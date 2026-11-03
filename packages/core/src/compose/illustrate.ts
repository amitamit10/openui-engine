/**
 * Generative illustration layer: deterministic, palette-driven SVG art so pages are not just UI mockups.
 * Everything is original geometry drawn from the design tokens (CSS variables), no third-party artwork.
 *   motifSvg()   - an abstract backdrop (blobs, arches, waves, contours, rays, dots, scallops, stripes, stack, dunes, rings)
 *   renderSpot() - a feature illustration: motif + big duotone icon badge + the feature's own bullets as floating pills
 *   renderScene()- a hero scene: motif + central icon badge + satellite icon badges
 */
import { iconSvg } from "../assets/icons.js";

export type Motif = "blobs" | "arches" | "waves" | "contour" | "rays" | "dots" | "scallop" | "stripes" | "stack" | "dunes" | "rings";
export const MOTIFS: Motif[] = ["blobs", "arches", "waves", "contour", "rays", "dots", "scallop", "stripes", "stack", "dunes", "rings"];

/** Icon markup is injected per build (the engine fetches icon sets at build time); falls back to bundled glyphs. */
let ICONS: Record<string, string> = {};
export function setIllustrationIcons(icons: Record<string, string>): void { ICONS = icons ?? {}; }

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function rng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth closed blob through n jittered points (Catmull-Rom to cubic Bezier). */
function blobPath(r: () => number, cx: number, cy: number, rad: number, n = 7, jitter = 0.28): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = rad * (1 - jitter + r() * jitter * 2); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  const at = (i: number) => pts[(i + n) % n]!;
  let d = `M${f(at(0)[0])} ${f(at(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const A = "var(--c-accent)", S = "var(--c-accent-soft)", T = "var(--c-text)", U = "var(--c-surface)", B = "var(--c-border)";

/** Abstract backdrop in a 400x300 box. */
export function motifSvg(motif: Motif, seed: string): string {
  const r = rng(seed + motif);
  switch (motif) {
    case "blobs":
      return `<path d="${blobPath(r, 150, 150, 120)}" fill="${S}"/><path d="${blobPath(r, 270, 120, 90)}" fill="${A}" fill-opacity=".16"/><path d="${blobPath(r, 230, 210, 70)}" fill="${T}" fill-opacity=".06"/>`;
    case "arches": {
      let s = ""; const n = 5, w = 400 / n;
      for (let i = 0; i < n; i++) { const h = 120 + r() * 140, x = i * w + 6, ww = w - 12; const fill = i % 3 === 0 ? A : i % 3 === 1 ? S : T; const op = i % 3 === 0 ? 0.22 : i % 3 === 1 ? 1 : 0.07; s += `<path d="M${f(x)} 300V${f(300 - h + ww / 2)}a${f(ww / 2)} ${f(ww / 2)} 0 0 1 ${f(ww)} 0V300Z" fill="${fill}" fill-opacity="${op}"/>`; }
      return s;
    }
    case "waves": {
      let s = ""; const bands = 4;
      for (let i = 0; i < bands; i++) { const y = 90 + i * 55, amp = 14 + r() * 18, ph = r() * 60; s += `<path d="M0 ${f(y)}C${f(80 + ph)} ${f(y - amp)} ${f(140 + ph)} ${f(y + amp)} 220 ${f(y)}S${f(340 - ph / 2)} ${f(y - amp)} 400 ${f(y)}V300H0Z" fill="${i % 2 ? A : S}" fill-opacity="${i % 2 ? 0.2 + i * 0.05 : 1}"/>`; }
      return s;
    }
    case "contour": {
      let s = "";
      for (let i = 0; i < 7; i++) { const k = 28 + i * 20; s += `<path d="${blobPath(r, 200 + (r() - 0.5) * 16, 150 + (r() - 0.5) * 12, k, 9, 0.12)}" fill="none" stroke="${i % 3 === 0 ? A : B}" stroke-width="${i % 3 === 0 ? 2 : 1.4}" stroke-opacity="${i % 3 === 0 ? 0.55 : 0.9}"/>`; }
      return s + `<circle cx="200" cy="150" r="14" fill="${S}"/>`;
    }
    case "rays": {
      let s = ""; const n = 16, cx = 200, cy = 170;
      for (let i = 0; i < n; i++) { if (i % 2) continue; const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, R = 420; s += `<path d="M${cx} ${cy}L${f(cx + Math.cos(a0) * R)} ${f(cy + Math.sin(a0) * R)}L${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)}Z" fill="${S}" fill-opacity=".8"/>`; }
      return s + `<circle cx="${cx}" cy="${cy}" r="70" fill="${A}" fill-opacity=".18"/>`;
    }
    case "dots": {
      let s = "";
      for (let y = 0; y < 8; y++) for (let x = 0; x < 11; x++) { const d = Math.hypot(x - 5, y - 3.5), rad = Math.max(1.2, 6.2 - d * 0.95); s += `<circle cx="${20 + x * 36}" cy="${22 + y * 36}" r="${f(rad)}" fill="${d < 2.2 ? A : T}" fill-opacity="${d < 2.2 ? 0.55 : 0.14}"/>`; }
      return s;
    }
    case "scallop": {
      let s = ""; const rows = 7, R = 34;
      for (let y = 0; y < rows; y++) for (let x = -1; x < 7; x++) { const cx = x * R * 2 + (y % 2 ? R : 0), cy = 20 + y * R * 0.62; s += `<circle cx="${cx}" cy="${f(cy)}" r="${R}" fill="${(x + y) % 3 === 0 ? A : (x + y) % 3 === 1 ? S : U}" fill-opacity="${(x + y) % 3 === 0 ? 0.26 : 1}" stroke="${B}" stroke-width="1"/>`; }
      return s;
    }
    case "stripes": {
      let s = "";
      for (let i = -3; i < 12; i++) s += `<path d="M${i * 44} 300L${i * 44 + 120} 0h22L${i * 44 + 22} 300Z" fill="${i % 3 === 0 ? A : i % 3 === 1 ? S : T}" fill-opacity="${i % 3 === 0 ? 0.3 : i % 3 === 1 ? 1 : 0.08}"/>`;
      return s;
    }
    case "stack": {
      let s = "";
      for (let i = 0; i < 4; i++) { const w = 250 - i * 14, h = 150, x = 70 + i * 22, y = 24 + i * 34, rot = (r() - 0.5) * 6; s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" transform="rotate(${f(rot)} ${x + w / 2} ${y + h / 2})" fill="${i === 3 ? S : U}" stroke="${B}" stroke-width="1.5"/>`; }
      return s + `<rect x="${70 + 66}" y="${24 + 102 + 10}" width="90" height="10" rx="5" fill="${A}" fill-opacity=".4"/>`;
    }
    case "dunes": {
      let s = "";
      for (let i = 0; i < 4; i++) { const y = 120 + i * 48, a = 30 + r() * 30; s += `<path d="M0 ${f(y)}Q${f(100 + r() * 40)} ${f(y - a)} 200 ${f(y)}T400 ${f(y - 6)}V300H0Z" fill="${i % 2 ? A : S}" fill-opacity="${i % 2 ? 0.22 : 1}"/>`; }
      return s + `<circle cx="${f(280 + r() * 60)}" cy="70" r="34" fill="${A}" fill-opacity=".35"/>`;
    }
    case "rings":
    default: {
      let s = "";
      for (let i = 0; i < 6; i++) s += `<circle cx="${f(200 + (r() - 0.5) * 40)}" cy="${f(150 + (r() - 0.5) * 30)}" r="${30 + i * 26}" fill="${i === 0 ? S : "none"}" stroke="${i % 2 ? B : A}" stroke-opacity="${i % 2 ? 1 : 0.5}" stroke-width="${i % 2 ? 1.4 : 2}"/>`;
      return s;
    }
  }
}

