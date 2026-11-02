import type { DesignTokens, SiteCategory, StyleId } from "../design/types.js";
import { generateTokens, matchStyles } from "../design/system.js";
import { getStyle } from "../design/styles.js";
import type { PageSpec, SectionSpec } from "./types.js";
import type { VisualKind, VisualSpec } from "./visuals.js";

/** The one structured document a small model has to write. Everything else is decided by the engine. */
export interface SiteBrief {
  name: string;
  /** Hero headline. Wrap the key outcome in *asterisks*. */
  headline: string;
  subheadline: string;
  category: SiteCategory;
  audience?: string;
  /** Tone words steer art direction and accent: calm, bold, premium, playful, technical… */
  tone?: string[];
  accent?: string;
  style?: StyleId;
  primaryCta: string;
  secondaryCta?: string;
  heroNote?: string;
  /** Domain visual for the hero, e.g. {kind:"timeline", items:[…]}. */
  heroVisual?: VisualSpec;
  logos?: string[];
  logosLabel?: string;
  /** 3–6 capabilities. Give each a `visual` when possible: it becomes an interactive tab with a product screenshot. */
  features: Array<{ title: string; body: string; icon?: string; bullets?: string[]; visual?: VisualSpec }>;
  featuresTitle?: string;
  showcase?: { title: string; subtitle?: string; visual: VisualSpec; callouts: Array<{ title: string; body: string; icon?: string }> };
  comparison?: { title: string; them: { label: string; items: string[] }; us: { label: string; items: string[] } };
  how?: { title: string; subtitle?: string; steps: Array<{ title: string; body: string }>; visual?: VisualSpec };
  integrations?: { title: string; items: Array<{ name: string; icon?: string; desc?: string }> };
  metrics?: Array<{ value: string; label: string; delta?: string; spark?: number[] }>;
  testimonials?: Array<{ quote: string; name: string; role: string; stats?: Array<{ value: string; label: string }> }>;
  pricing?: { title?: string; subtitle?: string; tiers: Array<{ name: string; monthly: number | string; yearly: number | string; desc: string; features: string[]; cta: string; featured?: boolean }> };
  faq?: Array<{ q: string; a: string }>;
  closing?: { title: string; subtitle: string; bullets?: string[]; form?: boolean; button?: string; note?: string };
  footer?: { tagline?: string; columns?: Array<{ title: string; links: Array<{ label: string; href: string }> }>; legal?: string };
}

/** First sentence, cut at a word boundary, never mid-word. */
function firstSentence(t: string, max: number): string {
  const s = t.split(/(?<=[.!?])\s/)[0] ?? t;
  if (s.length <= max) return s;
  const cut = s.slice(0, max).replace(/\s+\S*$/, "");
  return cut.replace(/[,;:]$/, "") + "…";
}

const WIDE: VisualKind[] = ["dashboard", "chart", "table", "kanban", "schedule", "gallery", "product-cards", "metrics"];

export interface PlannedSite { tokens: DesignTokens; spec: PageSpec; layout: Array<{ id: string; type: string; why: string }> }

