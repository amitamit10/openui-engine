import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { DesignTokens } from "./design/types.js";
import { renderDesignMd, renderTokensCss, renderTokensJson } from "./design/system.js";
import { setAssets, IMAGE_EXTS, collectImageRequests, imageInstructions, type AssetMap } from "./compose/assets.js";
import { buildSite, sanitizeTweak, type Overrides } from "./compose/page.js";
import type { PageSpec } from "./compose/sections.js";

/**
 * A generated project is a plain folder:
 *   DESIGN.md · tokens.json (DTCG) · openui.tokens.json (source of truth)
 *   openui.page.json (page spec) · openui.overrides.json (visual-editor tweaks)
 *   dist/ (rendered static site: deployable as-is to Vercel/Netlify/Pages)
 */
export interface Project { dir: string; tokens: DesignTokens; spec: PageSpec; overrides: Overrides; icons?: Record<string, string> }

const f = (dir: string, name: string) => join(dir, name);
const write = (p: string, c: string) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, c); };
const readJson = <T>(p: string, fallback?: T): T => {
  if (!existsSync(p)) { if (fallback !== undefined) return fallback; throw new Error(`Missing ${p}`); }
  return JSON.parse(readFileSync(p, "utf8")) as T;
};

export function isProject(dir: string): boolean {
  return existsSync(f(resolve(dir), "openui.page.json")) && existsSync(f(resolve(dir), "openui.tokens.json"));
}

export function loadProject(dir: string): Project {
  const d = resolve(dir);
  return {
    dir: d,
    tokens: readJson<DesignTokens>(f(d, "openui.tokens.json")),
    spec: readJson<PageSpec>(f(d, "openui.page.json")),
    overrides: readJson<Overrides>(f(d, "openui.overrides.json"), {}),
    icons: readJson<Record<string, string>>(f(d, "openui.icons.json"), {}),
  };
}

/** Images the user or the model dropped into <project>/images/ (hero.png, feature-2.jpg, logo.svg...), keyed by slot. Max 8MB each; logo.svg only svg/png/jpg. */
export function findAssets(dir: string): AssetMap {
  const d = join(resolve(dir), "images"), out: AssetMap = {};
  if (!existsSync(d)) return out;
  for (const n of readdirSync(d).sort()) {
    const m = /^([a-z0-9][a-z0-9-]{0,30})\.([a-z0-9]+)$/i.exec(n);
    if (!m || !IMAGE_EXTS.includes(m[2]!.toLowerCase())) continue;
    const slot = m[1]!.toLowerCase(), st = statSync(join(d, n));
    if (!st.isFile() || st.size > 8 * 1024 * 1024 || out[slot]) continue;
    out[slot] = `images/${n}`;
  }
  return out;
}

/** Image slots (hero, feature photos, logo) of a saved project and whether each has a file yet, with the instruction to relay to the user. */
export function imageStatus(dir: string) {
  const p = loadProject(dir), requests = collectImageRequests(p.spec, findAssets(dir));
  return { requests, next_step: imageInstructions(requests) };
}

export function saveProject(p: Project): { files: string[] } {
  const files: string[] = [];
  const w = (name: string, content: string) => { write(f(p.dir, name), content); files.push(name); };
  w("openui.tokens.json", JSON.stringify(p.tokens, null, 2) + "\n");
  w("openui.page.json", JSON.stringify(p.spec, null, 2) + "\n");
  w("openui.overrides.json", JSON.stringify(p.overrides, null, 2) + "\n");
  if (p.icons && Object.keys(p.icons).length) w("openui.icons.json", JSON.stringify(p.icons) + "\n");
  w("DESIGN.md", renderDesignMd(p.tokens));
  w("tokens.json", renderTokensJson(p.tokens));
  w("tokens.css", renderTokensCss(p.tokens));
  const found = findAssets(p.dir);
  setAssets(found);
  const site = buildSite(p.spec, p.tokens, p.overrides, p.icons ?? {});
  setAssets({});
  for (const [name, content] of Object.entries(site.files)) w(`dist/${name}`, content);
  for (const rel of Object.values(found)) { const dest = f(p.dir, `dist/${rel}`); mkdirSync(dirname(dest), { recursive: true }); copyFileSync(f(p.dir, rel), dest); files.push(`dist/${rel}`); }
  return { files: [...files, ...Object.keys(site.files).map((n) => `dist/${n}`)] };
}

export function rebuild(dir: string): { files: string[] } {
  return saveProject(loadProject(dir));
}

/** Persist visual tweaks as stable, id-keyed CSS overrides (maintainable, diffable, reversible). */
export function applyTweaks(dir: string, tweaks: Array<{ id: string; props: Record<string, string> }>): { applied: number; rejected: Array<{ id: string; prop: string; reason: string }> } {
  const p = loadProject(dir);
  const rejected: Array<{ id: string; prop: string; reason: string }> = [];
  let applied = 0;
  for (const t of tweaks) {
    for (const [prop, value] of Object.entries(t.props)) {
      const v = sanitizeTweak(prop, value);
      if (v === null) { rejected.push({ id: t.id, prop, reason: "property not in allow-list or unsafe value" }); continue; }
      (p.overrides[t.id] ??= {})[prop] = v;
      applied++;
    }
  }
  saveProject(p);
  return { applied, rejected };
}

/** Switch a section to another variant of the same group (e.g. hero-split ↔ hero-centered-product). */
export function setSectionVariant(dir: string, sectionId: string, type: PageSpec["sections"][number]["type"]): void {
  const p = loadProject(dir);
  const s = p.spec.sections.find((x) => x.id === sectionId);
  if (!s) throw new Error(`No section "${sectionId}"`);
  s.type = type;
  saveProject(p);
}

/** Token-level edit, e.g. { "color.accent": "#ff0066", "radius.lg": 20 }. */
export function setTokenPath(tokens: DesignTokens, path: string, value: string | number): void {
  const parts = path.split(".");
  let cur: any = tokens;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]!];
    if (cur === undefined || typeof cur !== "object") throw new Error(`Bad token path ${path}`);
  }
  const last = parts[parts.length - 1]!;
  if (!(last in cur)) throw new Error(`Unknown token ${path}`);
  cur[last] = value;
}
