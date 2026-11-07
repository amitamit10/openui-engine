import { createServer, request as httpRequest, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { request as httpsRequest } from "node:https";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import type { AddressInfo } from "node:net";
import { SECTION_VARIANT_GROUPS, applyTweaks, isProject, loadProject, setSectionVariant, setTokenPath, saveProject } from "@openui-engine/core";
import { OVERLAY_JS } from "./overlay.js";
import { SessionStore, type Session, type Target } from "./session.js";
import { editorHtml } from "./ui.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain",
};

export interface EditorServerOptions {
  store?: SessionStore;
  host?: string;
  port?: number;
  /** Extra Host header values to accept (e.g. a tunnel domain). Required when exposing beyond loopback. */
  allowedHosts?: string[];
  /** Permit proxying non-loopback URL targets. Off by default (SSRF guard). */
  allowRemoteTargets?: boolean;
}

export interface EditorServer {
  store: SessionStore;
  url: string;
  server: Server;
  sessionUrl: (s: Session) => string;
  close: () => Promise<void>;
}

const json = (res: ServerResponse, code: number, body: unknown) => { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };

function readBody(req: IncomingMessage, limit = 64 * 1024): Promise<any> {
  return new Promise((ok, fail) => {
    let n = 0; const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => { n += c.length; if (n > limit) { fail(Object.assign(new Error("Payload too large"), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { fail(Object.assign(new Error("Invalid JSON"), { status: 400 })); } });
    req.on("error", fail);
  });
}

function parseCookies(h: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of (h ?? "").split(";")) { const i = p.indexOf("="); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }
  return out;
}

const isLoopback = (h: string) => ["localhost", "127.0.0.1", "::1", "[::1]"].includes(h);

export async function startEditorServer(opts: EditorServerOptions = {}): Promise<EditorServer> {
  const store = opts.store ?? new SessionStore();
  const host = opts.host ?? "127.0.0.1";
  const allowedHosts = new Set(["localhost", "127.0.0.1", "[::1]", ...(opts.allowedHosts ?? [])]);
  const hits = new Map<string, { n: number; t: number }>();
  let boundPort = 0;

  const server = createServer(async (req, res) => {
    try {
      const reqHost = (req.headers.host ?? "").replace(/:\d+$/, "");
      if (!allowedHosts.has(reqHost)) return json(res, 421, { error: "Host not allowed (DNS-rebinding protection)" });
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
      const m = url.pathname.match(/^\/s\/([a-f0-9]{10})(\/.*)?$/);
      if (url.pathname === "/healthz") return json(res, 200, { ok: true });
      if (!m) return json(res, 404, { error: "Not found. Open the session URL returned by create_review_session." });
      const id = m[1]!, rest = m[2] ?? "/";

      // --- auth: one-time ?t= exchange for an HttpOnly cookie, or bearer header ---
      const qt = url.searchParams.get("t") ?? undefined;
      const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined;
      const cookie = parseCookies(req.headers.cookie)[`oui_${id}`];
      const session = store.verify(id, qt ?? bearer ?? cookie);
      if (!session) return json(res, 401, { error: "Invalid or expired session token." });
      if (qt) {
        res.writeHead(302, { "set-cookie": `oui_${id}=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Strict; Path=/s/${id}; Max-Age=28800`, location: `/s/${id}/`, "cache-control": "no-store" });
        return res.end();
      }
      // rate limit (per session)
      const now = Date.now(); const h = hits.get(id) ?? { n: 0, t: now };
      if (now - h.t > 60_000) { h.n = 0; h.t = now; } h.n++; hits.set(id, h);
      if (h.n > 1200) return json(res, 429, { error: "Too many requests" });

      const secure = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" };

      if (rest === "/" || rest === "") {
        const variants: Record<string, string[]> = {};
        for (const g of Object.values(SECTION_VARIANT_GROUPS)) for (const v of g) variants[v] = g;
        res.writeHead(200, { ...secure, "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'" });
        return res.end(editorHtml({ sessionId: id, title: session.target.kind === "project" ? session.target.dir.split("/").pop() ?? "project" : session.target.url, kind: session.target.kind, variants }));
      }
      if (rest === "/overlay.js") { res.writeHead(200, { ...secure, "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" }); return res.end(OVERLAY_JS); }
      if (rest.startsWith("/preview")) return preview(req, res, session, rest.slice("/preview".length) + url.search, opts, secure);
      if (rest.startsWith("/api/")) return api(req, res, session, rest.slice(5), store, reqHost, boundPort);
      return json(res, 404, { error: "Not found" });
    } catch (e: any) {
      if (!res.headersSent) json(res, e.status ?? 500, { error: e.message ?? "Internal error" });
    }
  });
  await new Promise<void>((ok) => server.listen(opts.port ?? 0, host, ok));
  boundPort = (server.address() as AddressInfo).port;
  const base = `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${boundPort}`;
  return {
    store, server, url: base,
    sessionUrl: (s) => `${base}/s/${s.id}/?t=${s.token}`,
    close: () => new Promise((ok) => { server.closeAllConnections?.(); server.close(() => ok()); }),
  };
}

function inject(html: string, id: string): string {
  const tag = `<script src="/s/${id}/overlay.js"></script>`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${tag}</body>`) : html + tag;
}

function preview(req: IncomingMessage, res: ServerResponse, s: Session, sub: string, opts: EditorServerOptions, secure: Record<string, string>) {
  const target: Target = s.target;
  const [pathPart = "/", query = ""] = sub.split("?");
  if (target.kind === "project") {
    const root = resolve(target.dir, "dist");
    const p = normalize(decodeURIComponent(pathPart || "/"));
    let file = resolve(join(root, p));
    if (file !== root && !file.startsWith(root + sep)) return json(res, 403, { error: "Forbidden" });
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return json(res, 404, { error: "Not found" });
    const ext = extname(file).toLowerCase();
    if (ext === ".html") {
      res.writeHead(200, { ...secure, "content-type": MIME[".html"]!, "cache-control": "no-store" });
      return res.end(inject(require_read(file), s.id));
    }
    res.writeHead(200, { ...secure, "content-type": MIME[ext] ?? "application/octet-stream", "cache-control": "no-store" });
    return createReadStream(file).pipe(res);
  }
  // URL target: reverse proxy with SSRF guard
  const t = new URL(target.url);
  if (!opts.allowRemoteTargets && !isLoopback(t.hostname)) return json(res, 403, { error: `Refusing to proxy non-loopback host "${t.hostname}". Start the editor with allowRemoteTargets to override.` });
  const lib = t.protocol === "https:" ? httpsRequest : httpRequest;
  const upstream = lib({ hostname: t.hostname, port: t.port || (t.protocol === "https:" ? 443 : 80), path: (t.pathname.replace(/\/$/, "") + pathPart + (query ? "?" + query : "")) || "/", method: "GET", headers: { accept: req.headers.accept ?? "*/*", "accept-encoding": "identity", host: t.host } }, (up) => {
    const headers = { ...up.headers } as Record<string, any>;
    delete headers["x-frame-options"]; delete headers["content-security-policy"]; delete headers["content-length"]; delete headers["content-security-policy-report-only"];
    const isHtml = String(headers["content-type"] ?? "").includes("text/html");
    if (!isHtml) { res.writeHead(up.statusCode ?? 200, { ...headers, ...secure }); return up.pipe(res); }
    const chunks: Buffer[] = []; up.on("data", (c) => chunks.push(c));
    up.on("end", () => { res.writeHead(up.statusCode ?? 200, { ...headers, ...secure, "cache-control": "no-store" }); res.end(inject(Buffer.concat(chunks).toString("utf8"), s.id)); });
  });
  upstream.on("error", (e) => json(res, 502, { error: `Upstream error: ${e.message}` }));
  upstream.end();
}

import { readFileSync } from "node:fs";
const require_read = (f: string) => readFileSync(f, "utf8");

async function api(req: IncomingMessage, res: ServerResponse, s: Session, route: string, store: SessionStore, reqHost: string, _port: number) {
  if (req.method !== "GET") {
    // CSRF: browsers always send Origin on cross-site POST; require same host and JSON.
    const origin = req.headers.origin;
    if (origin) { let oh = ""; try { oh = new URL(origin).hostname; } catch { /* ignore */ } if (oh !== reqHost.replace(/^\[|\]$/g, "")) return json(res, 403, { error: "Cross-origin request rejected" }); }
    if (!String(req.headers["content-type"] ?? "").includes("application/json")) return json(res, 415, { error: "Content-Type must be application/json" });
  }
  const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : undefined);
  if (req.method === "GET" && route === "state") return json(res, 200, { id: s.id, target: s.target, comments: s.comments, requests: s.requests, tweaks: s.tweaks, unread: s.unread.length, version: s.version });
  const body = await readBody(req);
  switch (route) {
    case "comment": {
      const text = str(body.text, 2000); if (!text?.trim()) return json(res, 400, { error: "text required" });
      return json(res, 200, store.addComment(s, { text, openuiId: str(body.openuiId, 200), selector: str(body.selector, 500) }));
    }
    case "comment/resolve": { const c = s.comments.find((x) => x.id === body.id); if (!c) return json(res, 404, { error: "no such comment" }); c.resolved = true; store.persist(s); return json(res, 200, c); }
    case "request": {
      const text = str(body.text, 4000); if (!text?.trim()) return json(res, 400, { error: "text required" });
      return json(res, 200, store.addRequest(s, { text, openuiId: str(body.openuiId, 200), selector: str(body.selector, 500) }));
    }
    case "tweak": {
      const props: Record<string, string> = {};
      for (const [k, v] of Object.entries(body.props ?? {})) if (typeof v === "string" && k.length < 40) props[k] = v.slice(0, 160);
      if (!Object.keys(props).length) return json(res, 400, { error: "props required" });
      return json(res, 200, store.addTweak(s, { props, openuiId: str(body.openuiId, 200), selector: str(body.selector, 500) }));
    }
    case "tweak/discard": { const k = body.openuiId ?? body.selector; s.tweaks = s.tweaks.filter((t) => (t.openuiId ?? t.selector) !== k); store.persist(s); return json(res, 200, { ok: true }); }
    case "apply": return json(res, 200, applyPending(s, store));
    case "variant": {
      if (s.target.kind !== "project") return json(res, 400, { error: "variants need a project target" });
      const sectionId = str(body.sectionId, 80), type = str(body.type, 80) as any;
      const group = Object.values(SECTION_VARIANT_GROUPS).find((g) => g.includes(type));
      const p = loadProject(s.target.dir); const cur = p.spec.sections.find((x) => x.id === sectionId);
      if (!cur || !group || !group.includes(cur.type)) return json(res, 400, { error: "Variant must belong to the same group as the current section" });
      setSectionVariant(s.target.dir, sectionId!, type); store.markEvent(s, "variant", `${sectionId} → ${type}`);
      return json(res, 200, { ok: true });
    }
    case "token": {
      if (s.target.kind !== "project") return json(res, 400, { error: "tokens need a project target" });
      const p = loadProject(s.target.dir);
      try { setTokenPath(p.tokens, String(body.path), body.value); } catch (e: any) { return json(res, 400, { error: e.message }); }
      saveProject(p); store.markEvent(s, "token", `${body.path}=${body.value}`); return json(res, 200, { ok: true });
    }
    default: return json(res, 404, { error: "Unknown route" });
  }
}

/** Persist pending tweaks into the project (id-keyed CSS overrides). */
export function applyPending(s: Session, store: SessionStore, only?: string[]) {
  if (s.target.kind !== "project" || !isProject(s.target.dir)) return { applied: 0, rejected: s.tweaks.map((t) => ({ id: t.openuiId ?? t.selector ?? "?", prop: "*", reason: "session target is not an OpenUI project" })), remaining: s.tweaks.length };
  const chosen = s.tweaks.filter((t) => !only || only.includes(t.id));
  const mapped = chosen.filter((t) => t.openuiId);
  const res = applyTweaks(s.target.dir, mapped.map((t) => ({ id: t.openuiId!, props: t.props })));
  const unmapped = chosen.filter((t) => !t.openuiId).map((t) => ({ id: t.selector ?? "?", prop: "*", reason: "element has no data-openui-id; apply this CSS patch manually" }));
  const done = new Set(mapped.map((t) => t.id));
  s.tweaks = s.tweaks.filter((t) => !done.has(t.id));
  s.unread = s.unread.filter((u) => !(u.kind === "tweak" && done.has(u.id)));
  store.note(s, "applied", `${res.applied} props`); store.persist(s);
  return { applied: res.applied, rejected: [...res.rejected, ...unmapped], remaining: s.tweaks.length };
}
