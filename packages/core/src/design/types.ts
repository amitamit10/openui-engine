export type StyleId =
  | "aurora-dark"
  | "clarity-light"
  | "editorial-paper"
  | "terminal-dev"
  | "warm-human"
  | "neo-brutal"
  | "field-notes"
  | "shadcn-mono"
  | "material-tonal"
  | "swiss-grid"
  | "noir-luxe"
  | "pastel-play";

export type SiteCategory =
  | "saas"
  | "ai-product"
  | "devtool"
  | "fintech"
  | "agency"
  | "portfolio"
  | "ecommerce"
  | "consumer-app";

export interface TypeStep {
  /** min size in px (mobile) */ min: number;
  /** max size in px (desktop) */ max: number;
  lineHeight: number;
  weight: number;
  tracking: string;
}

export interface DesignTokens {
  meta: { name: string; style: StyleId; mode: "light" | "dark"; description: string; category: SiteCategory };
  color: {
    bg: string; surface: string; surface2: string; border: string;
    text: string; muted: string;
    accent: string; accentFg: string; accentSoft: string; accent2: string;
    success: string; warning: string; danger: string;
    accent2Fg: string; successFg: string; warningFg: string;
  };
  font: { display: string; body: string; mono: string; googleFamilies: string[] };
  type: { ratio: number; scale: Record<string, TypeStep> };
  space: { unit: number; scale: number[] };
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  shadow: { sm: string; md: string; lg: string; glow: string };
  border: { width: number };
  motion: { intensity: 0 | 1 | 2 | 3; fast: string; base: string; slow: string; easing: string };
  layout: { container: number; gutter: number; sectionY: { min: number; max: number }; grid: 12 };
  composition: {
    heroVariant: "centered-product" | "split" | "editorial";
    ctaHierarchy: "one-primary-one-ghost" | "single" | "primary-secondary-link";
    imageTreatment: string;
    sectionTransition: string;
  };
}

/** Per-style art direction; the generator turns this + brief into concrete tokens. */
export interface StyleDefinition {
  id: StyleId;
  name: string;
  summary: string;
  mode: "light" | "dark";
  categories: SiteCategory[];
  /** Max animation intensity this style tolerates (0 none … 3 expressive). */
  maxMotion: 0 | 1 | 2 | 3;
  defaultMotion: 0 | 1 | 2 | 3;
  density: 1 | 2 | 3 | 4 | 5;
  defaultAccent: string;
  secondaryHueShift: number;
  fonts: { display: string; body: string; mono: string; google: string[]; displayWeight: number; displayTracking: string };
  ratio: number;
  radius: DesignTokens["radius"];
  borderWidth: number;
  palette: { bg: string; surface: string; surface2: string; border: string; text: string; muted: string };
  shadows: DesignTokens["shadow"];
  composition: DesignTokens["composition"];
  /** Words that signal this style when matching a free-text brief. */
  keywords: string[];
  doNot: string[];
  signatures: string[];
}