const bg = (motif: Motif, seed: string) => `<svg class="spot__bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${motifSvg(motif, seed)}</svg>`;
const pickMotif = (seed: string, preferred?: string): Motif => (MOTIFS as string[]).includes(preferred ?? "") ? (preferred as Motif) : MOTIFS[Math.floor(rng(seed)() * MOTIFS.length)]!;

export interface SpotSpec { icon?: string; motif?: string; seed?: string; pills?: string[]; caption?: string }

/** Feature illustration. Decorative (aria-hidden); the pills duplicate text that also exists in the card copy. */
export function renderSpot(v: SpotSpec, uid = "s"): string {
  const seed = v.seed ?? uid, motif = pickMotif(seed, v.motif);
  const pills = (v.pills ?? []).slice(0, 2).map((p, i) => `<span class="spot__pill spot__pill--${i + 1}">${esc(p)}</span>`).join("");
  return `<div class="spot spot--${motif}" aria-hidden="true">${bg(motif, seed)}<span class="spot__badge">${iconSvg(v.icon, ICONS)}</span>${pills}</div>`;
}

export interface SceneSpec { icons?: string[]; motif?: string; seed?: string; badge?: { label: string; value: string } }

/** Hero scene: backdrop + large central badge + satellite badges. */
export function renderScene(v: SceneSpec, uid = "h"): string {
  const seed = v.seed ?? uid, motif = pickMotif(seed, v.motif);
  const [main, ...rest] = v.icons?.length ? v.icons : [undefined];
  const sats = rest.slice(0, 3).map((ic, i) => `<span class="scene__sat scene__sat--${i + 1}">${iconSvg(ic, ICONS)}</span>`).join("");
  const badge = v.badge ? `<div class="hfloat hfloat--good scene__stat"><span>${esc(v.badge.label)}</span><strong>${esc(v.badge.value)}</strong></div>` : "";
  return `<div class="scene scene--${motif}" aria-hidden="true">${bg(motif, seed)}<span class="scene__main">${iconSvg(main, ICONS)}</span>${sats}${badge}</div>`;
}

/** Decorative backdrop + corner satellites placed around an existing hero visual (product card). */
export function renderBackdrop(v: SceneSpec, uid = "h"): string {
  const seed = v.seed ?? uid, motif = pickMotif(seed, v.motif);
  const sats = (v.icons ?? []).slice(0, 2).map((ic, i) => `<span class="scene__sat scene__sat--c${i + 1}" aria-hidden="true">${iconSvg(ic, ICONS)}</span>`).join("");
  return `<div class="hero__backdrop scene--${motif}" aria-hidden="true">${bg(motif, seed)}</div>${sats}`;
}
