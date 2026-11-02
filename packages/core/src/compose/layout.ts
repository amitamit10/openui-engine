import type { DesignTokens, SiteCategory, StyleId } from "../design/types.js";
import { getStyle } from "../design/styles.js";
import type { PageSpec, SectionSpec, SectionType } from "./sections.js";

export interface LayoutSuggestion {
  surface: string;
  archetype: string;
  sections: Array<{ type: SectionType; componentId: string; why: string }>;
  notes: string[];
}

const heroFor = (style: StyleId): SectionType => {
  const v = getStyle(style).composition.heroVariant;
  return v === "centered-product" ? "hero-centered-product" : v === "split" ? "hero-split" : "hero-editorial";
};

/** Surface-first layout reasoning (mirrors the claude-design skill): name the surface, then pick the sequence. */
export function suggestLayout(category: SiteCategory, style: StyleId, goal = "convert"): LayoutSuggestion {
  const hero = heroFor(style);
  const s = (type: SectionType, why: string) => ({ type, componentId: `openui/${type.replace(/^hero-.*/, (m) => m)}`, why });
  const seq: LayoutSuggestion["sections"] = [
    s("navbar-glass", "Persistent wayfinding and a primary CTA within reach at all times."),
    s(hero, `Hero for style ${style}: ${getStyle(style).composition.heroVariant} composition.`),
  ];
  const push = (t: SectionType, why: string) => seq.push(s(t, why));
  if (["saas", "ai-product", "fintech", "devtool"].includes(category)) {
    push("logo-cloud", "Immediate social proof beneath the fold line.");
    push("feature-bento", "Breadth of capabilities in one scannable block.");
    push("feature-rows", "Deep-dive on the two objections buyers raise most.");
    push("metrics", "Quantified trust before the quotes.");
    push("testimonials", "Peer proof with specific outcomes.");
    push("pricing", "Make the cost legible; reduce sales friction.");
    push("faq", "Remove last objections.");
  } else if (["agency", "portfolio"].includes(category)) {
    push("metrics", "Credibility through numbers.");
    push("feature-rows", "Selected work / capabilities, two deep rows.");
    push("testimonials", "Client voices.");
    push("faq", "Process and engagement questions.");
  } else {
    push("feature-bento", "Show product variety.");
    push("steps", "How it works in three steps.");
    push("testimonials", "Social proof.");
    push("pricing", "Plans.");
    push("faq", "Reassurance.");
  }
  push("cta-band", "One last ask repeating the hero CTA.");
  push("footer-columns", "Navigation and legal.");
  for (const x of seq) x.componentId = `openui/${x.type === "navbar-glass" ? "navbar-glass" : x.type}`;
  return {
    surface: "Decide / Learn",
    archetype: "A landing page is a Decide/Learn surface: one idea per section, the hero is correct here, and every section must earn its place.",
    sections: seq,
    notes: [
      `Goal "${goal}": keep exactly one primary CTA per viewport and repeat the same wording in the hero and closing band.`,
      "Alternate section backgrounds (bg / surface) to create rhythm without hard borders.",
      `Motion budget: ${getStyle(style).maxMotion}/3 for ${getStyle(style).name}.`,
    ],
  };
}

export interface ProductBrief {
  name: string;
  tagline?: string;
  description: string;
  audience?: string;
}

/**
 * Starter page spec with placeholder-grade but structurally complete copy.
 * Agents are expected to rewrite copy via the returned JSON; structure and ids stay stable.
 */
