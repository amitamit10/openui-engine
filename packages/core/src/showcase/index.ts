import { HEROES } from "./heroes.js";
import { SHOWCASES } from "./showcases.js";
import { BASE_CSS } from "./util.js";
import type { Palette, ShowcaseDef } from "./types.js";

export type { Palette, ShowcaseDef };
export const ALL_SHOWCASES: ShowcaseDef[] = [...HEROES, ...SHOWCASES];

export function listShowcases(query = "", kind?: "hero" | "showcase") {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  return ALL_SHOWCASES.filter((s) => !kind || s.kind === kind).map((s) => {
    const hay = `${s.fits.join(" ")} ${s.name} ${s.summary}`.toLowerCase();
    const score = words.reduce((a, w) => a + (s.fits.some((f) => f === w || f.includes(w) || w.includes(f)) ? 3 : hay.includes(w) ? 1 : 0), 0);
    return { id: s.id, kind: s.kind, name: s.name, summary: s.summary, fits: s.fits, score };
  }).sort((a, b) => b.score - a.score);
}

export function paletteCss(p: Palette = {}): string {
  const m: Array<[string, string | undefined]> = [["--sc-accent", p.accent], ["--sc-bg", p.bg], ["--sc-ink", p.ink], ["--sc-muted", p.muted], ["--sc-surface", p.surface], ["--sc-line", p.line], ["--sc-display", p.display], ["--sc-body", p.body], ["--sc-mono", p.mono]];
  const decl = m.filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(";");
  return decl ? `.oui-sc{${decl}}` : "";
}

/** Render one showcase with your fields merged over the defaults; css includes the palette variables so it adopts the page. */
export function renderShowcase(id: string, fields: Record<string, any> = {}, palette: Palette = {}): { id: string; kind: string; html: string; css: string; fields: Record<string, any> } {
  const s = ALL_SHOWCASES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown showcase "${id}". Known: ${ALL_SHOWCASES.map((x) => x.id).join(", ")}`);
  const merged = { ...s.defaults, ...fields };
  return { id: s.id, kind: s.kind, html: s.render(merged), css: `${BASE_CSS}\n${paletteCss(palette)}\n${s.css}`, fields: merged };
}
