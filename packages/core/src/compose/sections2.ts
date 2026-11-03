import { renderPhoto } from "./photos.js";
import { iconSvg } from "../assets/icons.js";
import type { Renderer, SectionType } from "./types.js";
import { ICON, btn, esc, head, rich, wrap } from "./util.js";
import { renderSpot } from "./illustrate.js";
import { renderArt } from "./art.js";
import { renderVisual } from "./visuals.js";

const chip = (ref: string | undefined, ctx: { icons: Record<string, string> }) => `<span class="ico-chip">${iconSvg(ref, ctx.icons)}</span>`;
const xmark = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

export const RENDERERS_2: Partial<Record<SectionType, Renderer>> = {
  "feature-grid": (s) => {
    const p = s.props, id = s.id; const items = (p.items ?? []) as any[];
    return wrap(s, `${p.title ? head(id, p) : ""}<div class="fgrid fgrid--n${items.length}">${items.map((it, i) => `<article class="card fcard reveal" data-openui-id="${id}.card${i}">
      ${(it.photo != null && it.photo !== "" && renderPhoto(it.photo, { alt: it.title, ratio: 1.45, sizes: "(max-width:700px) 100vw, 360px" })) || (it.art && renderArt(it.art, it.title)) || renderSpot({ icon: it.icon, motif: it.motif, seed: `${id}${i}${it.title}`, pills: it.pills ?? (it.bullets ?? []).slice(0, 2) }, `${id}${i}`)}
      <div class="fcard__text"><h3 class="h4" data-openui-id="${id}.card${i}.title">${esc(it.title)}</h3><p data-openui-id="${id}.card${i}.body">${esc(it.body)}</p></div></article>`).join("")}</div>`, "", !!p.tint);
  },

  "feature-tabs": (s, ctx) => {
    const p = s.props, id = s.id; const tabs = (p.tabs ?? []) as any[];
    return wrap(s, `${head(id, p)}<div class="tabs reveal" data-tabs>
    <div class="tabs__list" role="tablist" aria-label="${esc(p.title ?? "Features")}">${tabs.map((t, i) => `<button class="tabs__tab" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button">${t.icon ? iconSvg(t.icon, ctx.icons) : ""}${esc(t.label)}</button>`).join("")}</div>
    ${tabs.map((t, i) => `<div class="tabs__panel" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"${i === 0 ? "" : " hidden"} data-openui-id="${id}.panel${i}"><div class="tabs__copy"><h3 class="h2" data-openui-id="${id}.panel${i}.title">${rich(t.title ?? t.label)}</h3><p class="lead">${esc(t.body)}</p>${t.bullets ? `<ul class="ticks">${(t.bullets as string[]).map((b) => `<li>${ICON.check}<span>${esc(b)}</span></li>`).join("")}</ul>` : ""}</div><div>${renderVisual(t.visual, `${id}${i}`)}</div></div>`).join("")}</div>`, "", !!p.tint);
  },

  "feature-showcase": (s, ctx) => {
    const p = s.props, id = s.id; const calls = (p.callouts ?? []) as any[];
    return wrap(s, `${head(id, p)}<div class="showcase"><div class="reveal">${renderVisual(p.visual, id)}</div><div class="showcase__calls">${calls.map((c, i) => `<div class="call reveal" data-openui-id="${id}.call${i}">${c.icon ? chip(c.icon, ctx) : ""}<h3 class="h4">${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`).join("")}</div></div>`, "", !!p.tint);
  },

  comparison: (s) => {
    const p = s.props, id = s.id; const col = (c: any, kind: "them" | "us") => `<div class="card cmp__col cmp__col--${kind} reveal" data-openui-id="${id}.${kind}"><h3 class="h3">${esc(c?.label ?? "")}</h3><ul>${((c?.items ?? []) as string[]).map((x) => `<li>${kind === "us" ? ICON.check : xmark}<span>${esc(x)}</span></li>`).join("")}</ul></div>`;
    return wrap(s, `${head(id, p)}<div class="cmp">${col(p.them, "them")}${col(p.us, "us")}</div>`);
  },

  integrations: (s, ctx) => {
    const p = s.props, id = s.id; const items = (p.items ?? []) as any[];
    return wrap(s, `${head(id, p)}<div class="ints reveal">${items.map((it, i) => `<div class="int" data-openui-id="${id}.i${i}">${chip(it.icon, ctx)}<div><b>${esc(it.name)}</b>${it.desc ? `<small>${esc(it.desc)}</small>` : ""}</div></div>`).join("")}</div>`, "", !!p.tint);
  },

  "quote-feature": (s) => {
    const p = s.props, id = s.id; const stats = (p.stats ?? []) as any[];
    return wrap(s, `<div class="qf${stats.length ? "" : " qf--solo"} reveal"><figure style="margin:0"><blockquote data-openui-id="${id}.quote">“${esc(p.quote)}”</blockquote><figcaption><span class="avatar" aria-hidden="true">${esc(String(p.name ?? "").split(" ").map((w: string) => w[0]).join("").slice(0, 2))}</span><span class="who"><strong>${esc(p.name)}</strong><br><span class="muted">${esc(p.role)}</span></span></figcaption></figure>${stats.length ? `<div class="qf__stats">${stats.map((x, i) => `<div class="qf__stat" data-openui-id="${id}.stat${i}"><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}</div>`, "", !!p.tint);
  },

  "testimonial-wall": (s) => {
    const p = s.props, id = s.id; const items = (p.items ?? []) as any[];
    return wrap(s, `${head(id, p)}<div class="wall">${items.map((q, i) => `<figure class="card reveal" data-openui-id="${id}.q${i}"><blockquote class="${q.big ? "big" : ""}">“${esc(q.quote)}”</blockquote><figcaption style="display:flex;gap:12px;align-items:center"><span class="avatar" aria-hidden="true">${esc(String(q.name).split(" ").map((w: string) => w[0]).join("").slice(0, 2))}</span><span class="who"><strong>${esc(q.name)}</strong><br><span class="muted small">${esc(q.role)}</span></span></figcaption></figure>`).join("")}</div>`, "", !!p.tint);
  },

  "steps-timeline": (s) => {
    const p = s.props, id = s.id; const steps = (p.steps ?? []) as any[];
    return wrap(s, `${head(id, p, true)}<div class="stl"><ol class="stl__steps" style="list-style:none;margin:0;padding:0">${steps.map((st, i) => `<li class="stl__step reveal" data-openui-id="${id}.step${i}"><div><h3 class="h3">${esc(st.title)}</h3><p>${esc(st.body)}</p></div></li>`).join("")}</ol><div class="stl__vis reveal">${renderVisual(p.visual, id)}</div></div>`, "", !!p.tint);
  },

  "cta-split": (s) => {
    const p = s.props, id = s.id; const f = p.form ?? {};
    return wrap(s, `<div class="ctas reveal" data-openui-id="${id}.band"><div class="ctas__copy"><h2 class="h1" data-openui-id="${id}.title">${rich(p.title)}</h2><p class="lead" data-openui-id="${id}.subtitle">${esc(p.subtitle)}</p>${p.bullets ? `<ul class="ticks">${(p.bullets as string[]).map((b) => `<li>${ICON.check}<span>${esc(b)}</span></li>`).join("")}</ul>` : ""}</div>
    <form class="form" data-form data-success="${esc(f.success ?? "Thanks — we will be in touch shortly.")}" novalidate><label for="${id}-email">${esc(f.label ?? "Work email")}</label><div class="row"><input id="${id}-email" name="email" type="email" autocomplete="email" required placeholder="${esc(f.placeholder ?? "you@company.com")}"><button class="btn btn--primary btn--lg" type="submit" data-openui-id="${id}.cta">${esc(f.button ?? "Get started")}</button></div><p class="form__note" role="status" aria-live="polite">${esc(f.note ?? "")}</p></form></div>`);
  },

  "metrics-spark": (s) => {
    const p = s.props, id = s.id;
    return wrap(s, `${p.title ? head(id, p) : ""}<div class="reveal">${renderVisual({ kind: "metrics", items: p.items }, id)}</div>`, "", !!p.tint);
  },

  "faq-split": (s) => {
    const p = s.props, id = s.id; const items = (p.items ?? []) as any[];
    return wrap(s, `<div class="fqs"><div class="fqs__head reveal">${p.eyebrow ? `<span class="eyebrow">${esc(p.eyebrow)}</span>` : ""}<h2 class="h2" data-openui-id="${id}.title">${rich(p.title)}</h2>${p.subtitle ? `<p class="lead">${esc(p.subtitle)}</p>` : ""}${btn(p.cta, "ghost", `${id}.cta`)}</div><div class="faq reveal">${items.map((f, i) => `<details${i === 0 ? " open" : ""} data-openui-id="${id}.item${i}"><summary>${esc(f.q)}${ICON.plus}</summary><div class="ans">${esc(f.a)}</div></details>`).join("")}</div></div>`);
  },
};
