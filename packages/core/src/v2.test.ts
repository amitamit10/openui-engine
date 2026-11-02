import { describe, expect, it } from "vitest";
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
    expect(p.layout.find((l) => l.id === "features")!.type).toBe("feature-tabs");
    expect(p.layout.find((l) => l.id === "hero")!.type).toBe("hero-split"); // timeline is narrow
    const wide = planSite(brief({ heroVisual: { kind: "table", columns: ["a"], rows: [["b"]] } as any }));
    expect(wide.layout.find((l) => l.id === "hero")!.type).toBe("hero-centered-product");
    const few = planSite(brief({ features: briefTemplate().features.map((f) => ({ ...f, visual: undefined })) }));
    expect(few.layout.find((l) => l.id === "features")!.type).toBe("feature-bento");
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
    expect(top("Ledgerline", "invoicing for freelancers, trustworthy, plain-spoken, precise", "fintech")).toBe("field-notes");
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
