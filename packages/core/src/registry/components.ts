import type { ComponentMeta, Runtime, SourceId } from "./types.js";
import type { SiteCategory, StyleId } from "../design/types.js";

const ALL_STYLES: StyleId[] = ["aurora-dark", "clarity-light", "editorial-paper", "terminal-dev", "warm-human", "neo-brutal"];
const APACHE = { spdx: "Apache-2.0", verified: true, note: "Original OpenUI Engine code (this repository)." };

const a11yOk = { keyboard: true, reducedMotion: true, notes: "Semantic HTML, visible focus, motion gated by prefers-reduced-motion." };

function own(m: Partial<ComponentMeta> & Pick<ComponentMeta, "id" | "name" | "slot" | "summary" | "sectionType">): ComponentMeta {
  return {
    source: "openui",
    kind: "section",
    styles: ALL_STYLES,
    categories: ["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"],
    traits: { energy: 1, density: 3 },
    requires: { framework: "html", runtimes: ["none"], deps: [] },
    a11y: a11yOk,
    responsive: "verified",
    weightKb: 0,
    license: APACHE,
    ...m,
  };
}

/** Original, token-driven sections. Fully verified by the automated QA suite in this repo. */
export const OPENUI_SECTIONS: ComponentMeta[] = [
  own({ id: "openui/navbar-glass", name: "Glass sticky navbar", slot: "navbar", sectionType: "navbar-glass",
    summary: "Sticky nav that gains a blurred translucent surface and hairline on scroll; accessible mobile sheet menu.",
    props: ["links[{label,href}]", "cta{label,href}", "signIn{label,href}"], pairsWith: ["openui/hero-centered-product", "openui/hero-split"] }),
  own({ id: "openui/hero-centered-product", name: "Centered hero with product frame", slot: "hero", sectionType: "hero-centered-product", variantGroup: "hero",
    styles: ["aurora-dark", "clarity-light", "warm-human"], categories: ["saas", "ai-product", "fintech", "devtool", "consumer-app"], traits: { energy: 2, density: 3 },
    summary: "Badge, balanced display headline, one primary + one ghost CTA, then a framed dashboard mock with accent glow. The canonical SaaS 'Decide' composition.",
    props: ["badge{tag,text}", "title (*emphasis*)", "subtitle", "primaryCta", "secondaryCta", "note"], pairsWith: ["openui/logo-cloud", "openui/feature-bento"], avoidWith: ["openui/hero-editorial"] }),
  own({ id: "openui/hero-split", name: "Split hero (copy left, product right)", slot: "hero", sectionType: "hero-split", variantGroup: "hero",
    styles: ["terminal-dev", "warm-human", "clarity-light", "aurora-dark"], categories: ["saas", "devtool", "consumer-app", "ai-product"], traits: { energy: 1, density: 4 },
    summary: "Left-aligned H1 with CTAs beside a product frame; denser and faster to scan, good for technical audiences.",
    props: ["badge", "title", "subtitle", "primaryCta", "secondaryCta", "note"], pairsWith: ["openui/logo-cloud", "openui/feature-rows"] }),
  own({ id: "openui/hero-editorial", name: "Editorial hero with stats", slot: "hero", sectionType: "hero-editorial", variantGroup: "hero",
    styles: ["editorial-paper", "neo-brutal"], categories: ["agency", "portfolio", "ecommerce", "saas"], traits: { energy: 1, density: 2 },
    summary: "Oversized type-led hero, no product frame; hairline-ruled stat row underneath.",
    props: ["eyebrow", "title", "subtitle", "primaryCta", "secondaryCta", "stats[{value,label}]"] }),
  own({ id: "openui/logo-cloud", name: "Customer wordmark strip", slot: "logos", sectionType: "logo-cloud", traits: { energy: 1, density: 2 },
    summary: "Single-line social-proof strip with a quiet label; wordmarks are text so no third-party logos are embedded.", props: ["label", "logos[string]"] }),
  own({ id: "openui/feature-bento", name: "Bento feature grid", slot: "features", sectionType: "feature-bento", traits: { energy: 1, density: 4 },
    summary: "Asymmetric 6-column card grid with mini visualizations (bars, list, code, toggles, avatars); collapses to 2 then 1 columns.",
    props: ["eyebrow", "title", "subtitle", "items[{title,body,visual:bars|list|code|toggle|avatars,span:2|3|4}]"], pairsWith: ["openui/hero-centered-product"] }),
  own({ id: "openui/feature-rows", name: "Alternating feature rows", slot: "features", sectionType: "feature-rows", traits: { energy: 1, density: 3 },
    summary: "Zig-zag copy/visual rows with tick lists; best for 2-3 deep product explanations.", props: ["title", "items[{eyebrow,title,body,bullets,visual}]", "tint"] }),
  own({ id: "openui/metrics", name: "Stat band", slot: "metrics", sectionType: "metrics", traits: { energy: 0, density: 2 },
    summary: "Four large tabular-nums metrics with hairline tops.", props: ["items[{value,label}]", "tint"] }),
  own({ id: "openui/steps", name: "Three-step process", slot: "steps", sectionType: "steps", traits: { energy: 0, density: 2 },
    summary: "Numbered cards for a how-it-works sequence.", props: ["title", "subtitle", "items[{title,body}]"] }),
  own({ id: "openui/testimonials", name: "Quote cards", slot: "testimonials", sectionType: "testimonials", traits: { energy: 0, density: 3 },
    summary: "Three quote cards with initials avatars (no stock photography).", props: ["title", "items[{quote,name,role}]"] }),
  own({ id: "openui/pricing", name: "Pricing with billing toggle", slot: "pricing", sectionType: "pricing", traits: { energy: 1, density: 3 },
    summary: "Three tiers, featured middle tier, accessible monthly/yearly toggle that updates prices.", props: ["title", "subtitle", "tiers[{name,monthly,yearly,desc,features,cta,featured}]"] }),
  own({ id: "openui/faq", name: "Accordion FAQ", slot: "faq", sectionType: "faq", traits: { energy: 0, density: 2 },
    summary: "Native <details> accordion: keyboard and screen-reader support with zero JS.", props: ["title", "subtitle", "items[{q,a}]"] }),
  own({ id: "openui/cta-band", name: "Closing CTA band", slot: "cta", sectionType: "cta-band", traits: { energy: 1, density: 1 },
    summary: "Rounded panel with a glow, a single clear ask and the same CTA hierarchy as the hero.", props: ["title", "subtitle", "primaryCta", "secondaryCta"] }),
  own({ id: "openui/footer-columns", name: "Columned footer", slot: "footer", sectionType: "footer-columns", traits: { energy: 0, density: 3 },
    summary: "Brand blurb plus three link columns, legal line.", props: ["tagline", "columns[{title,links}]", "legal", "note"] }),
];

