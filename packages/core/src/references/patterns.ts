import type { SiteCategory, StyleId } from "../design/types.js";

/**
 * Original pattern knowledge. Each entry describes a *composition principle* distilled from
 * common professional practice. No third-party markup, copy or imagery is reproduced.
 * `browse` points to galleries where a human can find live examples.
 */
export interface PatternRef {
  id: string;
  slot: string;
  name: string;
  intent: string[];
  categories: SiteCategory[];
  styles: StyleId[];
  principles: string[];
  pitfalls: string[];
  implementedBy: string[];
  browse: Array<{ source: string; url: string }>;
}

export const PATTERNS: PatternRef[] = [
  { id: "hero.product-led", slot: "hero", name: "Product-led centered hero", intent: ["convert", "launch", "demo", "signup"], categories: ["saas", "ai-product", "fintech"], styles: ["aurora-dark", "clarity-light"],
    principles: ["One outcome-focused H1 (≤ 12 words) with a single emphasised phrase", "One primary CTA, one ghost secondary; microcopy under them removes risk (no card, free tier)", "Real product UI as the visual, framed at ~1100px wide and cropped by the fold line", "Soft glow or grid texture behind the frame, never competing with the CTA"],
    pitfalls: ["Abstract 3D blobs instead of product UI", "Two equally-weighted primary buttons", "Headline that describes the category, not the outcome"],
    implementedBy: ["openui/hero-centered-product"], browse: [{ source: "supahero", url: "https://supahero.io/" }, { source: "recent", url: "https://recent.design/" }] },
  { id: "hero.split-technical", slot: "hero", name: "Split hero with code or UI", intent: ["developer", "docs", "api", "install"], categories: ["devtool", "ai-product", "saas"], styles: ["terminal-dev", "warm-human", "clarity-light"],
    principles: ["Left-aligned H1, install command or CTA within the first 400px", "Visual at ≥ 50% width showing real code, terminal or UI", "Denser type scale; mono for commands"], pitfalls: ["Hiding the install command below the fold", "Screenshots instead of live-looking UI"],
    implementedBy: ["openui/hero-split"], browse: [{ source: "supahero", url: "https://supahero.io/" }] },
  { id: "hero.editorial-type", slot: "hero", name: "Type-led editorial hero", intent: ["brand", "portfolio", "studio", "story"], categories: ["agency", "portfolio", "ecommerce"], styles: ["editorial-paper", "neo-brutal"],
    principles: ["Display type at 8–12vw as the primary visual", "Single italic or highlighted word creates a focal point", "Hairline rule + three stats ground the page"], pitfalls: ["Adding a hero image that fights the type", "More than one typeface for display"],
    implementedBy: ["openui/hero-editorial"], browse: [{ source: "recent", url: "https://recent.design/" }, { source: "inspora", url: "https://inspora.design/" }] },
  { id: "nav.glass-sticky", slot: "navbar", name: "Sticky glass navigation", intent: ["navigate", "convert"], categories: ["saas", "ai-product", "devtool", "fintech", "agency"], styles: ["aurora-dark", "clarity-light", "warm-human", "terminal-dev"],
    principles: ["Transparent over hero, blurred surface + hairline after 8px scroll", "5 links max, one primary CTA at the far right, sign-in as ghost", "Mobile: 44px toggle with aria-expanded and a full-width sheet"], pitfalls: ["Mega-menus on a marketing one-pager", "Nav CTA identical in weight to hero CTA"],
    implementedBy: ["openui/navbar-glass", "shadcn/navigation-menu"], browse: [{ source: "recent", url: "https://recent.design/" }] },
  { id: "proof.logo-strip", slot: "logos", name: "Quiet logo strip", intent: ["trust", "social-proof"], categories: ["saas", "ai-product", "fintech", "devtool"], styles: ["aurora-dark", "clarity-light", "warm-human"],
    principles: ["Directly under hero, muted, uniform optical weight", "A one-line label stating who/how many", "Never saturated colours — logos should whisper"], pitfalls: ["Fake or unlicensed customer logos", "More than 8 logos"],
    implementedBy: ["openui/logo-cloud", "magicui/marquee"], browse: [{ source: "godly", url: "https://godly.website/" }] },
  { id: "features.bento", slot: "features", name: "Bento feature grid", intent: ["explain", "differentiate"], categories: ["saas", "ai-product", "devtool", "fintech"], styles: ["aurora-dark", "clarity-light"],
    principles: ["6-col grid with 2/3/4-span cards; largest card holds the strongest claim", "Every card has a mini-visual that shows the feature, then a 1-line title + 1-sentence body", "Hover lifts 2px and tints the border toward the accent"], pitfalls: ["Six identical cards (the generic-AI tell)", "Icons instead of visuals"],
    implementedBy: ["openui/feature-bento", "magicui/bento-grid", "aceternity/bento-grid"], browse: [{ source: "recent", url: "https://recent.design/" }, { source: "inspora", url: "https://inspora.design/" }] },
  { id: "features.deep-rows", slot: "features", name: "Alternating deep-dive rows", intent: ["explain", "compare"], categories: ["saas", "devtool", "fintech"], styles: ["clarity-light", "aurora-dark", "terminal-dev", "warm-human"],
    principles: ["2–3 rows only; each answers one buyer objection", "Copy column ≤ 52ch, tick list of three proof points", "Visual alternates sides on desktop, stacks copy-first on mobile"], pitfalls: ["More than four rows", "Visuals that do not match the claim"],
    implementedBy: ["openui/feature-rows"], browse: [{ source: "godly", url: "https://godly.website/" }] },
  { id: "proof.stat-band", slot: "metrics", name: "Stat band", intent: ["trust", "scale"], categories: ["saas", "fintech", "agency"], styles: ["clarity-light", "aurora-dark", "editorial-paper", "terminal-dev"],
    principles: ["Four numbers, each with a unit and a plain label", "Tabular numerals", "Only real or clearly illustrative figures"], pitfalls: ["Round vanity numbers", "More than four"],
    implementedBy: ["openui/metrics"], browse: [{ source: "recent", url: "https://recent.design/" }] },
  { id: "proof.quotes", slot: "testimonials", name: "Quote cards", intent: ["trust"], categories: ["saas", "ai-product", "fintech", "consumer-app"], styles: ["aurora-dark", "clarity-light", "warm-human"],
    principles: ["Specific outcome in the quote (a number or a before/after)", "Name + role + company; initials avatar if no licensed photo", "Three cards, equal height"], pitfalls: ["Generic praise", "Stock-photo avatars"],
    implementedBy: ["openui/testimonials"], browse: [{ source: "godly", url: "https://godly.website/" }] },
  { id: "convert.pricing-3", slot: "pricing", name: "Three-tier pricing with toggle", intent: ["convert", "compare"], categories: ["saas", "ai-product", "devtool", "fintech"], styles: ["clarity-light", "aurora-dark", "warm-human", "terminal-dev"],
    principles: ["Middle tier featured with a tag + accent border", "Monthly/yearly toggle shows the saving explicitly", "CTA labels differ by tier (Start free / Start trial / Contact sales)", "≤ 6 feature lines per tier, most important first"], pitfalls: ["Comparison tables inline with cards", "Hiding the free tier"],
    implementedBy: ["openui/pricing"], browse: [{ source: "cta-gallery", url: "https://cta.gallery/" }] },
  { id: "convert.faq", slot: "faq", name: "Objection-handling FAQ", intent: ["reassure", "support"], categories: ["saas", "ai-product", "devtool", "fintech", "ecommerce"], styles: ["aurora-dark", "clarity-light", "editorial-paper", "warm-human", "terminal-dev", "neo-brutal"],
    principles: ["6 questions max; first is open", "Questions are real objections (security, migration, pricing)", "Native <details> for accessibility and zero JS"], pitfalls: ["Marketing copy disguised as questions"],
    implementedBy: ["openui/faq", "shadcn/accordion", "fluid/accordion"], browse: [{ source: "recent", url: "https://recent.design/" }] },
  { id: "convert.final-cta", slot: "cta", name: "Closing CTA band", intent: ["convert"], categories: ["saas", "ai-product", "devtool", "fintech", "agency"], styles: ["aurora-dark", "clarity-light", "warm-human", "editorial-paper", "neo-brutal", "terminal-dev"],
    principles: ["Restate the outcome, not the product", "Exactly the same primary CTA as the hero", "Whitespace ≥ 96px; nothing else on the row"], pitfalls: ["New CTA wording that resets the user's mental model"],
    implementedBy: ["openui/cta-band"], browse: [{ source: "cta-gallery", url: "https://cta.gallery/" }] },
  { id: "chrome.footer", slot: "footer", name: "Columned footer", intent: ["navigate", "legal"], categories: ["saas", "ai-product", "devtool", "fintech", "agency", "ecommerce"], styles: ["aurora-dark", "clarity-light", "warm-human", "terminal-dev"],
    principles: ["Brand blurb + 3 columns (Product, Company, Resources)", "Muted links with 44px hit areas", "Legal row separated by a hairline"], pitfalls: ["Hidden contrast on dark footers"],
    implementedBy: ["openui/footer-columns"], browse: [{ source: "footer-design", url: "https://footer.design/" }] },
  { id: "motion.restraint", slot: "motion", name: "Restrained scroll reveal", intent: ["polish", "motion"], categories: ["saas", "ai-product", "fintech", "devtool"], styles: ["aurora-dark", "clarity-light", "terminal-dev"],
    principles: ["One easing curve, three durations", "Reveal = 14px translate + fade, once, 8% threshold", "Never animate layout properties; always honour prefers-reduced-motion"], pitfalls: ["Parallax everywhere", "Auto-playing marquee without a pause control"],
    implementedBy: ["openui/hero-centered-product"], browse: [{ source: "60fps", url: "https://60fps.design/" }] },
];
