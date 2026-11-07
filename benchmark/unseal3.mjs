// usage: node benchmark/unseal3.mjs <judgeOutDir> <blind_mapping3_SEALED.json> <out judges3.json>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const [, , outDir, mapFile, dest] = process.argv;
const mapping = JSON.parse(readFileSync(resolve(mapFile), "utf8")); const rows = [];
const D = ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"];
for (const f of readdirSync(resolve(outDir)).filter((n) => n.endsWith(".json")).sort()) {
  const j = JSON.parse(readFileSync(join(resolve(outDir), f), "utf8")); const m = mapping[j.pair]; if (!m) throw new Error(`no mapping for ${j.pair}`);
  const arm = (l) => m[l]; const scores = {}; for (const l of ["X", "Y", "Z"]) scores[arm(l)] = j[l];
  rows.push({ pair: j.pair, brief: m.brief, round: m.round, ranking: j.ranking.map(arm), template_like: arm(j.most_template_like_label), scores, rationale: j.rationale });
}
writeFileSync(resolve(dest), JSON.stringify(rows, null, 1));
const arms = Object.keys(rows[0].scores); const out = {};
for (const a of arms) {
  out[a] = { firsts: rows.filter((r) => r.ranking[0] === a).length, lasts: rows.filter((r) => r.ranking[2] === a).length, meanRank: +(rows.reduce((s, r) => s + r.ranking.indexOf(a) + 1, 0) / rows.length).toFixed(2), templateLike: rows.filter((r) => r.template_like === a).length, dims: Object.fromEntries(D.map((d) => [d, +(rows.reduce((s, r) => s + r.scores[a][d], 0) / rows.length).toFixed(2)])) };
}
const pair = {}; for (const a of arms) for (const b of arms) if (a < b) { const w = rows.filter((r) => r.ranking.indexOf(a) < r.ranking.indexOf(b)).length; pair[`${a} beats ${b}`] = `${w}-${rows.length - w}`; }
console.log(JSON.stringify({ judgements: rows.length, perArm: out, pairwise: pair }, null, 1));
