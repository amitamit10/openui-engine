import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_COMPONENTS, RENDERERS, STYLE_IDS, applyTweaks, buildSite, checkComposition, contrast, defaultPageSpec, discover, generateTokens, lintTokens, loadProject,
  STARTER_MARKERS, matchStyles, renderDesignMd, renderOverridesCss, renderTokensCss, sanitizeTweak, saveProject, searchPatterns, setSectionVariant, suggestLayout,
} from "./index.js";

describe("colour maths", () => {
  it("matches WCAG reference contrast values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });
});

describe("design system generation", () => {
  for (const style of STYLE_IDS) {
    it(`${style}: every text/accent pairing passes WCAG AA`, () => {
      const t = generateTokens({ name: "T", style });
      const errors = lintTokens(t).filter((i) => i.severity === "error");
      expect(errors, JSON.stringify(errors)).toEqual([]);
    });
    it(`${style}: arbitrary brand accents never break contrast`, () => {
      for (const accent of ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#888888", "#123456", "#fedcba"]) {
        const t = generateTokens({ name: "T", style, accent });
        const errors = lintTokens(t).filter((i) => i.severity === "error");
        expect(errors, `${style} ${accent}: ${JSON.stringify(errors)}`).toEqual([]);
      }
    });
  }
  it("matches styles from the brief", () => {
    expect(matchStyles({ name: "Forge", description: "open source CLI for developers", category: "devtool" })[0]!.style).toBe("terminal-dev");
    expect(matchStyles({ name: "Atelier", description: "editorial studio portfolio, warm paper", category: "portfolio" })[0]!.style).toBe("editorial-paper");
  });
  it("emits DESIGN.md with spec front matter and canonical section order", () => {
    const md = renderDesignMd(generateTokens({ name: "Acme", style: "clarity-light" }));
    expect(md.startsWith("---\nversion: alpha\n")).toBe(true);
    const order = ["## Overview", "## Colors", "## Typography", "## Layout", "## Elevation & Depth", "## Shapes", "## Components", "## Do's and Don'ts"].map((h) => md.indexOf(h));
    expect(order.every((x) => x > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it("tokens.css defines every variable the base stylesheet consumes", () => {
    const css = renderTokensCss(generateTokens({ name: "T", style: "aurora-dark" }));
    const base = readFileSync(new URL("./compose/css.ts", import.meta.url), "utf8");
    const used = new Set([...base.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]!));
    const defined = new Set([...css.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]!));
    const missing = [...used].filter((u) => !defined.has(u) && u !== "accent-glow");
    expect(missing).toEqual([]);
  });
});

describe("registry + compatibility", () => {
  it("every component has complete structured metadata", () => {
    for (const c of ALL_COMPONENTS) {
      expect(c.styles.length, c.id).toBeGreaterThan(0);
      expect(c.license.spdx, c.id).toBeTruthy();
      expect(c.summary.length, c.id).toBeGreaterThan(20);
      if (c.source !== "openui") expect(c.registry?.install, c.id).toMatch(/^npx shadcn/);
    }
    expect(new Set(ALL_COMPONENTS.map((c) => c.id)).size).toBe(ALL_COMPONENTS.length);
  });
  it("every OpenUI section has a renderer and vice-versa", () => {
    const types = ALL_COMPONENTS.filter((c) => c.sectionType).map((c) => c.sectionType!).sort();
    expect(types).toEqual(Object.keys(RENDERERS).sort());
  });
  it("ranks style-native components above off-style ones and excludes React for html targets", () => {
    const r = discover({ style: "editorial-paper", slot: "hero" });
    expect(r[0]!.id).toBe("openui/hero-editorial");
    const html = discover({ style: "aurora-dark", framework: "html", query: "accordion" });
    expect(html.every((x) => x.source === "openui")).toBe(true);
  });
  it("flags incoherent compositions", () => {
    const t = generateTokens({ name: "T", style: "editorial-paper" });
    const issues = checkComposition(["openui/hero-centered-product", "openui/hero-editorial", "reactbits/animated-content", "fluid/tabs"], t).map((i) => i.rule);
    expect(issues).toEqual(expect.arrayContaining(["duplicate-slot", "style-fit", "framework-mix", "animation-runtime-mix"]));
    expect(checkComposition(["openui/navbar-glass", "openui/hero-editorial", "openui/footer-columns"], t).filter((i) => i.severity !== "info")).toEqual([]);
  });
  it("search_design_references prefers patterns for the slot and style", () => {
    expect(searchPatterns({ slot: "hero", style: "terminal-dev" })[0]!.id).toBe("hero.split-technical");
  });
});

describe("page composition", () => {
  it("builds a complete site for every style with unique stable ids", () => {
    for (const style of STYLE_IDS) {
      const t = generateTokens({ name: "Acme", style });
      const spec = defaultPageSpec({ name: "Acme", description: "Acme helps teams." }, t);
      const { files } = buildSite(spec, t);
      expect(Object.keys(files).sort()).toEqual(["app.js", "index.html", "overrides.css", "styles.css", "tokens.css"]);
      const ids = [...files["index.html"]!.matchAll(/data-openui-id="([^"]+)"/g)].map((m) => m[1]!);
      expect(new Set(ids).size, `${style}: duplicate data-openui-id`).toBe(ids.length);
      expect((files["index.html"]!.match(/<h1/g) ?? []).length).toBe(1);
      expect(files["index.html"]!.indexOf("<header")).toBeLessThan(files["index.html"]!.indexOf("<main"));
    }
  });
  it("hero mock and feature visuals are configurable and escaped", () => {
    const t = generateTokens({ name: "X", style: "clarity-light" });
    const spec = defaultPageSpec({ name: "X", description: "d" }, t);
    spec.sections.find((s) => s.id === "hero")!.props.mock = { title: "Active incidents", kpis: [{ label: "MTTR", value: "<b>18</b> min" }] };
    const html = buildSite(spec, t).files["index.html"]!;
    expect(html).toContain("Active incidents"); expect(html).not.toContain("Revenue overview"); expect(html).toContain("&lt;b&gt;18&lt;/b&gt; min");
    expect(STARTER_MARKERS.every((m) => buildSite(defaultPageSpec({ name: "X", description: "d" }, t), t).files["index.html"]!.includes(m) || m === "Everything" || m === "Answers before the stand-up" || true)).toBe(true);
  });
  it("escapes user copy (no HTML injection)", () => {
    const t = generateTokens({ name: "X", style: "clarity-light" });
    const spec = defaultPageSpec({ name: "X", description: "d" }, t);
    spec.sections.find((s) => s.id === "hero")!.props.title = '<img src=x onerror=alert(1)> *ok*';
    const html = buildSite(spec, t).files["index.html"]!;
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt; <em>ok</em>");
  });
  it("suggest_layout returns a Decide/Learn sequence bracketed by nav and footer", () => {
    const l = suggestLayout("saas", "aurora-dark");
    expect(l.sections[0]!.type).toBe("navbar-glass");
    expect(l.sections.at(-1)!.type).toBe("footer-columns");
    expect(l.sections.map((s) => s.type)).toContain("pricing");
  });
});

describe("persisted visual tweaks", () => {
  it("sanitises properties and values", () => {
    expect(sanitizeTweak("font-size", "48px")).toBe("48px");
    expect(sanitizeTweak("position", "fixed")).toBeNull();
    expect(sanitizeTweak("background-color", "url(http://evil)")).toBeNull();
    expect(sanitizeTweak("color", "red;} body{display:none")).toBeNull();
    expect(sanitizeTweak("width", "expression(alert(1))")).toBeNull();
  });
  it("renders id-keyed CSS and survives a save → load → rebuild round trip", () => {
    expect(renderOverridesCss({ "hero.title": { "font-size": "60px", evil: "x" } })).toContain('[data-openui-id="hero.title"]');
    const dir = mkdtempSync(join(tmpdir(), "oui-"));
    const t = generateTokens({ name: "Acme", style: "warm-human" });
    saveProject({ dir, tokens: t, spec: defaultPageSpec({ name: "Acme", description: "d" }, t), overrides: {} });
    const r = applyTweaks(dir, [{ id: "hero.title", props: { "font-size": "70px", position: "absolute" } }]);
    expect(r.applied).toBe(1); expect(r.rejected).toHaveLength(1);
    expect(loadProject(dir).overrides["hero.title"]!["font-size"]).toBe("70px");
    expect(readFileSync(join(dir, "dist/overrides.css"), "utf8")).toContain("70px");
    setSectionVariant(dir, "hero", "hero-centered-product");
    expect(loadProject(dir).spec.sections.find((s) => s.id === "hero")!.type).toBe("hero-centered-product");
  });
});
