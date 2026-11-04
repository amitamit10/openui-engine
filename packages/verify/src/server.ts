import { createServer, type Server } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import type { AddressInfo } from "node:net";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".mp4": "video/mp4",
};

export interface StaticServer { url: string; close: () => Promise<void>; server: Server }

/** Tiny static file server (127.0.0.1 only, path-traversal safe) used to render generated sites. */
export async function serveDir(dir: string, port = 0, host = "127.0.0.1"): Promise<StaticServer> {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    try {
      const u = new URL(req.url ?? "/", "http://x");
      const p = normalize(decodeURIComponent(u.pathname));
      let file = resolve(join(root, p));
      if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end("Forbidden"); return; }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file)) { res.writeHead(404, { "content-type": "text/plain" }).end("Not found"); return; }
      res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
      createReadStream(file).pipe(res);
    } catch { res.writeHead(400).end("Bad request"); }
  });
  await new Promise<void>((ok) => server.listen(port, host, ok));
  const addr = server.address() as AddressInfo;
  return { url: `http://${host}:${addr.port}`, server, close: () => new Promise((ok) => { server.close(() => ok()); server.closeAllConnections?.(); }) };
}
