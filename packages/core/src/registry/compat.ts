import type { DesignTokens, SiteCategory, StyleId } from "../design/types.js";
import { getStyle } from "../design/styles.js";
import type { ComponentMeta } from "./types.js";
import { findComponent, searchableComponents } from "./components.js";

export interface FitContext {
  style: StyleId;
  category?: SiteCategory;
  slot?: ComponentMeta["slot"];
  framework?: "html" | "react";
  motionBudget?: 0 | 1 | 2 | 3;
  /** Runtimes already present in the project (components needing a second heavy runtime are penalised). */
  installedRuntimes?: string[];
}

export interface Fit { score: number; reasons: string[]; blockers: string[] }

/** Explainable fit score 0–100 between a component and a design context. */
export function fit(c: ComponentMeta, ctx: FitContext): Fit {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 50;
  const style = getStyle(ctx.style);
  if (c.styles.includes(ctx.style)) { score += 22; reasons.push(`designed for ${style.name}`); }
  else { score -= 18; reasons.push(`not curated for ${style.name}`); }
  if (ctx.category) {
    if (c.categories.includes(ctx.category)) { score += 8; reasons.push(`suits ${ctx.category}`); }
    else { score -= 10; reasons.push(`weak match for ${ctx.category}`); }
  }
  if (ctx.slot && c.slot === ctx.slot) { score += 10; }
  const budget = ctx.motionBudget ?? style.maxMotion;
  if (c.traits.energy > budget) { score -= 14 * (c.traits.energy - budget); reasons.push(`motion ${c.traits.energy} exceeds budget ${budget}`); }
  const densityGap = Math.abs(c.traits.density - style.density);
  if (densityGap >= 2) { score -= 6; reasons.push("density mismatch"); }
  if (ctx.framework === "html" && c.requires.framework === "react") { blockers.push("requires React; target is plain HTML"); score -= 40; }
  if (ctx.installedRuntimes) {
    const heavy = c.requires.runtimes.filter((r) => ["gsap", "three", "motion"].includes(r));
    for (const r of heavy) if (!ctx.installedRuntimes.includes(r) && ctx.installedRuntimes.some((x) => ["gsap", "three", "motion"].includes(x))) {
      score -= 12; reasons.push(`adds a second animation runtime (${r})`);
    }
  }
  if (!c.a11y.reducedMotion && c.traits.energy > 0) { score -= 4; reasons.push("needs manual reduced-motion handling"); }
  if (!c.license.verified) { score -= 3; reasons.push("license not verified"); }
  if (c.requires.framework === "html") score += 4; // zero-dependency bonus
  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons, blockers };
}

export interface CompositionIssue { severity: "error" | "warning" | "info"; rule: string; message: string }

/** Reason about a *set* of components so a page looks like one product, not a collage. */
export function checkComposition(ids: string[], tokens: Pick<DesignTokens, "meta" | "motion">): CompositionIssue[] {
  const out: CompositionIssue[] = [];
  const comps = ids.map((id) => findComponent(id)).filter((c): c is ComponentMeta => !!c);
  for (const id of ids) if (!findComponent(id)) out.push({ severity: "error", rule: "unknown-component", message: `Unknown component "${id}"` });
  const style = getStyle(tokens.meta.style);

  const frameworks = new Set(comps.map((c) => c.requires.framework));
  if (frameworks.size > 1) out.push({ severity: "warning", rule: "framework-mix", message: "Mixes plain-HTML sections with React components; choose one delivery target." });

  const rt = new Set(comps.flatMap((c) => c.requires.runtimes));
  if (rt.has("radix") && rt.has("base-ui")) out.push({ severity: "warning", rule: "primitive-mix", message: "Radix and Base UI primitives together double the primitive layer; pick one flavour (Fluid ships both)." });
  const anim = ["gsap", "motion", "three"].filter((r) => rt.has(r as never));
  if (anim.length > 1) out.push({ severity: "warning", rule: "animation-runtime-mix", message: `Multiple animation runtimes (${anim.join(", ")}) — pick one to keep the bundle and motion language coherent.` });

  const energies = comps.filter((c) => !["footer", "logos"].includes(c.slot)).map((c) => c.traits.energy);
  if (energies.length && Math.max(...energies) - Math.min(...energies) > 2) out.push({ severity: "warning", rule: "energy-spread", message: "Animation intensity varies by more than 2 levels between components; the page will feel inconsistent." });
  const over = comps.filter((c) => c.traits.energy > style.maxMotion);
  for (const c of over) out.push({ severity: "warning", rule: "motion-budget", message: `${c.id} (energy ${c.traits.energy}) exceeds ${style.name}'s motion budget (${style.maxMotion}).` });
  const off = comps.filter((c) => !c.styles.includes(tokens.meta.style));
  for (const c of off) out.push({ severity: "warning", rule: "style-fit", message: `${c.id} is not curated for ${style.name}; restyle with tokens or choose another.` });

  const slots = new Map<string, string[]>();
  for (const c of comps) if (["hero", "navbar", "footer"].includes(c.slot)) slots.set(c.slot, [...(slots.get(c.slot) ?? []), c.id]);
  for (const [slot, list] of slots) if (list.length > 1) out.push({ severity: "error", rule: "duplicate-slot", message: `More than one ${slot}: ${list.join(", ")}` });
  for (const c of comps) for (const bad of c.avoidWith ?? []) if (ids.includes(bad)) out.push({ severity: "warning", rule: "avoid-with", message: `${c.id} should not be combined with ${bad}.` });
  const unverified = comps.filter((c) => !c.license.verified);
  if (unverified.length) out.push({ severity: "info", rule: "license-check", message: `Verify licenses before shipping: ${unverified.map((c) => c.id).join(", ")}.` });
  return out;
}

export interface DiscoverOptions extends FitContext { query?: string; limit?: number; source?: string; includeInferred?: boolean }

export interface DiscoverResult { id: string; name: string; slot: string; source: string; fit: number; why: string; confidence: string; install?: string }

/** Ranked, deliberately small result set: never dump the registry into model context. */
export function discover(opts: DiscoverOptions): DiscoverResult[] {
  const q = (opts.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const limit = Math.min(opts.limit ?? 8, 20);
  return searchableComponents()
    .filter((c) => opts.includeInferred !== false || c.confidence !== "inferred")
    .filter((c) => !opts.slot || c.slot === opts.slot)
    .filter((c) => !opts.source || c.source === opts.source)
    .map((c) => {
      const f = fit(c, opts);
      const nameHay = `${c.id} ${c.name}`.toLowerCase(), descHay = `${c.summary} ${c.slot}`.toLowerCase();
      // a query word in the component's name is strong evidence; in its description only weak evidence
      const score = q.reduce((a, t) => a + (nameHay.includes(t) ? 1 : descHay.includes(t) ? 0.35 : 0), 0);
      const text = q.length ? Math.min(1, score / q.length) : 1;
      // inferred metadata is a guess: it must clearly beat curated options to rank above them
      return { c, f, rank: f.score + text * 30 - f.blockers.length * 100 - (c.confidence === "inferred" ? 14 : 0), text };
    })
    .filter((r) => r.text > 0 && (opts.framework !== "html" || r.f.blockers.length === 0))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map(({ c, f }) => ({
      id: c.id, name: c.name, slot: c.slot, source: c.source, fit: f.score, confidence: c.confidence ?? "curated",
      why: f.reasons.slice(0, 2).join("; ") || c.summary.slice(0, 80),
      ...(c.registry ? { install: c.registry.install } : {}),
    }));
}
