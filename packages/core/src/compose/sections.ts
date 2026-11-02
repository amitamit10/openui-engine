import { ICON, btn, ctaRow, esc, head, rich, wrap } from "./util.js";
import type { Cta, Renderer, SectionType } from "./types.js";
import { iconSvg } from "../assets/icons.js";
import { RENDERERS_2 } from "./sections2.js";
import { renderVisual } from "./visuals.js";
export * from "./types.js";
export { esc, rich } from "./util.js";

/** Deterministic smooth chart path so mockups look real and stay stable between builds. */
function chartPaths(): { line: string; area: string; line2: string } {
  const pts = [62, 58, 66, 52, 60, 44, 50, 38, 46, 30, 36, 22, 28, 14];
  const pts2 = [80, 78, 82, 72, 76, 68, 70, 62, 66, 58, 60, 52, 56, 46];
  const W = 560, H = 150, step = W / (pts.length - 1);
  const mk = (arr: number[]) => arr.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(y * H / 100).toFixed(1)}`).join(" ");
  const smooth = (arr: number[]) => {
    const p = arr.map((y, i) => [i * step, y * H / 100] as const);
    let d = `M${p[0]![0]} ${p[0]![1].toFixed(1)}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1]!, [x1, y1] = p[i]!, cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  };
  void mk;
  const line = smooth(pts);
  return { line, area: `${line} L${W} ${H} L0 ${H} Z`, line2: smooth(pts2) };
}

export interface MockSpec {
  title?: string; period?: string; sidebar?: string[]; url?: string;
  kpis?: Array<{ label: string; value: string; delta?: string }>;
  ariaLabel?: string;
}

