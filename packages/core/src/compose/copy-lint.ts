import type { PageSpec } from "./types.js";
import { normalizeVisual } from "./visuals.js";

export interface LintFinding { severity: "error" | "warning" | "info"; rule: string; where: string; message: string; fix?: string }

/** Generic marketing filler that signals machine-written copy. Matching is case-insensitive, whole-word. */
export const BUZZWORDS = [
  "revolutionize", "revolutionary", "supercharge", "seamless", "seamlessly", "unlock", "unleash", "elevate", "game-changer", "game changing", "cutting-edge", "cutting edge",
  "next-generation", "next-gen", "leverage", "empower", "empowers", "all-in-one", "next level", "streamline", "robust", "effortless", "effortlessly", "world-class", "innovative",
  "state-of-the-art", "holistic", "synergy", "turnkey", "best-in-class", "paradigm", "disrupt", "reimagine", "reimagined", "transform your", "take your", "in today's fast-paced", "end-to-end solution", "ecosystem",
];
const PLACEHOLDERS = /lorem ipsum|dolor sit amet|feature (one|two|three|\d)\b|your (company|product) name|insert .* here|\bTODO\b|\bTBD\b|placeholder|sample text|example\.com/i;
const GENERIC_NAMES = /\b(john|jane) (doe|smith)\b|\balex (johnson|smith)\b|\bsarah (johnson|miller)\b|\bmichael (chen|brown)\b|\bemily (chen|davis)\b|\bjohn d\./i;
const GENERIC_PRAISE = /\b(great|amazing|awesome|fantastic|incredible|excellent|game.?changer) (product|tool|platform|service|solution|app|team)\b|\bhighly recommend|\blove (it|this|using)\b|\bchanged (our|my) (life|business)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
const GENERIC_CTA = /^(click here|submit|learn more|get started now|read more|sign up now|join now)$/i;

function walk(v: unknown, path: string, out: Array<{ path: string; text: string }>) {
  if (typeof v === "string") out.push({ path, text: v });
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["href", "icon", "kind", "seed", "visual", "mock", "type", "tone", "status", "anchor", "chart"].includes(k)) walk(x, path ? `${path}.${k}` : k, out);
}

const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const re = (w: string) => new RegExp(`(^|[^a-z])${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^a-z]|$)`, "i");

