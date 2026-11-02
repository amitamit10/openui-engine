import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ALL_COMPONENTS, COMPONENT_INDEX, RENDERERS, STYLES, STYLE_IDS, checkComposition, defaultPageSpec, discover, fetchLiveItem, generateTokens, isProject, lintTokens,
  loadProject, matchStyles, rebuild, renderDesignMd, renderTokensCss, renderTokensJson, saveProject, searchPatterns, getSources, setTokenPath, suggestLayout, applyTweaks,
  type DesignTokens, type PageSpec, type SectionSpec, type SectionType, type SiteCategory, type StyleId,
} from "@openui-engine/core";
import { auditTarget, capture, serveDir, VIEWPORTS, formatReport } from "@openui-engine/verify";
import { applyPending } from "@openui-engine/editor";
import type { ServerContext } from "./context.js";

const STYLE = z.enum(STYLE_IDS as [StyleId, ...StyleId[]]);
const CATEGORY = z.enum(["saas", "ai-product", "devtool", "fintech", "agency", "portfolio", "ecommerce", "consumer-app"]);
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
      source: z.enum(["openui", "fluid", "shadcn", "magicui", "aceternity", "reactbits"]).optional(),
      projectDir: z.string().optional(),
      limit: z.number().int().min(1).max(15).default(6),
    },
  }, async (a) => {
    let style = a.style as StyleId | undefined;
    if (!style && a.projectDir) { try { style = loadProject(ctx.safePath(a.projectDir)).tokens.meta.style; } catch { /* fall through */ } }
    const results = discover({ style: style ?? "aurora-dark", category: a.category as SiteCategory | undefined, slot: a.slot, framework: a.framework, query: a.query, limit: a.limit, source: a.source });
    return text({ style: style ?? "aurora-dark", total_in_registry: ALL_COMPONENTS.length, results });
  });

  // 2 ────────────────────────────────────────────────────────────────────────
  server.registerTool("get_component", {
    title: "Get component",
    description: "Full metadata for one component id. detail='meta' (default) returns capabilities, compatibility, license status and props. detail='source' additionally returns, for OpenUI sections, an example JSON spec + rendered HTML, and for third-party registry items, the live source files fetched on demand from the project's own registry (truncated).",
    inputSchema: { id: z.string().describe("e.g. openui/pricing or fluid/tabs"), detail: z.enum(["meta", "source"]).default("meta"), style: STYLE.optional() },
  }, async (a) => {
    const c = COMPONENT_INDEX.get(a.id);
    if (!c) return fail(`Unknown component "${a.id}". Use discover_components to find ids.`);
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
          out.example_html = RENDERERS[sec.type as SectionType](sec, { tokens, spec }).slice(0, 5000);
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
    inputSchema: { name: z.string(), description: z.string().optional(), category: CATEGORY.optional(), style: STYLE.optional(), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().describe("brand accent hex"), motion: z.number().int().min(0).max(3).optional(), outDir: z.string().describe("project directory (relative to the server workdir)") },
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
    inputSchema: { category: CATEGORY, style: STYLE, goal: z.string().default("convert") },
  }, async (a) => text(suggestLayout(a.category as SiteCategory, a.style as StyleId, a.goal)));

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

  server.registerTool("rebuild_project", { title: "Rebuild project", description: "Re-render dist/ from openui.page.json, tokens and overrides (use after editing those files by hand).", inputSchema: { projectDir: z.string() } },
    async (a) => { const dir = ctx.safePath(a.projectDir); if (!isProject(dir)) return fail("Not an OpenUI project."); return text(rebuild(dir)); });

  // 8 ────────────────────────────────────────────────────────────────────────
  server.registerTool("validate_design", {
    title: "Validate design",
    description: "Run the automated QA gate in a real Chromium: desktop/tablet/mobile overflow, axe accessibility, console + network errors, broken images/anchors, interaction tests (accordion, nav, toggles, keyboard focus), reduced-motion behaviour, invisible-content detection and design-token compliance. Returns pass/fail with prioritised, fix-oriented issues (with data-openui-id so you can target them).",
    inputSchema: { target: z.string().describe("OpenUI project dir, a built-site dir, or http(s) URL"), viewports: z.array(z.enum(["desktop", "tablet", "mobile"])).default(["desktop", "mobile"]), maxIssues: z.number().int().default(15) },
  }, async (a) => {
    const target = /^https?:/.test(a.target) ? a.target : ctx.safePath(a.target);
    const vps = VIEWPORTS.filter((v) => a.viewports.includes(v.name as "desktop"));
    const r = await auditTarget(target, { viewports: vps, rebuildFirst: true });
    const issues = r.audit.viewports.flatMap((v) => v.issues.map((i) => ({ viewport: v.viewport.name, ...i }))).filter((i) => i.severity !== "info");
    const order = { error: 0, warning: 1, info: 2 } as const;
    issues.sort((x, y) => order[x.severity] - order[y.severity]);
    return text({
      passed: r.audit.passed, totals: r.audit.totals,
      interactions: Object.fromEntries(r.audit.viewports.map((v) => [v.viewport.name, `${v.interactions.filter((i) => i.passed).length}/${v.interactions.length}`])),
      token_compliance: r.audit.viewports[0]?.compliance ? Object.fromEntries(Object.entries(r.audit.viewports[0].compliance).map(([k, c]) => [k, `${(c.ratio * 100).toFixed(0)}%`])) : "n/a (no tokens)",
      issues: issues.slice(0, a.maxIssues).map((i) => ({ sev: i.severity, vp: i.viewport, cat: i.category, msg: i.message.slice(0, 300), id: i.openuiId, fix: i.fix })),
      truncated: Math.max(0, issues.length - a.maxIssues),
    });
  });

  // 9 ────────────────────────────────────────────────────────────────────────
  server.registerTool("capture_preview", {
    title: "Capture preview",
    description: "Render the site in real Chromium (after scrolling through to trigger lazy/reveal content) and return JPEG screenshots as images so a multimodal model can LOOK at the result. Full-page images are saved to disk (paths returned); `inline` picks what to return as image content.",
    inputSchema: { target: z.string(), viewports: z.array(z.enum(["desktop", "tablet", "mobile"])).default(["desktop", "mobile"]), inline: z.enum(["fold", "full", "none"]).default("fold") },
  }, async (a) => {
    const isUrl = /^https?:/.test(a.target);
    let srv: Awaited<ReturnType<typeof serveDir>> | null = null; let url = a.target; let outBase: string;
    if (!isUrl) {
      const dir = ctx.safePath(a.target);
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

  // 10 ───────────────────────────────────────────────────────────────────────
  server.registerTool("analyze_visual_quality", {
    title: "Analyze visual quality",
    description: "Heuristic design-quality scoring from real measurements: typography hierarchy, 4px spacing rhythm, palette discipline, alignment/CTA hierarchy, whitespace balance (pixel scan for empty zones), responsiveness, accessibility and robustness. Returns per-dimension scores with evidence and concrete suggestions. IMPORTANT: this measures engineering quality, not taste — also LOOK at capture_preview images.",
    inputSchema: { target: z.string() },
  }, async (a) => {
    const target = /^https?:/.test(a.target) ? a.target : ctx.safePath(a.target);
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
}