interface Ext {
  id: string; name: string; source: SourceId; slot: ComponentMeta["slot"]; summary: string; item: string;
  runtimes: Runtime[]; deps: string[]; energy: 0 | 1 | 2 | 3; density?: 1 | 2 | 3 | 4 | 5; styles?: StyleId[];
  weight?: number | null; kind?: ComponentMeta["kind"]; notes?: string; reducedMotion?: boolean; categories?: SiteCategory[];
}

const BASES: Record<string, { baseUrl: string; install: (item: string) => string; license: ComponentMeta["license"] }> = {
  fluid: {
    baseUrl: "https://www.fluidfunctionalism.com/r/",
    install: (i) => `npx shadcn@latest add https://www.fluidfunctionalism.com/r/${i}.json`,
    license: { spdx: "unverified", verified: false, note: "Registry publishes source; repo mickadesign/fluid-functionalism not reachable from the audit sandbox — read its LICENSE before shipping." },
  },
  shadcn: {
    baseUrl: "https://ui.shadcn.com/r/styles/new-york-v4/",
    install: (i) => `npx shadcn@latest add ${i}`,
    license: { spdx: "MIT", verified: false, note: "shadcn/ui is widely documented as MIT; repository not reachable from the audit sandbox, re-verify." },
  },
  magicui: {
    baseUrl: "https://magicui.design/r/",
    install: (i) => `npx shadcn@latest add "https://magicui.design/r/${i}.json"`,
    license: { spdx: "unverified", verified: false, note: "Open registry; confirm LICENSE in magicuidesign/magicui before shipping." },
  },
  aceternity: {
    baseUrl: "https://ui.aceternity.com/registry/",
    install: (i) => `npx shadcn@latest add https://ui.aceternity.com/registry/${i}.json`,
    license: { spdx: "unverified", verified: false, note: "Free tier registry; Pro components are paid. Confirm terms at ui.aceternity.com before shipping." },
  },
  reactbits: {
    baseUrl: "https://reactbits.dev/r/",
    install: (i) => `npx shadcn@latest add https://reactbits.dev/r/${i}.json`,
    license: { spdx: "unverified", verified: false, note: "Check the repository LICENSE (custom terms may restrict redistribution/resale)." },
  },
};

