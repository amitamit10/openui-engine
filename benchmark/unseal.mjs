// Unseals blind-judge verdicts: maps X/Y labels back to arms using the sealed mapping.
// usage: node benchmark/unseal.mjs <judgeOutDir> <blind_mapping_SEALED.json> <out judges.json>
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
const [, , outDir, mapFile, dest] = process.argv;
const mapping = JSON.parse(readFileSync(resolve(mapFile), "utf8"));
const rows = [];
for (const f of readdirSync(resolve(outDir)).filter((n) => n.endsWith(".json")).sort()) {
  const j = JSON.parse(readFileSync(join(resolve(outDir), f), "utf8"));
  const m = mapping[j.pair];
  if (!m) throw new Error(`no mapping for ${j.pair}`);
  const arm = (label) => (label === "X" ? m.X : m.Y);
  rows.push({
    pair: j.pair, brief: m.brief, round: m.round,
    X_is: m.X, Y_is: m.Y,
    winner_label: j.winner_label, winner: arm(j.winner_label),
    more_template_like: arm(j.more_template_like_label),
    [m.X]: j.X, [m.Y]: j.Y,
    rationale: j.rationale,
  });
}
mkdirSync(dirname(resolve(dest)), { recursive: true });
writeFileSync(resolve(dest), JSON.stringify(rows, null, 1));
const wins = { baseline: 0, engine: 0 };
for (const r of rows) wins[r.winner]++;
const avg = (arm, k) => (rows.reduce((a, r) => a + r[arm][k], 0) / rows.length).toFixed(2);
console.log(`judgements: ${rows.length}  wins:`, wins);
for (const k of ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"])
  console.log(k.padEnd(15), "baseline", avg("baseline", k), "engine", avg("engine", k));
console.log("engine judged more template-like:", rows.filter((r) => r.more_template_like === "engine").length, "/", rows.length);
