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
  /** How features with visuals are laid out. Default "rows": every product visual is on screen at once (tabs hide all but one). */
  featureLayout?: "rows" | "tabs";
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
  /** 1-3 small stat chips layered over the hero visual, e.g. {label:"Next free slot",value:"Today 4:10pm",tone:"good"}. Makes the hero read as a composed product scene. */
  heroFloats?: Array<{ label: string; value: string; tone?: "good" | "warn" | "info" }>;
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
  /** currency symbol (default "$"), savings badge text (default "Save 20%"), per-tier unit (default "/ seat / month"; use "/ month" for individual plans). */
  pricing?: { title?: string; subtitle?: string; currency?: string; savings?: string; tiers: Array<{ name: string; monthly: number | string; yearly: number | string; desc: string; features: string[]; cta: string; featured?: boolean; unit?: string }> };
  /** Override the generated nav. signIn:false removes the sign-in link. */
  nav?: { links?: Array<{ label: string; href: string }>; signIn?: { label: string; href: string } | false };
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

const CATEGORY_WORDS: Array<[RegExp, SiteCategory]> = [
  [/ecommerce|e-commerce|shop|store|retail|marketplace|dtc|commerce|ceramic|fashion|food|subscription box/, "ecommerce"],
  [/portfolio|photograph|artist|illustrat|freelance creative/, "portfolio"], [/agency|studio|architect|interior|design firm|consult|creative/, "agency"],
  [/fintech|financ|bank|payment|invoic|account|bookkeep|lending|insur|crypto|ledger|payroll/, "fintech"],
  [/ai\b|ml\b|llm|assistant|copilot|machine learning|agent|transcri|generative/, "ai-product"],
  [/devtool|developer|devops|observab|infra|api\b|sdk|database|data pipeline|monitoring|security|cli\b|open.?source|data eng/, "devtool"],
  [/consumer|wellness|health|journal|habit|meditat|fitness|therapy|mental|family|personal|lifestyle|education|learning|travel|game/, "consumer-app"],
  [/saas|b2b|software|platform|crm|hr\b|productivity|collaborat|project|analytics|operations/, "saas"],
];
/** Free-text category → one of the 8 engine categories (small models write "wellness", "data observability"…). */
export function normalizeCategory(input: unknown): SiteCategory {
  const t = String(input ?? "").toLowerCase().trim();
  const exact = (["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"] as const).find((c) => c === t);
  if (exact) return exact;
  return CATEGORY_WORDS.find(([re]) => re.test(t))?.[1] ?? "saas";
}

const WIDE: VisualKind[] = ["dashboard", "chart", "table", "kanban", "schedule", "gallery", "product-cards", "metrics"];

export interface PlannedSite { tokens: DesignTokens; spec: PageSpec; layout: Array<{ id: string; type: string; why: string }>; notes: string[] }

