// Packs label-sealed THREE-way judging sets (X/Y/Z) with two different position rotations per brief.
// usage: node benchmark/pack-blind3.mjs <dataDir> <outDir> <brief,brief,...> <armA,armB,armC>
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
const [, , dataDir, outDir, briefsArg, armsArg] = process.argv;
const arms = armsArg.split(","); let seed = 20261105; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const mapping = {}; mkdirSync(resolve(outDir), { recursive: true });
for (const brief of briefsArg.split(",")) {
  const perm = [...arms].sort(() => rnd() - 0.5);
  const rounds = [perm, [perm[1], perm[2], perm[0]]]; // second round rotates every arm to a new position
  rounds.forEach((order, ri) => {
    const id = `${brief}-3way-r${ri + 1}`; mapping[id] = { brief, round: ri + 1, X: order[0], Y: order[1], Z: order[2] };
    ["X", "Y", "Z"].forEach((label, li) => {
      const d = join(resolve(outDir), id, label); mkdirSync(d, { recursive: true });
      for (const vp of ["desktop", "mobile"]) for (const k of ["fold", "full"]) {
        const src = join(resolve(dataDir), `${brief}-${order[li]}`, `${brief}-${order[li]}-${vp}-${k}.png`);
        if (existsSync(src)) copyFileSync(src, join(d, `${vp}-${k}.png`));
      }
    });
  });
}
writeFileSync(join(resolve(outDir), "..", "blind_mapping3_SEALED.json"), JSON.stringify(mapping, null, 1));
console.log("packed", Object.keys(mapping).length, "three-way sets");