export function defaultPageSpec(brief: ProductBrief, tokens: DesignTokens): PageSpec {
  const name = brief.name;
  const lay = suggestLayout(tokens.meta.category, tokens.meta.style);
  const copy: Record<string, SectionSpec["props"]> = {
    "navbar-glass": { links: [{ label: "Features", href: "#features" }, { label: "How it works", href: "#how" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }], signIn: { label: "Sign in", href: "#" }, cta: { label: "Start free", href: "#pricing" } },
    "hero-centered-product": heroProps(brief),
    "hero-split": heroProps(brief),
    "hero-editorial": { ...heroProps(brief), eyebrow: "Independent studio", stats: [{ value: "12 yrs", label: "Shipping products" }, { value: "140+", label: "Launches" }, { value: "4.9/5", label: "Client rating" }] },
    "logo-cloud": { label: "Trusted by teams who ship weekly", logos: ["Northwind", "Lumen", "Parallax", "Helix", "Orbital", "Vantage"] },
    "feature-bento": { anchor: "features", eyebrow: "Platform", title: `Everything *${name}* needs in one place`, subtitle: "Fewer tools, fewer handoffs, and a single source of truth your whole team can trust.", items: [
      { title: "See what changed, instantly", body: "Live dashboards surface the signals that matter, with no query writing required.", visual: "bars", span: 4 },
      { title: "Automations that explain themselves", body: "Every run is logged with inputs, outputs and the rule that fired.", visual: "list", span: 2 },
      { title: "Typed from end to end", body: "A small, predictable API with generated clients.", visual: "code", span: 2 },
      { title: "Guardrails, not gatekeeping", body: "Approvals and limits that only appear when they should.", visual: "toggle", span: 2 },
      { title: "Built for the whole team", body: "Roles, comments and shared views keep everyone on the same page.", visual: "avatars", span: 2 },
    ] },
    "feature-rows": { title: "", items: [
      { eyebrow: "Visibility", title: "Answers before the *stand-up*", body: "Pin the metrics that matter and see them update as events arrive.", bullets: ["Real-time pipelines with sub-second refresh", "Drill from any chart into the underlying records", "Share a live view with a single link"], visual: "bars" },
      { eyebrow: "Control", title: "Automation you can *audit*", body: "Compose rules visually, ship them safely, and roll back in one click.", bullets: ["Version history on every rule", "Dry-run against last week's data", "Approvals for sensitive actions"], visual: "list" },
    ] },
    metrics: { tint: true, items: [{ value: "99.99%", label: "Uptime, trailing 12 months" }, { value: "3.2×", label: "Faster time to insight" }, { value: "18 min", label: "Median onboarding" }, { value: "4,200+", label: "Teams on the platform" }] },
    steps: { title: "From sign-up to value in three steps", subtitle: "No consultants, no month-long rollout.", items: [{ title: "Connect your data", body: "Authorise your sources in a few clicks." }, { title: "Choose a template", body: "Start from proven workflows." }, { title: "Go live", body: "Invite your team and ship." }] },
    testimonials: { eyebrow: "Customers", title: "Teams that moved faster", items: [
      { quote: `We replaced four tools with ${name} and cut reporting time from two days to ten minutes.`, name: "Priya Raman", role: "VP Operations, Northwind" },
      { quote: "The audit trail alone saved us during our SOC 2 review. Everything was already there.", name: "Marcus Lindqvist", role: "Head of Security, Helix" },
      { quote: "Our engineers actually enjoy the API. Onboarding a new service takes an afternoon.", name: "Sofia Alvarez", role: "CTO, Parallax" },
    ] },
    pricing: { anchor: "pricing", eyebrow: "Pricing", title: "Simple pricing that scales with you", subtitle: "Start free. Upgrade when your team is ready.", tiers: [
      { name: "Starter", monthly: 0, yearly: 0, desc: "For individuals exploring the product.", features: ["Up to 3 projects", "7-day history", "Community support"], cta: { label: "Start free", href: "#" } },
      { name: "Team", monthly: 24, yearly: 19, desc: "For growing teams that need collaboration.", features: ["Unlimited projects", "1-year history", "Roles and approvals", "Priority support"], cta: { label: "Start 14-day trial", href: "#" }, featured: true },
      { name: "Enterprise", monthly: "Custom", yearly: "Custom", desc: "For organisations with advanced security needs.", features: ["SSO and SCIM", "Audit log export", "Dedicated success manager", "99.99% SLA"], cta: { label: "Talk to sales", href: "#" } },
    ] },
    faq: { anchor: "faq", eyebrow: "FAQ", title: "Questions, answered", items: [
      { q: "How long does setup take?", a: "Most teams connect their first source and see live data within twenty minutes." },
      { q: "Is my data secure?", a: "Data is encrypted in transit and at rest. SOC 2 Type II and GDPR documentation are available on request." },
      { q: "Can I migrate from my current tool?", a: "Yes. Import wizards and a migration team are included on Team and Enterprise plans." },
      { q: "What happens if I exceed my plan?", a: "We never cut you off mid-month. We will email you before any change is applied." },
    ] },
    "cta-band": { title: `Ready to see *${name}* in action?`, subtitle: "Join thousands of teams. Free to start, no credit card required.", primaryCta: { label: "Start free", href: "#pricing" }, secondaryCta: { label: "Book a demo", href: "#" } },
    "footer-columns": { tagline: brief.tagline ?? brief.description.slice(0, 120), columns: [
      { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Changelog", href: "#" }] },
      { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
      { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Status", href: "#" }, { label: "Security", href: "#" }] },
    ], legal: `© ${new Date().getFullYear()} ${name}. All rights reserved.`, note: "" },
  };
  const counts = new Map<string, number>();
  const sections: SectionSpec[] = lay.sections.map(({ type }) => {
    const base = type.startsWith("hero") ? "hero" : type === "navbar-glass" ? "nav" : type === "footer-columns" ? "footer" : type;
    const n = (counts.get(base) ?? 0) + 1; counts.set(base, n);
    const id = n === 1 ? base : `${base}${n}`;
    const props = structuredClone(copy[type] ?? {});
    if (type === "feature-rows" && n === 1) props.anchor = props.anchor ?? "how";
    return { id, type, props };
  });
  return { title: `${name} — ${brief.tagline ?? brief.description.split(".")[0]}`, description: brief.description, brand: { name }, sections };
}

function heroProps(b: ProductBrief) {
  return {
    badge: { tag: "New", text: "AI copilot is now generally available" },
    title: b.tagline ?? `The operating system for *modern ${b.name}* teams`,
    subtitle: b.description,
    primaryCta: { label: "Start free", href: "#pricing" },
    secondaryCta: { label: "Book a demo", href: "#" },
    note: "Free for 14 days · No credit card · Cancel anytime",
  };
}

/**
 * Strings that only exist in the engine's starter copy. If any survive into a finished page the copy was
 * never rewritten (and, for the hero mock, would show revenue metrics inside an unrelated product).
 */
export const STARTER_MARKERS = [
  "Revenue overview", "Net revenue", "Active accounts", "Northwind", "Parallax", "Orbital", "Vantage",
  "Priya Raman", "Marcus Lindqvist", "Sofia Alvarez", "Deploy to production", "teammates online",
  "Auto-approve under $500", "one call, typed end to end", "Answers before the stand-up", "Everything",
];
