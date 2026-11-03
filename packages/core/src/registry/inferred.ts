import type { StyleId } from "../design/types.js";
import type { ComponentMeta, Runtime, Slot, SourceId } from "./types.js";
import raw from "./external-index.json" with { type: "json" };

interface RawItem { l: string; n: string; t: string; y: string; d: string; p: string[]; c: string[] }
interface RawIndex { generatedAt: string; libs: Record<string, { name: string; count: number; itemUrl: string; ok: boolean }>; items: RawItem[] }
const INDEX = raw as unknown as RawIndex;

const ALL_STYLES: StyleId[] = ["aurora-dark", "clarity-light", "editorial-paper", "terminal-dev", "warm-human", "neo-brutal", "field-notes", "shadcn-mono", "material-tonal", "swiss-grid", "noir-luxe", "pastel-play"];

const LIB_LICENSE: Record<string, string> = {
  shadcn: "MIT (verified 2026-11-03 from shadcn-ui/ui LICENSE.md)",
  magicui: "unverified — read the upstream LICENSE", reactbits: "unverified — may carry custom terms", aceternity: "free items open, Pro paid — confirm terms",
  fluid: "unverified — read the upstream LICENSE", kibo: "unverified — read the upstream LICENSE", cult: "unverified — read the upstream LICENSE",
  motionprimitives: "unverified — read the upstream LICENSE", animateui: "unverified — read the upstream LICENSE", eldora: "unverified — read the upstream LICENSE", tripled: "unverified — read the upstream LICENSE",
};

const SLOT_RULES: Array<[RegExp, Slot]> = [
  [/\bhero\b/i, "hero"], [/navbar|navigation|nav-bar|\bheader\b|menubar/i, "navbar"], [/pricing|price-card|plans?\b/i, "pricing"],
  [/testimonial|review|social-proof/i, "testimonials"], [/\bfaq\b|accordion/i, "faq"], [/\bcta\b|call-to-action|newsletter/i, "cta"], [/footer/i, "footer"],
  [/logo-?cloud|logos|marquee|clients?\b|brands?\b/i, "logos"], [/bento|feature/i, "features"], [/stats?\b|metric|counter|number-ticker|kpi/i, "metrics"],
  [/background|aurora|beam|meteor|particles|ripple|vortex|wavy|shader|spotlight|noise|dot-pattern|grid-pattern|gradient|lamp|stars|orb|waves|mesh/i, "background"],
  [/text|typing|typewriter|shimmer|scramble|morph|reveal|split|word|headline|letter|gradient-text|highlight/i, "text-effect"],
  [/sidebar|layout|container|scroll|carousel|stack|dock|tabs?\b|resizable|split-view/i, "layout"],
];

function inferSlot(it: RawItem): Slot {
  const hay = `${it.n} ${it.t} ${it.d} ${it.c.join(" ")}`;
  for (const [re, slot] of SLOT_RULES) if (re.test(it.n) || re.test(it.t)) return slot;
  for (const [re, slot] of SLOT_RULES) if (re.test(hay) && slot !== "text-effect") return slot;
  return "primitive";
}

function inferRuntimes(deps: string[]): Runtime[] {
  const r = new Set<Runtime>(["tailwind"]);
  for (const d of deps) {
    if (/gsap/.test(d)) r.add("gsap");
    if (/three|ogl|r3f|react-three|cobe|spline/.test(d)) r.add("three");
    if (/^motion$|framer-motion|motion\/react/.test(d)) r.add("motion");
    if (/radix/.test(d)) r.add("radix");
    if (/base-ui/.test(d)) r.add("base-ui");
  }
  return [...r];
}

function inferEnergy(it: RawItem, rt: Runtime[], slot: Slot): 0 | 1 | 2 | 3 {
  const hay = `${it.n} ${it.d}`.toLowerCase();
  if (rt.includes("three") || /shader|webgl|3d|particles|vortex|globe|cursor-trail|meteors?|sparkles?|confetti/.test(hay)) return 3;
  if (rt.includes("gsap") || slot === "background" || /animat|spotlight|beam|shimmer|marquee|parallax|infinite|typewriter|scramble/.test(hay)) return 2;
  if (rt.includes("motion")) return 1;
  return 0;
}

function inferStyles(it: RawItem): StyleId[] {
  const hay = `${it.n} ${it.d}`.toLowerCase();
  if (/neon|cyber|glow|aurora|spotlight|meteor|beam|lamp|matrix/.test(hay)) return ["aurora-dark", "terminal-dev"];
  if (/brutal/.test(hay)) return ["neo-brutal"];
  if (/terminal|code|command|cli|console/.test(hay)) return ["terminal-dev", "aurora-dark"];
  if (/serif|editorial|paper|magazine/.test(hay)) return ["editorial-paper"];
  if (/glass|gradient|mesh/.test(hay)) return ["aurora-dark", "clarity-light", "warm-human"];
  return ALL_STYLES;
}

/** One entry per *component*: React Bits publishes 4 code variants of each; keep the TS+Tailwind one. */
function wanted(it: RawItem): boolean {
  if (it.l === "reactbits") return /-TS-TW$/.test(it.n);
  if (/^icons?-|-icons?$/.test(it.n)) return false; // icon glyph components belong to the icon library tool
  if (/(^|-)demo(-|$)/.test(it.n) || it.y === "example") return false; // demos are usage examples, not components
  return true;
}

function toMeta(it: RawItem): ComponentMeta {
  const lib = INDEX.libs[it.l]!;
  const baseUrl = lib.itemUrl.split("{name}")[0]!;
  const slot = inferSlot(it);
  const runtimes = inferRuntimes(it.p);
  const energy = inferEnergy(it, runtimes, slot);
  const displayName = it.l === "reactbits" ? it.n.replace(/-TS-TW$/, "") : it.n;
  const install = `npx shadcn@latest add ${baseUrl}${it.n}.json`;
  return {
    id: `${it.l}/${displayName}`, name: it.t.replace(/-TS-TW$/, ""), source: it.l as SourceId, kind: slot === "background" || slot === "text-effect" ? "effect" : "ui", slot,
    summary: it.d || `${lib.name} ${it.y || "component"}: ${displayName}`,
    styles: inferStyles(it), categories: ["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"],
    traits: { energy, density: 3 },
    requires: { framework: "react", runtimes, deps: it.p },
    a11y: { keyboard: true, reducedMotion: energy === 0, notes: energy ? "Animated: verify prefers-reduced-motion after install." : "Static component." },
    responsive: "unverified", weightKb: null,
    license: { spdx: "unverified", verified: false, note: `${lib.name}: ${LIB_LICENSE[it.l] ?? "unverified"}. Source is fetched live, never vendored.` },
    registry: { baseUrl, item: it.n, install },
    confidence: "inferred",
  };
}

let cache: ComponentMeta[] | null = null;
/** ~3,500 registry entries indexed as metadata only (no source). Lower confidence than the curated set. */
export function indexedComponents(): ComponentMeta[] {
  cache ??= INDEX.items.filter(wanted).map(toMeta);
  return cache;
}

export const LIBRARIES = Object.entries(INDEX.libs).map(([id, l]) => ({ id, name: l.name, items: l.count, live: l.ok }));
export const INDEX_GENERATED_AT = INDEX.generatedAt;
