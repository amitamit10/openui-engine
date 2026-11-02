// Applies identical measurements to both benchmark outputs.
// usage: node benchmark/evaluate.mjs <baselineSiteDir> <enhancedSiteDir> <outDir>
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { auditTarget, serveDir, getBrowser, closeBrowser, scrollThrough, analyzePng } from "../packages/verify/dist/index.js";

const [, , aDir, bDir, outArg] = process.argv;
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

const results = {};
for (const [label, dir] of [["baseline", aDir], ["enhanced", bDir]]) {
  const root = resolve(dir);
  if (!existsSync(join(root, "index.html"))) { results[label] = { error: "no index.html" }; continue; }
  const shots = join(out, label);
  const t0 = Date.now();
  const r = await auditTarget(root, { outDir: shots, label });
  const srv = await serveDir(root);
  const disc = await discipline(srv.url + "/"); await srv.close();
  const wsp = {};
  for (const v of r.audit.viewports) if (v.screenshots.full) wsp[v.viewport.name] = analyzePng(v.screenshots.full);
  results[label] = {
    source: sourceStats(root),
    audit: { passed: r.audit.passed, totals: r.audit.totals, perViewport: r.audit.viewports.map((v) => ({ vp: v.viewport.name, errors: v.issues.filter((i) => i.severity === "error").length, warnings: v.issues.filter((i) => i.severity === "warning").length, interactions: `${v.interactions.filter((i) => i.passed).length}/${v.interactions.length}`, pageHeight: v.metrics.docHeight })), issues: r.audit.viewports.flatMap((v) => v.issues.filter((i) => i.severity !== "info").map((i) => ({ vp: v.viewport.name, sev: i.severity, cat: i.category, msg: i.message.slice(0, 220) }))) },
    quality: { overall: r.quality.overall, dimensions: Object.fromEntries(r.quality.dimensions.map((d) => [d.id, d.score])), deadZones: r.quality.deadZones },
    discipline: disc, deadZonesByViewport: Object.fromEntries(Object.entries(wsp).map(([k, v]) => [k, v.deadZones.length])),
    evalSeconds: +((Date.now() - t0) / 1000).toFixed(1),
  };
}
writeFileSync(join(out, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, (k, v) => (k === "issues" ? v.length + " issues" : v), 1));
await closeBrowser();