/** Deterministic planner: brief → art direction, tokens and a varied, non-template section sequence. */
export function planSite(input: SiteBrief): PlannedSite {
  const brief: SiteBrief = { ...input, category: normalizeCategory(input.category) };
  const desc = `${brief.subheadline} ${(brief.tone ?? []).join(" ")} ${brief.audience ?? ""}`;
  const style = brief.style ?? matchStyles({ name: brief.name, description: desc, category: brief.category })[0]!.style;
  const tokens = generateTokens({ name: brief.name, description: desc, category: brief.category, style, accent: brief.accent });
  const comp = getStyle(style).composition;
  const sections: SectionSpec[] = []; const layout: PlannedSite["layout"] = []; const notes: string[] = [];
  if (brief.features.length > 5) notes.push(`brief.features has ${brief.features.length} items; only the first 5 are shown. Merge or drop the rest.`);
  if (!brief.footer?.columns) notes.push("footer uses generated placeholder columns; set brief.footer.columns with real links.");
  const add = (id: string, type: SectionSpec["type"], props: Record<string, any>, why: string) => { sections.push({ id, type, props }); layout.push({ id, type, why }); };
  const cta = (label: string, href: string) => ({ label, href });

  const has = { features: brief.features.length > 0, pricing: !!brief.pricing?.tiers?.length, faq: (brief.faq?.length ?? 0) > 0, how: !!brief.how };
  const links = [has.features && { label: "Product", href: "#features" }, has.how && { label: "How it works", href: "#how" }, has.pricing && { label: "Pricing", href: "#pricing" }, has.faq && { label: "FAQ", href: "#faq" }].filter(Boolean) as Array<{ label: string; href: string }>;
  const primaryHref = has.pricing ? "#pricing" : "#cta";
  add("nav", "navbar-glass", { links: brief.nav?.links ?? links, signIn: brief.nav?.signIn === false ? undefined : (brief.nav?.signIn ?? { label: "Sign in", href: primaryHref }), cta: cta(brief.primaryCta, primaryHref) }, "wayfinding + primary CTA");

  const hv = brief.heroVisual;
  const heroType = !hv && comp.heroVariant === "editorial" ? "hero-editorial" : hv && WIDE.includes(hv.kind) ? "hero-centered-product" : hv ? "hero-split" : comp.heroVariant === "split" ? "hero-split" : "hero-centered-product";
  add("hero", heroType, { title: brief.headline, subtitle: brief.subheadline, primaryCta: cta(brief.primaryCta, primaryHref), secondaryCta: brief.secondaryCta ? cta(brief.secondaryCta, "#features") : undefined, note: brief.heroNote, floats: brief.heroFloats?.slice(0, 3), ...(hv ? { visual: hv } : {}), ...(heroType === "hero-editorial" ? { stats: (brief.metrics ?? []).slice(0, 3).map((m) => ({ value: m.value, label: m.label })) } : {}) },
    hv ? `hero shows the product itself (${hv.kind}); ${WIDE.includes(hv.kind) ? "wide visual → centered layout" : "narrow visual → split layout"}` : `no hero visual given → ${heroType}`);

  if (brief.logos?.length) add("logos", "logo-cloud", { label: brief.logosLabel ?? "Trusted by teams at", logos: brief.logos, marquee: brief.logos.length >= 7 }, "social proof directly under the hero");

  const withVis = brief.features.filter((f) => f.visual);
  if (has.features) {
    const title = brief.featuresTitle ?? "What it does";
    if (withVis.length >= 3 && (brief.featureLayout ?? "rows") === "rows") add("features", "feature-rows", { anchor: "features", align: "left", eyebrow: "Product", title, items: brief.features.slice(0, 6).map((f, i) => ({ title: f.title, body: f.body, bullets: f.bullets, visual: f.visual ?? ["list", "chart", "ui", "table"][i % 4] })) }, "≥3 features have visuals → alternating rows so every product visual is visible at once (tabs hide all but one)");
    else if (withVis.length >= 3) add("features", "feature-tabs", { anchor: "features", align: "left", eyebrow: "Product", title, tabs: brief.features.slice(0, 5).map((f) => ({ label: f.title, icon: f.icon, title: f.title, body: f.body, bullets: f.bullets, visual: f.visual })) }, "≥3 features have visuals → interactive tabs (depth without identical cards)");
    else if (brief.showcase) { add("features", "feature-showcase", { anchor: "features", align: "left", eyebrow: "Product", title: brief.showcase.title, subtitle: brief.showcase.subtitle, visual: brief.showcase.visual, callouts: brief.showcase.callouts }, "one large product visual with callouts"); }
    else add("features", "feature-bento", { anchor: "features", align: "left", eyebrow: "Product", title, items: brief.features.slice(0, 5).map((f, i) => ({ title: f.title, body: f.body, icon: f.icon, visual: f.visual ?? ["bars", "list", "code", "toggle", "avatars"][i % 5], span: i === 0 ? 4 : i === 1 ? 2 : 2 })) }, "few visuals → bento with mini-visuals");
    if (brief.showcase && withVis.length >= 3) add("showcase", "feature-showcase", { eyebrow: "In depth", title: brief.showcase.title, subtitle: brief.showcase.subtitle, visual: brief.showcase.visual, callouts: brief.showcase.callouts, tint: true }, "extra depth section");
  }
  if (brief.comparison) add("comparison", "comparison", { align: "left", ...brief.comparison }, "makes the pain and the payoff explicit");
  if (brief.how) add("how", brief.how.visual ? "steps-timeline" : "steps", { anchor: "how", eyebrow: "How it works", ...brief.how, items: brief.how.steps }, brief.how.visual ? "steps with a sticky product visual" : "three simple steps");
  if (brief.integrations) add("integrations", "integrations", brief.integrations, "shows fit with the stack");
  const sparkish = (brief.metrics ?? []).some((m) => Array.isArray(m.spark) && m.spark.length > 2);
  if (brief.metrics?.length) add("metrics", sparkish ? "metrics-spark" : "metrics", { tint: true, ink: !sparkish, items: brief.metrics.slice(0, 4) }, sparkish ? "metric cards with sparklines" : "plain stat band");
  const t = brief.testimonials ?? [];
  if (t.length === 1 || (t.length >= 1 && t.length < 3)) add("testimonials", "quote-feature", { quote: t[0]!.quote, name: t[0]!.name, role: t[0]!.role, stats: t[0]!.stats ?? [], tint: !brief.metrics?.length }, "one strong quote beats three vague ones");
  else if (t.length >= 3) add("testimonials", "testimonial-wall", { title: "What customers say", items: t.slice(0, 5).map((q, i) => ({ ...q, big: i === 0 })) }, "varied masonry wall");
  if (has.pricing) add("pricing", "pricing", { anchor: "pricing", eyebrow: "Pricing", title: brief.pricing!.title ?? "Simple pricing", subtitle: brief.pricing!.subtitle, currency: brief.pricing!.currency, savings: brief.pricing!.savings, tiers: brief.pricing!.tiers.map((x) => ({ name: x.name, monthly: x.monthly, yearly: x.yearly, desc: x.desc, features: x.features, cta: cta(x.cta, "#cta"), featured: x.featured, unit: x.unit })) }, "cost made legible");
  if (has.faq) add("faq", (brief.faq!.length >= 4 ? "faq-split" : "faq"), { anchor: "faq", eyebrow: "FAQ", title: "Questions, answered", items: brief.faq }, "objection handling");
  const c = brief.closing ?? { title: `Try *${brief.name}*`, subtitle: brief.subheadline };
  add("cta", c.form ? "cta-split" : "cta-band", c.form ? { anchor: "cta", title: c.title, subtitle: c.subtitle, bullets: c.bullets, form: { button: c.button ?? brief.primaryCta, note: c.note ?? "", label: "Work email" } } : { anchor: "cta", title: c.title, subtitle: c.subtitle, primaryCta: cta(brief.primaryCta, "#top"), secondaryCta: brief.secondaryCta ? cta(brief.secondaryCta, "#features") : undefined }, "single closing ask");
  add("footer", "footer-columns", { tagline: brief.footer?.tagline ?? firstSentence(brief.subheadline, 96), columns: brief.footer?.columns ?? [{ title: "Product", links: links.length ? links : [{ label: "Home", href: "#top" }] }, { title: "Get started", links: [{ label: brief.primaryCta, href: has.pricing ? "#pricing" : "#cta" }, ...(brief.secondaryCta ? [{ label: brief.secondaryCta, href: "#features" }] : [])] }, { title: "Company", links: [{ label: "Back to top", href: "#top" }, ...(has.faq ? [{ label: "Questions", href: "#faq" }] : [])] }], legal: brief.footer?.legal ?? `© ${new Date().getFullYear()} ${brief.name}`, note: "" }, "navigation and legal");

  return { tokens, spec: { title: `${brief.name} — ${brief.headline.replace(/\*/g, "").slice(0, 70)}`, description: brief.subheadline, brand: { name: brief.name }, sections }, layout, notes };
}

