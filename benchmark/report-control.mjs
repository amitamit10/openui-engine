// Builds results/control-v0.4.1/{summary.json,REPORT.md} from the evaluation data + the two unsealed verdict sets.
import { readFileSync, writeFileSync } from "node:fs";
const D = "results/control-v0.4.1";
const DIMS = ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"];
const res = JSON.parse(readFileSync(`${D}/data/results.json`, "utf8"));
const sets = {
  "control vs hybrid": JSON.parse(readFileSync(`${D}/raw/judges-control-vs-hybrid.json`, "utf8")),
  "baseline vs control": JSON.parse(readFileSync(`${D}/raw/judges-baseline-vs-control.json`, "utf8")),
};
const r1 = (n) => Math.round(n * 100) / 100;
const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const summarise = (rows) => {
  const arms = [...new Set(rows.flatMap((r) => Object.keys(r.scores)))];
  const out = { judgements: rows.length, wins: {}, templateLike: {}, scores: {}, mean: {} };
  for (const a of arms) {
    out.wins[a] = rows.filter((r) => r.winner === a).length;
    out.templateLike[a] = rows.filter((r) => r.more_template_like === a).length;
    out.scores[a] = Object.fromEntries(DIMS.map((d) => [d, r1(mean(rows.map((r) => r.scores[a][d])))]));
    out.mean[a] = r1(mean(DIMS.map((d) => out.scores[a][d])));
  }
  return out;
};
const sum = Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, summarise(v)]));
const auto = {};
for (const a of ["baseline", "control", "hybrid"]) {
  const rows = Object.entries(res).filter(([k]) => k.endsWith("-" + a)).map(([, v]) => v);
  auto[a] = { sites: rows.length, auditErrors: rows.reduce((s, x) => s + x.audit.totals.errors, 0), auditWarnings: rows.reduce((s, x) => s + x.audit.totals.warnings, 0), quality: r1(mean(rows.map((x) => x.quality.overall))), slop: r1(mean(rows.map((x) => x.slop.score))) };
}
writeFileSync(`${D}/summary.json`, JSON.stringify({ release: "control-v0.4.1", comparisons: sum, automated: auto }, null, 2));

const dimTable = (s, A, B) => DIMS.map((d) => `| ${d} | ${s.scores[A][d]} | ${s.scores[B][d]} | ${r1(s.scores[B][d] - s.scores[A][d])} |`).join("\n");
const pairTable = (rows) => rows.map((j) => `| ${j.brief} r${j.round} | ${j.winner} | ${j.more_template_like} |`).join("\n");
const [cA, cB] = [sum["control vs hybrid"], sum["baseline vs control"]];
const md = `# control-v0.4.1: is it the engine's tools, or the prompt and the extra review?

The hybrid arm (hand-written page + the engine's QA tools) beat the unguided baseline 7 of 8 in [hybrid-v0.4.1](../hybrid-v0.4.1/REPORT.md), but it had two confounds: its prompt told the agent to "make your own design decisions", and it iterated more. This release adds the **control** arm that removes the engine tools but keeps both: same hand-written instruction, same *required* self-review loop (screenshots, overflow/console/contrast/tap-target checks, fix, re-check) using plain Playwright. Same four briefs (tidewater, ironbark, loomhouse, quartermaster), fresh Haiku 5.5 agents, blind Sonnet judges, both label orders.

## Result

| comparison | wins | judged more template-like | mean of 8 dimensions |
|---|---|---|---|
| **control vs hybrid** | control ${cA.wins.control} / hybrid ${cA.wins.hybrid} | control ${cA.templateLike.control} / hybrid ${cA.templateLike.hybrid} | control ${cA.mean.control} / hybrid ${cA.mean.hybrid} |
| **baseline vs control** | baseline ${cB.wins.baseline} / control ${cB.wins.control} | baseline ${cB.templateLike.baseline} / control ${cB.templateLike.control} | baseline ${cB.mean.baseline} / control ${cB.mean.control} |

**Reading it honestly:** the control, which has *no engine tools*, ties the hybrid (4-4) and ties the baseline (4-4). So the earlier 7/8 for the hybrid cannot be credited to the engine's tools: a generic design-it-yourself prompt plus a self-review loop does about as well, and the three arms are close on judged design quality. With 8 judgements per comparison, a 4-4 split cannot detect a small difference either way, and the 7/8 earlier result is an outlier against these two ties (judge calibration also differs between pair sets, so the three comparisons are not strictly comparable). In each brief both label orders picked the same winner (control won ironbark and quartermaster; hybrid won loomhouse and tidewater), so this is not a position-bias artefact.

### Control vs hybrid, by dimension

| dimension | control | hybrid | hybrid - control |
|---|---|---|---|
${dimTable(cA, "control", "hybrid")}

| pair | winner | more template-like |
|---|---|---|
${pairTable(sets["control vs hybrid"])}

### Baseline vs control, by dimension

| dimension | baseline | control | control - baseline |
|---|---|---|---|
${dimTable(cB, "baseline", "control")}

| pair | winner | more template-like |
|---|---|---|
${pairTable(sets["baseline vs control"])}

## Where the engine's tools do show an objective advantage

Automated gate on all 12 sites (same gate for every arm; sum over 4 sites):

| arm | audit errors | audit warnings | heuristic quality | slop score |
|---|---|---|---|---|
| baseline | ${auto.baseline.auditErrors} | ${auto.baseline.auditWarnings} | ${auto.baseline.quality} | ${auto.baseline.slop} |
| control (generic self-review) | ${auto.control.auditErrors} | ${auto.control.auditWarnings} | ${auto.control.quality} | ${auto.control.slop} |
| hybrid (engine QA tools) | ${auto.hybrid.auditErrors} | ${auto.hybrid.auditWarnings} | ${auto.hybrid.quality} | ${auto.hybrid.slop} |

The hybrid shipped **0 audit errors on all four sites**; the control, despite a required self-review, still shipped ${auto.control.auditErrors} (axe-type issues such as contrast and small text that a hand-rolled check missed); the baseline ${auto.baseline.auditErrors}. Caveat: the hybrid agents were optimising against this very gate (validate_design uses the same audit code), so this is partly circular, though axe-core accessibility violations are real defects regardless of who measures them.

## What this means for the product

* **Supported:** the engine's QA gate reliably removes real defects (contrast, overflow, console errors, tap targets, broken interactions) from hand-written pages, beyond what a generic self-review catches.
* **Not supported:** that the engine makes a cheap model's design *look better* than that model working freely with a good prompt and a review loop. Judged design quality is about the same across baseline, control and hybrid.
* **Not supported (and falsified for the generator path):** that composing the page from the engine's templates helps; see the generator releases (engine 1 of 8 twice on unseen domains).

## Limits

n = 4 briefs, 8 judgements per comparison, one build per brief and arm, Sonnet judging Haiku from screenshots, shared scratchpad between agents (several re-verified after their scripts were overwritten; no cross-contamination found in the delivered sites), and the judges for the three arm comparisons ran as separate pair sets. Substitute model: Haiku 5.5 for the GPT-6 Luna the original brief named.
`;
writeFileSync(`${D}/REPORT.md`, md);
console.log(JSON.stringify(sum["control vs hybrid"].wins), JSON.stringify(sum["baseline vs control"].wins));
