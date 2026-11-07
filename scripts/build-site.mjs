// Builds the documentation site *with OpenUI Engine itself* (dogfooding), then adds the architecture diagrams.
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { generateTokens, saveProject } from "../packages/core/dist/index.js";

const root = new URL("..", import.meta.url).pathname;
const dir = `${root}docs/site-src`;
const tokens = generateTokens({ name: "OpenUI Engine", description: "dark premium developer platform for AI agents", category: "devtool", style: "aurora-dark", accent: "#7c6cff" });
const REPO = "https://github.com/amitamit10/openui-engine";
const spec = {
  title: "OpenUI Engine — design intelligence for coding agents",
  description: "An open-source MCP server that gives inexpensive coding models curated components, design systems, a visual editor and real-browser QA.",
  brand: { name: "OpenUI Engine" },
  sections: [
    { id: "nav", type: "navbar-glass", props: { links: [{ label: "Tools", href: "#features" }, { label: "Architecture", href: "#architecture" }, { label: "Results", href: "results/" }, { label: "Install", href: "#install" }], signIn: { label: "Docs", href: `${REPO}/tree/main/docs` }, cta: { label: "GitHub", href: REPO } } },
    { id: "hero", type: "hero-centered-product", props: { badge: { tag: "MCP", text: "13 tools · stdio + Streamable HTTP · Apache-2.0" }, title: "Stop making cheap models *invent* UI design", subtitle: "OpenUI Engine hands your coding agent curated components, a WCAG-checked design system, a visual editor and a real-browser QA loop — so it composes and verifies instead of improvising.", primaryCta: { label: "Install the MCP", href: "#install" }, secondaryCta: { label: "View on GitHub", href: REPO }, note: "Open source · local-first · no API keys", mock: { title: "validate_design", period: "desktop · mobile", url: "mcp://openui-engine/validate_design", sidebar: ["Tools", "Registry", "Tokens", "Editor", "Reports"], kpis: [{ label: "Errors", value: "0", delta: "passed" }, { label: "Token compliance", value: "100%" }, { label: "Interactions", value: "11/11" }], ariaLabel: "Preview of a validate_design result with zero errors and full token compliance" } } },
    { id: "logos", type: "logo-cloud", props: { label: "Works with any MCP client", logos: ["Claude Code", "Codex", "Cursor", "Windsurf", "VS Code", "Zed"] } },
    { id: "features", type: "feature-bento", props: { anchor: "features", eyebrow: "Tools", title: "Everything an agent needs to ship a *designed* page", subtitle: "Short ranked answers, not registry dumps. Source is fetched only when asked for.", items: [
      { title: "discover_components → get_component", body: "A ranked shortlist with fit scores and reasons, then metadata or live registry source on demand.", visual: "list", span: 4 },
      { title: "generate_design_system", body: "Art direction, tokens and a DESIGN.md that passes Google's linter.", visual: "code", span: 2 },
      { title: "validate_design", body: "Chromium: overflow, axe, console, interactions, token compliance.", visual: "toggle", span: 2 },
      { title: "analyze_visual_quality", body: "Measured scores with evidence, honest about what it cannot judge.", visual: "bars", span: 2 },
      { title: "create_review_session", body: "Click, comment, tweak, ask — persisted as id-keyed CSS overrides.", visual: "avatars", span: 2 } ] } },
    { id: "metrics", type: "metrics", props: { tint: true, items: [{ value: "13", label: "MCP tools" }, { value: "6", label: "WCAG-checked art directions" }, { value: "32", label: "curated components" }, { value: "0", label: "third-party files vendored" }] } },
    { id: "steps", type: "steps", props: { anchor: "install", title: "Install in one minute", subtitle: "Node 20+ and a Chromium (or let Playwright download one).", items: [
      { title: "Build", body: "git clone, pnpm install, pnpm build." }, { title: "Register", body: "Add the stdio command to Claude Code, Codex or Cursor." }, { title: "Ask", body: "“Build a landing page for …” — the agent now has tools to do it well." } ] } },
    { id: "faq", type: "faq", props: { eyebrow: "FAQ", title: "Honest answers", items: [
      { q: "Does it replace a designer?", a: "No. It removes avoidable mistakes (contrast, overflow, inconsistency) and gives models a coherent starting point. Taste still needs a human, which is why the editor exists." },
      { q: "Are third-party components bundled?", a: "No. Registries (shadcn, Fluid Functionalism, Magic UI, Aceternity, React Bits) are fetched live; licence status per source is published." },
      { q: "Is the benchmark a proof?", a: "It is a small, disclosed experiment, not a proof. The report lists every confound." },
      { q: "Can it run remotely?", a: "Yes: Streamable HTTP with a mandatory bearer token; the editor is loopback-only unless you opt in." } ] } },
    { id: "cta", type: "cta-band", props: { title: "Give your agent a *design system*", subtitle: "Apache-2.0. Built by Amit Elgabsi.", primaryCta: { label: "Get started", href: "#install" }, secondaryCta: { label: "Read the architecture", href: "#architecture" } } },
    { id: "footer", type: "footer-columns", props: { tagline: "Design intelligence and visual QA for AI coding agents.", columns: [
      { title: "Project", links: [{ label: "GitHub", href: REPO }, { label: "Issues", href: `${REPO}/issues` }, { label: "Contributing", href: `${REPO}/blob/main/CONTRIBUTING.md` }] },
      { title: "Docs", links: [{ label: "MCP setup", href: `${REPO}/blob/main/docs/MCP_SETUP.md` }, { label: "Sources audit", href: `${REPO}/blob/main/docs/SOURCES.md` }, { label: "Skills audit", href: `${REPO}/blob/main/docs/SKILLS_AUDIT.md` }] },
      { title: "Author", links: [{ label: "Amit Elgabsi", href: "https://github.com/amitamit10" }] } ], legal: "© 2026 Amit Elgabsi · Apache-2.0", note: "Diagrams made with stack-diagram (MIT)." } },
  ],
};
saveProject({ dir, tokens, spec, overrides: {} });

