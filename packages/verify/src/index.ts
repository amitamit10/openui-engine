import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";
import { loadProject, isProject, rebuild, STARTER_MARKERS, type DesignTokens } from "@openui-engine/core";
import { runAudit, type AuditOptions } from "./audit.js";
import { analyzeQuality, type QualityReport } from "./quality.js";
import { serveDir } from "./server.js";
import type { AuditReport } from "./types.js";

export * from "./types.js";
export * from "./audit.js";
export * from "./quality.js";
export * from "./server.js";
export * from "./browser.js";

export interface TargetResult { audit: AuditReport; quality: QualityReport; tokens?: DesignTokens; outDir: string }

/** Audit either a URL or an OpenUI project directory (served from <dir>/dist). */
export async function auditTarget(target: string, opts: Partial<AuditOptions> & { rebuildFirst?: boolean } = {}): Promise<TargetResult> {
  if (/^https?:\/\//.test(target)) {
    const outDir = opts.outDir ?? resolve(".openui/shots");
    const audit = await runAudit({ ...opts, url: target, outDir });
    return { audit, quality: analyzeQuality(audit), outDir, ...(opts.tokens ? { tokens: opts.tokens } : {}) };
  }
  const dir = resolve(target);
  let tokens = opts.tokens;
  let root = dir;
  let markers = opts.starterMarkers;
  if (isProject(dir)) {
    markers ??= STARTER_MARKERS;
    // Rebuild only when dist is missing or older than its sources: never silently overwrite hand-edited output.
    const distIdx = resolve(dir, "dist/index.html");
    const stale = !existsSync(distIdx) || ["openui.page.json", "openui.tokens.json", "openui.overrides.json"].some((f) => existsSync(resolve(dir, f)) && statSync(resolve(dir, f)).mtimeMs > statSync(distIdx).mtimeMs);
    if (opts.rebuildFirst && stale) rebuild(dir);
    tokens = tokens ?? loadProject(dir).tokens;
    root = resolve(dir, "dist");
  } else if (existsSync(resolve(dir, "dist/index.html"))) root = resolve(dir, "dist");
  if (!existsSync(resolve(root, "index.html"))) throw new Error(`No index.html found in ${root}`);
  const srv = await serveDir(root);
  try {
    const outDir = opts.outDir ?? resolve(dir, ".openui/shots");
    const audit = await runAudit({ ...opts, url: srv.url + "/", tokens, outDir, starterMarkers: markers });
    return { audit, quality: analyzeQuality(audit), tokens, outDir };
  } finally { await srv.close(); }
}
export * from "./capture.js";
export * from "./slop.js";
