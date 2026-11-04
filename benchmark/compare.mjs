// Unseals blind-judge verdicts for ANY two arms (e.g. control vs hybrid) and prints win counts and mean scores.
// usage: node benchmark/compare.mjs <judgeOutDir> <blind_mapping_SEALED.json> [<out judges.json>]
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const [, , outDir, mapFile, dest] = process.argv;
const DIMS = ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"];
const mapping = JSON.parse(readFileSync(resolve(mapFile), "utf8"));
const rows = [];
for (const f of readdirSync(resolve(outDir)).filter((n) => n.endsWith(".json")).sort()) {
  const j = JSON.parse(readFileSync(join(resolve(outDir), f), "utf8"));
  const m = mapping[j.pair];
  if (!m) throw new Error(`no mapping for ${j.pair}`);
  const arm = (label) => (label === "X" ? m.X : m.Y);
  rows.push({
    pair: j.pair, brief: m.brief, round: m.round, X_is: m.X, Y_is: m.Y,
    winner_label: j.winner_label, winner: arm(j.winner_label),
    more_template_like: arm(j.more_template_like_label),
    scores: { [m.X]: j.X, [m.Y]: j.Y }, rationale: j.rationale,
  });
}
const arms = [...new Set(rows.flatMap((r) => Object.keys(r.scores)))];
const wins = Object.fromEntries(arms.map((a) => [a, rows.filter((r) => r.winner === a).length]));
const tmpl = Object.fromEntries(arms.map((a) => [a, rows.filter((r) => r.more_template_like === a).length]));
const avg = (a, d) => (rows.reduce((s, r) => s + r.scores[a][d], 0) / rows.length).toFixed(2);
console.log(`judgements: ${rows.length}`, "wins:", wins, "judged more template-like:", tmpl);
for (const d of DIMS) console.log(d.padEnd(15), arms.map((a) => `${a} ${avg(a, d)}`).join("   "));
const overall = (a) => (DIMS.reduce((s, d) => s + Number(avg(a, d)), 0) / DIMS.length).toFixed(2);
console.log("mean of 8".padEnd(15), arms.map((a) => `${a} ${overall(a)}`).join("   "));
if (dest) { mkdirSync(dirname(resolve(dest)), { recursive: true }); writeFileSync(resolve(dest), JSON.stringify(rows, null, 1)); }