/** Spec-level copy lint: run before rendering so a model can fix words, not pixels. */
export function lintCopy(spec: PageSpec): LintFinding[] {
  const f: LintFinding[] = [];
  const texts: Array<{ path: string; text: string; section: string }> = [];
  for (const s of spec.sections) { const t: Array<{ path: string; text: string }> = []; walk(s.props, "", t); for (const x of t) texts.push({ ...x, section: s.id }); }
  const where = (t: { section: string; path: string }) => `${t.section}.${t.path}`;

  for (const t of texts) {
    if (PLACEHOLDERS.test(t.text)) f.push({ severity: "error", rule: "placeholder", where: where(t), message: `Placeholder text: "${t.text.slice(0, 60)}"`, fix: "Write real, specific copy for this product." });
    if (GENERIC_NAMES.test(t.text)) f.push({ severity: "warning", rule: "stock-name", where: where(t), message: `Stock-looking person name: "${t.text.slice(0, 40)}"`, fix: "Use a distinctive fictional name, role and company." });
    if (EMOJI.test(t.text)) f.push({ severity: "warning", rule: "emoji", where: where(t), message: "Emoji in copy reads as machine-made; use icons instead.", fix: "Remove the emoji or set an `icon` (e.g. lucide:siren)." });
    if (/!/.test(t.text) && t.text.length > 4) f.push({ severity: "warning", rule: "exclamation", where: where(t), message: "Exclamation mark — calm, precise copy converts better.", fix: "Use a full stop." });
    for (const w of BUZZWORDS) if (re(w).test(t.text)) { f.push({ severity: "warning", rule: "buzzword", where: where(t), message: `Generic buzzword "${w}": "${t.text.slice(0, 70)}"`, fix: "Say the concrete thing: what happens, for whom, how fast, how much." }); break; }
    if (wc(t.text) > 32 && !/title|quote|answer|^a$|\.a$/.test(t.path)) f.push({ severity: "info", rule: "long-copy", where: where(t), message: `${wc(t.text)} words in one block`, fix: "Split or trim to ≤ 28 words." });
  }

  // hero headline
  const hero = spec.sections.find((s) => s.type.startsWith("hero"));
  const ht = hero?.props.title as string | undefined;
  if (ht) { const n = wc(ht.replace(/\*/g, "")); if (n < 3 || n > 14) f.push({ severity: "warning", rule: "headline-length", where: `${hero!.id}.title`, message: `Hero headline is ${n} words (aim for 5–12).`, fix: "State the outcome in a short, specific sentence." }); }
  if (hero && !/\*[^*]+\*/.test(String(ht ?? ""))) f.push({ severity: "info", rule: "headline-emphasis", where: `${hero.id}.title`, message: "No *emphasised* phrase in the headline.", fix: "Wrap the key outcome in *asterisks* for a focal point." });

  // testimonials
  for (const s of spec.sections) {
    const items = (s.props.items ?? []) as any[];
    if (s.type === "testimonials" || s.type === "testimonial-wall") for (const q of items) {
      const quote = String(q.quote ?? "");
      if (GENERIC_PRAISE.test(quote) || wc(quote) < 8) f.push({ severity: "warning", rule: "generic-testimonial", where: `${s.id}`, message: `Vague testimonial: "${quote.slice(0, 60)}"`, fix: "Quote a concrete outcome with a number or a before/after." });
      else if (!/\d/.test(quote)) f.push({ severity: "info", rule: "testimonial-specifics", where: `${s.id}`, message: `Testimonial has no number: "${quote.slice(0, 50)}"`, fix: "Add a measurable result." });
    }
    if (["feature-bento", "feature-tabs", "feature-showcase"].includes(s.type)) {
      const titles = ((s.props.items ?? s.props.tabs ?? s.props.callouts ?? []) as any[]).map((i) => String(i.title ?? i.label ?? ""));
      const first = titles.map((t) => t.split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
      const dup = first.find((w, i) => first.indexOf(w) !== i && first.filter((x) => x === w).length >= 3);
      if (dup) f.push({ severity: "warning", rule: "uniform-features", where: s.id, message: `Three+ feature titles start with "${dup}".`, fix: "Vary the structure; lead with the outcome or the noun." });
      if (titles.some((t) => wc(t) > 9)) f.push({ severity: "info", rule: "long-feature-title", where: s.id, message: "Feature title over 9 words.", fix: "Keep titles to 2–6 words." });
    }
    if (s.type === "metrics" || s.type === "metrics-spark") for (const m of (s.props.items ?? []) as any[]) if (!/\d/.test(String(m.value ?? ""))) f.push({ severity: "warning", rule: "metric-no-number", where: s.id, message: `Metric "${m.value}" has no number.`, fix: "Use a real figure with a unit." });
    for (const k of ["primaryCta", "secondaryCta", "cta"]) { const l = s.props[k]?.label; if (l && GENERIC_CTA.test(String(l).trim())) f.push({ severity: "warning", rule: "generic-cta", where: `${s.id}.${k}`, message: `Generic CTA label "${l}".`, fix: "Name the action and the payoff: “Start a free trial”, “Book a 20-min demo”." }); }
  }

  // repeated 5-grams across sections (copy-paste padding)
  const grams = new Map<string, string>();
  for (const t of texts) { const w = t.text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean); for (let i = 0; i + 5 <= w.length; i++) { const g = w.slice(i, i + 5).join(" "); const prev = grams.get(g); if (prev && prev !== t.section) { f.push({ severity: "info", rule: "repeated-phrase", where: `${prev} / ${t.section}`, message: `Phrase repeated across sections: "${g}"`, fix: "Say it once." }); grams.set(g, t.section); } else if (!prev) grams.set(g, t.section); } }
  return f;
}

const NEEDS: Record<string, string[]> = {
  dashboard: ["kpis"], table: ["columns", "rows"], timeline: ["items"], chart: ["series"], kanban: ["columns"], chat: ["messages"], code: ["code"], terminal: ["code"],
  invoice: ["items"], schedule: ["rows"], checklist: ["items"], metrics: ["items"], gallery: ["items"], "product-cards": ["items"],
};

/** A domain visual with no data renders empty. Catch it before the model has to notice in a screenshot. */
export function lintVisuals(spec: PageSpec): LintFinding[] {
  const out: LintFinding[] = [];
  const visit = (v: any, where: string) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${where}[${i}]`)); return; }
    if (typeof v.kind === "string" && NEEDS[v.kind]) {
      v = normalizeVisual(v) ?? v;
      const missing = NEEDS[v.kind]!.filter((k) => { const x = v[k]; return x === undefined || x === null || (Array.isArray(x) && x.length === 0) || (typeof x === "string" && !x.trim()); });
      if (missing.length) out.push({ severity: "error", rule: "visual-empty", where, message: `${v.kind} visual has no ${missing.join(" / ")} — it will render empty.`, fix: `Give it real data, e.g. ${v.kind === "table" ? '{kind:"table", columns:["Invoice","Client","Amount","Status"], rows:[["INV-204","Quillstone","$4,800",{"text":"Paid","tone":"ok"}]]}' : `${missing.map((m) => m + ":[…]").join(", ")}`}` });
    }
    for (const [k, x] of Object.entries(v)) if (x && typeof x === "object") visit(x, `${where}.${k}`);
  };
  for (const sec of spec.sections) visit(sec.props, sec.id);
  return out;
}
