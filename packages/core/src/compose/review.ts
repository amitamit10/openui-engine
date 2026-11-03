/**
 * Art-director review: judges a PLANNED page (no browser needed) on the things blind judges actually penalised in generated pages:
 * monotony, flat heroes, repeated visuals, missing illustration, thin sections. Every finding carries a concrete brief patch so a
 * small model can act on it in one call. Complements the pixel-level audit in @openui-engine/verify.
 */
import type { PageSpec } from "./types.js";
import type { SiteBrief } from "./build.js";

export interface ReviewFinding { severity: "high" | "medium" | "low"; issue: string; fix: string }
export interface DesignReview { score: number; findings: ReviewFinding[]; summary: string }

export function reviewDesign(spec: PageSpec, brief?: Partial<SiteBrief>): DesignReview {
  const f: ReviewFinding[] = [];
  const secs = spec.sections;
  const by = (t: string) => secs.filter((s) => s.type === t);
  const hero = secs.find((s) => s.type.startsWith("hero"));

  if (hero) {
    const hp: any = hero.props;
    if (!hp.visual && !hp.scene) f.push({ severity: "high", issue: "Hero shows no product or scene; it is text on a plain background.", fix: "Add heroVisual (kind:'ui' with 5-8 specific blocks) so the hero shows your product doing its job." });
    else if (hp.visual && !(hp.floats?.length)) f.push({ severity: "medium", issue: "Hero product card has no layered proof points, so it reads as a flat mockup.", fix: "Add heroFloats: 2 specific stat chips, e.g. [{label:'Next free slot',value:'Today 4:10pm',tone:'good'}]." });
    const words = String(hp.title ?? "").replace(/\*/g, "").trim().split(/\s+/).filter(Boolean).length;
    if (words > 14) f.push({ severity: "medium", issue: `Headline is ${words} words; it will wrap to many lines and lose impact.`, fix: "Rewrite headline to 5-10 words with one *emphasised phrase*." });
    if (words > 0 && !/\*[^*]+\*/.test(String(hp.title ?? ""))) f.push({ severity: "low", issue: "Headline has no emphasised phrase, so the display type has no focal point.", fix: "Wrap the key outcome in *asterisks* in headline." });
  }

  const rows = by("feature-rows")[0], grid = secs.filter((s) => s.type === "feature-grid"), tabs = by("feature-tabs")[0], bento = by("feature-bento")[0];
  const kinds = new Set<string>(((rows?.props.items ?? tabs?.props.tabs ?? []) as any[]).map((i) => String(i.visual?.kind ?? "")));
  kinds.delete("");
  if (rows && (rows.props.items as any[]).length >= 2 && kinds.size < 2) f.push({ severity: "medium", issue: "All product-visual rows use the same visual type, so the section looks repetitive.", fix: "Give each featured row a different visual kind (table, chart, kanban, timeline, chat, checklist, ui)." });
  const cards = grid.flatMap((g) => (g.props.items ?? []) as any[]);
  if (!grid.length && !bento && !rows && !tabs) f.push({ severity: "high", issue: "No feature section.", fix: "Provide at least 5 features." });
  if (cards.length) {
    const icons = cards.map((c) => c.icon).filter(Boolean);
    if (new Set(icons).size < Math.min(icons.length, 3)) f.push({ severity: "medium", issue: "Feature cards reuse the same icon, so the illustrations look identical.", fix: "Set a distinct lucide:<name> icon per feature (use search_icons with the feature title)." });
    if (cards.some((c) => !(c.bullets?.length))) f.push({ severity: "low", issue: "Some illustrated cards have no bullets, so they show no floating detail pills.", fix: "Add 1-2 short, specific bullets per feature (they appear as pills on the illustration)." });
  }

  // Rhythm: distinct section treatments across the page.
  const treatment = (s: any) => (s.type === "metrics" && s.props.ink ? "ink" : s.props.soft ? "soft" : s.props.tint || s.type === "pricing" ? "tint" : "plain");
  const treatments = new Set(secs.filter((s) => !["navbar-glass", "footer-columns"].includes(s.type)).map(treatment));
  if (treatments.size < 3) f.push({ severity: "medium", issue: `Only ${treatments.size} background treatment(s) across the page; it will feel flat.`, fix: "Include a metrics band (ink), a steps section (soft band) and a pricing/tinted section, or add a 'showcase'." });
  if (!by("metrics").length && !by("metrics-spark").length) f.push({ severity: "medium", issue: "No metrics band, so there is no dark/contrast section to break the rhythm.", fix: "Add 4 specific metrics (value + label)." });
  if (!by("testimonials").length && !by("testimonial-wall").length && !by("quote-feature").length) f.push({ severity: "medium", issue: "No social proof beyond logos.", fix: "Add 3 testimonials with a number in each quote." });
  if (!by("pricing").length) f.push({ severity: "low", issue: "No pricing section.", fix: "Add pricing tiers if the product has a price." });
  if (brief?.style === undefined && (spec.sections.length < 8)) f.push({ severity: "low", issue: "Few sections; the page may feel thin.", fix: "Add faq, how (3 steps) and a closing CTA." });

  const weight = { high: 18, medium: 8, low: 3 } as const;
  const score = Math.max(0, 100 - f.reduce((a, x) => a + weight[x.severity], 0));
  const summary = f.length ? `${f.length} art-direction issue(s); fix the highest first and rebuild with build_site patch.` : "No art-direction issues found; compare the screenshots against the references before shipping.";
  return { score, findings: f.sort((a, b) => weight[b.severity] - weight[a.severity]), summary };
}
