// Packages randomized, label-sealed pairs for blind judging.
// usage: node benchmark/pack-blind.mjs <resultsDir> <outDir> <briefs comma list>
// results layout: <resultsDir>/<brief>-<arm>/<brief>-<arm>-{desktop,mobile}-{fold,full}.png
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
const [, , resDir, outDir, briefsArg] = process.argv;
const briefs = briefsArg.split(",");
// deterministic PRNG so the packaging is reproducible
let seed = 20261102; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const mapping = {};
mkdirSync(resolve(outDir), { recursive: true });
for (const brief of briefs) for (const round of [1, 2]) {
  // round 1 and 2 present the same pair with swapped label order (position-bias control)
  const flip = round === 1 ? rnd() < 0.5 : mapping[`${brief}#1`].flip === false;
  const order = flip ? ["engine", "baseline"] : ["baseline", "engine"];
  const id = `${brief}-r${round}`;
  mapping[`${brief}#${round}`] = { id, flip, X: order[0], Y: order[1] };
  for (const [label, arm] of [["X", order[0]], ["Y", order[1]]]) {
    const d = join(resolve(outDir), id, label); mkdirSync(d, { recursive: true });
    for (const vp of ["desktop", "mobile"]) for (const k of ["fold", "full"]) {
      const src = join(resolve(resDir), `${brief}-${arm}`, `${brief}-${arm}-${vp}-${k}.png`);
      if (existsSync(src)) copyFileSync(src, join(d, `${vp}-${k}.png`));
    }
  }
}
writeFileSync(join(resolve(outDir), "..", "blind_mapping_SEALED.json"), JSON.stringify(mapping, null, 1));
console.log("packed", Object.keys(mapping).length, "judge pairs →", outDir);