export const VISUAL_SUGGESTIONS: Record<SiteCategory, VisualKind[]> = {
  saas: ["ui", "table", "chart", "kanban"], "ai-product": ["ui", "chat", "code", "timeline"], devtool: ["code", "terminal", "timeline", "table"], fintech: ["invoice", "chart", "table", "ui"],
  agency: ["gallery", "ui", "timeline"], portfolio: ["gallery", "timeline"], ecommerce: ["product-cards", "chart", "checklist"], "consumer-app": ["ui", "chart", "schedule", "checklist"],
};

/** A complete example brief to copy and rewrite (domain-neutral wording; the structure is the point). */
export function briefTemplate(category: SiteCategory = "saas"): SiteBrief {
  const kinds = VISUAL_SUGGESTIONS[category];
  return {
    name: "Acme", headline: "Replace with a specific outcome in 5–12 words, with *one emphasised phrase*", subheadline: "One or two sentences: what it does, for whom, and the measurable result. No buzzwords.",
    category, audience: "who buys and who uses it", tone: ["calm", "precise"],
    // style is optional: leave it out and the engine picks from your tone words. Options: see styleGuide() — e.g. "field-notes" (warm paper, serif), "clarity-light", "editorial-paper", "warm-human", "terminal-dev", "aurora-dark", "neo-brutal".
    primaryCta: "Start a free trial", secondaryCta: "See how it works", heroNote: "14-day trial · no card",
    // Show YOUR product doing its job with specific data. kind:"ui" composes a bespoke screen from blocks (5-8 recommended):
    heroFloats: [{ label: "A specific number from the product", value: "e.g. 38 sec", tone: "good" }, { label: "A second proof point", value: "e.g. 2 flagged", tone: "warn" }],
    heroVisual: { kind: "ui", title: "Name of the screen", blocks: [
      { type: "text", label: "Prompt from your therapist", text: "A specific, in-character line the product shows", style: "italic" },
      { type: "text", text: "A second line of realistic content the user wrote or sees." },
      { type: "mood", label: "How are you feeling?", value: 6, max: 10 },
      { type: "chips", items: ["tag one", { text: "status", tone: "ok" }] },
      { type: "list", items: [{ title: "Specific item", meta: "detail", tag: "new", tone: "info" }, { title: "Another item", meta: "detail" }], side: true },
      { type: "toggle", label: "A setting the user controls", on: true, side: true },
      { type: "callout", text: "A reassuring or important state message", tone: "ok", side: true },
    ] } as unknown as VisualSpec,
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

/** One line per art direction, for the model to choose from consciously. */
export function styleGuide(): Array<{ id: StyleId; use_for: string; look: string }> {
  const use: Record<StyleId, string> = {
    "field-notes": "calm, human, trustworthy, plain-spoken products (therapy, health, finance for people, education)",
    "clarity-light": "crisp B2B SaaS and fintech with a confident, modern tone",
    "editorial-paper": "studios, agencies, portfolios, premium and crafted brands",
    "warm-human": "friendly consumer apps and ecommerce",
    "terminal-dev": "developer tools, CLIs, infrastructure and data products",
    "aurora-dark": "dark, premium AI and platform products (only when the brief wants dark)",
    "neo-brutal": "loud, playful, creative brands",
  };
  return (Object.keys(use) as StyleId[]).map((id) => ({ id, use_for: use[id], look: getStyle(id).summary }));
}