function ext(e: Ext): ComponentMeta {
  const b = BASES[e.source]!;
  const motion = e.runtimes.some((r) => r === "motion" || r === "gsap" || r === "three");
  return {
    id: e.id,
    name: e.name,
    source: e.source,
    kind: e.kind ?? "ui",
    slot: e.slot,
    summary: e.summary,
    styles: e.styles ?? ALL_STYLES,
    categories: e.categories ?? ["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"],
    traits: { energy: e.energy, density: e.density ?? 3 },
    requires: { framework: "react", runtimes: ["tailwind", ...e.runtimes], deps: e.deps },
    a11y: { keyboard: true, reducedMotion: e.reducedMotion ?? !motion, notes: e.notes ?? (motion ? "Animated: verify prefers-reduced-motion handling after install." : "Built on accessible primitives.") },
    responsive: "unverified",
    weightKb: e.weight ?? null,
    license: b.license,
    registry: { baseUrl: b.baseUrl, item: e.item, install: b.install(e.item) },
  };
}

/** Curated third-party picks. Fetched live from each project's own registry; never vendored here. */
export const EXTERNAL: ComponentMeta[] = [
  ext({ id: "fluid/tabs", name: "Fluid tabs", source: "fluid", slot: "primitive", item: "tabs", runtimes: ["radix", "motion"], deps: ["@radix-ui/react-tabs", "motion", "lucide-react"], energy: 2, weight: 38, summary: "Tabs with cursor-following fluid hover and animated pill selection. Good for product-feature switchers.", styles: ["clarity-light", "aurora-dark", "warm-human"] }),
  ext({ id: "fluid/button", name: "Fluid button", source: "fluid", slot: "primitive", item: "button", runtimes: ["radix", "motion"], deps: ["motion", "@radix-ui/react-slot", "class-variance-authority"], energy: 1, weight: 38, summary: "Animated button with primary/secondary/tertiary variants and spring press feedback.", styles: ["clarity-light", "aurora-dark", "warm-human"] }),
  ext({ id: "fluid/accordion", name: "Fluid accordion", source: "fluid", slot: "faq", item: "accordion", runtimes: ["radix", "motion"], deps: ["@radix-ui/react-accordion", "motion"], energy: 1, weight: 38, summary: "Accordion with animated height and spring transitions; upgrade path for the native FAQ.", styles: ["clarity-light", "aurora-dark", "warm-human"] }),
  ext({ id: "fluid/dialog", name: "Fluid dialog", source: "fluid", slot: "primitive", item: "dialog", runtimes: ["radix", "motion"], deps: ["@radix-ui/react-dialog", "motion"], energy: 1, weight: 38, summary: "Modal with spring scale/opacity entrance; Radix focus trap and scroll lock.", styles: ["clarity-light", "aurora-dark", "warm-human"] }),
  ext({ id: "fluid/card", name: "Fluid card", source: "fluid", slot: "primitive", item: "card", runtimes: ["motion"], deps: ["motion"], energy: 1, weight: 38, summary: "Compositional card on Fluid's eight-level surface/elevation ladder.", styles: ["clarity-light", "aurora-dark"] }),
  ext({ id: "fluid/table", name: "Fluid table", source: "fluid", slot: "primitive", item: "table", runtimes: ["motion"], deps: ["motion"], energy: 1, weight: 38, summary: "Table with fluid row highlight; for data-heavy product sections.", styles: ["clarity-light", "aurora-dark", "terminal-dev"] }),
  ext({ id: "fluid/sidebar", name: "Fluid sidebar", source: "fluid", slot: "layout", item: "sidebar", runtimes: ["radix", "motion"], deps: ["@radix-ui/react-dialog", "motion", "lucide-react"], energy: 1, weight: 40, summary: "Composable app sidebar for dashboards (not for marketing pages).", styles: ["clarity-light", "aurora-dark"] }),
  ext({ id: "fluid/surfaces", name: "Fluid surface ladder tokens", source: "fluid", slot: "layout", item: "surfaces", kind: "block", runtimes: ["none"], deps: [], energy: 0, summary: "Eight-level surface and shadow ladder (registry:theme) — a token system to align cards and popovers.", styles: ["clarity-light", "aurora-dark"] }),
  ext({ id: "shadcn/button", name: "shadcn button", source: "shadcn", slot: "primitive", item: "button", runtimes: ["radix"], deps: ["radix-ui", "class-variance-authority"], energy: 0, weight: 4, summary: "The baseline accessible button primitive; theme via CSS variables." }),
  ext({ id: "shadcn/accordion", name: "shadcn accordion", source: "shadcn", slot: "faq", item: "accordion", runtimes: ["radix"], deps: ["radix-ui"], energy: 0, weight: 6, summary: "Radix accordion; the default FAQ for React stacks." }),
  ext({ id: "shadcn/dialog", name: "shadcn dialog", source: "shadcn", slot: "primitive", item: "dialog", runtimes: ["radix"], deps: ["radix-ui"], energy: 0, weight: 8, summary: "Accessible modal with focus trap." }),
  ext({ id: "shadcn/navigation-menu", name: "shadcn navigation menu", source: "shadcn", slot: "navbar", item: "navigation-menu", runtimes: ["radix"], deps: ["radix-ui"], energy: 0, weight: 8, summary: "Keyboard-accessible mega-menu primitive for marketing navbars." }),
  ext({ id: "shadcn/tabs", name: "shadcn tabs", source: "shadcn", slot: "primitive", item: "tabs", runtimes: ["radix"], deps: ["radix-ui"], energy: 0, weight: 5, summary: "Accessible tabs primitive." }),
  ext({ id: "magicui/marquee", name: "Magic UI marquee", source: "magicui", slot: "logos", item: "marquee", runtimes: ["tailwind"], deps: [], energy: 2, weight: 1, summary: "Pure-CSS infinite scroller for logo clouds and testimonials; pause on hover.", styles: ["aurora-dark", "clarity-light", "warm-human"], reducedMotion: false, notes: "CSS animation: add motion-reduce:animate-none after install." }),
  ext({ id: "magicui/bento-grid", name: "Magic UI bento grid", source: "magicui", slot: "features", item: "bento-grid", runtimes: ["tailwind"], deps: [], energy: 1, weight: 2, summary: "Bento layout primitives; pair with your own card content.", styles: ["aurora-dark", "clarity-light"] }),
  ext({ id: "magicui/animated-shiny-text", name: "Magic UI shiny text", source: "magicui", slot: "text-effect", item: "animated-shiny-text", runtimes: ["tailwind"], deps: [], energy: 2, weight: 1, summary: "Subtle shimmer sweep for hero badges.", styles: ["aurora-dark", "clarity-light"], reducedMotion: false }),
  ext({ id: "aceternity/bento-grid", name: "Aceternity bento grid", source: "aceternity", slot: "features", item: "bento-grid", runtimes: ["tailwind", "motion"], deps: ["@tabler/icons-react"], energy: 2, weight: 3, summary: "Bento grid with hover reveal; heavier than Magic UI's.", styles: ["aurora-dark"], reducedMotion: false }),
  ext({ id: "reactbits/animated-content", name: "React Bits AnimatedContent", source: "reactbits", slot: "layout", item: "AnimatedContent-JS-CSS", runtimes: ["gsap"], deps: ["gsap"], energy: 2, weight: 28, summary: "Scroll-reveal wrapper (slide, blur, stagger) via GSAP — only worth it if the page already ships GSAP.", styles: ["warm-human", "neo-brutal", "aurora-dark"], reducedMotion: false }),
];

export const ALL_COMPONENTS: ComponentMeta[] = [...OPENUI_SECTIONS, ...EXTERNAL];
export const COMPONENT_INDEX = new Map(ALL_COMPONENTS.map((c) => [c.id, c]));
