import type { DesignTokens, SiteCategory, StyleId, TypeStep } from "./types.js";
import { STYLES, STYLE_IDS, getStyle } from "./styles.js";
import { contrast, ensureContrast, hexToHsl, hslToHex, mix, readableOn } from "./color.js";

export interface DesignBrief {
  name: string;
  /** Free text: what the product is, audience, tone. */
  description?: string;
  category?: SiteCategory;
  style?: StyleId;
  /** Brand accent override (hex). */
  accent?: string;
  /** Opt in: tint the paper surfaces, borders and ink with the accent hue on the light paper styles. Off by default (it made green brands read as mint). */
  tint?: boolean;
  motion?: 0 | 1 | 2 | 3;
}

/**
 * Accent families by category. Violet/indigo (the default AI palette) is deliberately absent: it is only
 * used when the brief asks for it. Hues are chosen to read as a *product* colour, not a template colour.
 */
const ACCENTS: Record<SiteCategory, string[]> = {
  saas: ["#2563eb", "#0d9488", "#ea580c", "#16a34a"],
  "ai-product": ["#0ea5e9", "#10b981", "#f59e0b", "#e11d48"],
  devtool: ["#14b8a6", "#f97316", "#22c55e", "#06b6d4"],
  fintech: ["#047857", "#1d4ed8", "#0f766e", "#b45309"],
  agency: ["#dc2626", "#ea580c", "#be123c", "#0f766e"],
  portfolio: ["#dc2626", "#c2410c", "#0f766e", "#be123c"],
  ecommerce: ["#c2410c", "#047857", "#be185d", "#1d4ed8"],
  "consumer-app": ["#ea580c", "#16a34a", "#db2777", "#0284c7"],
};
const TONE_ACCENTS: Array<[RegExp, string[]]> = [
  [/calm|trust|reliab|secure|steady|precise/, ["#0d9488", "#2563eb", "#0369a1", "#15803d"]], [/bold|loud|energ|fast|playful/, ["#ea580c", "#dc2626", "#d97706", "#db2777"]],
  [/natural|wellness|health|garden|organic|sustain/, ["#16a34a", "#65a30d", "#0f766e", "#b45309"]], [/luxur|premium|elegan|heritage|craft/, ["#b45309", "#7c2d12", "#166534", "#9f1239"]],
  [/finance|bank|invoice|ledger|account/, ["#047857", "#1d4ed8", "#0f766e", "#b45309"]], [/creative|studio|art|design/, ["#dc2626", "#ea580c", "#be123c", "#0f766e"]],
  [/ocean|water|cloud|data|analytic/, ["#0284c7", "#0891b2", "#0d9488", "#2563eb"]],
];
const hashStr = (t: string) => { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
/** Deterministic, non-violet accent from category + tone words + name. */
export function pickAccent(brief: Pick<DesignBrief, "name" | "description" | "category">): string {
  const text = `${brief.name} ${brief.description ?? ""}`.toLowerCase();
  // tone narrows to a family; the product name picks within it, so two "calm" products still differ
  const tone = TONE_ACCENTS.find(([re]) => re.test(text));
  const list = tone ? [...new Set([...tone[1], ...ACCENTS[brief.category ?? "saas"].slice(0, 2)])] : ACCENTS[brief.category ?? "saas"];
  return list[hashStr(brief.name) % list.length]!;
}

const TINT_STYLES = new Set<string>(["field-notes", "warm-human", "editorial-paper", "clarity-light", "material-tonal", "pastel-play"]);
/** Re-hue a palette to `hue`, keeping each colour's lightness. Saturation is set per role so the tint is visible but quiet. */
export function tintPalette(pal: { bg: string; surface: string; surface2: string; border: string; text: string; muted: string }, hue: number) {
  const sat: Record<string, [number, number]> = { bg: [0.22, 0.34], surface: [0.2, 0.36], surface2: [0.2, 0.3], border: [0.16, 0.26], text: [0.25, 0.4], muted: [0.1, 0.22] };
  const out: Record<string, string> = {};
  for (const k of Object.keys(sat)) {
    const c = hexToHsl((pal as Record<string, string>)[k]!), [lo, hi] = sat[k]!;
    out[k] = hslToHex({ h: hue, s: Math.min(hi, Math.max(lo, c.s)), l: c.l });
  }
  return out as typeof pal;
}

/** Complementary hue for the secondary accent: warm for greens/teals/blues, cool for reds/oranges, green for magentas. */
export function pairHue(h: number): number {
  const x = ((h % 360) + 360) % 360;
  if (x < 20 || x >= 340) return 175;
  if (x < 50) return 205;
  if (x < 75) return 215;
  if (x < 170) return 22;
  if (x < 200) return 16;
  if (x < 250) return 32;
  if (x < 300) return 42;
  return 160;
}

export interface StyleMatch { style: StyleId; score: number; reasons: string[] }

/** Rank art directions against a brief. Tone words dominate; category is a weak prior; dark only when asked for or technical. */
export function matchStyles(brief: Pick<DesignBrief, "description" | "category" | "name">): StyleMatch[] {
  const text = `${brief.name} ${brief.description ?? ""}`.toLowerCase();
  const wantsDark = /\b(dark|night|midnight|neon)\b/.test(text);
  const technical = /technical|developer|devtool|cli\b|api\b|sdk|infra|observab|pipeline|terminal|open.?source|engineer|lineage|schema/.test(text);
  return STYLE_IDS.map((id) => {
    const s = STYLES[id];
    let score = 0;
    const reasons: string[] = [];
    if (brief.category && s.categories.includes(brief.category)) { score += 1.5; reasons.push(`fits category "${brief.category}"`); }
    for (const k of s.keywords) {
      if (new RegExp(`(^|[^a-z])${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^a-z]|$)`).test(text)) { score += 2; reasons.push(`brief says "${k}"`); }
    }
    if (wantsDark && s.mode === "dark") { score += 3; reasons.push("brief asks for dark"); }
    if (!wantsDark && s.mode === "dark" && !technical) { score -= 2.5; reasons.push("dark theme only when asked for or technical"); }
    if (technical && id === "terminal-dev") { score += 3; }
    if (/\b(light|bright|clean|simple)\b/.test(text) && s.mode === "light") { score += 1; reasons.push("brief asks for light/clean"); }
    return { style: id, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

function typeScale(ratio: number, displayWeight: number, tracking: string): Record<string, TypeStep> {
  const r = (n: number, base: number) => Math.round(base * Math.pow(ratio, n));
  // Desktop = base 17, mobile = base 16, with display steps compressed on mobile so headlines never overflow.
  return {
    display: { min: r(4, 16) - 4 < 40 ? 40 : r(4, 16) - 4, max: Math.round(17 * Math.pow(ratio, 5) * 1.22), lineHeight: 1.04, weight: displayWeight, tracking },
    h1: { min: 34, max: Math.round(17 * Math.pow(ratio, 4)), lineHeight: 1.08, weight: displayWeight, tracking },
    h2: { min: 28, max: Math.round(17 * Math.pow(ratio, 3)), lineHeight: 1.12, weight: displayWeight, tracking },
    h3: { min: 20, max: Math.round(17 * Math.pow(ratio, 2)), lineHeight: 1.25, weight: Math.max(500, displayWeight - 100), tracking: "-0.01em" },
    h4: { min: 17, max: Math.round(17 * ratio), lineHeight: 1.35, weight: 600, tracking: "-0.005em" },
    "body-lg": { min: 17, max: 19, lineHeight: 1.6, weight: 400, tracking: "0em" },
    body: { min: 15, max: 16, lineHeight: 1.6, weight: 400, tracking: "0em" },
    small: { min: 13, max: 14, lineHeight: 1.5, weight: 400, tracking: "0em" },
    caption: { min: 12, max: 12, lineHeight: 1.4, weight: 500, tracking: "0.06em" },
  };
}

/** Deterministically derive a complete token set from an art direction + brief. */
export function generateTokens(brief: DesignBrief): DesignTokens {
  const category: SiteCategory = brief.category ?? "saas";
  const styleId = brief.style ?? matchStyles({ ...brief, category })[0]!.style;
  const s = getStyle(styleId);
  // Styles whose built-in accent is generic (indigo, or a single green or orange shared by every site) get a per-brief derived accent; the others keep their identity colour.
  const accentRequested = brief.accent ?? (styleId === "aurora-dark" || styleId === "clarity-light" || styleId === "field-notes" || styleId === "warm-human" || styleId === "material-tonal" || styleId === "pastel-play" ? pickAccent({ ...brief, category }) : s.defaultAccent);
  // Optional: on the light "paper" styles the surfaces, borders and ink can take the brand hue (same lightness, so contrast is unchanged).
  // Opt-in only (brief.tint): in the v0.10.0 benchmark, tinting made green-accent pages entirely mint and judges called them generic; the style's own warm paper scored better.
  const p = brief.tint && TINT_STYLES.has(styleId) ? tintPalette(s.palette, hexToHsl(accentRequested).h) : s.palette;

  // Accent must be usable as a button fill: choose foreground by contrast, then guarantee text-grade accent for links.
  const accentFg = readableOn(accentRequested, "#ffffff", p.text === "#ffffff" ? "#0b0b10" : s.mode === "dark" ? "#06060a" : p.text);
  // A button fill must reach 4.5:1 with its label. If the brand colour cannot, keep its hue and nudge lightness minimally.
  const accentIn = ensureContrast(accentRequested, accentFg, 4.5);
  const accentSoft = mix(p.bg, accentIn, s.mode === "dark" ? 0.16 : 0.1);
  // accent-coloured text appears on bg, surfaces and the tinted accent-soft pill: it must pass AA on all of them
  let accentText = accentIn;
  for (const bgc of [p.bg, p.surface, p.surface2, accentSoft]) accentText = ensureContrast(accentText, bgc, 4.5);
  const h = hexToHsl(accentIn);
  // Light styles pair the brand hue with a curated warm/cool complement (a green brand gets terracotta, a red one teal) instead of a blind hue rotation, which turned forest green into magenta.
  const curated = s.mode !== "dark" && styleId !== "terminal-dev";
  const accent2 = hslToHex({ h: curated ? pairHue(h.h) : h.h + s.secondaryHueShift, s: curated ? Math.min(0.62, Math.max(0.42, h.s)) : Math.min(0.85, h.s), l: s.mode === "dark" ? 0.68 : curated ? 0.43 : 0.5 });
  const motion = (brief.motion ?? s.defaultMotion);

  // semantic colours (success/warning/danger) are used as text on plain surfaces AND on their own ~14% tint (status pills)
  const onBoth = (c: string) => {
    let x = c;
    for (let pass = 0; pass < 3; pass++) for (const b of [p.bg, p.surface, p.surface2]) { x = ensureContrast(x, b, 4.6); x = ensureContrast(x, mix(b, x, 0.14), 4.6); }
    return x;
  };
  const success = onBoth(s.mode === "dark" ? "#4ade80" : "#15803d");
  const warning = onBoth(s.mode === "dark" ? "#fbbf24" : "#b45309");
  const danger = onBoth(s.mode === "dark" ? "#f87171" : "#b91c1c");
  const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
  const tokens: DesignTokens = {
    meta: {
      name: brief.name,
      style: styleId,
      mode: s.mode,
      category,
      description: `${s.name} art direction for ${brief.name}. ${s.summary}`,
    },
    color: {
      bg: p.bg, surface: p.surface, surface2: p.surface2, border: p.border,
      text: p.text,
      muted: ensureContrast(p.muted, p.bg, 4.5),
      accent: accentIn,
      accentFg,
      accentSoft,
      accent2,
      success, warning, danger,
      accent2Fg: readableOn(accent2), successFg: readableOn(success), warningFg: readableOn(warning),
    },
    font: { display: s.fonts.display, body: s.fonts.body, mono: s.fonts.mono, googleFamilies: s.fonts.google },
    type: { ratio: s.ratio, scale: typeScale(s.ratio, s.fonts.displayWeight, s.fonts.displayTracking) },
    space: { unit: 4, scale: space },
    radius: s.radius,
    shadow: s.shadows,
    border: { width: s.borderWidth },
    motion: {
      intensity: Math.min(motion, s.maxMotion) as 0 | 1 | 2 | 3,
      fast: "140ms", base: "240ms", slow: "520ms",
      easing: "cubic-bezier(.2,.7,.2,1)",
    },
    layout: { container: 1200, gutter: 24, sectionY: { min: 56, max: 104 }, grid: 12 },
    composition: s.composition,
  };
  // keep a derived text-safe accent available for links on bg
  (tokens.color as Record<string, string>)["accentText"] = accentText;
  return tokens;
}

export interface TokenIssue { severity: "error" | "warning" | "info"; rule: string; message: string }

/** Validate contrast and structure of a token set. */
export function lintTokens(t: DesignTokens): TokenIssue[] {
  const out: TokenIssue[] = [];
  const pairs: Array<[string, string, string, number]> = [
    ["text", t.color.text, t.color.bg, 7],
    ["text on surface", t.color.text, t.color.surface, 7],
    ["muted", t.color.muted, t.color.bg, 4.5],
    ["muted on surface", t.color.muted, t.color.surface, 4.5],
    ["accentFg on accent", t.color.accentFg, t.color.accent, 4.5],
  ];
  for (const [label, fg, bg, min] of pairs) {
    const c = contrast(fg, bg);
    if (c < min) out.push({ severity: min >= 7 ? "warning" : "error", rule: "contrast-ratio", message: `${label}: ${c.toFixed(2)}:1 < ${min}:1 (${fg} on ${bg})` });
  }
  const at = (t.color as Record<string, string>)["accentText"];
  if (at) for (const [n, bgc] of [["bg", t.color.bg], ["surface", t.color.surface], ["surface2", t.color.surface2], ["accentSoft", t.color.accentSoft]] as const) if (contrast(at, bgc) < 4.5) out.push({ severity: "error", rule: "contrast-ratio", message: `accent text on ${n} is ${contrast(at, bgc).toFixed(2)}:1 (< 4.5:1)` });
  if (t.motion.intensity > getStyle(t.meta.style).maxMotion) out.push({ severity: "warning", rule: "motion-budget", message: "motion intensity exceeds the style's budget" });
  out.push({ severity: "info", rule: "token-summary", message: `${Object.keys(t.color).length} colors, ${Object.keys(t.type.scale).length} type steps, ${t.space.scale.length} spacing steps` });
  return out;
}

const px = (n: number) => `${n}px`;
const fluid = (min: number, max: number, vwMin = 375, vwMax = 1280) => {
  if (min === max) return px(min);
  const slope = (max - min) / (vwMax - vwMin);
  const intercept = min - slope * vwMin;
  return `clamp(${px(min)}, ${intercept.toFixed(3)}px + ${(slope * 100).toFixed(4)}vw, ${px(max)})`;
};

/** tokens.css — the single source of visual truth consumed by every section and by the verifier. */
export function renderTokensCss(t: DesignTokens): string {
  const c = t.color as Record<string, string>;
  const lines: string[] = [":root {", "  color-scheme: " + t.meta.mode + ";"];
  const add = (k: string, v: string) => lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(c)) add(`c-${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`, v);
  add("accent-glow", t.meta.mode === "dark" ? hexA(t.color.accent, 0.35) : hexA(t.color.accent, 0.3));
  add("f-display", t.font.display); add("f-body", t.font.body); add("f-mono", t.font.mono);
  for (const [k, st] of Object.entries(t.type.scale)) {
    add(`t-${k}`, fluid(st.min, st.max));
    add(`lh-${k}`, String(st.lineHeight));
    add(`fw-${k}`, String(st.weight));
    add(`tr-${k}`, st.tracking);
  }
  t.space.scale.forEach((v, i) => add(`s-${i}`, px(v)));
  for (const [k, v] of Object.entries(t.radius)) add(`r-${k}`, px(v));
  for (const [k, v] of Object.entries(t.shadow)) add(`sh-${k}`, v);
  add("bw", px(t.border.width));
  add("dur-fast", t.motion.fast); add("dur-base", t.motion.base); add("dur-slow", t.motion.slow); add("ease", t.motion.easing);
  add("container", px(t.layout.container)); add("gutter", px(t.layout.gutter));
  add("section-y", fluid(t.layout.sectionY.min, t.layout.sectionY.max));
  add("motion", String(t.motion.intensity));
  lines.push("}");
  return lines.join("\n") + "\n";
}

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** W3C DTCG-flavoured token export. */
export function renderTokensJson(t: DesignTokens): string {
  const wrap = (type: string, v: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(v).map(([k, value]) => [k, { $type: type, $value: value }]));
  const doc = {
    $description: t.meta.description,
    color: wrap("color", t.color),
    fontFamily: wrap("fontFamily", { display: t.font.display, body: t.font.body, mono: t.font.mono }),
    typography: Object.fromEntries(Object.entries(t.type.scale).map(([k, v]) => [k, { $type: "typography", $value: { fontSize: `${v.max}px`, mobileFontSize: `${v.min}px`, lineHeight: v.lineHeight, fontWeight: v.weight, letterSpacing: v.tracking } }])),
    spacing: wrap("dimension", Object.fromEntries(t.space.scale.map((v, i) => [String(i), `${v}px`]))),
    radius: wrap("dimension", Object.fromEntries(Object.entries(t.radius).map(([k, v]) => [k, `${v}px`]))),
    shadow: wrap("shadow", t.shadow),
    motion: wrap("duration", { fast: t.motion.fast, base: t.motion.base, slow: t.motion.slow }),
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

/** DESIGN.md in Google's alpha spec shape: YAML tokens + ordered prose sections. */
export function renderDesignMd(t: DesignTokens): string {
  const s = getStyle(t.meta.style);
  const q = (v: string) => JSON.stringify(v);
  const typo = (k: string, fam: string) => {
    const st = t.type.scale[k]!;
    return `  ${k}:\n    fontFamily: ${q(fam.split(",")[0]!.replace(/'/g, "").trim())}\n    fontSize: ${st.max}px\n    fontWeight: ${st.weight}\n    lineHeight: ${st.lineHeight}\n    letterSpacing: ${q(st.tracking)}`;
  };
  const yaml = [
    "---",
    "version: alpha",
    `name: ${q(t.meta.name)}`,
    `description: ${q(t.meta.description)}`,
    "colors:",
    `  primary: ${q(t.color.accent)}`,
    `  on-primary: ${q(t.color.accentFg)}`,
    `  secondary: ${q(t.color.accent2)}`,
    `  neutral: ${q(t.color.bg)}`,
    `  surface: ${q(t.color.surface)}`,
    `  surface-raised: ${q(t.color.surface2)}`,
    `  border: ${q(t.color.border)}`,
    `  text: ${q(t.color.text)}`,
    `  text-muted: ${q(t.color.muted)}`,
    "typography:",
    typo("display", t.font.display), typo("h1", t.font.display), typo("h2", t.font.display), typo("h3", t.font.display),
    typo("body-lg", t.font.body), typo("body", t.font.body), typo("small", t.font.body),
    "rounded:",
    ...Object.entries(t.radius).map(([k, v]) => `  ${k}: ${v}px`),
    "spacing:",
    ...t.space.scale.map((v, i) => `  s${i}: ${v}px`),
    "components:",
    "  button-primary:",
    `    backgroundColor: "{colors.primary}"`,
    `    textColor: "{colors.on-primary}"`,
    `    rounded: "{rounded.pill}"`,
    "    padding: 14px",
    "  button-primary-hover:",
    `    backgroundColor: "{colors.secondary}"`,
    "  page:",
    `    backgroundColor: "{colors.neutral}"`,
    `    textColor: "{colors.text}"`,
    "  card-raised:",
    `    backgroundColor: "{colors.surface-raised}"`,
    `    textColor: "{colors.text}"`,
    "  divider:",
    `    backgroundColor: "{colors.border}"`,
    "  caption:",
    `    textColor: "{colors.text-muted}"`,
    `    backgroundColor: "{colors.neutral}"`,
    "  card:",
    `    backgroundColor: "{colors.surface}"`,
    `    textColor: "{colors.text}"`,
    `    rounded: "{rounded.lg}"`,
    "    padding: 24px",
    "---",
  ].join("\n");
  const body = `
## Overview

${s.summary}

**Art direction — ${s.name}.** ${t.composition.imageTreatment}

Signatures:
${s.signatures.map((x) => `- ${x}`).join("\n")}

## Colors

- **Primary (${t.color.accent}):** the only call-to-action fill. Foreground on it is ${t.color.accentFg}.
- **Secondary (${t.color.accent2}):** a derived accent for data and illustrations only, never for buttons.
- **Neutral (${t.color.bg}) / Surface (${t.color.surface}) / Surface-raised (${t.color.surface2}):** the elevation ladder; each nested layer steps up one surface.
- **Text (${t.color.text}) / Text-muted (${t.color.muted}):** both meet WCAG AA on every surface.

## Typography

Display: ${t.font.display.split(",")[0]!.replace(/'/g, "")}. Body: ${t.font.body.split(",")[0]!.replace(/'/g, "")}. Mono: ${t.font.mono.split(",")[0]!.replace(/'/g, "")}.
Modular scale ratio ${t.type.ratio}; sizes are fluid between a 375px and a 1280px viewport. Only the steps defined in the front matter may be used.

## Layout

Container ${t.layout.container}px, ${t.layout.grid}-column grid, ${t.layout.gutter}px gutters. Spacing is a 4px base unit; section padding is fluid ${t.layout.sectionY.min}–${t.layout.sectionY.max}px.
Section transitions: ${t.composition.sectionTransition}

## Elevation & Depth

- sm: \`${t.shadow.sm}\`
- md: \`${t.shadow.md}\`
- lg: \`${t.shadow.lg}\`

## Shapes

Radii: ${Object.entries(t.radius).map(([k, v]) => `${k} ${v}px`).join(", ")}. Border width ${t.border.width}px.

## Components

\`button-primary\` is the single highest-emphasis action per viewport. Hero composition: **${t.composition.heroVariant}**. CTA hierarchy: **${t.composition.ctaHierarchy}**. Motion intensity ${t.motion.intensity}/3 (all motion respects \`prefers-reduced-motion\`).

## Do's and Don'ts

${s.doNot.map((x) => `- ❌ ${x}`).join("\n")}
- ✅ Reference tokens by variable (\`var(--c-accent)\`), never by literal value.
- ✅ Keep one primary CTA per viewport.
`;
  return yaml + "\n" + body;
}
