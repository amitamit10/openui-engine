import type { DesignTokens } from "../design/types.js";
import type { Cta, SectionSpec } from "./types.js";

export const esc = (s: unknown): string =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Allow *emphasis* in headlines → <em>, everything else escaped. */
export const rich = (s: unknown): string => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

export const ICON = {
  arrow: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  check: `<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>`,
  plus: `<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>`,
  menu: `<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg>`,
  mark: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l3-6 3 4 4-6"/></svg>`,
};

export const btn = (c: Cta | undefined, kind: "primary" | "ghost" | "link", id: string, large = false, arrow = false) =>
  c ? `<a class="btn btn--${kind}${large ? " btn--lg" : ""}" href="${esc(c.href)}" data-openui-id="${id}">${esc(c.label)}${arrow ? ICON.arrow : ""}</a>` : "";

export function ctaRow(p: any, id: string, hierarchy: DesignTokens["composition"]["ctaHierarchy"]): string {
  if (hierarchy === "single") return `<div class="cta-row">${btn(p.primaryCta, "primary", `${id}.cta`, true, true)}</div>`;
  const second = hierarchy === "primary-secondary-link" ? btn(p.secondaryCta, "link", `${id}.cta2`, true, true) : btn(p.secondaryCta, "ghost", `${id}.cta2`, true);
  return `<div class="cta-row">${btn(p.primaryCta, "primary", `${id}.cta`, true, true)}${second}</div>`;
}

export const head = (id: string, p: any, left = false) => `<div class="section-head${left || p.align === "left" ? " section-head--left" : ""} reveal">
    ${p.eyebrow ? `<span class="eyebrow" data-openui-id="${id}.eyebrow">${esc(p.eyebrow)}</span>` : ""}
    <h2 class="h2" data-openui-id="${id}.title">${rich(p.title)}</h2>
    ${p.subtitle ? `<p class="lead" data-openui-id="${id}.subtitle">${esc(p.subtitle)}</p>` : ""}
  </div>`;

export const wrap = (s: SectionSpec, inner: string, cls = "", tint = false) =>
  `<section class="section ${cls}${tint ? " section--tint" : ""}" id="${esc(s.props.anchor ?? s.id)}" data-openui-section="${esc(s.id)}" data-openui-variant="${s.type}" data-openui-id="${esc(s.id)}">
  <div class="container">${inner}</div>
</section>`;

