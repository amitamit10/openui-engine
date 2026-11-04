// Packages randomized, label-sealed pairs for blind judging.
// usage: node benchmark/pack-blind.mjs <dataDir> <outDir> <brief:armA:armB>[,<brief:armA:armB>...]
// data layout: <dataDir>/<brief>-<arm>/<brief>-<arm>-{desktop,mobile}-{fold,full}.png
// Every pair is packaged TWICE with the X/Y order swapped (position-bias control). Mapping is written to a SEALED file.
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
const [, , dataDir, outDir, pairsArg] = process.argv;
let seed = 20261102; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const mapping = {};
mkdirSync(resolve(outDir), { recursive: true });
for (const spec of pairsArg.split(",")) {
  const [brief, armA, armB] = spec.split(":");
  const swap1 = rnd() < 0.5;
  for (const round of [1, 2]) {
    const flip = round === 1 ? swap1 : !swap1;
    const order = flip ? [armB, armA] : [armA, armB];
    const id = `${brief}-${armA}-vs-${armB}-r${round}`;
    mapping[id] = { brief, round, X: order[0], Y: order[1] };
    for (const [label, arm] of [["X", order[0]], ["Y", order[1]]]) {
      const d = join(resolve(outDir), id, label); mkdirSync(d, { recursive: true });
      for (const vp of ["desktop", "mobile"]) for (const k of ["fold", "full"]) {
        const src = join(resolve(dataDir), `${brief}-${arm}`, `${brief}-${arm}-${vp}-${k}.png`);
        if (existsSync(src)) copyFileSync(src, join(d, `${vp}-${k}.png`));
      }
    }
  }
}
writeFileSync(join(resolve(outDir), "..", "blind_mapping_SEALED.json"), JSON.stringify(mapping, null, 1));
console.log("packed", Object.keys(mapping).length, "judge pairs →", outDir);
