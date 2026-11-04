import { randomBytes, timingSafeEqual } from "node:crypto";
import { EventEmitter } from "node:events";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface Comment { id: string; openuiId?: string; selector?: string; text: string; author: string; createdAt: string; resolved: boolean }
export interface AgentRequest { id: string; text: string; openuiId?: string; selector?: string; createdAt: string; status: "open" | "handled" }
export interface PendingTweak { id: string; openuiId?: string; selector?: string; props: Record<string, string>; at: string }
export type Target = { kind: "project"; dir: string } | { kind: "url"; url: string };

export interface Session {
  id: string;
  token: string;
  target: Target;
  createdAt: string;
  expiresAt: number;
  comments: Comment[];
  requests: AgentRequest[];
  tweaks: PendingTweak[];
  log: Array<{ at: string; event: string; detail?: string }>;
  /** Feedback items the agent has not fetched yet. */
  unread: Array<{ kind: "comment" | "request" | "tweak" | "variant" | "token"; id: string }>;
  version: number;
}

const rid = (n = 6) => randomBytes(n).toString("hex");

export class SessionStore extends EventEmitter {
  private sessions = new Map<string, Session>();
  constructor(private ttlMs = 8 * 3600_000) { super(); }

  create(target: Target): Session {
    const s: Session = {
      id: rid(5), token: randomBytes(24).toString("base64url"), target,
      createdAt: new Date().toISOString(), expiresAt: Date.now() + this.ttlMs,
      comments: [], requests: [], tweaks: [], log: [], unread: [], version: 0,
    };
    this.sessions.set(s.id, s);
    this.persist(s);
    return s;
  }

  get(id: string): Session | undefined {
    const s = this.sessions.get(id);
    if (s && s.expiresAt < Date.now()) { this.sessions.delete(id); return undefined; }
    return s;
  }
  list(): Session[] { return [...this.sessions.values()].filter((s) => s.expiresAt > Date.now()); }

  verify(id: string, token: string | undefined): Session | undefined {
    const s = this.get(id);
    if (!s || !token) return undefined;
    const a = Buffer.from(s.token), b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b) ? s : undefined;
  }

  revoke(id: string) { this.sessions.delete(id); }

  note(s: Session, event: string, detail?: string) { s.log.push({ at: new Date().toISOString(), event, detail }); if (s.log.length > 200) s.log.shift(); }

  addComment(s: Session, c: Pick<Comment, "openuiId" | "selector" | "text">): Comment {
    const comment: Comment = { id: rid(3), ...c, text: c.text.slice(0, 2000), author: "reviewer", createdAt: new Date().toISOString(), resolved: false };
    s.comments.push(comment); s.unread.push({ kind: "comment", id: comment.id }); this.bump(s, "comment", comment.text.slice(0, 80)); return comment;
  }
  addRequest(s: Session, r: Pick<AgentRequest, "text" | "openuiId" | "selector">): AgentRequest {
    const req: AgentRequest = { id: rid(3), ...r, text: r.text.slice(0, 4000), createdAt: new Date().toISOString(), status: "open" };
    s.requests.push(req); s.unread.push({ kind: "request", id: req.id }); this.bump(s, "request", req.text.slice(0, 80)); return req;
  }
  addTweak(s: Session, t: Omit<PendingTweak, "id" | "at">): PendingTweak {
    // merge successive tweaks to the same target so the agent sees the *net* change
    const key = t.openuiId ?? t.selector ?? "";
    const existing = s.tweaks.find((x) => (x.openuiId ?? x.selector ?? "") === key);
    if (existing) { Object.assign(existing.props, t.props); existing.at = new Date().toISOString(); this.bump(s, "tweak", key); return existing; }
    const tw: PendingTweak = { id: rid(3), ...t, at: new Date().toISOString() };
    s.tweaks.push(tw); s.unread.push({ kind: "tweak", id: tw.id }); this.bump(s, "tweak", key); return tw;
  }
  markEvent(s: Session, kind: "variant" | "token", detail: string) { s.unread.push({ kind, id: rid(3) }); this.bump(s, kind, detail); }

  private bump(s: Session, event: string, detail?: string) { s.version++; this.note(s, event, detail); this.persist(s); this.emit("change", s.id); }

  /** Resolves when the session has unread feedback (or after timeout). */
  waitForFeedback(s: Session, timeoutMs: number): Promise<boolean> {
    if (s.unread.length) return Promise.resolve(true);
    return new Promise((ok) => {
      const t = setTimeout(() => { this.off("change", h); ok(false); }, timeoutMs);
      const h = (id: string) => { if (id === s.id && s.unread.length) { clearTimeout(t); this.off("change", h); ok(true); } };
      this.on("change", h);
    });
  }

  persist(s: Session) {
    if (s.target.kind !== "project") return;
    try {
      const d = join(resolve(s.target.dir), ".openui", "sessions"); mkdirSync(d, { recursive: true });
      const { token: _t, ...safe } = s; // never write the secret token to disk
      writeFileSync(join(d, `${s.id}.json`), JSON.stringify(safe, null, 2));
    } catch { /* non-fatal */ }
  }
  static loadComments(dir: string, id: string): Partial<Session> | undefined {
    const p = join(resolve(dir), ".openui", "sessions", `${id}.json`);
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : undefined;
  }
}
