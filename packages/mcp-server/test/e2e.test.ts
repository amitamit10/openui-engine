import { mkdtempSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { chromium } from "playwright-core";
import { findChromium, closeBrowser } from "@openui-engine/verify";

import { request as httpRequest } from "node:http";
const statusWithHost = (url: string, host: string) => new Promise<number>((ok, bad) => { const u = new URL(url); const r = httpRequest({ hostname: u.hostname, port: u.port, path: u.pathname, headers: { host } }, (res) => { res.resume(); ok(res.statusCode ?? 0); }); r.on("error", bad); r.end(); });
const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "../dist/cli.js");
let client: Client; let work: string;
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const r: any = await client.callTool({ name, arguments: args }, undefined, { timeout: 170_000 });
  const t = r.content.find((c: any) => c.type === "text")?.text ?? "";
  return { isError: !!r.isError, text: t, json: (() => { try { return JSON.parse(t); } catch { return undefined; } })(), content: r.content };
};

beforeAll(async () => {
  work = mkdtempSync(join(tmpdir(), "openui-e2e-"));
  client = new Client({ name: "e2e", version: "0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [cli, "--workdir", work], stderr: "ignore", env: { ...process.env } as Record<string, string> }));
});
afterAll(async () => { await client.close(); await closeBrowser(); });

describe("MCP tool surface", () => {
  it("lists every documented tool with descriptions and schemas", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    for (const n of ["discover_components", "get_component", "search_design_references", "generate_design_system", "compose_page", "suggest_layout", "validate_design", "capture_preview", "analyze_visual_quality", "create_review_session", "get_visual_feedback", "apply_visual_tweaks"]) expect(names).toContain(n);
    for (const t of tools) { expect(t.description!.length).toBeGreaterThan(40); expect(t.inputSchema.type).toBe("object"); }
  });

  it("style_pack writes a self-contained toolkit (tokens, CSS, JS, snippets) that a hand-written page can use and that passes the quick gate", async () => {
    const r = await call("style_pack", { outDir: "pack", name: "Quay Bakery", description: "an independent neighbourhood bakery, warm and unfussy", category: "ecommerce" });
    expect(r.isError).toBe(false);
    for (const f of ["tokens.css", "styles.css", "app.js", "DESIGN.md", "README.md", "reference.html"]) expect(r.json.files).toContain(f);
    expect(r.json.files.filter((f: string) => f.startsWith("snippets/")).length).toBeGreaterThanOrEqual(8);
    expect(readFileSync(join(work, "pack", "README.md"), "utf8")).toMatch(/Signatures of this style/);
    const ref = readFileSync(join(work, "pack", "reference.html"), "utf8");
    expect(ref).not.toContain("overrides.css");
  });

  it("tools tolerate the argument slips small models make (no outDir, loose style, unknown category)", async () => {
    const r = await call("style_pack", { name: "Kelpline Summit", description: "two-day conference on ocean technology, curious and practical", category: "conference", style: "warm editorial like a magazine" });
    expect(r.isError).toBe(false);
    expect(r.json.outDir).toBe("pack");
    expect(r.json.style).not.toBe("clarity-light");
    const d = await call("generate_design_system", { description: "wood-fire restaurant, warm and smoky" });
    expect(d.isError).toBe(false);
    const l = await call("suggest_layout", { category: "consumer-app" });
    expect(l.isError).toBe(false);
  }, 60000);

  it("discover_components returns a short ranked list, never the full registry", async () => {
    const r = await call("discover_components", { slot: "pricing", style: "aurora-dark", limit: 3 });
    expect(r.json.results.length).toBeLessThanOrEqual(3);
    expect(r.json.results[0].id).toBe("openui/pricing");
    expect(r.text.length).toBeLessThan(2500);
  });

  it("get_component returns real metadata and example HTML for an OpenUI section", async () => {
    const r = await call("get_component", { id: "openui/pricing", detail: "source" });
    expect(r.json.license.spdx).toBe("Apache-2.0");
    expect(r.json.example_html).toContain("data-openui-id");
  });

  it("rejects paths outside the workdir", async () => {
    const r = await call("generate_design_system", { name: "X", outDir: "../escape" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/outside the allowed working directory/);
  });

  it("search_design_references returns patterns and the source audit", async () => {
    const r = await call("search_design_references", { slot: "hero", style: "aurora-dark", includeSources: true });
    expect(r.json.patterns[0].principles.length).toBeGreaterThan(1);
    expect(r.json.sources.find((s: any) => s.id === "devault").access).toBe("blocked");
  });
});

describe("design → compose → verify → review loop", () => {
  it("generates a WCAG-clean design system and a page that passes the browser QA gate", async () => {
    const ds = await call("generate_design_system", { name: "Acme", description: "Dark premium AI platform", category: "ai-product", outDir: "site" });
    expect(ds.json.style.id).toBe("aurora-dark");
    expect(ds.json.lint.filter((i: any) => i.severity === "error")).toHaveLength(0);
    expect(readFileSync(join(work, "site/DESIGN.md"), "utf8")).toMatch(/^---\nversion: alpha/);
    const c = await call("compose_page", { projectDir: "site", brief: { name: "Acme", tagline: "Ship *faster* with Acme", description: "Acme helps teams ship product faster." } });
    expect(c.json.style).toBe("aurora-dark"); // existing design system must be respected
    expect(existsSync(join(work, "site/dist/index.html"))).toBe(true);
    const v = await call("validate_design", { target: "site", viewports: ["desktop", "mobile"] });
    // starter copy is intentionally flagged: a page must not ship the engine's placeholder content
    expect(v.json.issues.filter((i: any) => i.sev === "error"), JSON.stringify(v.json.issues)).toEqual([]);
    expect(v.json.issues.some((i: any) => i.cat === "content" && /Starter placeholder copy/.test(i.msg))).toBe(true);
    expect(v.json.passed).toBe(true);
    expect(v.json.token_compliance.color).toBe("100%");
  });

  it("copy edits via sectionProps rebuild the site", async () => {
    await call("compose_page", { projectDir: "site", sectionProps: { hero: { title: "A *new* headline" } } });
    expect(readFileSync(join(work, "site/dist/index.html"), "utf8")).toContain("A <em>new</em> headline");
  });

  it("rewriting every starter section (incl. the hero mock) clears the placeholder warning", async () => {
    await call("compose_page", { projectDir: "site", sectionProps: {
      hero: { mock: { title: "Active incidents", period: "Last 24 hours", url: "app.acme.com/incidents", sidebar: ["Incidents", "On-call", "SLOs"], kpis: [{ label: "Open", value: "2", delta: "1 SEV-2" }, { label: "MTTR", value: "18 min" }, { label: "SLO burn", value: "0.6x" }] } },
      "logo-cloud": { logos: ["Quillstone", "Harbor & Pine", "Lattice Works"] },
      "feature-bento": { title: "What Acme does", items: [
        { title: "Signals", body: "Correlated alerts.", visual: "list", span: 4, data: { rows: [{ label: "p99 latency high", time: "now" }] } },
        { title: "Policies", body: "Escalation rules.", visual: "toggle", span: 2, data: { toggles: [{ label: "Page on-call", on: true }] } },
        { title: "Code", body: "API.", visual: "code", span: 2, data: { code: "acme.page(incident)" } },
        { title: "Team", body: "Roles.", visual: "avatars", span: 2, data: { people: "+9 on call" } } ] },
      "feature-rows": { items: [{ title: "Timeline *built for you*", body: "Auto-drafted.", bullets: ["One"], visual: "bars" }] },
      testimonials: { items: [{ quote: "Great.", name: "Ana Ruiz", role: "SRE, Quillstone" }] },
    } });
    expect(readFileSync(join(work, "site/dist/index.html"), "utf8")).toContain("Active incidents");
    const v = await call("validate_design", { target: "site", viewports: ["desktop"] });
    expect(v.json.issues.some((i: any) => /Starter placeholder/.test(i.msg)), JSON.stringify(v.json.issues)).toBe(false);
  });

  it("validate_design never overwrites hand-edited dist output", async () => {
    const f = join(work, "site/dist/index.html"); const html = readFileSync(f, "utf8");
    writeFileSync(f, html.replace("</body>", "<!-- hand edit --></body>"));
    await call("validate_design", { target: "site", viewports: ["desktop"] });
    expect(readFileSync(f, "utf8")).toContain("<!-- hand edit -->");
    await call("rebuild_project", { projectDir: "site" });
  });

  it("capture_preview returns real JPEG image content", async () => {
    const r = await call("capture_preview", { target: "site", viewports: ["mobile"], inline: "fold" });
    const img = r.content.find((c: any) => c.type === "image");
    expect(img.mimeType).toBe("image/jpeg");
    expect(Buffer.from(img.data, "base64").subarray(0, 2).toString("hex")).toBe("ffd8");
  });

  it("analyze_visual_quality returns evidence-backed dimensions", async () => {
    const r = await call("analyze_visual_quality", { target: "site" });
    expect(r.json.dimensions.map((d: any) => d.id)).toContain("whitespace");
    expect(r.json.overall).toBeGreaterThan(80);
    expect(r.json.note).toMatch(/not taste|cannot judge taste|not taste/i);
  });

  it("validate_design catches a seeded defect (horizontal overflow) with a fix hint", async () => {
    await call("compose_page", { projectDir: "site", addSections: [{ id: "broken", type: "metrics", afterId: "hero", props: { items: [{ value: "1", label: "x" }] } }] });
    // seed an overflow through a persisted tweak (width wider than any phone)
    await call("apply_visual_tweaks", { projectDir: "site", tweaks: [{ openuiId: "broken.m0", props: { width: "900px" } }] });
    const v = await call("validate_design", { target: "site", viewports: ["mobile"] });
    expect(v.json.passed).toBe(false);
    expect(v.json.issues.some((i: any) => i.cat === "overflow" && i.fix)).toBe(true);
    // undo
    await call("compose_page", { projectDir: "site", removeSections: ["broken"] });
  });

  it("visual editor: select → tweak → comment → ask → agent receives feedback → apply persists to source", async () => {
    const s = await call("create_review_session", { target: "site" });
    const { sessionId, editorUrl } = s.json;
    expect(editorUrl).toMatch(/\/s\/[a-f0-9]{10}\/\?t=/);

    // access control: no token → 401; wrong token → 401; bad Host header → 421
    const base = new URL(editorUrl).origin; const path = new URL(editorUrl).pathname;
    expect((await fetch(base + path)).status).toBe(401);
    expect((await fetch(base + path + "?t=wrong")).status).toBe(401);
    expect(await statusWithHost(base + path, "evil.example")).toBe(421);

    const browser = await chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox"] });
    const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
    await page.goto(editorUrl);
    const frame = page.frameLocator("#pv");
    await frame.locator('[data-openui-id="hero.title"]').waitFor();
    await frame.locator('[data-openui-id="hero.title"]').click();
    await expect.poll(async () => page.locator("#inspector").isVisible()).toBe(true);
    expect(await page.locator("#inspector code").first().textContent()).toBe("hero.title");

    // live tweak: font-size 60 → preview updates instantly
    await page.locator('input[data-p="font-size"]').fill("61");
    await expect.poll(async () => frame.locator('[data-openui-id="hero.title"]').evaluate((e) => getComputedStyle(e).fontSize)).toBe("61px");
    // change radius on the CTA through the Style tab and a comment + a natural-language request
    await frame.locator('[data-openui-id="hero.cta"]').click();
    // wait until the inspector has actually switched to the CTA, otherwise the edit lands on the previous element
    await expect.poll(async () => page.locator("#inspector code").first().textContent(), { timeout: 10_000 }).toBe("hero.cta");
    await page.locator('input[data-p="border-radius"]').fill("6");
    await page.locator('[data-tab="comments"]').click();
    await page.locator("#ctext").fill("CTA feels too round for the brand");
    await page.locator("#cadd").click();
    await page.locator('[data-tab="ask"]').click();
    await page.locator("#rtext").fill("Make the hero subtitle a little shorter");
    await page.locator("#radd").click();
    await expect.poll(async () => (await page.locator("#pending").textContent()), { timeout: 10_000 }).toMatch(/2 pending/);

    // the agent receives it through MCP
    const fb = await call("get_visual_feedback", { sessionId, waitSeconds: 5 });
    expect(fb.json.comments[0].text).toMatch(/too round/);
    expect(fb.json.comments[0].on).toBe("hero.cta");
    expect(fb.json.requests[0].text).toMatch(/subtitle/);
    expect(fb.json.pending_tweaks.map((t: any) => t.target).sort()).toEqual(["hero.cta", "hero.title"]);

    // approve → written to real source
    await page.locator("#apply").click();
    await expect.poll(() => readFileSync(join(work, "site/dist/overrides.css"), "utf8").includes('[data-openui-id="hero.title"]')).toBe(true);
    const ov = JSON.parse(readFileSync(join(work, "site/openui.overrides.json"), "utf8"));
    expect(ov["hero.title"]["font-size"]).toBe("61px");
    expect(ov["hero.cta"]["border-radius"]).toBe("6px");
    expect(readFileSync(join(work, "site/dist/overrides.css"), "utf8")).toContain('[data-openui-id="hero.title"]');
    const done = await call("apply_visual_tweaks", { sessionId, resolveCommentIds: [fb.json.comments[0].id], handledRequestIds: [fb.json.requests[0].id] });
    expect(done.isError).toBe(false);

    // variant switching rebuilds a different hero
    await frame.locator('[data-openui-id="hero.title"]').click();
    await page.locator('[data-tab="style"]').click();
    await page.locator("#variant").selectOption("hero-split");
    await expect.poll(async () => frame.locator('[data-openui-variant="hero-split"]').count()).toBe(1);
    expect(JSON.parse(readFileSync(join(work, "site/openui.page.json"), "utf8")).sections.find((x: any) => x.id === "hero").type).toBe("hero-split");
    await browser.close();
  });

  it("build_site: one call plans, renders, lints, gates and returns screenshots; patch iterates", async () => {
    const t = await call("brief_template", { category: "devtool" });
    expect(t.json.visualSuggestions.length).toBeGreaterThan(2);
    const brief = { ...t.json.brief, name: "Northstar", headline: "Incidents handled before they become *emergencies*", subheadline: "Northstar groups alerts into one incident and pages the on-call engineer in 38 seconds." };
    brief.features[0].title = "Detect"; brief.features[1].title = "Respond"; brief.features[2].title = "Learn";
    const r = await call("build_site", { projectDir: "ns", deployDir: "ns-out", brief });
    expect(r.isError).toBe(false);
    const out = JSON.parse(r.text);
    expect(out.layout.join("\n")).toMatch(/feature-rows/);
    expect(out.icons).toMatch(/^\d+\/\d+ fetched/);
    expect(out.gate.passed).toBe(true);
    expect(existsSync(join(work, "ns-out/index.html"))).toBe(true);
    expect(r.content.filter((c: any) => c.type === "image")).toHaveLength(2);
    // the closing email form validates and confirms (real browser)
    const { chromium: cr } = await import("playwright-core");
    const br = await cr.launch({ executablePath: findChromium(), args: ["--no-sandbox"] });
    const pg = await br.newPage(); await pg.goto("file://" + join(work, "ns-out/index.html"));
    await pg.locator("#cta-email").scrollIntoViewIfNeeded();
    await pg.fill("#cta-email", "nope"); await pg.click("[data-form] button");
    await expect.poll(() => pg.locator("[data-form] .form__note").textContent()).toMatch(/valid email/i);
    await pg.fill("#cta-email", "ana@quillstone.io"); await pg.click("[data-form] button");
    await expect.poll(() => pg.locator("[data-form] .form__note").textContent()).toMatch(/Thanks/);
    // feature tabs (opt-in via featureLayout): keyboard navigation
    const rt = await call("build_site", { projectDir: "ns", deployDir: "ns-out", patch: { featureLayout: "tabs" }, verify: false, images: false });
    expect(JSON.parse(rt.text).layout.join("\n")).toMatch(/feature-tabs/);
    await pg.reload();
    await pg.locator("[role=tab]").first().focus(); await pg.keyboard.press("ArrowRight");
    await expect.poll(() => pg.locator("[role=tab][aria-selected=true]").textContent()).toMatch(/Respond/);
    await br.close();
    // patch: introduce buzzwords → copy lint reports them
    const r2 = await call("build_site", { projectDir: "ns", patch: { headline: "Supercharge your seamless workflow!" }, verify: false, images: false });
    const o2 = JSON.parse(r2.text);
    expect(o2.copy_lint.top.join(" ")).toMatch(/buzzword/);
    expect(readFileSync(join(work, "ns/openui.brief.json"), "utf8")).toContain("Supercharge");
  });

  it("long real-world tab labels and bad visual data do not overflow or silently render empty", async () => {
    const t = await call("brief_template", { category: "wellness journaling" }); // free-text category is accepted
    const brief = { ...t.json.brief, name: "Fieldnote", category: "wellness", headline: "A journal your therapist can *actually* read with you", subheadline: "Fieldnote keeps weekly reflections private by default and shares only what you choose, with end-to-end encryption.",
      features: ["Prompts your therapist assigns to you", "Mood tracking you can understand", "Weekly reflections you choose to share", "Encrypted on your device by default", "Works offline on the train or in the waiting room"].map((title, i) => ({ title, body: "One specific sentence about this capability.", icon: "lucide:notebook-pen", visual: i === 1 ? { kind: "table" } : { kind: "checklist", title: "Today", items: [{ text: "Write about the week", done: true }, { text: "Rate your mood" }] } })) };
    const r = await call("build_site", { projectDir: "fn", brief, verify: true, images: false });
    const out = JSON.parse(r.text);
    expect(out.copy_lint.top.join(" ")).toMatch(/visual-empty/);        // the empty table is reported, not silently rendered
    expect(out.gate.issues.join(" ")).not.toMatch(/overflow/i);          // long labels no longer widen the grid
    const g = await call("get_component", { id: "feature-tabs" });       // bare ids resolve
    expect(g.isError).toBe(false); expect(g.json.id).toBe("openui/feature-tabs");
    const bad = await call("get_component", { id: "kanbann-board" });
    expect(bad.isError).toBe(true); expect(bad.text).toMatch(/Did you mean/);
    const slop = await call("detect_ai_slop", { url: "file://" + join(work, "fn/dist") }); // argument aliases accepted
    expect(slop.isError).toBe(false);
  });

  it("list_libraries, search_icons and discover across indexed registries", async () => {
    const l = await call("list_libraries");
    expect(l.json.searchableComponents).toBeGreaterThan(1000);
    expect(l.json.componentLibraries.map((x: any) => x.id)).toEqual(expect.arrayContaining(["openui", "shadcn", "kibo", "cult", "animateui"]));
    expect(l.json.iconLibraries.map((x: any) => x.id)).toEqual(["lucide", "tabler", "heroicons", "phosphor"]);
    const i = await call("search_icons", { query: "invoice" });
    expect(i.json.results.length).toBeGreaterThan(3);
    const d = await call("discover_components", { query: "kanban", limit: 3 });
    expect(d.json.results.some((x: any) => x.id === "kibo/kanban")).toBe(true);
  });

  it("rejects unsafe tweak values (injection attempt) and unknown properties", async () => {
    const r = await call("apply_visual_tweaks", { projectDir: "site", tweaks: [{ openuiId: "hero.title", props: { "background-color": "url(javascript:alert(1))", "position": "fixed", color: "red" } }] });
    expect(r.json.explicit.rejected.map((x: any) => x.prop).sort()).toEqual(["background-color", "position"]);
    expect(r.json.explicit.applied).toBe(1);
  });
});
