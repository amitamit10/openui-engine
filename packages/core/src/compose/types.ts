import type { DesignTokens } from "../design/types.js";

export type SectionType =
  | "navbar-glass" | "hero-centered-product" | "hero-split" | "hero-editorial"
  | "logo-cloud" | "feature-bento" | "feature-rows" | "metrics" | "steps"
  | "testimonials" | "pricing" | "faq" | "cta-band" | "footer-columns"
  | "feature-tabs" | "feature-showcase" | "comparison" | "integrations" | "quote-feature"
  | "testimonial-wall" | "feature-grid" | "steps-timeline" | "cta-split" | "metrics-spark" | "faq-split";

export interface Cta { label: string; href: string }
export interface SectionSpec { id: string; type: SectionType; props: Record<string, any> }

export interface PageSpec {
  title: string;
  description: string;
  brand: { name: string; mark?: string; customLogo?: string };
  /** Standalone legal pages (privacy.html, terms.html) and the details they use. */
  legal?: { pages?: boolean; holder?: string; email?: string; address?: string; jurisdiction?: string };
  lang?: string;
  sections: SectionSpec[];
}

export type Ctx = { tokens: DesignTokens; spec: PageSpec; icons: Record<string, string> };
export type Renderer = (s: SectionSpec, ctx: Ctx) => string;
