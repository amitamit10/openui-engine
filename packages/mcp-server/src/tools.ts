import { mkdirSync, readFileSync, writeFileSync, existsSync, cpSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ALL_COMPONENTS, ICON_SETS, INDEX_GENERATED_AT, LIBRARIES, RENDERERS, VISUAL_KINDS, VISUAL_SUGGESTIONS, briefTemplate, styleGuide, collectIconRefs, normalizeCategory, inferCategory, resolveStyle, suggestComponentIds, fetchIcons, findComponent, lintCopy, lintVisuals, planSite, searchIcons, searchableComponents, STYLES, STYLE_IDS, checkComposition, defaultPageSpec, discover, fetchLiveItem, generateTokens, isProject, lintTokens,
  loadProject, matchStyles, rebuild, renderDesignMd, renderTokensCss, renderTokensJson, saveProject, searchPatterns, reviewDesign, buildSite, getStyle, imageStatus, IMAGE_EXTS, searchPhotos, photoUrl, PHOTOS, LOGO_MARKS, pickMark, logoFiles, legalDoc, pickAccent, hexToHsl, hslToHex, contrast, OBJECTS, PALETTE_VARS, SCENE_IDS, sceneSvg, getSources, setTokenPath, suggestLayout, applyTweaks,
  type DesignTokens, type PageSpec, type SectionSpec, type SectionType, type SiteCategory, type StyleId,
} from "@openui-engine/core";
import { auditTarget, capture, serveDir, VIEWPORTS, formatReport, detectSlop, getBrowser } from "@openui-engine/verify";
import { applyPending } from "@openui-engine/editor";
import type { ServerContext } from "./context.js";