// add the architecture section + benchmark link before the FAQ (docs-specific markup, token-driven CSS)
const out = `${root}docs/site`;
mkdirSync(out, { recursive: true });
cpSync(`${dir}/dist`, out, { recursive: true });
const pic = (n, alt) => `<picture><source media="(prefers-color-scheme: dark)" srcset="diagrams/${n}-dark.png"><img src="diagrams/${n}.png" alt="${alt}" loading="lazy" width="1000" height="${n === "architecture" ? 680 : 560}"></picture>`;
const arch = `<section class="section" id="architecture" data-openui-section="architecture"><div class="container"><div class="section-head"><span class="eyebrow">Architecture</span><h2 class="h2">How the pieces fit</h2><p class="lead">An MCP server in front of a component registry, design intelligence, a composer, a Playwright QA gate and a browser editor.</p></div><div class="docs-fig">${pic("architecture", "OpenUI Engine system architecture diagram")}</div><div class="docs-fig">${pic("quality-loop", "Generate, render, inspect, correct, verify loop diagram")}</div></div></section>`;
let html = readFileSync(`${out}/index.html`, "utf8").replace('<section class="section section--tint"', `${arch}\n<section class="section section--tint"`);
// insert before FAQ section specifically
html = readFileSync(`${out}/index.html`, "utf8");
const i = html.indexOf('<section class="section " id="faq"');
html = i > 0 ? html.slice(0, i) + arch + "\n" + html.slice(i) : html;
writeFileSync(`${out}/index.html`, html);
writeFileSync(`${out}/styles.css`, readFileSync(`${out}/styles.css`, "utf8") + `\n.docs-fig{margin-top:var(--s-6);border:var(--bw) solid var(--c-border);border-radius:var(--r-xl);overflow:hidden;background:var(--c-surface)}.docs-fig img{width:100%;height:auto}\n`);
mkdirSync(`${out}/diagrams`, { recursive: true });
for (const f of ["architecture", "architecture-dark", "quality-loop", "quality-loop-dark"]) cpSync(`${root}docs/diagrams/${f}.png`, `${out}/diagrams/${f}.png`);
for (const f of ["architecture", "quality-loop"]) cpSync(`${root}docs/diagrams/${f}.html`, `${out}/diagrams/${f}.html`);
if (existsSync(`${root}results`)) cpSync(`${root}results`, `${out}/results`, { recursive: true, filter: (f) => !/\/(REPORT\.md|SPEC\.md|raw)$/.test(f) && !f.endsWith(".md") });
console.log("docs site built →", out);