/** Deterministic planner: brief → art direction, tokens and a varied, non-template section sequence. */
export function planSite(brief: SiteBrief): PlannedSite {
  const desc = `${brief.subheadline} ${(brief.tone ?? []).join(" ")} ${brief.audience ?? ""}`;
  const style = brief.style ?? matchStyles({ name: brief.name, description: desc, category: brief.category })[0]!.style;
  const tokens = generateTokens({ name: brief.name, description: desc, category: brief.category, style, accent: brief.accent });
  const comp = getStyle(style).composition;
  const sections: SectionSpec[] = []; const layout: PlannedSite["layout"] = [];
  const add = (id: string, type: SectionSpec["type"], props: Record<string, any>, why: string) => { sections.push({ id, type, props }); layout.push({ id, type, why }); };
  const cta = (label: string, href: string) => ({ label, href });

  const has = { features: brief.features.length > 0, pricing: !!brief.pricing?.tiers?.length, faq: (brief.faq?.length ?? 0) > 0, how: !!brief.how };
  const links = [has.features && { label: "Product", href: "#features" }, has.how && { label: "How it works", href: "#how" }, has.pricing && { label: "Pricing", href: "#pricing" }, has.faq && { label: "FAQ", href: "#faq" }].filter(Boolean) as Array<{ label: string; href: string }>;
  const primaryHref = has.pricing ? "#pricing" : "#cta";
  add("nav", "navbar-glass", { links, signIn: { label: "Sign in", href: "#" }, cta: cta(brief.primaryCta, primaryHref) }, "wayfinding + primary CTA");

  const hv = brief.heroVisual;
  const heroType = !hv && comp.heroVariant === "editorial" ? "hero-editorial" : hv && WIDE.includes(hv.kind) ? "hero-centered-product" : hv ? "hero-split" : comp.heroVariant === "split" ? "hero-split" : "hero-centered-product";
  add("hero", heroType, { title: brief.headline, subtitle: brief.subheadline, primaryCta: cta(brief.primaryCta, primaryHref), secondaryCta: brief.secondaryCta ? cta(brief.secondaryCta, "#features") : undefined, note: brief.heroNote, ...(hv ? { visual: hv } : {}), ...(heroType === "hero-editorial" ? { stats: (brief.metrics ?? []).slice(0, 3).map((m) => ({ value: m.value, label: m.label })) } : {}) },
    hv ? `hero shows the product itself (${hv.kind}); ${WIDE.includes(hv.kind) ? "wide visual → centered layout" : "narrow visual → split layout"}` : `no hero visual given → ${heroType}`);

  if (brief.logos?.length) add("logos", "logo-cloud", { label: brief.logosLabel ?? "Trusted by teams at", logos: brief.logos, marquee: brief.logos.length >= 7 }, "social proof directly under the hero");

  const withVis = brief.features.filter((f) => f.visual);
  if (has.features) {
    const title = brief.featuresTitle ?? "What it does";
    if (withVis.length >= 3) add("features", "feature-tabs", { anchor: "features", eyebrow: "Product", title, tabs: brief.features.slice(0, 5).map((f) => ({ label: f.title, icon: f.icon, title: f.title, body: f.body, bullets: f.bullets, visual: f.visual })) }, "≥3 features have visuals → interactive tabs (depth without identical cards)");
    else if (brief.showcase) { add("features", "feature-showcase", { anchor: "features", eyebrow: "Product", title: brief.showcase.title, subtitle: brief.showcase.subtitle, visual: brief.showcase.visual, callouts: brief.showcase.callouts }, "one large product visual with callouts"); }
    else add("features", "feature-bento", { anchor: "features", eyebrow: "Product", title, items: brief.features.slice(0, 5).map((f, i) => ({ title: f.title, body: f.body, icon: f.icon, visual: f.visual ?? ["bars", "list", "code", "toggle", "avatars"][i % 5], span: i === 0 ? 4 : i === 1 ? 2 : 2 })) }, "few visuals → bento with mini-visuals");
    if (brief.showcase && withVis.length >= 3) add("showcase", "feature-showcase", { eyebrow: "In depth", title: brief.showcase.title, subtitle: brief.showcase.subtitle, visual: brief.showcase.visual, callouts: brief.showcase.callouts, tint: true }, "extra depth section");
  }
  if (brief.comparison) add("comparison", "comparison", brief.comparison, "makes the pain and the payoff explicit");
  if (brief.how) add("how", brief.how.visual ? "steps-timeline" : "steps", { anchor: "how", eyebrow: "How it works", ...brief.how, items: brief.how.steps }, brief.how.visual ? "steps with a sticky product visual" : "three simple steps");
  if (brief.integrations) add("integrations", "integrations", brief.integrations, "shows fit with the stack");
  const sparkish = (brief.metrics ?? []).some((m) => m.spark || m.delta);
  if (brief.metrics?.length) add("metrics", sparkish ? "metrics-spark" : "metrics", { tint: true, items: brief.metrics.slice(0, 4) }, sparkish ? "metric cards with sparklines" : "plain stat band");
  const t = brief.testimonials ?? [];
  if (t.length === 1 || (t.length >= 1 && t.length < 3)) add("testimonials", "quote-feature", { quote: t[0]!.quote, name: t[0]!.name, role: t[0]!.role, stats: t[0]!.stats ?? [], tint: !brief.metrics?.length }, "one strong quote beats three vague ones");
  else if (t.length >= 3) add("testimonials", "testimonial-wall", { title: "What customers say", items: t.slice(0, 5).map((q, i) => ({ ...q, big: i === 0 })) }, "varied masonry wall");
  if (has.pricing) add("pricing", "pricing", { anchor: "pricing", eyebrow: "Pricing", title: brief.pricing!.title ?? "Simple pricing", subtitle: brief.pricing!.subtitle, tiers: brief.pricing!.tiers.map((x) => ({ name: x.name, monthly: x.monthly, yearly: x.yearly, desc: x.desc, features: x.features, cta: cta(x.cta, "#cta"), featured: x.featured })) }, "cost made legible");
  if (has.faq) add("faq", (brief.faq!.length >= 4 ? "faq-split" : "faq"), { anchor: "faq", eyebrow: "FAQ", title: "Questions, answered", items: brief.faq }, "objection handling");
  const c = brief.closing ?? { title: `Try *${brief.name}*`, subtitle: brief.subheadline };
  add("cta", c.form ? "cta-split" : "cta-band", c.form ? { anchor: "cta", title: c.title, subtitle: c.subtitle, bullets: c.bullets, form: { button: c.button ?? brief.primaryCta, note: c.note ?? "", label: "Work email" } } : { anchor: "cta", title: c.title, subtitle: c.subtitle, primaryCta: cta(brief.primaryCta, "#top"), secondaryCta: brief.secondaryCta ? cta(brief.secondaryCta, "#features") : undefined }, "single closing ask");
  add("footer", "footer-columns", { tagline: brief.footer?.tagline ?? firstSentence(brief.subheadline, 96), columns: brief.footer?.columns ?? [{ title: "Product", links: links.length ? links : [{ label: "Home", href: "#top" }] }], legal: brief.footer?.legal ?? `© ${new Date().getFullYear()} ${brief.name}`, note: "" }, "navigation and legal");

  return { tokens, spec: { title: `${brief.name} — ${brief.headline.replace(/\*/g, "").slice(0, 70)}`, description: brief.subheadline, brand: { name: brief.name }, sections }, layout };
}