function dashboardMock(id: string, brand: string, mock: MockSpec = {}): string {
  const c = chartPaths();
  const side = mock.sidebar ?? ["Overview", "Pipelines", "Insights", "Automations", "Team", "Settings"];
  const kpis = mock.kpis ?? [{ label: "Net revenue", value: "$482.6k", delta: "▲ 18.2%" }, { label: "Active accounts", value: "12,840", delta: "▲ 6.4%" }, { label: "Churn", value: "1.9%", delta: "▲ 0.4% better" }];
  return `<div class="frame frame--float" data-openui-id="${id}.frame" role="img" aria-label="${esc(mock.ariaLabel ?? "Product dashboard preview showing a trend chart and key metrics")}">
  <div class="frame__bar"><span class="frame__dot"></span><span class="frame__dot"></span><span class="frame__dot"></span><span class="frame__url">${esc(mock.url ?? `app.${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/overview`)}</span></div>
  <div class="dash" aria-hidden="true">
    <div class="dash__side">${side.map((x, i) => `<div class="item${i === 0 ? " is-active" : ""}"><i></i>${esc(x)}</div>`).join("")}</div>
    <div class="dash__main">
      <div class="dash__top"><span class="title">${esc(mock.title ?? "Revenue overview")}</span><span class="pill">${esc(mock.period ?? "Last 30 days")}</span></div>
      <div class="kpis">${kpis.slice(0, 3).map((k) => `<div class="kpi"><small>${esc(k.label)}</small><strong>${esc(k.value)}</strong>${k.delta ? `<em>${esc(k.delta)}</em>` : ""}</div>`).join("")}</div>
      <div class="chart"><svg viewBox="0 0 560 150" preserveAspectRatio="none">
        <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c-accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--c-accent)" stop-opacity="0"/></linearGradient></defs>
        <g class="grid"><line x1="0" x2="560" y1="37" y2="37"/><line x1="0" x2="560" y1="75" y2="75"/><line x1="0" x2="560" y1="112" y2="112"/></g>
        <path class="area" d="${c.area}"/><path class="line2" d="${c.line2}"/><path class="line" d="${c.line}"/></svg></div>
    </div>
  </div>
</div>`;
}

export interface VizData { rows?: Array<{ label: string; time?: string }>; toggles?: Array<{ label: string; on?: boolean }>; code?: string; people?: string; bars?: number[] }

function viz(kind: string, d: VizData = {}): string {
  switch (kind) {
    case "bars": return `<div class="viz viz--bars" aria-hidden="true">${(d.bars ?? [38, 52, 44, 70, 58, 86, 74, 96]).map((h) => `<span style="height:${h}%"></span>`).join("")}</div>`;
    case "list": return `<div class="viz viz--list" aria-hidden="true">${(d.rows ?? [{ label: "Deploy to production", time: "2m ago" }, { label: "Review required", time: "14m ago" }, { label: "Sync completed", time: "1h ago" }]).slice(0, 4).map((r) => `<div class="row"><b></b><span>${esc(r.label)}</span><span>${esc(r.time ?? "")}</span></div>`).join("")}</div>`;
    case "code": return `<div class="viz viz--code" aria-hidden="true"><code>${d.code ? esc(d.code) : `<span class="c">// one call, typed end to end</span>
<span class="k">const</span> run = <span class="k">await</span> client.flows.<span class="k">start</span>({
  name: <span class="s">"onboarding"</span>,
  retries: <span class="s">3</span>,
});`}</code></div>`;
    case "toggle": return `<div class="viz viz--toggle" aria-hidden="true">${(d.toggles ?? [{ label: "Auto-approve under $500", on: true }, { label: "Notify finance", on: true }, { label: "Require 2nd reviewer", on: false }]).slice(0, 4).map((t) => `<div class="t"><span>${esc(t.label)}</span><i class="sw${t.on ? " on" : ""}"></i></div>`).join("")}</div>`;
    case "avatars": return `<div class="viz viz--avatars" aria-hidden="true"><span>AK</span><span>MJ</span><span>SL</span><span>RD</span><em>${esc(d.people ?? "+24 teammates online")}</em></div>`;
    default: return "";
  }
}


/** Mini visual by name (legacy) or a full domain visual object. */
function vizAny(v: any, data: any, id: string): string { return v && typeof v === "object" ? renderVisual(v, id) : viz(String(v ?? ""), data); }

const RENDERERS_1: Partial<Record<SectionType, Renderer>> = {
  "navbar-glass": (s, { spec }) => {
    const p = s.props, id = s.id;
    const links = (p.links ?? []) as Array<{ label: string; href: string }>;
    return `<header class="nav" data-openui-section="${id}" data-openui-variant="navbar-glass" data-openui-id="${id}">
  <div class="container nav__row">
    <a class="brand" href="#top" aria-label="${esc(spec.brand.name)} home" data-openui-id="${id}.brand"><span class="brand__mark" aria-hidden="true" data-i="${esc([...String(spec.brand.name).trim()][0]?.toUpperCase() ?? "•")}"></span>${esc(spec.brand.name)}</a>
    <nav class="nav__links" aria-label="Primary">${links.map((l, i) => `<a href="${esc(l.href)}" data-openui-id="${id}.link${i}">${esc(l.label)}</a>`).join("")}</nav>
    <div class="nav__actions">${p.signIn ? `<a class="btn btn--ghost" href="${esc(p.signIn.href)}" data-openui-id="${id}.signin">${esc(p.signIn.label)}</a>` : ""}${btn(p.cta, "primary", `${id}.cta`)}
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="${id}-sheet" aria-label="Open menu" data-nav-toggle>${ICON.menu}</button></div>
  </div>
  <div class="nav__sheet" id="${id}-sheet" hidden>${links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join("")}${p.signIn ? `<a href="${esc(p.signIn.href)}">${esc(p.signIn.label)}</a>` : ""}${btn(p.cta, "primary", `${id}.sheetcta`)}</div>
</header>`;
  },

  "hero-centered-product": (s, { tokens, spec }) => {
    const p = s.props, id = s.id;
    return `<section class="hero hero--centered" data-openui-section="${id}" data-openui-variant="hero-centered-product" data-openui-id="${id}" id="top">
  <div class="hero__grid" aria-hidden="true"></div>
  <div class="container">
    <div class="hero__copy">
      ${p.badge ? `<a class="badge" href="${esc(p.badge.href ?? "#")}" data-openui-id="${id}.badge"><b>${esc(p.badge.tag)}</b>${esc(p.badge.text)}</a>` : ""}
      <h1 class="h-display" data-openui-id="${id}.title">${rich(p.title)}</h1>
      <p class="lead" data-openui-id="${id}.subtitle">${esc(p.subtitle)}</p>
      ${ctaRow(p, id, tokens.composition.ctaHierarchy)}
      ${p.note ? `<p class="hero__note" data-openui-id="${id}.note">${esc(p.note)}</p>` : ""}
    </div>
    <div class="hero__visual">${p.visual ? renderVisual(p.visual, `${id}hv`) : dashboardMock(id, spec.brand.name, p.mock)}</div>
  </div>
</section>`;
  },

  "hero-split": (s, { tokens, spec }) => {
    const p = s.props, id = s.id;
    return `<section class="hero hero--split" data-openui-section="${id}" data-openui-variant="hero-split" data-openui-id="${id}" id="top">
  <div class="hero__grid" aria-hidden="true"></div>
  <div class="container hero__row">
    <div class="hero__copy">
      ${p.badge ? `<a class="badge" href="${esc(p.badge.href ?? "#")}" data-openui-id="${id}.badge"><b>${esc(p.badge.tag)}</b>${esc(p.badge.text)}</a>` : ""}
      <h1 class="h1" data-openui-id="${id}.title">${rich(p.title)}</h1>
      <p class="lead" data-openui-id="${id}.subtitle">${esc(p.subtitle)}</p>
      ${ctaRow(p, id, tokens.composition.ctaHierarchy)}
      ${p.note ? `<p class="hero__note" data-openui-id="${id}.note">${esc(p.note)}</p>` : ""}
    </div>
    <div class="hero__visual">${p.visual ? renderVisual(p.visual, `${id}hv`) : dashboardMock(id, spec.brand.name, p.mock)}${Array.isArray(p.floats) && p.floats.length ? `<div class="hero__floats">${p.floats.map((f: any, i: number) => `<div class="hfloat hfloat--${esc(f.tone ?? "info")}" data-openui-id="${id}.float${i}"><span>${esc(f.label)}</span><strong>${esc(f.value)}</strong></div>`).join("")}</div>` : ""}</div>
  </div>
</section>`;
  },

  "hero-editorial": (s, { tokens }) => {
    const p = s.props, id = s.id;
    const stats = (p.stats ?? []) as Array<{ value: string; label: string }>;
    return `<section class="hero hero--editorial" data-openui-section="${id}" data-openui-variant="hero-editorial" data-openui-id="${id}" id="top">
  <div class="container">
    <div class="hero__copy">
      ${p.eyebrow ? `<span class="eyebrow" data-openui-id="${id}.eyebrow">${esc(p.eyebrow)}</span>` : ""}
      <h1 class="h-display" data-openui-id="${id}.title">${rich(p.title)}</h1>
      <p class="lead" data-openui-id="${id}.subtitle" style="max-width:56ch">${esc(p.subtitle)}</p>
      ${ctaRow(p, id, tokens.composition.ctaHierarchy)}
    </div>
    ${stats.length ? `<div class="hero__foot">${stats.map((x, i) => `<div class="metric" style="border:0;padding:0"><strong data-openui-id="${id}.stat${i}">${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}
  </div>
</section>`;
  },

  "logo-cloud": (s) => {
    const p = s.props, id = s.id;
    return `<section class="logos" data-openui-section="${id}" data-openui-variant="logo-cloud" data-openui-id="${id}" aria-label="Customers">
  <div class="container reveal"><p class="logos__label" data-openui-id="${id}.label">${esc(p.label)}</p>
  ${p.marquee ? `<div class="marq"><div class="marq__track">${[0, 1].map((k) => ((p.logos ?? []) as string[]).map((n) => `<span class="logo-word"${k ? ' aria-hidden="true"' : ""}><i></i>${esc(n)}</span>`).join("")).join("")}</div></div>` : `<div class="logos__row">${((p.logos ?? []) as string[]).map((n) => `<span class="logo-word"><i></i>${esc(n)}</span>`).join("")}</div>`}</div>
</section>`;
  },

  "feature-bento": (s, ctx) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ title: string; body: string; visual: any; span?: number }>;
    return wrap(s, `${head(id, p)}
  <div class="bento">${items.map((it, i) => `<article class="card span-${it.span ?? 2} reveal" data-openui-id="${id}.card${i}">
    ${vizAny(it.visual, (it as any).data, `${id}c${i}`)}
    <div class="card__text">${(it as any).icon ? `<span class="ico-chip">${iconSvg((it as any).icon, ctx.icons)}</span>` : ""}<h3 class="h4" data-openui-id="${id}.card${i}.title">${esc(it.title)}</h3><p data-openui-id="${id}.card${i}.body">${esc(it.body)}</p></div></article>`).join("")}</div>`, "", false);
  },

  "feature-rows": (s) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ eyebrow?: string; title: string; body: string; bullets?: string[]; visual: any }>;
    return wrap(s, `${p.title ? head(id, p) : ""}
  <div class="rows">${items.map((it, i) => `<div class="frow reveal" data-openui-id="${id}.row${i}">
    <div class="frow__copy">
      ${it.eyebrow ? `<span class="eyebrow">${esc(it.eyebrow)}</span>` : ""}
      <h3 class="h2" data-openui-id="${id}.row${i}.title">${rich(it.title)}</h3>
      <p class="lead" data-openui-id="${id}.row${i}.body">${esc(it.body)}</p>
      ${it.bullets ? `<ul class="ticks">${it.bullets.map((b) => `<li>${ICON.check}<span>${esc(b)}</span></li>`).join("")}</ul>` : ""}
    </div>
    <div class="card" style="padding:var(--s-5)">${vizAny(it.visual, (it as any).data, `${id}r${i}`)}</div></div>`).join("")}</div>`, "", !!p.tint);
  },

  metrics: (s) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ value: string; label: string }>;
    return wrap(s, `${p.title ? head(id, p) : ""}<div class="metrics reveal">${items.map((m, i) => `<div class="metric"><strong data-openui-id="${id}.m${i}">${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join("")}</div>`, p.ink ? "section--ink" : "", p.ink ? false : !!p.tint);
  },

  steps: (s, ctx) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ title: string; body: string }>;
    return wrap(s, `${head(id, p)}<div class="steps">${items.map((st, i) => `<div class="step card reveal" data-openui-id="${id}.step${i}">${(st as any).icon ? `<span class="ico-chip">${iconSvg((st as any).icon, ctx.icons)}</span>` : ""}<h3 class="h3">${esc(st.title)}</h3><p>${esc(st.body)}</p></div>`).join("")}</div>`, "", true);
  },

  testimonials: (s) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ quote: string; name: string; role: string }>;
    return wrap(s, `${head(id, p)}<div class="quotes">${items.map((q, i) => `<figure class="card quote reveal" data-openui-id="${id}.q${i}"><blockquote>“${esc(q.quote)}”</blockquote><figcaption><span class="avatar" aria-hidden="true">${esc(q.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><span class="who"><strong>${esc(q.name)}</strong><span>${esc(q.role)}</span></span></figcaption></figure>`).join("")}</div>`);
  },

  pricing: (s) => {
    const p = s.props, id = s.id;
    const tiers = (p.tiers ?? []) as Array<{ name: string; monthly: number | string; yearly: number | string; desc: string; features: string[]; cta: Cta; featured?: boolean; unit?: string }>;
    // Savings badge: use the brief's own text, else derive it from the real monthly vs yearly prices (never a made-up number).
    const cuts = tiers.map((t) => (typeof t.monthly === "number" && typeof t.yearly === "number" && t.monthly > 0 && t.yearly < t.monthly ? Math.round((1 - t.yearly / t.monthly) * 100) : 0)).filter((n) => n > 0);
    const saveText: string = p.savings ?? (cuts.length ? `Save up to ${Math.max(...cuts)}%` : "");
    return wrap(s, `${head(id, p)}
  <div class="reveal" style="display:flex;justify-content:center;margin-bottom:var(--s-7)">
    <div class="billing" role="group" aria-label="Billing period">
      <button type="button" aria-pressed="true" data-billing="monthly">Monthly</button>
      <button type="button" aria-pressed="false" data-billing="yearly">Yearly${saveText ? ` <span class="save">${esc(saveText)}</span>` : ""}</button>
    </div></div>
  <div class="tiers">${tiers.map((t, i) => `<article class="card tier reveal${t.featured ? " tier--featured" : ""}" data-openui-id="${id}.tier${i}">
    ${t.featured ? `<span class="tier__tag">Most popular</span>` : ""}
    <div class="stack"><h3 class="h3">${esc(t.name)}</h3><p class="muted small">${esc(t.desc)}</p></div>
    <div class="price"><strong data-price data-monthly="${esc(t.monthly)}" data-yearly="${esc(t.yearly)}" data-cur="${esc(p.currency ?? "$")}">${typeof t.monthly === "number" ? esc(p.currency ?? "$") : ""}${esc(t.monthly)}</strong><span>${typeof t.monthly === "number" ? esc(t.unit ?? "/ month") : ""}</span></div>
    ${btn(t.cta, t.featured ? "primary" : "ghost", `${id}.tier${i}.cta`, false)}
    <ul class="ticks">${t.features.map((f) => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join("")}</ul></article>`).join("")}</div>`, "", true);
  },

  faq: (s) => {
    const p = s.props, id = s.id;
    const items = (p.items ?? []) as Array<{ q: string; a: string }>;
    return wrap(s, `${head(id, p)}<div class="faq reveal">${items.map((f, i) => `<details${i === 0 ? " open" : ""} data-openui-id="${id}.item${i}"><summary>${esc(f.q)}${ICON.plus}</summary><div class="ans">${esc(f.a)}</div></details>`).join("")}</div>`);
  },

  "cta-band": (s, { tokens }) => {
    const p = s.props, id = s.id;
    return wrap(s, `<div class="cta-band reveal" data-openui-id="${id}.band">
    <h2 class="h1" data-openui-id="${id}.title">${rich(p.title)}</h2>
    <p class="lead" data-openui-id="${id}.subtitle" style="max-width:52ch">${esc(p.subtitle)}</p>
    ${ctaRow(p, id, tokens.composition.ctaHierarchy)}
  </div>`);
  },

  "footer-columns": (s, { spec }) => {
    const p = s.props, id = s.id;
    const cols = (p.columns ?? []) as Array<{ title: string; links: Array<{ label: string; href: string }> }>;
    return `<footer class="footer" data-openui-section="${id}" data-openui-variant="footer-columns" data-openui-id="${id}">
  <div class="container"><div class="footer__grid">
    <div class="footer__brand"><a class="brand" href="#top"><span class="brand__mark" aria-hidden="true" data-i="${esc([...String(spec.brand.name).trim()][0]?.toUpperCase() ?? "•")}"></span>${esc(spec.brand.name)}</a><p class="muted small" data-openui-id="${id}.tagline">${esc(p.tagline)}</p></div>
    ${cols.map((c) => `<nav aria-label="${esc(c.title)}"><h3>${esc(c.title)}</h3><ul>${c.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join("")}</ul></nav>`).join("")}
  </div>
  <div class="footer__legal"><span>${esc(p.legal)}</span><span>${esc(p.note ?? "")}</span></div></div>
</footer>`;
  },
};

export const SECTION_VARIANT_GROUPS: Record<string, SectionType[]> = {
  hero: ["hero-centered-product", "hero-split", "hero-editorial"],
};

export const RENDERERS = { ...RENDERERS_1, ...RENDERERS_2 } as Record<SectionType, Renderer>;
