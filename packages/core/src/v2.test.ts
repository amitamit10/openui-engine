import { describe, expect, it } from "vitest";
import {
  ALL_COMPONENTS, BUZZWORDS, RENDERERS, STYLE_IDS, VISUAL_KINDS, briefTemplate, buildSite, collectIconRefs, discover, generateTokens, hexToHsl, indexedComponents, lintCopy,
  findComponent, lintVisuals, normalizeCategory, normalizeVisual, suggestComponentIds, pickAccent, planSite, renderVisual, sanitizeSvg, searchIcons, searchableComponents, type PageSpec, type SiteBrief, type SiteCategory,
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
});
