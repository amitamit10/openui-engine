import type { DesignTokens } from "../design/types.js";

export type SectionType =
  | "navbar-glass" | "hero-centered-product" | "hero-split" | "hero-editorial"
  | "logo-cloud" | "feature-bento" | "feature-rows" | "metrics" | "steps"
  | "testimonials" | "pricing" | "faq" | "cta-band" | "footer-columns"
  | "feature-tabs" | "feature-showcase" | "comparison" | "integrations" | "quote-feature"
  | "testimonial-wall" | "steps-timeline" | "cta-split" | "metrics-spark" | "faq-split";

export interface Cta { label: string; href: string }
export interface SectionSpec { id: string; type: SectionType; props: Record<string, any> }

export interface PageSpec {
  title: string;
  description: string;
  brand: { name: string };
  lang?: string;
  sections: SectionSpec[];
}

export type Ctx = { tokens: DesignTokens; spec: PageSpec; icons: Record<string, string> };
export type Renderer = (s: SectionSpec, ctx: Ctx) => string;
