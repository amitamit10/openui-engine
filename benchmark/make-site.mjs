// Builds benchmark/site: an interactive page with both generated sites embedded side by side + measured results.
// usage: node benchmark/make-site.mjs <resultsDir> label=siteDir ...   (labels: baseline, enhanced, enhanced2)
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
const [, , resDir, ...arms] = process.argv;
const LABELS = arms.map((a) => a.split("=")[0]);
const TITLES = { baseline: "A — Baseline", enhanced: "B — Engine available, not used", enhanced2: "B2 — Engine required" };
const out = resolve(new URL("./site", import.meta.url).pathname);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const a of arms) { const [l, d] = a.split("="); cpSync(resolve(d), join(out, l), { recursive: true, filter: (s) => !s.includes("/.openui") }); }
mkdirSync(join(out, "shots"), { recursive: true });
for (const l of LABELS) for (const vp of ["desktop", "mobile"]) for (const k of ["fold", "full"]) {
  const src = join(resolve(resDir), l, `${l}-${vp}-${k}.png`); if (existsSync(src)) cpSync(src, join(out, "shots", `${l}-${vp}-${k}.png`));
}
const R = JSON.parse(readFileSync(join(resolve(resDir), "results.json"), "utf8"));
const meta = existsSync(join(resolve(resDir), "meta.json")) ? JSON.parse(readFileSync(join(resolve(resDir), "meta.json"), "utf8")) : {};
const f = (x) => (x === undefined || x === null ? "—" : x);
const rows = [
  ["Audit gate (errors / warnings)", (r) => `${r.audit.totals.errors} / ${r.audit.totals.warnings}`],
  ["Interactions passed (desktop)", (r) => r.audit.perViewport[0]?.interactions],
  ["axe + a11y errors", (r) => r.audit.issues.filter((i) => i.cat === "a11y" && i.sev === "error").length],
  ["Horizontal overflow errors", (r) => r.audit.issues.filter((i) => i.cat === "overflow" && i.sev === "error").length],
  ["Console / network errors", (r) => r.audit.issues.filter((i) => ["console", "network"].includes(i.cat) && i.sev === "error").length],
  ["Distinct font sizes", (r) => r.discipline.distinctFontSizes],
  ["Distinct colours (text+fills)", (r) => r.discipline.distinctTextColorsAndFills],
  ["Distinct corner radii", (r) => r.discipline.distinctRadii],
  ["Spacing on 4px grid", (r) => (r.discipline.spacingOn4pxGrid === null ? "—" : Math.round(r.discipline.spacingOn4pxGrid * 100) + "%")],
  ["Source size (KB) / lines", (r) => `${(r.source.totalBytes / 1024).toFixed(0)} / ${r.source.lines}`],
  ["Engine heuristic score (engine's own tooling — biased toward its markup)", (r) => r.quality.overall],
  ["Markup-agnostic behaviour checks passed (pricing, FAQ, mobile menu)", (r) => `${r.neutral.filter((n) => n.passed).length}/${r.neutral.length}`],
  ["MCP tool calls made by the agent", (r) => f(r.agent?.mcpCalls)],
  ["Blind judge rank (1 = best, Sonnet, static screenshots)", (r) => (meta.blindJudge ? meta.blindJudge.ranking.indexOf(meta.blindJudge.mapping[r.__label]) + 1 : "—")],
  ["Tokens in session (agent)", (r) => f(r.agent?.tokens)], ["Tool calls (agent)", (r) => f(r.agent?.toolUses)], ["Wall-clock (agent, s)", (r) => f(r.agent?.seconds)],
];
const ARM = Object.fromEntries(LABELS.map((l) => [l, { ...R[l], agent: meta[l], __label: l }]));
const table = rows.map(([k, fn]) => `<tr><th scope="row">${k}</th>${LABELS.map((l) => `<td>${f(fn(ARM[l]))}</td>`).join("")}</tr>`).join("");
const judge = Object.fromEntries(LABELS.map((l) => [l, meta.blindJudge?.mapping?.[l]]));
const img = (l, vp, k) => existsSync(join(out, "shots", `${l}-${vp}-${k}.png`)) ? `<img loading="lazy" src="shots/${l}-${vp}-${k}.png" alt="${l} ${vp} ${k}">` : "<em>n/a</em>";
writeFileSync(join(out, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Benchmark comparison — OpenUI Engine</title>
<style>:root{color-scheme:dark light;--bg:#0b0b10;--fg:#ececf4;--mut:#a4a4bd;--line:#2a2a3d;--acc:#9b8cff;--panel:#12121a}@media(prefers-color-scheme:light){:root{--bg:#fff;--fg:#14142b;--mut:#555a70;--line:#dcdfe8;--acc:#4f46e5;--panel:#f6f7fb}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 Inter,system-ui,sans-serif}main{max-width:1280px;margin:0 auto;padding:24px 16px 64px}h1{font-size:clamp(28px,4vw,44px);letter-spacing:-.03em;margin:.2em 0}h2{margin-top:2.2em;letter-spacing:-.02em}
.warn{border:1px solid var(--acc);background:var(--panel);border-radius:12px;padding:14px 18px}.mut{color:var(--mut)}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}button{background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:999px;padding:10px 16px;min-height:44px;cursor:pointer;font:inherit}button[aria-pressed=true]{background:var(--acc);color:#fff;border-color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}@media(max-width:1100px){.grid{grid-template-columns:1fr}}
.pane{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel)}.pane h3{margin:0;padding:10px 14px;font-size:14px;border-bottom:1px solid var(--line)}.pane h3 span{color:var(--mut);font-weight:400}
.pane .vp{display:flex;justify-content:center;background:repeating-conic-gradient(#0000 0 25%,#8881 0 50%) 0 0/20px 20px}.pane iframe{border:0;height:720px;background:#fff;width:100%;max-width:100%}
.shots3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media(max-width:1100px){.shots3{grid-template-columns:1fr}}.shots3 img{width:100%;height:auto;border:1px solid var(--line);border-radius:8px}.shots img{width:100%;height:auto;border:1px solid var(--line);border-radius:8px}.scroll{max-height:900px;overflow:auto;border:1px solid var(--line);border-radius:8px}.scroll img{border:0;border-radius:0;display:block}
table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid var(--line);padding:10px 12px;text-align:left}thead th{color:var(--mut);font-weight:600}a{color:var(--acc)}</style></head><body><main>
<p class="mut"><a href="../">← OpenUI Engine</a></p><h1>Same model, with and without OpenUI Engine</h1>
<p class="warn"><strong>Headline.</strong> Arm B had the engine available but <strong>made zero MCP calls</strong>, so it is effectively a second baseline. Arm B2 (engine required) was run afterwards with a changed protocol. In the blind design review the engine-built page ranked <strong>last</strong>. This experiment does <em>not</em> show that OpenUI Engine improves a cheap model's design.</p>
<p class="warn"><strong>Read first.</strong> The requested model (GPT-6 Luna) is not available in this environment. Both agents are <strong>${meta.model ?? "Claude Haiku"}</strong>, the cheapest model available — a <em>substitute</em>. One run per arm (n=1), the audit tooling is the engine's own, and design judgements are subjective. See the <a href="https://github.com/amitamit10/openui-engine/blob/main/benchmark/REPORT.md">full report</a> for confounds. Not a proof.</p>
<h2>Live sites</h2><div class="bar" role="group" aria-label="Viewport"><button aria-pressed="true" data-w="100%">Desktop</button><button aria-pressed="false" data-w="820px">Tablet</button><button aria-pressed="false" data-w="390px">Mobile</button></div>
<div class="grid">${LABELS.map((l) => `<section class="pane"><h3>${TITLES[l]} <span>· <a href="${l}/">open</a></span></h3><div class="vp"><iframe title="${TITLES[l]}" src="${l}/"></iframe></div></section>`).join("")}</div>
<h2>Measured (identical measurement applied to both)</h2><table><thead><tr><th>Metric</th>${LABELS.map((l) => `<th>${TITLES[l]}</th>`).join("")}</tr></thead><tbody>${table}</tbody></table>
<h2>Screenshots — desktop 1440px (above the fold)</h2><div class="shots3">${LABELS.map((l) => img(l, "desktop", "fold")).join("")}</div>
<h2>Screenshots — mobile 390px (full page)</h2><div class="shots3">${LABELS.map((l) => `<div class="scroll">${img(l, "mobile", "full")}</div>`).join("")}</div>
<h2>Screenshots — desktop full page</h2><div class="shots3">${LABELS.map((l) => `<div class="scroll">${img(l, "desktop", "full")}</div>`).join("")}</div>
</main><script>document.querySelectorAll('[data-w]').forEach(function(b){b.onclick=function(){document.querySelectorAll('[data-w]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('iframe').forEach(function(f){f.style.width=b.dataset.w})}})</script></body></html>`);
console.log("benchmark site →", out);
