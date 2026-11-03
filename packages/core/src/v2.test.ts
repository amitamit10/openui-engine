import { describe, expect, it } from "vitest";
import { MOTIFS, motifSvg, renderScene, renderSpot } from "./compose/illustrate.js";
import {
  ALL_COMPONENTS, BUZZWORDS, contrast as contrastRatio, RENDERERS, STYLE_IDS, VISUAL_KINDS, briefTemplate, buildSite, collectIconRefs, discover, generateTokens, hexToHsl, indexedComponents, lintCopy,
  styleGuide, findComponent, lintVisuals, normalizeCategory, normalizeVisual, suggestComponentIds, matchStyles, pickAccent, planSite, renderVisual, sanitizeSvg, searchIcons, searchableComponents, type PageSpec, type SiteBrief, type SiteCategory,
} from "./index.js";

const CATS: SiteCategory[] = ["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"];

describe("libraries", () => {
  it("indexes thousands of registry entries as metadata and ranks curated above inferred", () => {
    expect(indexedComponents().length).toBeGreaterThan(1000);
    expect(searchableComponents().length).toBeGreaterThan(ALL_COMPONENTS.length + 1000);
    const only = discover({ style: "aurora-dark", query: "bento", includeInferred: false, limit: 10 });
    expect(only.every((r) => r.confidence === "curated")).toBe(true);
    const mixed = discover({ style: "aurora-dark", query: "timeline", limit: 5 });
    expect(mixed.some((r) => r.confidence === "inferred")).toBe(true);
    expect(new Set(searchableComponents().map((c) => c.id)).size).toBe(searchableComponents().length);
  });
  it("inferred metadata never claims a verified licence and always has an install command", () => {
    for (const c of indexedComponents().slice(0, 400)) { expect(c.license.verified).toBe(false); expect(c.registry?.install).toMatch(/^npx shadcn@latest add https:\/\//); }
  });
  it("searches 9,000+ icons with concept synonyms", () => {
    expect(searchIcons({ query: "incident" }).map((h) => h.ref)).toContain("lucide:siren");
    expect(searchIcons({ query: "payment", set: "lucide" }).every((h) => h.ref.startsWith("lucide:"))).toBe(true);
  });
  it("refuses unsafe SVG and collects icon refs from a spec", () => {
    expect(sanitizeSvg('<svg><script>alert(1)</script></svg>')).toBeNull();
    expect(sanitizeSvg('<svg onload="x()"></svg>')).toBeNull();
    expect(sanitizeSvg('<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0"/></svg>')).toContain('class="ico"');
    expect([...collectIconRefs({ a: [{ icon: "lucide:siren" }, "plain", "tabler:bolt"] })]).toEqual(["lucide:siren", "tabler:bolt"]);
  });
});

describe("domain visuals", () => {
  it("renders every kind, escapes all data, and never emits script", () => {
    const evil = "<img src=x onerror=alert(1)>";
    for (const kind of VISUAL_KINDS) {
      const html = renderVisual({ kind, title: evil, items: [{ title: evil, name: evil, text: evil, time: evil }], messages: [{ role: "user", text: evil }], columns: [evil], rows: [[evil]], code: evil, series: [{ label: evil, values: [1, 2, 3] }] } as any, "t");
      expect(html, kind).not.toMatch(/<img src=x/);
      expect(html, kind).not.toMatch(/<script/i);
    }
  });
  it("chart renders a sensible default instead of throwing on empty or malformed series", () => {
    for (const series of [[], [{ label: "a", values: [] }], [{ label: "a" }], [{ label: "a", values: [5] }], "nope", null]) {
      expect(() => renderVisual({ kind: "chart", chart: "area", series } as any, "c")).not.toThrow();
      expect(renderVisual({ kind: "chart", chart: "bars", series } as any, "c")).toContain("<svg");
    }
  });
  it("renders real chart geometry from data", () => {
    const svg = renderVisual({ kind: "chart", chart: "bars", labels: ["a", "b"], series: [{ label: "s", values: [10, 20] }] } as any, "c");
    expect((svg.match(/<rect class="b b0"/g) ?? []).length).toBe(2);
  });
});

describe("generated client script", () => {
  it("emits a working email regex (escapes survive the template literal)", () => {
    const p = planSite(briefTemplate("saas"));
    const js = buildSite(p.spec, p.tokens, {}, {}).files["app.js"]!;
    expect(js).toContain("/^\\S+@\\S+\\.\\S+$/");
    const m = js.match(/test\(i\.value\)/); expect(m).toBeTruthy();
    const re = new Function("return " + js.match(/(\/\^\\S\+@\\S\+\\\.\\S\+\$\/)/)![1])();
    expect(re.test("a@b.co")).toBe(true); expect(re.test("nope")).toBe(false);
  });
});

describe("copy lint", () => {
  const spec = (props: any): PageSpec => ({ title: "t", description: "d", brand: { name: "X" }, sections: [{ id: "hero", type: "hero-split", props }] });
  it("flags buzzwords, placeholders, stock names and emoji; passes specific copy", () => {
    const bad = lintCopy(spec({ title: "Revolutionize your workflow seamlessly!", subtitle: "Lorem ipsum dolor sit amet 🚀", primaryCta: { label: "Click here", href: "#" } }));
    expect(bad.map((f) => f.rule)).toEqual(expect.arrayContaining(["buzzword", "placeholder", "emoji", "exclamation", "generic-cta"]));
    const good = lintCopy(spec({ title: "Incidents handled before they become *emergencies*", subtitle: "Northstar groups alerts into one incident and pages the on-call engineer in 38 seconds.", primaryCta: { label: "Start a free trial", href: "#" } }));
    expect(good.filter((f) => f.severity !== "info")).toEqual([]);
    expect(BUZZWORDS.length).toBeGreaterThan(25);
  });
});

describe("planner", () => {
  const brief = (over: Partial<SiteBrief> = {}): SiteBrief => ({ ...briefTemplate("devtool"), ...over });
  it("never picks the default AI indigo/violet for derived accents", () => {
    for (const c of CATS) for (let i = 0; i < 40; i++) { const h = hexToHsl(pickAccent({ name: `Brand${i}${"x".repeat(i % 7)}`, category: c })).h; expect(h < 245 || h > 295, `${c} ${i} → hue ${h}`).toBe(true); }
    for (const style of STYLE_IDS) { const t = generateTokens({ name: "Nova", style, category: "saas" }); const h = hexToHsl(t.color.accent).h; if (style === "aurora-dark" || style === "clarity-light") expect(h < 245 || h > 295).toBe(true); }
  });
  it("uses tabs when ≥3 features carry visuals, and varies hero layout by visual shape", () => {
    const p = planSite(brief());
    expect(p.layout.find((l) => l.id === "features")!.type).toBe("feature-rows");
    expect(p.layout.find((l) => l.id === "hero")!.type).toBe("hero-split"); // timeline is narrow
    const wide = planSite(brief({ heroVisual: { kind: "table", columns: ["a"], rows: [["b"]] } as any }));
    expect(wide.layout.find((l) => l.id === "hero")!.type).toBe("hero-centered-product");
    const few = planSite(brief({ features: briefTemplate().features.map((f) => ({ ...f, visual: undefined })) }));
    expect(few.layout.find((l) => l.id === "features")!.type).toBe("feature-grid");
  });
  it("builds a complete site from the template for every category with unique ids and one h1", () => {
    for (const c of CATS) {
      const p = planSite(briefTemplate(c));
      const html = buildSite(p.spec, p.tokens, {}, {}).files["index.html"]!;
      const ids = [...html.matchAll(/data-openui-id="([^"]+)"/g)].map((m) => m[1]!);
      expect(new Set(ids).size, c).toBe(ids.length);
      expect((html.match(/<h1/g) ?? []).length, c).toBe(1);
      for (const s of p.spec.sections) expect(RENDERERS[s.type], s.type).toBeTypeOf("function");
    }
  });
  it("one testimonial becomes a featured quote without duplicating the metrics above it", () => {
    const p = planSite(brief());
    const q = p.spec.sections.find((s) => s.id === "testimonials")!;
    expect(q.type).toBe("quote-feature"); expect(q.props.stats).toEqual([]);
  });
});

describe("v0.2.1 regressions (found by agents using the engine)", () => {
  it("dashboard visual renders real content (it used to render nothing)", () => {
    const html = renderVisual({ kind: "dashboard", title: "Deals at risk", period: "This quarter", sidebar: ["Calls", "Deals"], kpis: [{ label: "At risk", value: "7", delta: "▲ 2" }] } as any, "d");
    expect(html).toContain("Deals at risk"); expect(html).toContain("At risk"); expect(html).toContain("vz-side");
  });
  it("normalises the data shapes small models write", () => {
    expect(normalizeVisual({ kind: "chart", values: [1, 2, 3] } as any)!.series).toEqual([{ label: "Series", values: [1, 2, 3] }]);
    expect((normalizeVisual({ kind: "chart", series: [[1, 2], [3, 4]] } as any) as any).series[1].values).toEqual([3, 4]);
    const t: any = normalizeVisual({ kind: "table", rows: [{ a: 1, b: 2 }] } as any); expect(t.columns).toEqual(["a", "b"]); expect(t.rows).toEqual([[1, 2]]);
    expect((normalizeVisual({ kind: "timeline", events: [{ title: "x" }] } as any) as any).items).toHaveLength(1);
    expect(renderVisual({ kind: "chart", values: [3, 5, 4] } as any, "c")).toContain("<path");
  });
  it("lints visuals that would render empty", () => {
    const spec: PageSpec = { title: "t", description: "d", brand: { name: "X" }, sections: [{ id: "features", type: "feature-tabs", props: { tabs: [{ label: "a", visual: { kind: "table" } }, { label: "b", visual: { kind: "table", columns: ["a"], rows: [["x"]] } }, { label: "c", visual: { kind: "dashboard" } }] } }] };
    const f = lintVisuals(spec); expect(f.map((x) => x.where).sort()).toEqual(["features.tabs[0].visual", "features.tabs[2].visual"]);
    expect(f.every((x) => x.severity === "error" && x.rule === "visual-empty")).toBe(true);
  });
  it("maps free-text categories and resolves bare component ids with suggestions", () => {
    expect(normalizeCategory("wellness")).toBe("consumer-app"); expect(normalizeCategory("data observability")).toBe("devtool");
    expect(normalizeCategory("B2B invoicing")).toBe("fintech"); expect(normalizeCategory("architecture studio")).toBe("agency"); expect(normalizeCategory("saas")).toBe("saas"); expect(normalizeCategory("???")).toBe("saas");
    expect(findComponent("feature-tabs")?.id).toBe("openui/feature-tabs"); expect(findComponent("dashboard")?.id).toBe("openui/visual-dashboard"); expect(findComponent("visual-chart")?.id).toBe("openui/visual-chart");
    expect(suggestComponentIds("kanban")[0]).toMatch(/kanban/);
  });
  it("default footer has three columns and the planner warns about >5 features", () => {
    const b = briefTemplate("saas"); b.features = [...b.features, ...b.features];
    const p = planSite(b);
    expect((p.spec.sections.find((x) => x.id === "footer")!.props.columns as any[]).length).toBe(3);
    expect(p.notes.join(" ")).toMatch(/only the first 5/);
  });
  it("uses minmax(0,1fr) tracks so long content cannot widen a grid", () => {
    const css = buildSite(planSite(briefTemplate("saas")).spec, planSite(briefTemplate("saas")).tokens, {}, {}).files["styles.css"]!;
    expect(css).not.toMatch(/grid-template-columns:\s*repeat\(\d+,1fr\)/); expect(css).toContain(".tabs{display:grid;grid-template-columns:minmax(0,1fr)");
  });
  it("v0.2.2: pricing currency/unit/savings and nav overrides are honoured", () => {
    const b = briefTemplate("saas"); b.pricing!.currency = "€"; b.pricing!.savings = "Save 15%"; b.pricing!.tiers[1]!.unit = "/ person / month"; b.nav = { links: [{ label: "Work", href: "#features" }], signIn: false };
    const p = planSite(b); const html = buildSite(p.spec, p.tokens, {}, {}).files["index.html"]!;
    expect(html).toContain("€24"); expect(html).toContain("Save 15%"); expect(html).toContain("/ person / month"); expect(html).not.toContain("Sign in"); expect(html).toContain(">Work<");
    expect(buildSite(p.spec, p.tokens, {}, {}).files["app.js"]).toContain("data-cur");
  });
  it("v0.2.2: scrollable table regions are focusable and not role=img (axe)", () => {
    const html = renderVisual({ kind: "table", title: "Deals", columns: ["a"], rows: [["x"]] } as any, "t");
    expect(html).toContain('role="region"'); expect(html).toContain('tabindex="0"'); expect(html).not.toMatch(/vz-table" role="img"/);
  });
  it("v0.2.2: semantic colours pass AA on their own tinted pill background in every style", () => {
    for (const style of STYLE_IDS) {
      const t = generateTokens({ name: "T", style }); const tint = (c: string, b: string) => { const x = parseInt(c.slice(1), 16), y = parseInt(b.slice(1), 16); const m = (sh: number) => Math.round(((x >> sh) & 255) * 0.14 + ((y >> sh) & 255) * 0.86); return "#" + [16, 8, 0].map((sh) => m(sh).toString(16).padStart(2, "0")).join(""); };
      for (const k of ["success", "warning", "danger"] as const) for (const bg of [t.color.surface, t.color.surface2]) expect(contrastRatio(t.color[k], tint(t.color[k], bg)), `${style} ${k} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("v0.3.0: tone words pick the style; dark only when asked for or technical", () => {
    const top = (name: string, description: string, category: SiteCategory) => matchStyles({ name, description, category })[0]!.style;
    expect(top("Fieldnote", "private journaling app for therapy, warm, safe, human, unhurried", "consumer-app")).toBe("field-notes");
    expect(top("Ledgerline", "invoicing for freelancers, plain-spoken, grounded, unhurried", "fintech")).toBe("field-notes");
    // v0.4.0: domain vocabulary spreads briefs across art directions instead of defaulting to one look
    expect(top("Pawpath", "a neighbourhood network of veterinary clinics, reassuring, practical", "consumer-app")).toBe("warm-human");
    expect(top("Summitworks", "a climbing gym with classes and memberships, energetic, welcoming", "consumer-app")).toBe("neo-brutal");
    expect(top("Freightly", "shipment tracking for freight forwarders, precise, dependable", "saas")).toBe("clarity-light");
    const picks = new Set([
      top("Pawpath", "veterinary clinics, reassuring, practical", "consumer-app"), top("Summitworks", "climbing gym, energetic", "consumer-app"),
      top("Freightly", "freight tracking, precise, dependable", "saas"), top("Fieldnote", "private journaling for therapy, unhurried", "consumer-app"),
    ]);
    expect(picks.size).toBeGreaterThanOrEqual(4);
    expect(top("Gridwise", "observability for data pipelines, technical, honest, calm, data engineers", "devtool")).toBe("terminal-dev");
    expect(top("Atelier", "architecture studio, refined, editorial, quietly confident", "agency")).toBe("editorial-paper");
    expect(top("Nova", "a dark premium AI platform", "ai-product")).toBe("aurora-dark");
    for (const c of ["saas", "fintech", "consumer-app"] as SiteCategory[]) expect(top("Acme", "a product for teams", c), c).not.toBe("aurora-dark");
    expect(styleGuide().map((x) => x.id).sort()).toEqual([...STYLE_IDS].sort());
  });
  it("v0.3.0: composable ui visual renders every block type, escapes data, and has a thin-hero lint", () => {
    const evil = "<img src=x onerror=alert(1)>";
    const blocks = ["heading", "text", "chips", "mood", "toggle", "progress", "stat", "list", "people", "quote", "callout", "wave", "buttons", "divider"].map((type) => ({ type, text: evil, label: evil, items: [{ title: evil, name: evil, meta: evil }, evil], value: 5, on: true, by: evil, side: type === "toggle" }));
    const html = renderVisual({ kind: "ui", title: evil, blocks } as any, "u");
    expect(html).not.toMatch(/<img src=x/); expect(html).not.toMatch(/<script/i);
    for (const t of ["heading", "text", "chips", "mood", "toggle", "progress", "stat", "list", "people", "quote", "callout", "wave", "buttons", "divider"]) expect(html, t).toContain(`vz-b-${t}`);
    expect(html).toContain("vz-uiside");
    const spec = (v: any): PageSpec => ({ title: "t", description: "d", brand: { name: "X" }, sections: [{ id: "hero", type: "hero-split", props: { visual: v } }] });
    expect(lintVisuals(spec({ kind: "ui", blocks: [{ type: "text", text: "a" }] })).some((f) => f.rule === "thin-hero-visual")).toBe(true);
    expect(lintVisuals(spec({ kind: "ui", blocks: Array.from({ length: 6 }, () => ({ type: "text", text: "a" })) })).some((f) => f.rule === "thin-hero-visual")).toBe(false);
    expect(lintVisuals(spec({ kind: "ui" })).some((f) => f.rule === "visual-empty")).toBe(true);
  });
  it("v0.3.0: logo strip is typographic (no placeholder shapes) and display tracking is relaxed", () => {
    const p = planSite(briefTemplate("saas")); const css = buildSite(p.spec, p.tokens, {}, {}).files["styles.css"]!;
    expect(css).toContain(".logo-word i{display:none}");
    for (const style of STYLE_IDS) expect(parseFloat(generateTokens({ name: "T", style }).type.scale.display!.tracking), style).toBeGreaterThanOrEqual(-0.03);
  });
});

describe("v0.4.0: composed hero and ink metrics band", () => {
  it("renders hero floats (escaped, max 3) and an ink metrics band by default", () => {
    const brief: any = { name: "Acme", headline: "Ship *faster*", subheadline: "Acme ships things quickly for teams.", category: "saas", primaryCta: "Start",
      features: [{ title: "A", body: "a body", visual: { kind: "list", items: ["x"] } }, { title: "B", body: "b body", visual: { kind: "list", items: ["y"] } }, { title: "C", body: "c body", visual: { kind: "list", items: ["z"] } }],
      heroVisual: { kind: "ui", title: "Screen", blocks: [{ type: "text", text: "hello" }] },
      heroFloats: [{ label: "<b>x</b>", value: "9", tone: "good" }, { label: "two", value: "2" }, { label: "three", value: "3" }, { label: "four", value: "4" }],
      metrics: [{ value: "1", label: "one" }, { value: "2", label: "two" }, { value: "3", label: "three" }, { value: "4", label: "four" }] };
    const planned = planSite(brief);
    const html = buildSite(planned.spec, planned.tokens, {}, {}).files["index.html"]!;
    expect((html.match(/class="hfloat /g) ?? []).length).toBe(3);
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("section--ink");
  });
});

describe("v0.4.1: pricing badge and template guidance", () => {
  const mk = (pricing: any): SiteBrief => ({ ...briefTemplate("saas"), pricing }) as SiteBrief;
  const html = (b: SiteBrief) => { const pl = planSite(b); return buildSite(pl.spec, pl.tokens, {}, {}).files["index.html"]!; };
  it("derives the savings badge from real prices, never a made-up number", () => {
    const tiers = (m: number, y: number) => [{ name: "A", monthly: m, yearly: y, desc: "d", features: ["f"], cta: "Go" }];
    expect(html(mk({ tiers: tiers(100, 85) }))).toContain("Save up to 15%");
    expect(html(mk({ tiers: tiers(100, 100) }))).not.toContain('class="save"');
    expect(html(mk({ tiers: [{ name: "A", monthly: "Custom", yearly: "Custom", desc: "d", features: ["f"], cta: "Go" }] }))).not.toContain('class="save"');
    expect(html(mk({ savings: "2 months free", tiers: tiers(100, 85) }))).toContain("2 months free");
  });
  it("brief_template exposes the fields agents could not find (currency, unit, featuresTitle, nav)", () => {
    const t: any = briefTemplate("saas");
    expect(t.featuresTitle).toBeTruthy(); expect(t.nav.links.length).toBe(4);
    expect(t.pricing.currency).toBeTruthy(); expect(t.pricing.tiers[0].unit).toBeTruthy();
  });
});

describe("v0.5.0: illustration layer", () => {
  const brief = (): SiteBrief => ({ ...briefTemplate("saas"), name: "Pawpath", headline: "Same-day vet care", features: [
    { title: "Same-day appointments", body: "See a vet today.", icon: "lucide:calendar", visual: { kind: "list", items: ["a"] } as any, bullets: ["Under 4 hours"] },
    { title: "One shared record", body: "Every clinic sees the same history.", visual: { kind: "table", columns: ["a"], rows: [["b"]] } as any },
    { title: "Night line", body: "Phone triage after hours.", bullets: ["<img src=x onerror=alert(1)>"] },
    { title: "Care plans", body: "Vaccines and dental bundled." }, { title: "Reminders", body: "We nudge you in time." },
  ] }) as SiteBrief;
  it("motifs are deterministic and every motif renders palette-driven SVG with no external refs", () => {
    for (const m of MOTIFS) {
      const a = motifSvg(m, "seed"), b = motifSvg(m, "seed");
      expect(a).toBe(b); expect(a.length).toBeGreaterThan(40); expect(a).not.toMatch(/https?:|<script|href=/);
    }
    expect(motifSvg("blobs", "x")).not.toBe(motifSvg("blobs", "y"));
  });
  it("spot and scene render, escape pill text and never throw on missing data", () => {
    const html = renderSpot({ icon: "lucide:anchor", pills: ["<b>x</b>"] }, "s");
    expect(html).toContain("spot__badge"); expect(html).not.toContain("<b>x</b>");
    expect(() => renderSpot({}, "s")).not.toThrow(); expect(() => renderScene({}, "h")).not.toThrow();
    expect(renderScene({ icons: ["lucide:anchor", "lucide:ship"] }, "h")).toContain("scene__sat");
  });
  it("default feature layout is rows for the strongest 2 plus an illustrated grid for the rest, and the hero gets a scene", () => {
    const p = planSite(brief());
    expect(p.layout.find((l) => l.id === "features")!.type).toBe("feature-rows");
    expect(p.layout.find((l) => l.id === "more")!.type).toBe("feature-grid");
    const hero: any = p.spec.sections.find((x) => x.id === "hero")!;
    expect(hero.props.scene.motif).toBeTruthy(); expect(hero.props.scene.icons?.length).toBeGreaterThan(0);
    const html = buildSite(p.spec, p.tokens, {}, {}).files["index.html"]!;
    expect((html.match(/class="spot /g) ?? []).length).toBe(3);
    expect(html).not.toContain("<img src=x");
    expect(buildSite(p.spec, p.tokens, {}, {}).files["app.js"]).toContain("requestAnimationFrame");
  });
});
