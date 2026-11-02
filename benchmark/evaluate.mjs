// Applies identical measurements to both benchmark outputs.
// usage: node benchmark/evaluate.mjs <outDir> label=siteDir [label=siteDir ...]
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync, cpSync, rmSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { auditTarget, serveDir, getBrowser, closeBrowser, scrollThrough, analyzePng } from "../packages/verify/dist/index.js";

const [, , outArg, ...arms] = process.argv;
const out = resolve(outArg); mkdirSync(out, { recursive: true });

function walk(d) { return readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]); }
function sourceStats(dir) {
  const files = walk(dir).filter((f) => !f.includes("/.openui") && !f.includes("/node_modules"));
  const by = { html: 0, css: 0, js: 0, other: 0 }; let lines = 0;
  for (const f of files) { const e = extname(f).slice(1); const k = by[e] !== undefined ? e : "other"; by[k] += statSync(f).size; if (["html", "css", "js"].includes(e)) lines += readFileSync(f, "utf8").split("\n").length; }
  return { files: files.length, bytes: by, totalBytes: Object.values(by).reduce((a, b) => a + b, 0), lines };
}

/** Design-system discipline measured the same way for any page (no tokens needed). */
async function discipline(url) {
  const b = await getBrowser(); const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" }); await scrollThrough(page);
  const r = await page.evaluate(() => {
    const els = [...document.body.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== "none"; });
    const colors = new Set(), fonts = new Set(), sizes = new Set(), radii = new Set(), sp = []; let textEls = 0;
    for (const e of els) {
      const cs = getComputedStyle(e);
      if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) { textEls++; colors.add(cs.color); fonts.add(cs.fontFamily.split(",")[0].replace(/["']/g, "").trim()); sizes.add(Math.round(parseFloat(cs.fontSize) * 2) / 2); }
      if (!/rgba?\(0, 0, 0, 0\)/.test(cs.backgroundColor)) colors.add(cs.backgroundColor);
      if (parseFloat(cs.borderTopLeftRadius) > 0) radii.add(cs.borderTopLeftRadius.split(" ")[0]);
      for (const p of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"]) { const v = parseFloat(cs[p]); if (v > 0 && v < 400) sp.push(v); }
    }
    const on4 = sp.filter((v) => Math.abs(v / 4 - Math.round(v / 4)) < 0.13).length;
    return { distinctTextColorsAndFills: colors.size, fontFamilies: [...fonts], distinctFontSizes: sizes.size, distinctRadii: radii.size, spacingSamples: sp.length, spacingOn4pxGrid: sp.length ? +(on4 / sp.length).toFixed(3) : null, sections: document.querySelectorAll("section").length, h2: document.querySelectorAll("h2").length, imgs: document.images.length, svgs: document.querySelectorAll("svg").length, textLength: document.body.innerText.length };
  });
  await page.close(); return r;
}


/** Markup-agnostic behavioural checks (no engine selectors). */
async function neutralChecks(url) {
  const b = await getBrowser(); const out = [];
  const run = async (name, vp, fn) => { const ctx = await b.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500 }); const p = await ctx.newPage(); p.setDefaultTimeout(4000);
    try { await p.goto(url, { waitUntil: "networkidle" }); const d = await fn(p); out.push({ name, viewport: vp.width, passed: true, detail: d }); } catch (e) { out.push({ name, viewport: vp.width, passed: false, detail: String(e.message).split("\n")[0] }); } await ctx.close(); };
  const prices = (p) => p.evaluate(() => (document.body.innerText.match(/\$\s?\d[\d,]*/g) || []).join(","));
  await run("pricing toggle changes displayed prices", { width: 1440, height: 900 }, async (p) => {
    const find = (re) => { const btn = p.getByRole("button", { name: re }).first(); return btn.count().then((n) => (n ? btn : p.locator("label,[role=tab],[role=switch]").filter({ hasText: re }).first())); };
    const y = await find(/year|annual/i), m = await find(/month/i);
    await y.scrollIntoViewIfNeeded(); const seen = [];
    for (const el of [m, y, m]) { await el.click(); await p.waitForTimeout(250); seen.push(await prices(p)); }
    if (new Set(seen).size < 2) throw new Error("prices identical in monthly and yearly modes"); return seen.map((x) => x.slice(0, 28)).join(" | "); });
  await run("FAQ accordion toggles", { width: 1440, height: 900 }, async (p) => {
    const q = p.locator("details:not([open]) > summary, button[aria-expanded=false]").filter({ hasText: /\?/ }).first(); const h = await q.elementHandle();
    await h.scrollIntoViewIfNeeded(); await h.click(); await p.waitForTimeout(250);
    const ok = await h.evaluate((e) => (e.tagName === "SUMMARY" ? e.parentElement.open : e.getAttribute("aria-expanded") === "true")); if (!ok) throw new Error("did not open"); });
  await run("mobile menu opens", { width: 390, height: 844 }, async (p) => {
    const m = p.locator("button[aria-expanded], button:has-text('Menu'), [aria-label*='menu' i]").first(); const h = await m.elementHandle();
    const visBefore = await p.evaluate(() => [...document.querySelectorAll("header a, nav a")].filter((a) => a.getBoundingClientRect().height > 0 && a.getBoundingClientRect().width > 0).length);
    await h.click(); await p.waitForTimeout(350);
    const visAfter = await p.evaluate(() => [...document.querySelectorAll("header a, nav a")].filter((a) => a.getBoundingClientRect().height > 0 && a.getBoundingClientRect().width > 0).length);
    if (visAfter <= visBefore) throw new Error("no additional nav links visible after click"); return visBefore + " -> " + visAfter + " visible nav links"; });
  return out;
}

const results = {};
for (const [label, dir] of arms.map((a) => a.split("="))) {
  // Evaluate exactly what was delivered: site/index.html at the root, excluding engine project files and tool output.
  const root = resolve(out, "_staged", label); rmSync(root, { recursive: true, force: true }); mkdirSync(root, { recursive: true });
  cpSync(resolve(dir), root, { recursive: true, filter: (f) => !/\/(dist|\.openui|node_modules)(\/|$)/.test(f) && !/\/(openui\.[a-z.]+\.json|DESIGN\.md|tokens\.json)$/.test(f) });
  if (!existsSync(join(root, "index.html"))) { results[label] = { error: "no index.html" }; continue; }
  const shots = join(out, label);
  const t0 = Date.now();
  const r = await auditTarget(root, { outDir: shots, label });
  const srv = await serveDir(root);
  const disc = await discipline(srv.url + "/"); const neutral = await neutralChecks(srv.url + "/"); await srv.close();
  const wsp = {};
  for (const v of r.audit.viewports) if (v.screenshots.full) wsp[v.viewport.name] = analyzePng(v.screenshots.full);
  results[label] = {
    source: sourceStats(root),
    audit: { passed: r.audit.passed, totals: r.audit.totals, perViewport: r.audit.viewports.map((v) => ({ vp: v.viewport.name, errors: v.issues.filter((i) => i.severity === "error").length, warnings: v.issues.filter((i) => i.severity === "warning").length, interactions: `${v.interactions.filter((i) => i.passed).length}/${v.interactions.length}`, pageHeight: v.metrics.docHeight })), issues: r.audit.viewports.flatMap((v) => v.issues.filter((i) => i.severity !== "info").map((i) => ({ vp: v.viewport.name, sev: i.severity, cat: i.category, msg: i.message.slice(0, 220) }))) },
    quality: { overall: r.quality.overall, dimensions: Object.fromEntries(r.quality.dimensions.map((d) => [d.id, d.score])), deadZones: r.quality.deadZones },
    slop: r.audit.viewports.find((v) => v.slop)?.slop ?? null,
    neutral, discipline: disc, deadZonesByViewport: Object.fromEntries(Object.entries(wsp).map(([k, v]) => [k, v.deadZones.length])),
    evalSeconds: +((Date.now() - t0) / 1000).toFixed(1),
  };
}
writeFileSync(join(out, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, (k, v) => (k === "issues" ? v.length + " issues" : v), 1));
await closeBrowser();