const STYLE = z.string().transform((v) => resolveStyle(v).style).describe("art direction: an id (" + STYLE_IDS.join(", ") + ") or loose words such as 'warm editorial'; unknown words fall back to the closest match");
/** Any text is accepted and mapped to the nearest of the eight categories (small models write "services", "surf school", "vet clinic"). */
const CATEGORY = z.string().describe("any text; mapped to the nearest of: saas, ai-product, devtool, fintech, agency, portfolio, ecommerce, consumer-app").transform((s) => normalizeCategory(s));
/** Small models guess argument names; accept the obvious aliases for `target`. */
const tgt = (a: Record<string, any>): string => { const t = a.target ?? a.url ?? a.path ?? a.dir ?? a.projectDir ?? a.site; if (typeof t !== "string") return "site"; return t.replace(/^file:\/\//, ""); };
const text = (obj: unknown) => ({ content: [{ type: "text" as const, text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 1) }] });
const fail = (msg: string) => ({ isError: true, content: [{ type: "text" as const, text: msg }] });

function writeDesignFiles(dir: string, tokens: DesignTokens): string[] {
  mkdirSync(dir, { recursive: true });
  const files: Record<string, string> = {
    "openui.tokens.json": JSON.stringify(tokens, null, 2) + "\n",
    "DESIGN.md": renderDesignMd(tokens), "tokens.json": renderTokensJson(tokens), "tokens.css": renderTokensCss(tokens),
  };
  for (const [n, c] of Object.entries(files)) writeFileSync(join(dir, n), c);
  return Object.keys(files);
}

const brief = z.object({
  name: z.string().describe("Product / brand name"),
  tagline: z.string().optional().describe("Hero headline; wrap one phrase in *asterisks* for the emphasised word"),
  description: z.string().describe("1–2 sentences: what it is and who it is for"),
  audience: z.string().optional(),
});

export function registerTools(server: McpServer, ctx: ServerContext): void {
  // 1 ────────────────────────────────────────────────────────────────────────
  server.registerTool("discover_components", {
    title: "Discover components",
    description: "Find the best-fitting components for a slot (hero, features, pricing…) given an art direction. Returns a SHORT ranked list (id, fit score, why, install command) — never the whole registry. Call get_component for details. Includes original OpenUI sections (zero-dependency HTML) and curated third-party registry items (shadcn, Fluid Functionalism, Magic UI, Aceternity, React Bits).",
    inputSchema: {
      query: z.string().optional().describe("keywords, e.g. 'pricing toggle' or 'logo marquee'"),
      slot: z.enum(["navbar", "hero", "logos", "features", "metrics", "steps", "testimonials", "pricing", "faq", "cta", "footer", "primitive", "background", "text-effect", "layout"]).optional(),
      style: STYLE.optional().describe("Art direction; defaults to the project's style when projectDir is given, else aurora-dark"),
      category: CATEGORY.optional(),
      framework: z.enum(["html", "react"]).optional().describe("'html' excludes React-only components"),
      source: z.string().optional().describe("library id: openui, shadcn, magicui, reactbits, aceternity, fluid, kibo, cult, motionprimitives, animateui, eldora, tripled (see list_libraries)"),
      includeInferred: z.boolean().default(true).describe("false = only hand-reviewed components"),
      projectDir: z.string().optional(),
      limit: z.number().int().min(1).max(15).default(6),
    },
  }, async (a) => {
    let style = a.style as StyleId | undefined;
    if (!style && a.projectDir) { try { style = loadProject(ctx.safePath(a.projectDir)).tokens.meta.style; } catch { /* fall through */ } }
    const results = discover({ style: style ?? "aurora-dark", category: a.category as SiteCategory | undefined, slot: a.slot, framework: a.framework, query: a.query, limit: a.limit, source: a.source, includeInferred: a.includeInferred });
    return text({ style: style ?? "aurora-dark", searchable: searchableComponents().length, curated: ALL_COMPONENTS.length, note: "entries marked confidence:inferred have metadata derived from the registry entry, not hand-reviewed", results });
  });

  // 2 ────────────────────────────────────────────────────────────────────────
  server.registerTool("get_component", {
    title: "Get component",
    description: "Full metadata for one component id. detail='meta' (default) returns capabilities, compatibility, license status and props. detail='source' additionally returns, for OpenUI sections, an example JSON spec + rendered HTML, and for third-party registry items, the live source files fetched on demand from the project's own registry (truncated).",
    inputSchema: { id: z.string().describe("e.g. openui/pricing or fluid/tabs"), detail: z.enum(["meta", "source"]).default("meta"), style: STYLE.optional() },
  }, async (a) => {
    const c = findComponent(a.id);
    if (!c) return fail(`Unknown component "${a.id}". Did you mean: ${suggestComponentIds(a.id).join(", ") || "(none)"}? Use discover_components to search; OpenUI ids look like openui/feature-tabs or openui/visual-chart.`);
    const out: Record<string, unknown> = { ...c };
    if (a.detail === "source") {
      if (c.registry) {
        try { out.live = await fetchLiveItem(c, { includeSource: true, maxChars: 7000 }); }
        catch (e) { out.live_error = `Could not reach registry: ${(e as Error).message}. Install with: ${c.registry.install}`; }
      } else if (c.sectionType) {
        const style = (a.style ?? "aurora-dark") as StyleId;
        const tokens = generateTokens({ name: "Example", style });
        const spec = defaultPageSpec({ name: "Example", description: "Example product." }, tokens);
        const sec = spec.sections.find((s) => s.type === c.sectionType);
        if (sec) {
          out.example_spec = sec;
          out.example_html = RENDERERS[sec.type as SectionType](sec, { tokens, spec, icons: {} }).slice(0, 5000);
        }
      }
    }
    return text(out);
  });

  // 3 ────────────────────────────────────────────────────────────────────────
  server.registerTool("search_design_references", {
    title: "Search design references",
    description: "Look up composition patterns (principles, pitfalls, which components implement them) by category, style, slot or intent, with pointers to external inspiration galleries for human browsing. Set includeSources to also list the audited status/licence of every inspiration and component source. Patterns are original summaries — no third-party markup or imagery is reproduced.",
    inputSchema: { category: CATEGORY.optional(), style: STYLE.optional(), slot: z.string().optional(), intent: z.string().optional().describe("free text: 'convert', 'trust', 'developer'…"), includeSources: z.boolean().default(false), limit: z.number().int().min(1).max(10).default(4) },
  }, async (a) => {
    const patterns = searchPatterns({ category: a.category as SiteCategory | undefined, style: a.style as StyleId | undefined, slot: a.slot, intent: a.intent, limit: a.limit })
      .map(({ score: _s, ...p }) => p);
    return text({ patterns, ...(a.includeSources ? { sources: getSources().map((s) => ({ id: s.id, url: s.url, http: s.httpStatus, access: s.access, integration: s.integration, license: s.license })) } : {}) });
  });

  // 4 ────────────────────────────────────────────────────────────────────────
  server.registerTool("generate_design_system", {
    title: "Generate design system",
    description: "Pick an art direction from the brief (or use `style`) and generate a complete, WCAG-checked design system: DESIGN.md (Google DESIGN.md spec), tokens.json (DTCG), tokens.css and openui.tokens.json written to outDir. Returns the chosen style, runner-up styles, lint findings and token summary. Every section later composed uses these tokens exclusively.",
    inputSchema: { name: z.string().default("Brand"), description: z.string().optional(), category: CATEGORY.optional(), style: STYLE.optional(), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().describe("brand accent hex"), motion: z.number().int().min(0).max(3).optional(), outDir: z.string().default("design").describe("project directory (default 'design'; relative to the server workdir)") },
  }, async (a) => {
    const dir = ctx.safePath(a.outDir);
    const matches = matchStyles({ name: a.name, description: a.description, category: a.category as SiteCategory | undefined });
    const tokens = generateTokens({ name: a.name, description: a.description, category: a.category as SiteCategory | undefined, style: a.style as StyleId | undefined, accent: a.accent, motion: a.motion as 0 | 1 | 2 | 3 | undefined });
    const files = writeDesignFiles(dir, tokens);
    const s = STYLES[tokens.meta.style];
    return text({ style: { id: s.id, name: s.name, summary: s.summary, why: matches.find((m) => m.style === s.id)?.reasons ?? ["explicit"] }, alternatives: matches.filter((m) => m.style !== s.id).slice(0, 2).map((m) => ({ id: m.style, score: m.score })), lint: lintTokens(tokens), signatures: s.signatures, avoid: s.doNot, composition: tokens.composition, files });
  });

  // 5 ────────────────────────────────────────────────────────────────────────
  server.registerTool("suggest_layout", {
    title: "Suggest layout",
    description: "Surface-first page layout: names the surface archetype and returns the ordered section sequence with component ids and the reason each earns its place.",
    inputSchema: { category: CATEGORY.default("saas"), style: STYLE.optional().describe("art direction; chosen from category when omitted"), goal: z.string().default("convert") },
  }, async (a) => text(suggestLayout(a.category as SiteCategory, (a.style ?? matchStyles({ name: "", category: a.category as SiteCategory })[0]!.style) as StyleId, a.goal)));

  // 6 ────────────────────────────────────────────────────────────────────────
  server.registerTool("compose_page", {
    title: "Compose page",
    description: "Create or update a runnable project in projectDir: generates tokens (if missing), a page spec (openui.page.json) from the suggested layout, then renders a static, deployable site to dist/. Re-call with sectionProps to rewrite copy (props are merged), removeSections/addSections to restructure, or `spec` to supply a full page spec. Returns section ids with their editable props and any component-compatibility issues. Open dist/index.html or serve dist/ to view.",
    inputSchema: {
      projectDir: z.string(), brief: brief.optional().describe("required when creating a new project"),
      style: STYLE.optional(), category: CATEGORY.optional(), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      spec: z.any().optional().describe("Full PageSpec {title,description,brand:{name},sections:[{id,type,props}]}"),
      sectionProps: z.record(z.record(z.any())).optional().describe("sectionId → props to deep-merge, e.g. {hero:{title:'…'}}"),
      removeSections: z.array(z.string()).optional(),
      addSections: z.array(z.object({ id: z.string(), type: z.string(), props: z.record(z.any()).default({}), afterId: z.string().optional() })).optional(),
      reset: z.boolean().default(false).describe("regenerate the default spec even if the project exists"),
    },
  }, async (a) => {
    const dir = ctx.safePath(a.projectDir);
    let tokens: DesignTokens; let spec: PageSpec; let overrides = {};
    const exists = isProject(dir);
    if (exists) { const p = loadProject(dir); tokens = p.tokens; spec = p.spec; overrides = p.overrides; }
    else {
      if (!a.brief) return fail("brief is required to create a new project.");
      const tokenFile = join(dir, "openui.tokens.json");
      // a design system generated earlier (generate_design_system) is the source of truth; never silently replace it
      tokens = existsSync(tokenFile) && !a.style && !a.accent ? (JSON.parse(readFileSync(tokenFile, "utf8")) as DesignTokens) : generateTokens({ name: a.brief.name, description: a.brief.description, category: a.category as SiteCategory | undefined, style: a.style as StyleId | undefined, accent: a.accent });
      spec = defaultPageSpec(a.brief, tokens);
    }
    if (exists && a.reset && a.brief) spec = defaultPageSpec(a.brief, tokens);
    if (a.spec) spec = a.spec as PageSpec;
    for (const id of a.removeSections ?? []) spec.sections = spec.sections.filter((s) => s.id !== id);
    for (const add of a.addSections ?? []) {
      if (!(add.type in RENDERERS)) return fail(`Unknown section type "${add.type}". Valid: ${Object.keys(RENDERERS).join(", ")}`);
      const sec: SectionSpec = { id: add.id, type: add.type as SectionType, props: add.props };
      const i = add.afterId ? spec.sections.findIndex((s) => s.id === add.afterId) : -1;
      i >= 0 ? spec.sections.splice(i + 1, 0, sec) : spec.sections.splice(Math.max(0, spec.sections.length - 1), 0, sec);
    }
    for (const [id, props] of Object.entries(a.sectionProps ?? {})) {
      const s = spec.sections.find((x) => x.id === id);
      if (!s) return fail(`No section "${id}". Existing: ${spec.sections.map((x) => x.id).join(", ")}`);
      s.props = { ...s.props, ...props };
    }
    const ids = spec.sections.map((s) => `openui/${s.type}`);
    const issues = checkComposition(ids, tokens);
    const saved = saveProject({ dir, tokens, spec, overrides });
    return text({
      project: relative(ctx.workdir, dir) || ".", created: !exists, style: tokens.meta.style, preview: `serve ${relative(ctx.workdir, join(dir, "dist")) || "dist"} (static) or open dist/index.html`,
      sections: spec.sections.map((s) => ({ id: s.id, type: s.type, props: Object.keys(s.props) })),
      composition_issues: issues, files: saved.files,
      next: "Run validate_design, then capture_preview/analyze_visual_quality; fix issues using sectionProps/tokens, not hand-edited CSS.",
    });
  });

  // 6b ───────────────────────────────────────────────────────────────────────
  server.registerTool("update_design_tokens", {
    title: "Update design tokens",
    description: "Change tokens by dotted path (for example color.accent, radius.lg, motion.intensity) and rebuild. Keeps DESIGN.md, tokens.css and the rendered site in sync. Contrast is re-linted and returned.",
    inputSchema: { projectDir: z.string(), set: z.record(z.union([z.string(), z.number()])) },
  }, async (a) => {
    const dir = ctx.safePath(a.projectDir); if (!isProject(dir)) return fail("Not an OpenUI project.");
    const p = loadProject(dir);
    try { for (const [k, v] of Object.entries(a.set)) setTokenPath(p.tokens, k, v); } catch (e) { return fail((e as Error).message); }
    saveProject(p);
    return text({ updated: Object.keys(a.set), lint: lintTokens(p.tokens).filter((i) => i.severity !== "info") });
  });

  server.registerTool("rebuild_project", { title: "Rebuild project", description: "Re-render dist/ from openui.page.json, tokens and overrides (use after editing those files by hand). Pass deployDir to also copy dist/ there (e.g. 'site').", inputSchema: { projectDir: z.string(), deployDir: z.string().optional().describe("also copy the rebuilt dist/ here, e.g. 'site'") } },
    async (a) => {
      const dir = ctx.safePath(a.projectDir); if (!isProject(dir)) return fail("Not an OpenUI project.");
      const out = rebuild(dir);
      if (a.deployDir) { const dd = ctx.safePath(a.deployDir); mkdirSync(dd, { recursive: true }); cpSync(join(dir, "dist"), dd, { recursive: true }); }
      return text({ ...out, images: imageStatus(dir) });
    });

  // 8 ────────────────────────────────────────────────────────────────────────
  server.registerTool("validate_design", {
    title: "Validate design",
    description: "Run the automated QA gate in a real Chromium: desktop/tablet/mobile overflow, axe accessibility, console + network errors, broken images/anchors, interaction tests (accordion, nav, toggles, keyboard focus), reduced-motion behaviour, invisible-content detection and design-token compliance. Returns pass/fail with prioritised, fix-oriented issues (with data-openui-id so you can target them).",
    inputSchema: { target: z.string().optional().describe("OpenUI project dir, a built-site dir, or http(s) URL (aliases accepted: url, path, dir)"), url: z.string().optional(), path: z.string().optional(), dir: z.string().optional(), viewports: z.array(z.enum(["desktop", "tablet", "mobile"])).default(["desktop", "mobile"]), maxIssues: z.number().int().default(15), quick: z.boolean().default(false).describe("faster iterative check while building: desktop only and skips axe-core (about a third less time in a measured run, mostly browser start-up and interaction tests remain). Run the full gate before you finish.") },
  }, async (a) => {
    const t0 = tgt(a); const target = /^https?:/.test(t0) ? t0 : ctx.safePath(t0);
    const vps = a.quick ? VIEWPORTS.filter((v) => v.name === "desktop") : VIEWPORTS.filter((v) => a.viewports.includes(v.name as "desktop"));
    const r = await auditTarget(target, { viewports: vps, rebuildFirst: true, axe: !a.quick });
    const issues = r.audit.viewports.flatMap((v) => v.issues.map((i) => ({ viewport: v.viewport.name, ...i }))).filter((i) => i.severity !== "info");
    const order = { error: 0, warning: 1, info: 2 } as const;
    issues.sort((x, y) => order[x.severity] - order[y.severity]);
    return text({
      passed: r.audit.passed, totals: r.audit.totals,
      interactions: Object.fromEntries(r.audit.viewports.map((v) => [v.viewport.name, `${v.interactions.filter((i) => i.passed).length}/${v.interactions.length}`])),
      token_compliance: r.audit.viewports[0]?.compliance ? Object.fromEntries(Object.entries(r.audit.viewports[0].compliance).map(([k, c]) => [k, `${(c.ratio * 100).toFixed(0)}%`])) : "n/a (no tokens)",
      issues: issues.slice(0, a.maxIssues).map((i) => ({ sev: i.severity, vp: i.viewport, cat: i.category, msg: i.message.slice(0, 300), selector: i.selector, text: i.snippet, id: i.openuiId, fix: i.fix })),
      ...(a.quick ? { mode: "quick (desktop only, axe-core skipped): run validate_design without quick for the full gate before finishing" } : {}),
      truncated: Math.max(0, issues.length - a.maxIssues),
    });
  });

  // 9 ────────────────────────────────────────────────────────────────────────
  server.registerTool("capture_preview", {
    title: "Capture preview",
    description: "Render the site in real Chromium (after scrolling through to trigger lazy/reveal content) and return JPEG screenshots as images so a multimodal model can LOOK at the result. Full-page images are saved to disk (paths returned); `inline` picks what to return as image content.",
    inputSchema: { target: z.string().optional(), url: z.string().optional(), path: z.string().optional(), dir: z.string().optional(), viewports: z.array(z.enum(["desktop", "tablet", "mobile"])).default(["desktop", "mobile"]), inline: z.enum(["fold", "full", "none"]).default("fold") },
  }, async (a) => {
    const t0 = tgt(a);
    const isUrl = /^https?:/.test(t0);
    let srv: Awaited<ReturnType<typeof serveDir>> | null = null; let url = t0; let outBase: string;
    if (!isUrl) {
      const dir = ctx.safePath(t0);
      if (isProject(dir)) rebuild(dir);
      srv = await serveDir(existsSync(join(dir, "dist")) ? join(dir, "dist") : dir); url = srv.url + "/"; outBase = join(dir, ".openui", "shots");
    } else outBase = join(ctx.workdir, ".openui", "shots");
    try {
      const shots = await capture(url, outBase, a.viewports);
      const content: any[] = [{ type: "text", text: JSON.stringify(shots.map((s) => ({ viewport: `${s.viewport} ${s.width}px`, pageHeight: s.pageHeight, fold: relative(ctx.workdir, s.fold), full: relative(ctx.workdir, s.full) })), null, 1) }];
      if (a.inline !== "none") for (const s of shots) content.push({ type: "image", data: readFileSync(a.inline === "fold" ? s.fold : s.full).toString("base64"), mimeType: "image/jpeg" });
      return { content };
    } finally { await srv?.close(); }
  });

  // review_sections ───────────────────────────────────────────────────────────
  server.registerTool("review_sections", {
    title: "Review the page section by section",
    description: "THE SECTION-BY-SECTION REVIEW LOOP: renders your site in Chromium and returns ONE IMAGE PER SECTION (header, each section, footer) plus measured facts and the design-director questions to answer for each one. Full-page screenshots hide weak sections; looking at each section at reading size does not. Call it after your first build, LOOK at every image, answer the questions in your head (is this section deliberately designed or a default card grid? does it show something specific to THIS business? is the type and colour distinctive?), fix the weakest three sections, and call it again. Repeat at least twice, once for viewport=mobile. Use `from`/`limit` to page through long pages.",
    inputSchema: { target: z.string().optional().describe("site dir or http(s) URL (default 'site')"), url: z.string().optional(), path: z.string().optional(), dir: z.string().optional(), viewport: z.enum(["desktop", "mobile"]).default("desktop"), from: z.number().int().min(0).default(0).describe("index of the first section to return as an image"), limit: z.number().int().min(1).max(6).default(4) },
  }, async (a) => {
    const t0 = tgt(a); const isUrl = /^https?:/.test(t0);
    let srv: Awaited<ReturnType<typeof serveDir>> | null = null; let url = t0;
    if (!isUrl) { const dir = ctx.safePath(t0); if (isProject(dir)) rebuild(dir); srv = await serveDir(existsSync(join(dir, "dist")) ? join(dir, "dist") : dir); url = srv.url + "/"; }
    const vp = VIEWPORTS.find((v) => v.name === a.viewport)!;
    try {
      const browser = await getBrowser();
      const bctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      const page = await bctx.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      const handles = await page.evaluateHandle(() => {
        const seen = new Set<Element>(); const out: Element[] = [];
        const push = (e: Element) => { const r = e.getBoundingClientRect(); if (!seen.has(e) && r.height > 40 && getComputedStyle(e).display !== "none") { seen.add(e); out.push(e); } };
        document.querySelectorAll("body > header, body > nav, main > *, body > section, body > footer, body > main > footer").forEach(push);
        return out;
      });
      const props = await handles.getProperties(); const els = [...props.values()].map((h) => h.asElement()!).filter(Boolean);
      const facts: any[] = []; let prevSig = "";
      for (let i = 0; i < els.length; i++) {
        const f = await els[i]!.evaluate((el) => {
          const cs = getComputedStyle(el); const txt = (el as HTMLElement).innerText || "";
          const words = txt.trim().split(/\s+/).filter(Boolean).length;
          let best = 0; el.querySelectorAll("*").forEach((c: Element) => { const d = getComputedStyle(c).display; if ((d === "grid" || d === "flex") && c.children.length > best) best = c.children.length; });
          const h = el.querySelector("h1,h2,h3"); const rect = el.getBoundingClientRect();
          return { id: (el as HTMLElement).id || null, tag: el.tagName.toLowerCase(), heading: h?.textContent?.trim().slice(0, 70) ?? null, heightPx: Math.round(rect.height), words, svgs: el.querySelectorAll("svg").length, imgs: el.querySelectorAll("img").length, buttons: el.querySelectorAll("a.btn,button,.btn").length, repeatedChildren: best, background: cs.backgroundColor };
        });
        const sig = `${f.repeatedChildren}x${f.svgs > 0}`; const flags: string[] = [];
        if (f.svgs === 0 && f.imgs === 0 && f.tag === "section") flags.push("no visual element: text only");
        if (f.repeatedChildren >= 3 && sig === prevSig) flags.push("same repeated-card layout as the previous section: vary it");
        if (f.heightPx > vp.height * 1.8) flags.push(`taller than 1.8 screens (${f.heightPx}px): trim or split`);
        if (f.heightPx < 160 && f.tag === "section") flags.push("very short: does it earn its place?");
        prevSig = sig; facts.push({ index: i, ...f, flags });
      }
      const dir = join(ctx.workdir, ".openui", "sections"); mkdirSync(dir, { recursive: true });
      const content: any[] = [{ type: "text", text: JSON.stringify({ viewport: `${a.viewport} ${vp.width}px`, sections: facts.length, images: `${a.from}..${Math.min(a.from + a.limit, facts.length) - 1}`, next: a.from + a.limit < facts.length ? `call again with from=${a.from + a.limit}` : "all sections returned", facts, ask_for_each_image: ["Is this deliberately designed for THIS business, or a default card grid/band?", "Does it show something specific (real data, an object, a diagram) rather than generic icons and filler?", "Is the type scale, colour and spacing consistent with the rest of the page and distinctive?", "Name the single change that would most improve it, then make it."], rule: "Fix the weakest three sections, rebuild, and call this tool again. At least two passes, one on viewport=mobile." }, null, 1) }];
      for (let i = a.from; i < Math.min(a.from + a.limit, els.length); i++) {
        const file = join(dir, `section-${a.viewport}-${i}.jpg`);
        await els[i]!.scrollIntoViewIfNeeded().catch(() => {});
        const isChrome = ["header", "nav"].includes(facts[i].tag);
        // sticky/fixed bars would be drawn over every section capture; hide them unless this IS the bar
        const hidden = isChrome ? 0 : await page.evaluate(() => { let n = 0; document.querySelectorAll("*").forEach((e) => { const p = getComputedStyle(e).position; if ((p === "fixed" || p === "sticky") && (e as HTMLElement).style.visibility !== "hidden") { (e as HTMLElement).dataset.ouiHid = "1"; (e as HTMLElement).style.visibility = "hidden"; n++; } }); return n; });
        await els[i]!.screenshot({ path: file, type: "jpeg", quality: 70 }).catch(() => {});
        if (hidden) await page.evaluate(() => document.querySelectorAll("[data-oui-hid]").forEach((e) => { (e as HTMLElement).style.visibility = ""; delete (e as HTMLElement).dataset.ouiHid; }));
        if (existsSync(file)) content.push({ type: "image", data: readFileSync(file).toString("base64"), mimeType: "image/jpeg" });
      }
      await bctx.close();
      return { content };
    } finally { await srv?.close(); }
  });

  // 10 ───────────────────────────────────────────────────────────────────────
  server.registerTool("analyze_visual_quality", {
    title: "Analyze visual quality",
    description: "Heuristic design-quality scoring from real measurements: typography hierarchy, 4px spacing rhythm, palette discipline, alignment/CTA hierarchy, whitespace balance (pixel scan for empty zones), responsiveness, accessibility and robustness. Returns per-dimension scores with evidence and concrete suggestions. IMPORTANT: this measures engineering quality, not taste — also LOOK at capture_preview images.",
    inputSchema: { target: z.string().optional(), url: z.string().optional(), path: z.string().optional(), dir: z.string().optional() },
  }, async (a) => {
    const t0 = tgt(a); const target = /^https?:/.test(t0) ? t0 : ctx.safePath(t0);
    const r = await auditTarget(target, { rebuildFirst: true });
    const q = r.quality;
    return text({ overall: q.overall, note: q.note, dimensions: q.dimensions.map((d) => ({ id: d.id, score: d.score, basis: d.basis, evidence: d.evidence, suggestions: d.suggestions })), deadZones: q.deadZones, review_screenshots: q.needsVisualReview.map((p) => relative(ctx.workdir, p)), summary: formatReport(r.audit).split("\n")[0] });
  });

  // 11 ───────────────────────────────────────────────────────────────────────
  server.registerTool("create_review_session", {
    title: "Create review session",
    description: "Start the browser visual editor for a project (or a localhost dev-server URL) and return a private, tokenised session URL. The human can select elements, comment, tweak typography/spacing/colour/radius/shadow/layout live, switch hero variants, and send natural-language requests; all of it queues here for get_visual_feedback. Security: loopback-only by default, per-session secret (HttpOnly cookie), Host/Origin checks, CSP, 8h expiry.",
    inputSchema: { target: z.string().describe("OpenUI project dir, or http://localhost:PORT URL of a running dev server") },
  }, async (a) => {
    const editor = await ctx.editor();
    let t;
    if (/^https?:/.test(a.target)) t = { kind: "url" as const, url: a.target };
    else { const dir = ctx.safePath(a.target); if (!isProject(dir)) return fail("Not an OpenUI project (no openui.page.json). Pass a localhost URL to review any dev server."); rebuild(dir); t = { kind: "project" as const, dir }; }
    const s = editor.store.create(t);
    return text({ sessionId: s.id, editorUrl: editor.sessionUrl(s), expiresInHours: 8, persistence: t.kind === "project" ? "Approved tweaks are written to openui.overrides.json (id-keyed CSS) and the site is rebuilt." : "URL targets are review-only: tweaks are returned as CSS patches for you to apply.", next: "Give the URL to the reviewer, then call get_visual_feedback with waitSeconds to receive their input." });
  });

  // 12 ───────────────────────────────────────────────────────────────────────
  server.registerTool("get_visual_feedback", {
    title: "Get visual feedback",
    description: "Fetch what the reviewer did in the editor: open comments, natural-language requests and pending style tweaks (as CSS patches keyed by data-openui-id). With waitSeconds>0 it long-polls until new feedback arrives. Marks items as read unless markRead=false.",
    inputSchema: { sessionId: z.string(), waitSeconds: z.number().min(0).max(120).default(0), markRead: z.boolean().default(true) },
  }, async (a) => {
    const s = ctx.store.get(a.sessionId); if (!s) return fail("Unknown or expired session.");
    if (a.waitSeconds > 0) await ctx.store.waitForFeedback(s, a.waitSeconds * 1000);
    const fb = {
      unread: s.unread.length,
      comments: s.comments.filter((c) => !c.resolved).map((c) => ({ id: c.id, on: c.openuiId ?? c.selector ?? "page", text: c.text })),
      requests: s.requests.filter((r) => r.status === "open").map((r) => ({ id: r.id, on: r.openuiId ?? r.selector ?? "page", text: r.text })),
      pending_tweaks: s.tweaks.map((t) => ({ id: t.id, target: t.openuiId ?? t.selector, mapped: !!t.openuiId, css: t.props })),
      next: "Fix comments/requests via compose_page(sectionProps)/update_design_tokens, then call apply_visual_tweaks to persist the reviewer's pending tweaks.",
    };
    if (a.markRead) s.unread = [];
    return text(fb);
  });

  // 13 ───────────────────────────────────────────────────────────────────────
  server.registerTool("apply_visual_tweaks", {
    title: "Apply visual tweaks",
    description: "Persist style tweaks into the real project: reviewer's pending tweaks (all, or by id) and/or an explicit list. Tweaks are validated against an allow-list, written as stable id-keyed rules in openui.overrides.json and the site is rebuilt. Optionally resolve comments / mark requests handled. Elements without data-openui-id are reported as manual CSS patches.",
    inputSchema: {
      sessionId: z.string().optional(), tweakIds: z.array(z.string()).optional(), acceptAllPending: z.boolean().default(false),
      projectDir: z.string().optional().describe("required if no sessionId"),
      tweaks: z.array(z.object({ openuiId: z.string(), props: z.record(z.string()) })).optional(),
      resolveCommentIds: z.array(z.string()).optional(), handledRequestIds: z.array(z.string()).optional(),
    },
  }, async (a) => {
    const s = a.sessionId ? ctx.store.get(a.sessionId) : undefined;
    if (a.sessionId && !s) return fail("Unknown or expired session.");
    const out: Record<string, unknown> = {};
    const dir = a.projectDir ? ctx.safePath(a.projectDir) : s?.target.kind === "project" ? s.target.dir : undefined;
    if (s && (a.acceptAllPending || a.tweakIds)) Object.assign(out, applyPending(s, ctx.store, a.acceptAllPending ? undefined : a.tweakIds));
    if (a.tweaks?.length) { if (!dir) return fail("projectDir or a project session is required for explicit tweaks."); out.explicit = applyTweaks(dir, a.tweaks.map((t) => ({ id: t.openuiId, props: t.props }))); }
    if (s) {
      for (const id of a.resolveCommentIds ?? []) { const c = s.comments.find((x) => x.id === id); if (c) c.resolved = true; }
      for (const id of a.handledRequestIds ?? []) { const r = s.requests.find((x) => x.id === id); if (r) r.status = "handled"; }
      ctx.store.persist(s);
    }
    if (dir && existsSync(join(dir, "openui.overrides.json"))) out.overrides = JSON.parse(readFileSync(join(dir, "openui.overrides.json"), "utf8"));
    return text(out);
  });

  // ── libraries ──────────────────────────────────────────────────────────────
  server.registerTool("list_libraries", {
    title: "List libraries",
    description: "Every component and icon library the engine can search or fetch live: item counts, how many entries are hand-reviewed vs inferred, and licence status. Registries are indexed as metadata only; source is fetched on demand and never vendored.",
    inputSchema: {},
  }, async () => text({
    indexedOn: INDEX_GENERATED_AT, searchableComponents: searchableComponents().length, curated: ALL_COMPONENTS.length,
    componentLibraries: [{ id: "openui", name: "OpenUI original sections + domain visuals", items: ALL_COMPONENTS.filter((c) => c.source === "openui").length, license: "Apache-2.0" }, ...LIBRARIES.map((l) => ({ id: l.id, name: l.name, items: l.items, live: l.live, license: "see get_component per item (mostly unverified)" }))],
    iconLibraries: ICON_SETS, visualKinds: VISUAL_KINDS,
  }));

  server.registerTool("search_icons", {
    title: "Search icons",
    description: "Find icon names across Lucide (ISC), Phosphor, Heroicons and Tabler (MIT) — 9,000+ icons. Returns refs like `lucide:siren` to use as the `icon` field of features, callouts, integrations and steps; the engine fetches and inlines the SVG at build time (offline fallback included). Understands concepts: incident, payment, analytics, security…",
    inputSchema: { query: z.string(), set: z.enum(["lucide", "tabler", "heroicons", "phosphor"]).optional(), limit: z.number().int().min(1).max(30).default(10) },
  }, async (a) => text({ query: a.query, results: searchIcons({ query: a.query, set: a.set, limit: a.limit }).map((h) => h.ref) }));



  server.registerTool("image_requests", {
    title: "Image slots and prompts",
    description: "List every image slot of a project (hero, feature photos, logo) with its status (missing/provided), the file name to save it as, and a ready-to-paste image-generation prompt. FIRST decide whether you can generate images yourself: if yes, generate each missing one and save it with add_image. If you cannot, show the user the prompts and tell them plainly to copy-paste each into ChatGPT (or another image generator), save the result as images/<slot>.png in the project, then run rebuild_project.",
    inputSchema: { projectDir: z.string() },
  }, async (a) => { const dir = ctx.safePath(a.projectDir); if (!isProject(dir)) return fail("Not an OpenUI project."); return text(imageStatus(dir)); });

  server.registerTool("add_image", {
    title: "Add an image to a slot",
    description: "Put a finished image into a slot (hero, feature-1, feature-2, logo...) and rebuild. Give `path` (a file inside the workdir) or `base64` + `ext`. png, jpg, webp, avif, and svg for the logo; max 8MB. The placeholder for that slot becomes the real <img> (with width/height and alt) and the file is copied to dist/images/.",
    inputSchema: { projectDir: z.string(), slot: z.string().regex(/^[a-z0-9][a-z0-9-]{0,30}$/), path: z.string().optional(), base64: z.string().optional(), ext: z.enum(["png", "jpg", "jpeg", "webp", "avif", "svg"]).optional(), deployDir: z.string().optional() },
  }, async (a) => {
    const dir = ctx.safePath(a.projectDir); if (!isProject(dir)) return fail("Not an OpenUI project.");
    let bytes: Buffer, ext = a.ext as string | undefined;
    if (a.path) { const src = ctx.safePath(a.path); if (!existsSync(src)) return fail(`No file at ${a.path}`); bytes = readFileSync(src); ext = ext ?? (/\.([a-z0-9]+)$/i.exec(src)?.[1] ?? "").toLowerCase(); }
    else if (a.base64) { bytes = Buffer.from(a.base64.replace(/^data:[^,]*,/, ""), "base64"); }
    else return fail("Give `path` or `base64` + `ext`.");
    if (!ext || !IMAGE_EXTS.includes(ext)) return fail(`Unsupported type "${ext ?? ""}". Use ${IMAGE_EXTS.join(", ")}.`);
    if (bytes.length < 64 || bytes.length > 8 * 1024 * 1024) return fail("Image must be between 64 bytes and 8MB.");
    const head = bytes.subarray(0, 12), isPng = head[0] === 0x89 && head[1] === 0x50, isJpg = head[0] === 0xff && head[1] === 0xd8, isWebp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP", isAvif = head.subarray(4, 8).toString() === "ftyp";
    if (ext === "svg") { const t = bytes.toString("utf8"); if (!/<svg[\s>]/i.test(t) || /<script|on[a-z]+\s*=|<foreignObject|javascript:/i.test(t)) return fail("SVG must be a plain <svg> with no scripts, event handlers or foreignObject."); }
    else if (!(isPng || isJpg || isWebp || isAvif)) return fail("That does not look like a real png/jpg/webp/avif image (bad file signature).");
    if (a.slot !== "logo" && ext === "svg") return fail("SVG is only accepted for the logo slot.");
    const imgDir = join(dir, "images"); mkdirSync(imgDir, { recursive: true });
    for (const e of IMAGE_EXTS) { const old = join(imgDir, `${a.slot}.${e}`); if (existsSync(old)) unlinkSync(old); }
    writeFileSync(join(imgDir, `${a.slot}.${ext}`), bytes);
    const out = rebuild(dir);
    if (a.deployDir) { const dd = ctx.safePath(a.deployDir); mkdirSync(dd, { recursive: true }); cpSync(join(dir, "dist"), dd, { recursive: true }); }
    return text({ saved: `images/${a.slot}.${ext}`, bytes: bytes.length, rebuilt: out.files.length, images: imageStatus(dir) });
  });


  // ── toolkit mode: the model writes the page, the engine supplies the pieces ──
  server.registerTool("style_pack", {
    title: "Style pack for a hand-written page",
    description: "TOOLKIT MODE: write the page YOURSELF and let the engine supply the pieces. Pick a style (or let the brief choose) and get a folder with: tokens.css (colours, type, spacing, radii), styles.css (the component classes), app.js (accessible mobile menu, pricing toggle, accordion, tabs and reveals, driven by data attributes), DESIGN.md (the art direction and its don'ts), snippets/ (ready-made, tested HTML for every section type with the right classes and data attributes) and reference.html (a complete sample page). Copy a snippet, rewrite its copy, restructure it, and draw your own hero object, then run validate_design. The more specific and unusual your hero object and layout, the better: the snippets are a starting point, not a template to leave untouched.",
    inputSchema: { outDir: z.string().default("pack").describe("folder to write into (default 'pack')"), name: z.string().default("Brand"), description: z.string().default("").describe("what the business does and its tone: used to choose the style and accent"), category: z.string().optional().describe("any words (conference, charity, restaurant, studio…); mapped to the nearest engine category, inferred from name+description when omitted"), style: z.string().optional().describe("an id (" + STYLE_IDS.join(", ") + ") or loose words like 'warm editorial' or 'dark techy'; unknown words fall back to the closest match, never an error"), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), lang: z.string().optional() },
  }, async (a0) => {
    const inferred = inferCategory(`${a0.category ?? ""} ${a0.name} ${a0.description}`);
    const cat = inferred.category;
    const res = resolveStyle(a0.style, { name: a0.name, description: a0.description, category: inferred.confident ? cat : undefined });
    // category is only a weak prior: when it was a guess, choose the style from the tone words alone
    const style = res.style ?? (inferred.confident ? undefined : matchStyles({ name: a0.name, description: a0.description })[0]?.style);
    const a = { ...a0, category: cat, style };
    const dir = ctx.safePath(a.outDir); mkdirSync(join(dir, "snippets"), { recursive: true });
    const brief: any = { ...briefTemplate(a.category as SiteCategory), name: a.name, subheadline: a.description || a.name, category: a.category, style: a.style, accent: a.accent, lang: a.lang };
    const planned = planSite(brief);
    const icons = await fetchIcons([...collectIconRefs(planned.spec)]).catch(() => ({}));
    const site = buildSite(planned.spec, planned.tokens, {}, icons);
    const written: string[] = [];
    const w = (rel: string, content: string) => { writeFileSync(join(dir, rel), content); written.push(rel); };
    for (const f of ["tokens.css", "styles.css", "app.js"]) w(f, site.files[f]!);
    w("reference.html", site.files["index.html"]!.replace(/<link rel="stylesheet" href="overrides\.css">\s*/, ""));
    w("DESIGN.md", renderDesignMd(planned.tokens));
    const bodyTag = /<body[^>]*>/.exec(site.files["index.html"]!)?.[0] ?? "<body>";
    const htmlTag = /<html[^>]*>/.exec(site.files["index.html"]!)?.[0] ?? "<html>";
    const rctx = { tokens: planned.tokens, spec: planned.spec, icons };
    for (const s of planned.spec.sections) { const r = (RENDERERS as any)[s.type]; if (r) w(`snippets/${s.id}.${s.type}.html`, `<!-- ${s.type}: copy this block, rewrite the copy, restructure freely. Classes come from styles.css; data-* attributes are used by app.js. -->\n${r(s, rctx)}\n`); }
    const fonts = /<link rel="preconnect"[\s\S]*?(?=<link rel="stylesheet" href="tokens.css">)/.exec(site.files["index.html"]!)?.[0]?.trim() ?? "";
    const st = getStyle(planned.tokens.meta.style as StyleId);
    w("README.md", `# Style pack: ${st.name}\n\n${st.summary}\n\n## Use it\n1. Put these files next to your index.html: tokens.css, styles.css, app.js.\n2. USE THESE EXACT TAGS (the CSS keys off data-style / data-mode-ui; without them the glow, surfaces and pricing rules of the style do not apply):\n   ${htmlTag}\n   ${bodyTag}\n3. In <head>, add the font links below, then <link rel="stylesheet" href="tokens.css"> and <link rel="stylesheet" href="styles.css">; before </body> add <script src="app.js" defer></script>.\n4. Build your sections from snippets/*.html (copy, rewrite, restructure). Keep the data-* attributes the snippet uses; app.js wires them (menu, billing toggle, accordion, tabs, reveal, form). Steps: .step gets an automatic 01/02/03 number unless it contains your own .step__n or .num element. Never put more than one auto-number on a step. The featured pricing tier (.tier--featured) is an inverted dark card: put any markup in it, text colours follow automatically.\n5. Draw something specific for the hero (your own inline SVG or an HTML product card with real data) rather than leaving a generic visual.\n6. Run validate_design on your site folder and fix what it reports.\n\n## Fonts\n\`\`\`html\n${fonts}\n\`\`\`\n\n## Signatures of this style\n${st.signatures.map((x) => "- " + x).join("\n")}\n\n## Do not\n${st.doNot.map((x) => "- " + x).join("\n")}\n\n## Palette\naccent ${planned.tokens.color.accent}, secondary ${planned.tokens.color.accent2}, bg ${planned.tokens.color.bg}, text ${planned.tokens.color.text}\n`);
    return text({ style: planned.tokens.meta.style, styleNote: res.note, why: st.summary, accent: planned.tokens.color.accent, outDir: a.outDir, files: written, next: "Read README.md and DESIGN.md, copy the snippets you need into your own index.html, make the hero specific, then validate_design." });
  });

  // ── assets: photos, logo, colour, legal ────────────────────────────────────
  server.registerTool("search_photos", {
    title: "Search photos",
    description: "Stock fallback: find real photographs (120 hand-tagged Unsplash-licensed photos, offline search) for heroPhoto or features[].photo. Returns ids, alt text and ready URLs. Pass the id as `heroPhoto` or `features[].photo`; the engine writes responsive <img> tags with width/height and alt and credits the photographer in the footer. The library is heavy on workspaces, landscapes, coasts, cities, cafes, craft and vintage objects; for anything it lacks (dental chairs, a specific product), draw an SVG or supply your own https image URL with alt text.",
    inputSchema: { query: z.string().describe("keywords, e.g. 'coffee cafe interior', 'workspace laptop', 'mountain hiking'"), limit: z.number().int().min(1).max(20).default(8) },
  }, async (a) => { const r = searchPhotos(a.query, a.limit); return text({ query: a.query, count: PHOTOS.length, results: r.map((p) => ({ id: p.id, alt: p.alt, tags: p.tags, photographer: p.author, preview: photoUrl(p.id, 480, 320) })), use: "heroPhoto: <id> (add heroPhotoAlt to override alt), features[].photo: <id>", note: r.length ? undefined : "no match: try broader words (workspace, coast, city, food, people, craft, vintage, nature) or supply your own https image URL" }); });

  server.registerTool("generate_logo", {
    title: "Generate logo",
    description: "Preview generated geometric logo marks (these are simple placeholders, not a designed brand logo: prefer the image-prompt flow for a real logo) (monogram, arch, leaf, petal, stack, diamond, orbit, hex, wave, spark) for a brand, in the chosen colours, with favicon.svg and logo.svg ready to write. build_site already generates one automatically from the name and art direction; call this to preview options, pick a mark (brief.logo.mark) or get standalone files.",
    inputSchema: { name: z.string(), style: z.string().optional(), accent: z.string().optional().describe("hex, default #2563eb"), mark: z.enum(LOGO_MARKS as unknown as [string, ...string[]]).optional() },
  }, async (a) => { const accent = /^#[0-9a-f]{6}$/i.test(a.accent ?? "") ? a.accent! : "#2563eb"; const fg = contrast(accent, "#ffffff") >= contrast(accent, "#0b0b10") ? "#ffffff" : "#0b0b10"; const kind = (a.mark ?? pickMark(a.name, a.style)) as any; return text({ mark: kind, options: LOGO_MARKS, files: logoFiles(a.name, kind, accent, fg, "#111111"), use: `brief.logo = { mark: "${kind}" }, or { svg: "<svg viewBox='0 0 32 32'>…</svg>" } for your own` }); });

  server.registerTool("generate_palette", {
    title: "Generate colour palette",
    description: "Colour for a brand: give a brand hex (the engine guarantees AA contrast around it) or a mood/product description and get an accent with harmonies, the full light/dark token set of the best-matching art directions, and WCAG contrast checks. Set the result as brief.accent (and optionally brief.style).",
    inputSchema: { name: z.string().default("Brand"), description: z.string().default(""), category: CATEGORY.default("saas"), brand: z.string().optional().describe("brand hex like #c2410c"), style: STYLE.optional() },
  }, async (a) => {
    const accent = /^#[0-9a-f]{6}$/i.test(a.brand ?? "") ? a.brand! : pickAccent({ name: a.name, description: a.description, category: a.category as SiteCategory });
    const h = hexToHsl(accent), rot = (d: number) => hslToHex({ ...h, h: (h.h + d + 360) % 360 });
    const styles = a.style ? [a.style] : matchStyles({ name: a.name, description: a.description, category: a.category as SiteCategory }).slice(0, 3).map((m) => m.style);
    return text({ accent, harmonies: { complementary: rot(180), analogous: [rot(-30), rot(30)], triadic: [rot(120), rot(240)] },
      candidates: styles.map((st) => { const t = generateTokens({ name: a.name, description: a.description, category: a.category as SiteCategory, style: st, accent }); const c = t.color; return { style: st, mode: t.meta.mode, bg: c.bg, surface: c.surface, text: c.text, muted: c.muted, accent: c.accent, accentFg: c.accentFg, accent2: c.accent2, contrast: { text_on_bg: +contrast(c.text, c.bg).toFixed(2), accentFg_on_accent: +contrast(c.accentFg, c.accent).toFixed(2), muted_on_bg: +contrast(c.muted, c.bg).toFixed(2) } }; }),
      use: `brief.accent = "${accent}"; brief.style = one of the candidate styles` });
  });

  server.registerTool("legal_kit", {
    title: "Legal pages and copyright",
    description: "Template privacy policy and terms text plus the copyright line. In build_site set brief.legal = { holder, year, email, address, jurisdiction, pages: true } to get privacy.html and terms.html linked from the footer with '© year holder. All rights reserved.' Template text for small business sites, not legal advice.",
    inputSchema: { name: z.string(), holder: z.string().optional(), email: z.string().optional(), address: z.string().optional(), jurisdiction: z.string().optional() },
  }, async (a) => text({ copyright: `© ${new Date().getFullYear()} ${a.holder ?? a.name}. All rights reserved.`, privacy: legalDoc("privacy", a), terms: legalDoc("terms", a), use: "brief.legal = { holder, year, email, address, jurisdiction, pages: true }", disclaimer: "Template text; have a qualified adviser review it before relying on it." }));

  // ── one-call build ─────────────────────────────────────────────────────────
  server.registerTool("brief_template", {
    title: "Site brief template",
    description: "Returns a complete example SiteBrief for a category with visual-kind suggestions. Copy it, REWRITE EVERY FIELD with specific copy for the real product, then pass it to build_site. Visual kinds: " + VISUAL_KINDS.join(", ") + ".",
    inputSchema: { category: z.string().default("saas").describe("any text; mapped to the nearest of: saas, ai-product, devtool, fintech, agency, portfolio, ecommerce, consumer-app") },
  }, async (a0) => { const a = { category: normalizeCategory(a0.category) }; return text({ visualSuggestions: VISUAL_SUGGESTIONS[a.category as SiteCategory], styleGuide: styleGuide(), rules: ["ASSETS (one-shot a complete site): FIRST check whether you can generate images yourself. Give photographs as prompts (heroPhoto {prompt, alt, aspect}, features[].photo {prompt, alt}); the build shows labelled placeholders and returns images.requests with a prompt per slot. If you can generate images, do it and call add_image; if you cannot, tell the user to copy-paste each prompt into ChatGPT, save as images/<slot>.png, and run rebuild_project. Never invent image URLs. The logo works the same way (images/logo.svg|png) unless you can write a genuinely professional SVG (brief.logo.svg); the default is a clean text wordmark. search_photos offers 120 generic stock photographs as a fallback (heroPhoto: <id>); generate_palette gives a brand accent with harmonies and contrast checks (brief.accent); brief.legal {holder, email, address, jurisdiction, pages:true} writes the copyright line plus privacy.html and terms.html (template text, not legal advice).", "ART (biggest quality lever): a SPECIFIC drawing beats generic art. Call illustration_kit, then draw your own flat SVG for the hero (heroVisual {kind:\"svg\",svg}) or give each feature an art SVG (features[].art), adapting the example scenes/objects to YOUR product (a labelled coffee bag, a kiln, a client portal timeline) using palette variables only. If the product is an app, a UI mockup (heroVisual kind \"ui\") is the better hero.", "HERO: for software, data and API products show the product (heroVisual kind:\"ui\" with 5-8 specific blocks). For services, retail, care, food, craft, clinics, law and other non-software businesses, benchmark judges preferred a SPECIFIC artefact of the customer experience over any scene: show the thing the customer gets, as heroVisual, using a real-data kind: a booking/appointment card (kind \"schedule\"), a receipt or quote (kind \"invoice\"), a route or order timeline (kind \"timeline\"), a labelled product (kind \"product-cards\"), or your own drawn svg of that exact object with labels. Fill it with real names, times and amounts, and layer 2 specific heroFloats. Only OMIT heroVisual (engine draws a library scene; heroScene forces one) when you cannot think of a concrete artefact.", "Choose or omit `style`: the engine picks from your tone words (warm/human/calm → field-notes; technical → terminal-dev; refined/crafted → editorial-paper). Dark only if asked for.", "Hero visual: use kind:\"ui\" with 5–8 blocks that show YOUR product doing its job (not a 3-row list)", "Headline 5–12 words with ONE *emphasised* phrase", "No buzzwords (seamless, unlock, supercharge, all-in-one…)", "Every feature gets a visual that shows THIS product's data", "Testimonials need a number; use distinctive fictional names", "Use real domain data inside visuals (times, names, amounts), never generic placeholders"], brief: briefTemplate(a.category as SiteCategory) }); });

  const deepMerge = (a: any, b: any): any => { if (Array.isArray(b) || b === null || typeof b !== "object") return b; const o = { ...(a && typeof a === "object" && !Array.isArray(a) ? a : {}) }; for (const [k, v] of Object.entries(b)) { if (v === null) delete o[k]; else o[k] = deepMerge(o[k], v); } return o; };

  // illustration_kit ────────────────────────────────────────────────────────
  server.registerTool("illustration_kit", {
    title: "Illustration kit",
    description: "Everything you need to DRAW a specific flat SVG illustration for the hero or a feature (a coffee bag, a kiln, a client portal, a boat): palette variables, ~30 ready object shapes (each in a 100x100 box) and 11 finished example scenes (400x320). Copy an example scene or compose objects with <g transform=\"translate(x y) scale(s)\">, then change shapes to fit YOUR product (swap objects, recolour, add details). Pass the result as heroVisual {kind:\"svg\",svg:\"<svg viewBox=...>\"} or as features[].art. Drawings must be specific to the business; generic art loses to a specific product mockup.",
    inputSchema: { scene: z.string().optional().describe("return only this example scene (interior, care, clinic, food, marine, books, craft, solar, law, climb, field)"), objects: z.boolean().default(true) },
  }, async (a) => text({
    palette: PALETTE_VARS, canvas: "viewBox 0 0 400 320 for scenes (heroVisual/hero art) or 0 0 400 300 for feature art; flat shapes only (path, circle, ellipse, rect, line, polygon, g); NO text, NO images, NO scripts, NO <style>; colour only with the palette variables so it matches the page",
    scenes: Object.fromEntries(SCENE_IDS.filter((id) => !a.scene || id === a.scene).map((id) => [id, sceneSvg(id)])),
    ...(a.objects ? { objects: OBJECTS } : {}),
    example: '<svg viewBox="0 0 400 320"><rect width="400" height="320" fill="var(--c-accent-soft)"/><rect y="236" width="400" height="84" fill="var(--c-surface)"/><g transform="translate(120 150) scale(1.6)"><rect x="6" y="12" width="88" height="44" rx="14" fill="var(--c-accent)"/></g></svg>',
  }));

  server.registerTool("build_site", {
    title: "Build site (one call)",
    description: "THE FASTEST PATH. Give a structured SiteBrief (call brief_template first) and the engine does art direction (style + non-violet accent from the brief), picks a varied layout (interactive tabs, showcase, steps-timeline, quote feature, split FAQ… not the same icon-card grid), renders domain-specific product visuals from YOUR data, inlines icons, lints the copy for buzzwords/placeholders, runs the real-browser QA gate with the anti-slop detector, and returns desktop+mobile screenshots. Re-call with `patch` (JSON merge onto the saved brief) to fix issues. Output is a static site in <projectDir>/dist (and copied to deployDir if given).",
    inputSchema: {
      projectDir: z.string(),
      brief: z.any().optional().describe("full SiteBrief; required the first time"),
      patch: z.any().optional().describe("partial SiteBrief merged onto the saved brief (arrays are replaced, null deletes a key)"),
      deployDir: z.string().optional().describe("also copy the built site here, e.g. 'site' so site/index.html exists"),
      verify: z.boolean().default(true), images: z.boolean().default(true),
    },
  }, async (a) => {
    const dir = ctx.safePath(a.projectDir); const briefFile = join(dir, "openui.brief.json");
    let brief: any = a.brief;
    if (!brief && existsSync(briefFile)) brief = JSON.parse(readFileSync(briefFile, "utf8"));
    if (!brief) return fail("brief is required the first time. Call brief_template, rewrite it for the real product, and pass it as `brief`.");
    if (a.patch) brief = deepMerge(brief, a.patch);
    const need = ["name", "headline", "subheadline", "category", "primaryCta", "features"].filter((k) => brief[k] === undefined || (Array.isArray(brief[k]) && !brief[k].length));
    if (need.length) return fail(`brief is missing: ${need.join(", ")}. See brief_template.`);
    if (!Array.isArray(brief.features)) return fail("brief.features must be an array of {title, body, icon?, visual?}.");
    let planned;
    try { planned = planSite(brief); } catch (e) { return fail(`Could not plan the site: ${(e as Error).message}. Check brief against brief_template.`); }
    const copy = [...lintVisuals(planned.spec), ...lintCopy(planned.spec)];
    const icons = await fetchIcons([...collectIconRefs(planned.spec)]);
    mkdirSync(dir, { recursive: true }); writeFileSync(briefFile, JSON.stringify(brief, null, 2) + "\n");
    saveProject({ dir, tokens: planned.tokens, spec: planned.spec, overrides: isProject(dir) ? loadProject(dir).overrides : {}, icons });
    let deployed: string | undefined;
    if (a.deployDir) { const dd = ctx.safePath(a.deployDir); mkdirSync(dd, { recursive: true }); cpSync(join(dir, "dist"), dd, { recursive: true }); deployed = relative(ctx.workdir, dd) || "."; }
    const out: Record<string, unknown> = {
      style_choice: { used: planned.tokens.meta.style, alternatives: matchStyles({ name: brief.name, description: `${brief.subheadline} ${(brief.tone ?? []).join(" ")}`, category: planned.tokens.meta.category }).filter((m) => m.style !== planned.tokens.meta.style).slice(0, 2).map((m) => m.style), how_to_change: "build_site with patch {\"style\":\"<id>\"}; see brief_template.styleGuide" },
      project: relative(ctx.workdir, dir) || ".", notes: [...planned.notes, ...(a.deployDir ? [`${a.deployDir}/ is regenerated on every build_site call — hand edits there are lost; change the brief (patch) instead.`] : [])], style: planned.tokens.meta.style, accent: planned.tokens.color.accent, deployed,
      layout: planned.layout.map((l) => `${l.id}: ${l.type} — ${l.why}`),
      design_review: reviewDesign(planned.spec, brief),
      images: imageStatus(dir),
      inspiration: searchPatterns({ category: planned.tokens.meta.category as SiteCategory, style: planned.tokens.meta.style as StyleId, limit: 3 }).map((p) => ({ pattern: p.name, principles: p.principles.slice(0, 2), pitfall: p.pitfalls[0] })),
      icons: `${Object.keys(icons).length}/${collectIconRefs(planned.spec).size} fetched${Object.keys(icons).length < collectIconRefs(planned.spec).size ? " (others use built-in fallbacks)" : ""}`,
      copy_lint: { errors: copy.filter((c) => c.severity === "error").length, warnings: copy.filter((c) => c.severity === "warning").length, top: [...copy.filter((c) => c.severity === "error"), ...copy.filter((c) => c.severity === "warning")].slice(0, 12).map((c) => `[${c.rule}] ${c.where}: ${c.message} → ${c.fix}`) },
    };
    const content: any[] = [];
    if (a.verify) {
      const r = await auditTarget(dir, { viewports: VIEWPORTS.filter((v) => v.name === "desktop" || v.name === "mobile"), rebuildFirst: false, screenshots: false, starterMarkers: [] });
      const issues = r.audit.viewports.flatMap((v) => v.issues.map((i) => ({ vp: v.viewport.name, ...i }))).filter((i) => i.severity !== "info");
      const sl = r.audit.viewports.find((v) => v.slop)?.slop;
      out.gate = { passed: r.audit.passed, errors: r.audit.totals.errors, warnings: r.audit.totals.warnings, originality: r.quality.dimensions.find((d) => d.id === "originality")?.score, quality: r.quality.overall, issues: issues.filter((i) => !i.message.startsWith("[slop")).slice(0, 8).map((i) => `${i.severity} [${i.category}] ${i.message.slice(0, 200)}${i.openuiId ? ` {id:${i.openuiId}}` : ""}`), slop: sl?.findings.map((f) => `[${f.rule}] ${f.message}`) ?? [] };
    }
    out.next = "Read copy_lint and gate.slop: fix by calling build_site again with `patch` (e.g. {\"features\":[…]} or {\"headline\":\"…\"}). Finish when copy_lint.errors=0, gate.passed=true and slop is empty or justified. Look at the screenshots.";
    content.push({ type: "text", text: JSON.stringify(out, null, 1) });
    if (a.images) {
      const srv = await serveDir(join(dir, "dist"));
      try { const shots = await capture(srv.url + "/", join(dir, ".openui", "shots"), ["desktop", "mobile"], "build"); for (const s of shots) content.push({ type: "image", data: readFileSync(s.fold).toString("base64"), mimeType: "image/jpeg" }); } finally { await srv.close(); }
    }
    return { content, ...(copy.some((c) => c.severity === "error") ? {} : {}) };
  });

  server.registerTool("detect_ai_slop", {
    title: "Detect AI slop",
    description: "Heuristic originality check of a built site (project dir, site dir or URL): default indigo/violet palette, repeated identical icon-card grids, gradient-text overuse, emoji icons, everything centered, missing product visuals, buzzwords, stock names. Returns a 0–100 score (higher = more original) and specific findings. A proxy for template-looking pages, not a judge of taste.",
    inputSchema: { target: z.string().optional(), url: z.string().optional(), path: z.string().optional(), dir: z.string().optional() },
  }, async (a) => {
    const t0 = tgt(a); const target = /^https?:/.test(t0) ? t0 : ctx.safePath(t0);
    const srv = /^https?:/.test(target) ? null : await serveDir(isProject(target) ? join(target, "dist") : target);
    try {
      const page = await (await getBrowser()).newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(srv ? srv.url + "/" : target, { waitUntil: "networkidle" });
      const r = await detectSlop(page); await page.close();
      const copy = !/^https?:/.test(target) && isProject(target) ? lintCopy(loadProject(target).spec).filter((c) => c.severity !== "info").slice(0, 12).map((c) => `[${c.rule}] ${c.where}: ${c.message}`) : undefined;
      return text({ originality: r.score, findings: r.findings, copy_lint: copy });
    } finally { await srv?.close(); }
  });
}
