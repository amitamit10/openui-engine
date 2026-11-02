import type { SiteCategory, StyleId } from "../design/types.js";

export type Slot =
  | "navbar" | "hero" | "logos" | "features" | "metrics" | "steps" | "testimonials"
  | "pricing" | "faq" | "cta" | "footer" | "primitive" | "background" | "text-effect" | "layout";

export type Runtime = "none" | "motion" | "gsap" | "three" | "radix" | "base-ui" | "tailwind";
export type SourceId = "openui" | "fluid" | "shadcn" | "magicui" | "aceternity" | "reactbits" | "bencho";

export interface ComponentMeta {
  id: string;
  name: string;
  source: SourceId;
  kind: "section" | "ui" | "effect" | "block";
  slot: Slot;
  summary: string;
  /** Art directions this component looks native in (curated, not guessed). */
  styles: StyleId[];
  categories: SiteCategory[];
  traits: {
    /** Animation intensity this component needs (0 static … 3 expressive). */
    energy: 0 | 1 | 2 | 3;
    density: 1 | 2 | 3 | 4 | 5;
  };
  requires: {
    framework: "html" | "react";
    runtimes: Runtime[];
    deps: string[];
  };
  a11y: { keyboard: boolean; reducedMotion: boolean; notes: string };
  responsive: "verified" | "fluid" | "unverified";
  /** Rough shipped weight in KB gzip for the component's own runtime deps (null = unknown). */
  weightKb: number | null;
  license: { spdx: string; verified: boolean; note: string };
  /** Present for third-party registry components: fetched live, never vendored. */
  registry?: { baseUrl: string; item: string; install: string };
  /** For OpenUI sections: the section type string accepted by compose_page. */
  sectionType?: string;
  /** Props schema hint for OpenUI sections (names only, concise). */
  props?: string[];
  variantGroup?: string;
  /** Hand-curated "pairs well with" and "avoid with" for composition reasoning. */
  pairsWith?: string[];
  avoidWith?: string[];
}
