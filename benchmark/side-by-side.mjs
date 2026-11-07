// Builds results/<release>/side-by-side/<brief>.html (+ a PNG of the desktop and mobile folds) from the evaluation screenshots.
// env LEFT_ARM / RIGHT_ARM name the data folders' arm suffixes (defaults baseline / engine).
// usage: node benchmark/side-by-side.mjs <release> <brief,brief,...> "<left label>" "<right label>"
import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
const require = createRequire("/opt/node-tools/");
const { chromium } = require("playwright");
const [, , rel, briefsArg, L = "Haiku alone", R = "Haiku + OpenUI MCP"] = process.argv;
const root = resolve("results", rel), out = join(root, "side-by-side"); mkdirSync(out, { recursive: true });
const img = (brief, arm, k) => `../data/${brief}-${arm}/${brief}-${arm}-${k}.png`;
const b = await chromium.launch();
for (const brief of briefsArg.split(",")) {
  const col = (arm, label, kind) => `<section><h2>${label}</h2><img src="${img(brief, arm, kind)}" alt="${label} ${kind}"></section>`;
  const page = (title, body) => `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{margin:0;font:14px system-ui;background:#111;color:#eee}h1{margin:0;padding:14px 20px;font-size:16px}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 12px 12px}section h2{margin:0 0 6px;font-size:13px;color:#9cf}img{width:100%;display:block;border-radius:6px;background:#fff}</style><h1>${title}</h1>${body}`;
  const row = (kind) => `<div class="row">${col(process.env.LEFT_ARM ?? "baseline", L, kind)}${col(process.env.RIGHT_ARM ?? "engine", R, kind)}</div>`;
  writeFileSync(join(out, `${brief}.html`), page(`${brief}: ${L} (left) vs ${R} (right)`, `${row("desktop-fold")}${row("mobile-fold")}${row("desktop-full")}${row("mobile-full")}`));
  const p = await b.newPage({ viewport: { width: 2000, height: 1000 } });
  await p.goto("file://" + join(out, `${brief}.html`)); await p.waitForTimeout(400);
  const hdr = await p.evaluate(() => document.querySelectorAll(".row")[1].getBoundingClientRect().bottom);
  await p.screenshot({ path: join(out, `${brief}-folds.png`), clip: { x: 0, y: 0, width: 2000, height: Math.min(hdr + 12, 2400) }, fullPage: true });
  await p.close();
}
await b.close(); console.log("written to", out);
