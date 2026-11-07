import { isAbsolute, relative, resolve } from "node:path";
import { startEditorServer, SessionStore, type EditorServer, type EditorServerOptions } from "@openui-engine/editor";

export interface ServerContext {
  workdir: string;
  store: SessionStore;
  editorOptions: EditorServerOptions;
  /** Lazily started editor HTTP server shared by all review sessions. */
  editor: () => Promise<EditorServer>;
  safePath: (p: string) => string;
  closeAll: () => Promise<void>;
}

export function createContext(opts: { workdir?: string; editor?: EditorServerOptions } = {}): ServerContext {
  const workdir = resolve(opts.workdir ?? process.cwd());
  const store = new SessionStore();
  let editorP: Promise<EditorServer> | null = null;
  const editorOptions = { ...opts.editor, store };
  return {
    workdir, store, editorOptions,
    editor: () => (editorP ??= startEditorServer(editorOptions)),
    safePath(p: string) {
      const abs = resolve(workdir, p);
      const rel = relative(workdir, abs);
      if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`Path "${p}" is outside the allowed working directory (${workdir}). Start the server with --workdir to widen it.`);
      return abs;
    },
    async closeAll() { if (editorP) { const e = await editorP; await e.close(); editorP = null; } },
  };
}