export const VISUAL_SUGGESTIONS: Record<SiteCategory, VisualKind[]> = {
  saas: ["dashboard", "table", "chart", "kanban"], "ai-product": ["chat", "code", "timeline", "checklist"], devtool: ["code", "terminal", "timeline", "table"], fintech: ["invoice", "chart", "table", "metrics"],
  agency: ["gallery", "metrics", "timeline"], portfolio: ["gallery", "timeline"], ecommerce: ["product-cards", "chart", "checklist"], "consumer-app": ["checklist", "chart", "schedule", "chat"],
};

/** A complete example brief to copy and rewrite (domain-neutral wording; the structure is the point). */
export function briefTemplate(category: SiteCategory = "saas"): SiteBrief {
  const kinds = VISUAL_SUGGESTIONS[category];
  return {
    name: "Acme", headline: "Replace with a specific outcome in 5–12 words, with *one emphasised phrase*", subheadline: "One or two sentences: what it does, for whom, and the measurable result. No buzzwords.",
    category, audience: "who buys and who uses it", tone: ["calm", "precise"], primaryCta: "Start a free trial", secondaryCta: "See how it works", heroNote: "14-day trial · no card",
    heroVisual: { kind: kinds[0]!, title: "Name of the screen", items: [{ time: "14:02", title: "Specific event", detail: "specific detail", status: "bad", tag: "detected" }, { time: "14:03", title: "Next event", status: "info" }] } as VisualSpec,
    logos: ["Customer One", "Customer Two", "Customer Three", "Customer Four", "Customer Five", "Customer Six"],
    features: [
      { title: "Capability one", body: "What it does and what changes for the user, in one sentence.", icon: "lucide:activity", bullets: ["Concrete proof point", "Another proof point"], visual: { kind: kinds[1] ?? "chart", title: "Screen name" } as VisualSpec },
      { title: "Capability two", body: "One sentence.", icon: "lucide:users", visual: { kind: kinds[2] ?? "table", title: "Screen name" } as VisualSpec },
      { title: "Capability three", body: "One sentence.", icon: "lucide:shield-check", visual: { kind: kinds[3] ?? "checklist", title: "Screen name" } as VisualSpec },
    ],
    how: { title: "Live in an afternoon", steps: [{ title: "Connect", body: "Specific first step." }, { title: "Configure", body: "Specific second step." }, { title: "Ship", body: "Specific result." }] },
    metrics: [{ value: "19 min", label: "median time to resolve", delta: "▼ 63%" }, { value: "4,200+", label: "teams", delta: "▲ 12%" }],
    testimonials: [{ quote: "A concrete outcome with a number, in the customer's own words.", name: "Distinctive Name", role: "Role, Company" }],
    pricing: { tiers: [{ name: "Starter", monthly: 0, yearly: 0, desc: "who it is for", features: ["feature"], cta: "Start free" }, { name: "Team", monthly: 24, yearly: 19, desc: "who it is for", features: ["feature"], cta: "Start trial", featured: true }, { name: "Enterprise", monthly: "Custom", yearly: "Custom", desc: "who it is for", features: ["feature"], cta: "Talk to sales" }] },
    faq: [{ q: "A real objection?", a: "A direct answer." }, { q: "Another?", a: "Answer." }, { q: "Another?", a: "Answer." }, { q: "Another?", a: "Answer." }],
    closing: { title: "Run your next *thing* with Acme", subtitle: "Free for 14 days.", bullets: ["No credit card"], form: true, button: "Start free trial", note: "We email a setup link." },
  };
}
