import { describe, expect, it } from "vitest";
import { MOTIFS, motifSvg, renderScene, renderSpot } from "./compose/illustrate.js";
import { SCENE_IDS, pickScene, sceneMarkup } from "./compose/scenes.js";
import { sanitizeArt } from "./compose/art.js";
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
  it("default footer has three columns and the planner warns when features exceed what the layout shows", () => {
    const b = briefTemplate("saas"); b.features = [...b.features, ...b.features, ...b.features];
    const p = planSite(b);
    expect((p.spec.sections.find((x) => x.id === "footer")!.props.columns as any[]).length).toBe(3);
    expect(p.notes.join(" ")).toMatch(/only the first 8/);
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

describe("v0.5.1: domain scenes and polish", () => {
  const mk = (over: Partial<SiteBrief>): SiteBrief => ({ ...briefTemplate("saas"), heroVisual: undefined, ...over }) as SiteBrief;
  it("routes non-software businesses to a drawn domain scene and keeps software on the product mockup", () => {
    expect(pickScene("Fernwood Dental family practice")).toBe("clinic");
    expect(pickScene("Heron & Finch interior design studio")).toBe("interior");
    expect(pickScene("Tidewater marina sailing lessons")).toBe("marine");
    expect(pickScene("Skyplot crop-monitoring satellite imagery")).toBe("field");
    expect(pickScene("an invoicing app for freelancers")).toBeNull();
    const dental = planSite(mk({ name: "Fernwood Dental", subheadline: "A family dental practice with evening appointments.", category: "saas" }));
    const hero: any = dental.spec.sections.find((x) => x.id === "hero")!;
    expect(hero.type).toBe("hero-split"); expect(hero.props.sceneArt).toBe("clinic"); expect(hero.props.visual).toBeUndefined();
    const api = planSite(mk({ name: "Skyplot", subheadline: "A crop-monitoring satellite imagery API for developers.", category: "devtool" }));
    expect((api.spec.sections.find((x) => x.id === "hero")!.props as any).sceneArt).toBeUndefined();
    const sched = planSite(mk({ name: "Cadence", subheadline: "Shift-scheduling software for independent restaurants.", category: "saas" }));
    expect((sched.spec.sections.find((x) => x.id === "hero")!.props as any).sceneArt).toBeUndefined();
    const supplied = planSite(mk({ name: "Fernwood Dental", subheadline: "A family dental practice.", heroVisual: { kind: "ui", title: "Visit", blocks: [{ type: "text", text: "hi" }] } as any }));
    expect((supplied.spec.sections.find((x) => x.id === "hero")!.props as any).sceneArt).toBeUndefined(); // a supplied mockup is never overridden
    const forced = planSite(mk({ name: "Fernwood Dental", subheadline: "A family dental practice.", heroStyle: "product" }));
    expect((forced.spec.sections.find((x) => x.id === "hero")!.props as any).sceneArt).toBeUndefined();
  });
  it("every scene renders self-contained SVG with no external references and uses only palette variables", () => {
    for (const id of SCENE_IDS) {
      const m = sceneMarkup(id);
      expect(m).toContain("<svg"); expect(m).not.toMatch(/https?:|<script|href=|<image/);
    }
  });
  it("renders the scene hero without throwing and formats prices with thousands separators", () => {
    const p = planSite(mk({ name: "Heron & Finch", subheadline: "An interior design studio for family homes.", category: "agency", pricing: { currency: "£", tiers: [{ name: "Whole", monthly: 6200, yearly: 5580, desc: "d", features: ["f"], cta: "Go", featured: true }] } as any }));
    const html = buildSite(p.spec, p.tokens, {}, {}).files["index.html"]!;
    expect(html).toContain("scene--art"); expect(html).toContain("£6,200");
    expect(buildSite(p.spec, p.tokens, {}, {}).files["app.js"]).toContain("toLocaleString");
  });
});

describe("v0.6.0: model-drawn art", () => {
  it("keeps safe flat SVG with palette variables and strips everything executable or external", () => {
    const ok = sanitizeArt('<svg viewBox="0 0 400 300" width="400"><rect width="400" height="300" fill="var(--c-accent-soft)"/><g transform="translate(10 10)"><circle cx="50" cy="50" r="20" fill="var(--c-accent)"/></g></svg>');
    expect(ok).toContain("var(--c-accent)"); expect(ok).toContain("viewBox"); expect(ok).not.toMatch(/<svg[^>]*\swidth=/);
    const evil = sanitizeArt('<svg onload="alert(1)"><rect width="1" height="1"/></svg>'); expect(evil).toBeNull();
    expect(sanitizeArt('<svg><script>alert(1)</script><rect width="1" height="1"/></svg>')).toBeNull();
    expect(sanitizeArt('<svg><foreignObject><div/></foreignObject><rect width="1" height="1"/></svg>')).toBeNull();
    const mixed = sanitizeArt('<svg><rect width="1" height="1" fill="url(https://evil.test/x)" style="x" href="javascript:alert(1)"/><text>hi</text><image href="http://e/x.png"/><circle r="2"/></svg>')!;
    expect(mixed).not.toMatch(/evil|javascript|onclick|style=|<image|http/);
    expect(mixed).toContain("<text>hi</text>");
    expect(mixed).toContain("<circle");
    expect(sanitizeArt('<svg><rect width="1" height="1" onclick="1"/></svg>')).toBeNull(); // any event handler rejects the whole drawing
    expect(sanitizeArt("not svg")).toBeNull(); expect(sanitizeArt("<svg></svg>")).toBeNull(); expect(sanitizeArt(42)).toBeNull();
  });
  it("keeps short plain text labels, escapes them, drops risky attrs, and explains rejections", async () => {
    const { sanitizeArtDetailed } = await import("./compose/art.js");
    const ok = sanitizeArtDetailed('<svg viewBox="0 0 400 300"><rect width="400" height="300"/><text x="20" y="40" font-size="18" font-family="evil, serif" fill="var(--c-text)">Sauna 1 &amp; plunge <b>now</b></text></svg>');
    expect(ok.svg).toContain('<text x="20" y="40" font-size="18" fill="var(--c-text)">');
    expect(ok.svg).not.toMatch(/font-family|<b>/);
    expect(ok.svg).toContain("Sauna 1 &amp; plunge");
    expect(sanitizeArtDetailed('<svg><text x="1">' + "x".repeat(200) + '</text><rect width="1" height="1"/></svg>').svg).not.toContain("x".repeat(61));
    expect(sanitizeArtDetailed('<svg><text>javascript:alert(1)</text><rect width="1" height="1"/></svg>').svg).not.toMatch(/javascript/);
    expect(sanitizeArtDetailed("<svg><script/></svg>").reason).toMatch(/script/);
    expect(sanitizeArtDetailed('<svg><rect onclick="1"/></svg>').reason).toMatch(/event handler/);
    expect(sanitizeArtDetailed("<svg></svg>").reason).toMatch(/no drawable shapes/);
    expect(sanitizeArtDetailed("hello").reason).toMatch(/no <svg>/);
  });
  it("warns in the build notes when supplied art is rejected, and lays out five features without an orphan row", async () => {
    const { planSite, buildSite } = await import("./index.js");
    const bad = '<svg viewBox="0 0 10 10"><script>x</script><rect width="1" height="1"/></svg>';
    const brief: any = { ...briefTemplate("saas"), features: [1, 2, 3, 4, 5].map((n) => ({ title: `Feature ${n}`, body: "b", art: n === 2 ? bad : undefined })) };
    const { tokens, spec, notes } = planSite(brief);
    expect(notes.join(" ")).toMatch(/features\[1\]\.art.*rejected.*script/);
    expect(buildSite(spec, tokens, {}, {}).files["index.html"]).toContain("fgrid fgrid--n5");
    const six: any = { ...briefTemplate("saas"), features: [1, 2, 3, 4, 5, 6].map((n) => ({ title: `F${n}`, body: "b" })) };
    expect(planSite(six).notes.join(" ")).not.toMatch(/only the first/);
  });
  it("renders heroVisual svg and per-feature art, never overridden by a library scene", () => {
    const art = '<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="var(--c-accent)"/><circle cx="9" cy="9" r="4" fill="var(--c-bg)"/></svg>';
    const b: SiteBrief = { ...briefTemplate("saas"), name: "Fernwood Dental", subheadline: "A family dental practice.", category: "saas", heroVisual: { kind: "svg", svg: art, alt: "A tooth" } as any,
      features: [{ title: "A", body: "b", art }, { title: "B", body: "b", art }, { title: "C", body: "b" }, { title: "D", body: "b" }, { title: "E", body: "b" }] } as SiteBrief;
    const p = planSite(b);
    expect((p.spec.sections.find((x) => x.id === "hero")!.props as any).sceneArt).toBeUndefined();
    const html = buildSite(p.spec, p.tokens, {}, {}).files["index.html"]!;
    expect((html.match(/class="vz vz-art"/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(html).not.toContain("<script>alert");
  });
});

describe("assets: photos, logo, legal", () => {
  it("searches the photo library offline and ranks tag matches first", async () => {
    const { searchPhotos, PHOTOS } = await import("./compose/photos.js");
    expect(PHOTOS.length).toBeGreaterThanOrEqual(100);
    const r = searchPhotos("coffee cafe", 5);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.tags.some((t) => t === "coffee" || t === "cafe")).toBe(true);
    expect(searchPhotos("zzzz")).toEqual([]);
  });
  it("renders accessible responsive photos, accepts id 0, rejects unsafe URLs", async () => {
    const { renderPhoto } = await import("./compose/photos.js");
    const html = renderPhoto(0, { alt: "A desk" })!;
    expect(html).toContain('alt="A desk"'); expect(html).toContain("srcset="); expect(html).toContain('width="1200"'); expect(html).toContain('loading="lazy"');
    expect(renderPhoto("javascript:alert(1)")).toBeNull();
    expect(renderPhoto('https://x.test/a.jpg"onerror="x')).toBeNull();
    expect(renderPhoto("https://images.example.com/a.jpg", { alt: "x" })).toContain('src="https://images.example.com/a.jpg"');
  });
  it("builds heroPhoto, feature photos, logo files, legal pages and a copyright footer", async () => {
    const { planSite, buildSite } = await import("./index.js");
    const brief: any = { name: "Harbour Row", category: "consumer-app", headline: "Coffee roasted *two streets* away", subheadline: "Small batch beans roasted every Tuesday.", primaryCta: "Order beans", heroPhoto: 42, features: [{ title: "Roasted twice a week", body: "12kg batches bagged within an hour.", photo: 0 }, { title: "Beans by post", body: "Ordered by noon, with you in two days." }, { title: "Brewed at the bar", body: "Flat whites from 7am." }], legal: { holder: "Harbour Row Ltd", pages: true, email: "a@b.test" }, logo: { mark: "leaf" } };
    const { tokens, spec } = planSite(brief);
    const site = buildSite(spec, tokens, {}, {});
    const idx = site.files["index.html"]!;
    expect(idx).toContain("picsum.photos/id/42/"); expect(idx).toContain("picsum.photos/id/0/");
    expect(idx).toContain("All rights reserved"); expect(idx).toContain("privacy.html"); expect(idx).toContain('rel="icon" href="favicon.svg"');
    for (const f of ["favicon.svg", "logo.svg", "privacy.html", "terms.html"]) expect(site.files[f]).toBeTruthy();
    expect(site.files["privacy.html"]).toContain("Harbour Row Ltd");
  });
  it("sanitises a supplied logo", async () => {
    const { customLogo } = await import("./compose/logo.js");
    expect(customLogo('<svg viewBox="0 0 32 32" onload="x()"><circle cx="16" cy="16" r="8"/></svg>')).toBeNull();
    expect(customLogo('<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="8"/></svg>')).toContain("brand__svg");
  });
});

describe("image slots: placeholders, prompts and dropped-in files", () => {
  const brief: any = { name: "Quay Bakery", category: "consumer-app", headline: "Bread baked before the town wakes", subheadline: "Sourdough and pastries from a quayside oven.", primaryCta: "Order bread", heroPhoto: { prompt: "A baker lifting a sourdough loaf from a stone oven at dawn", alt: "A baker with a fresh loaf" }, features: [{ title: "Stone-baked sourdough", body: "Thirty-hour ferment, baked at 5am.", photo: { prompt: "Close-up of scored sourdough loaves on a wooden peel", alt: "Loaves" } }, { title: "Pastries", body: "Laminated daily." }, { title: "Box delivery", body: "Saturday boxes." }] };
  it("renders placeholders carrying the prompt, and lists requests with a logo prompt and user instructions", async () => {
    const { planSite, buildSite, collectImageRequests, imageInstructions, setAssets } = await import("./index.js");
    setAssets({});
    const { tokens, spec } = planSite(brief);
    const html = buildSite(spec, tokens, {}, {}).files["index.html"]!;
    expect(html).toContain("vz-photo--ph"); expect(html).toContain("A baker lifting a sourdough loaf"); expect(html).toContain("No text, logos, watermarks");
    expect(html).not.toContain("<img src=\"undefined");
    const reqs = collectImageRequests(spec, {});
    expect(reqs.map((r) => r.slot).sort()).toEqual(["feature-1", "hero", "logo"]);
    expect(reqs.every((r) => r.status === "missing" && r.prompt.length > 40)).toBe(true);
    expect(reqs.find((r) => r.slot === "logo")!.prompt).toContain("Quay Bakery");
    expect(imageInstructions(reqs)).toMatch(/copy-paste/);
  });
  it("swaps placeholders for real files and marks slots provided", async () => {
    const { planSite, buildSite, collectImageRequests, imageInstructions, setAssets } = await import("./index.js");
    const { tokens, spec } = planSite(brief);
    const found = { hero: "images/hero.png", "feature-1": "images/feature-1.jpg", logo: "images/logo.svg" };
    setAssets(found);
    const html = buildSite(spec, tokens, {}, {}).files["index.html"]!;
    setAssets({});
    expect(html).toContain('src="images/hero.png"'); expect(html).toContain('src="images/feature-1.jpg"'); expect(html).toContain('class="brand__img"'); expect(html).toContain('href="images/logo.svg"');
    expect(html).not.toContain("vz-photo--ph\"");
    const reqs = collectImageRequests(spec, found);
    expect(reqs.every((r) => r.status === "provided")).toBe(true);
    expect(imageInstructions(reqs)).toBeUndefined();
  });
  it("ignores unsafe slot names", async () => {
    const { renderImageSlot } = await import("./index.js");
    expect(renderImageSlot({ slot: '../x"', prompt: "p" })).toBeNull();
  });
});

describe("art directions added in v0.7 are chosen for the briefs they were built for", () => {
  const pick = (name: string, description: string, category: any) => matchStyles({ name, description, category })[0]!.style;
  it("routes briefs to the right new style and leaves the older routing intact", () => {
    expect(pick("Hollis & Reed", "an architecture practice designing houses and galleries with a rational, structured approach", "agency")).toBe("swiss-grid");
    expect(pick("Maison Verre", "a boutique hotel and spa for private evening stays, luxury and bespoke service", "agency")).toBe("noir-luxe");
    expect(pick("Pip & Bean", "a nursery school and kids learning club, playful and friendly", "consumer-app")).toBe("pastel-play");
    expect(pick("Ledgerline", "a minimal internal developer dashboard and workspace tool, clean and neutral", "devtool")).toBe("shadcn-mono");
    expect(pick("Homely", "a friendly household services marketplace app for families booking help", "consumer-app")).toBe("material-tonal");
    expect(pick("Quillstone Bindery", "hand bookbinding studio, refined, patient, old-fashioned", "ecommerce")).toBe("editorial-paper");
    expect(pick("Saltmarsh Sauna", "calm earthy coastal sauna club", "consumer-app")).toBe("field-notes");
  });
  it("renders every new style with its own signature rules and a curated, non-magenta secondary accent", () => {
    for (const style of ["shadcn-mono", "material-tonal", "swiss-grid", "noir-luxe", "pastel-play"] as const) {
      const brief: any = { ...briefTemplate("saas"), style };
      const { tokens, spec } = planSite(brief);
      const css = buildSite(spec, tokens, {}, {}).files["styles.css"]!;
      expect(css, style).toContain(`[data-style="${style}"]`);
      expect(tokens.meta.style).toBe(style);
      const h2 = hexToHsl(tokens.color.accent2).h;
      expect(h2 > 285 && h2 < 335, `${style} accent2 hue ${Math.round(h2)}`).toBe(false);
    }
  });
});

describe("schedule visual accepts natural shapes and warns when empty", () => {
  it("maps items/appointments/day names to blocks, and the lint catches a grid with no blocks", async () => {
    const { normalizeVisual, renderVisual, lintVisuals } = await import("./index.js");
    const v: any = { kind: "schedule", title: "Thursday", days: ["Mon", "Tue", "Wed"], appointments: [{ time: "09:00", items: [{ day: "Tue", title: "Vaccination: Biscuit" }, "Check-up"] }, { name: "10:30", slots: [{ col: 2, label: "Dental" }] }] };
    const n: any = normalizeVisual(v);
    expect(n.rows[0].label).toBe("09:00"); expect(n.rows[0].blocks[0]).toMatchObject({ day: 1, label: "Vaccination: Biscuit" }); expect(n.rows[1].blocks[0]).toMatchObject({ day: 2, label: "Dental" });
    expect(renderVisual(v, "t")).toContain("Vaccination: Biscuit");
    const spec: any = { title: "t", description: "d", brand: { name: "X" }, sections: [{ id: "hero", type: "hero-split", props: { visual: { kind: "schedule", rows: [{ label: "09:00" }] } } }] };
    expect(lintVisuals(spec).some((f) => /none has blocks/.test(f.message))).toBe(true);
  });
});

describe("category normalisation understands local service businesses", () => {
  it("maps services, clinics, schools and clubs to consumer-app and keeps exact categories", () => {
    for (const w of ["services", "surf school", "veterinary clinic", "sauna club", "dental practice", "hospitality", "tutoring", "restaurant"]) expect(normalizeCategory(w), w).toBe("consumer-app");
    expect(normalizeCategory("saas")).toBe("saas"); expect(normalizeCategory("developer tools")).toBe("devtool"); expect(normalizeCategory("ecommerce shop")).toBe("ecommerce");
    expect(normalizeCategory("architecture studio")).toBe("agency");
  });
});
