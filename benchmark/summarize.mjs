// Builds results/<release>/summary.json + REPORT.md and results/README.md from raw data.
// usage: node benchmark/summarize.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIMS = ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"];

// Agent usage as reported by the harness completion notifications (engine arm only).
// v0.2.0 / v0.2.1: ranges recorded at the time; v0.3.0: per agent.
const USAGE = {
  "v0.2.0": { agents: 3, tokens: "118,871-145,517", toolCalls: "42-62", seconds: "321-519", perAgent: null },
  "v0.2.1": { agents: 6, tokens: "75,739-96,362", toolCalls: "17-36", seconds: "177-358", perAgent: null },
  "v0.3.1": { agents: 0, tokens: "0 (deterministic replay)", toolCalls: "0", seconds: "about 30 per build", perAgent: null },
  "v0.3.0": {
    agents: 6, tokens: "88,456-104,393", toolCalls: "23-40", seconds: "222-415",
    perAgent: {
      fieldnote: { tokens: 89773, toolCalls: 26, seconds: 377 },
      ledgerline: { tokens: 88456, toolCalls: 23, seconds: 258 },
      minutewise: { tokens: 99681, toolCalls: 40, seconds: 415 },
      atelier: { tokens: 104393, toolCalls: 35, seconds: 357 },
      kilnco: { tokens: 89415, toolCalls: 25, seconds: 258 },
      gridwise: { tokens: 91189, toolCalls: 27, seconds: 222 },
    },
  },
};

const NOTES = {
  "v0.3.1": "Deterministic REPLAY, not a new model run: the six briefs written by the v0.3.0 Haiku agents were rebuilt unchanged with the engine after two fixes (split hero respects its mobile breakpoint; feature section defaults to alternating rows so every product visual is on screen, instead of one-at-a-time tabs). No hand edits. It isolates the engine change but is NOT a fair estimate of a fresh agent run: the briefs were written while the agents looked at tab-based output, and the layout change was designed after reading the v0.3.0 judges' complaints about those same sites (tuning to the judged set).",
  "v0.2.0": "First engine-guided run with the 19-tool surface. Engine agents needed many calls to get a passing build.",
  "v0.2.1": "Reliability pass: fewer calls, fewer tokens, build_site one-shot. Design identity unchanged.",
  "v0.3.0": "Design-identity pass: tone-driven art direction (new field-notes style), composable product screens (`ui` visual), non-violet accents. " +
    "CONFOUND: 5 of 6 agents hand-patched a real engine CSS bug (the split hero ignored its mobile breakpoint, so the product panel overlapped the headline at 390px) in the delivered site; the atelier agent also hand-edited price formatting and copy. The bug is fixed in source afterwards (see v0.3.1 / commit da2cb88) but these results measure the sites as delivered, hand edits included.",
};

const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const r1 = (n) => Math.round(n * 10) / 10;

function armMetrics(res, arm) {
  const rows = Object.entries(res).filter(([k]) => k.endsWith("-" + arm)).map(([, v]) => v);
  if (!rows.length) return null;
  return {
    sites: rows.length,
    quality: r1(mean(rows.map((x) => x.quality.overall))),
    originalityScore: r1(mean(rows.map((x) => x.quality.dimensions.originality ?? 0))),
    slopScore: r1(mean(rows.map((x) => x.slop.score))),
    slopFindings: r1(mean(rows.map((x) => x.slop.findings.length))),
    auditErrors: r1(mean(rows.map((x) => x.audit.totals.errors))),
    auditWarnings: r1(mean(rows.map((x) => x.audit.totals.warnings))),
    neutralChecksPassed: `${rows.reduce((a, x) => a + x.neutral.filter((n) => n.passed).length, 0)}/${rows.reduce((a, x) => a + x.neutral.length, 0)}`,
    svgs: r1(mean(rows.map((x) => x.discipline.svgs))),
    fontFamilies: r1(mean(rows.map((x) => x.discipline.fontFamilies.length))),
    distinctColors: r1(mean(rows.map((x) => x.discipline.distinctTextColorsAndFills))),
    spacingOn4px: r1(mean(rows.map((x) => x.discipline.spacingOn4pxGrid)) * 100),
    sourceKB: r1(mean(rows.map((x) => x.source.totalBytes)) / 1024),
  };
}

const releases = ["v0.2.0", "v0.2.1", "v0.3.0", "v0.3.1"];
const summaries = {};
for (const rel of releases) {
  const dir = join("results", rel);
  const res = JSON.parse(readFileSync(join(dir, "data", "results.json"), "utf8"));
  const judges = JSON.parse(readFileSync(join(dir, "raw", "judges.json"), "utf8"));
  const wins = { baseline: 0, engine: 0 };
  judges.forEach((j) => wins[j.winner]++);
  const scores = {};
  for (const arm of ["baseline", "engine"]) scores[arm] = Object.fromEntries(DIMS.map((d) => [d, r1(mean(judges.map((j) => j[arm][d])))]));
  const meanAll = (arm) => r1(mean(DIMS.map((d) => scores[arm][d])));
  const s = {
    release: rel, note: NOTES[rel],
    briefs: [...new Set(judges.map((j) => j.brief))],
    judgements: judges.length, wins,
    engineWinRatePct: Math.round((wins.engine / judges.length) * 100),
    engineJudgedMoreTemplateLike: judges.filter((j) => j.more_template_like === "engine").length,
    judgeScores: scores, judgeMeanOverall: { baseline: meanAll("baseline"), engine: meanAll("engine") },
    automated: { baseline: armMetrics(res, "baseline"), engine: armMetrics(res, "engine") },
    engineAgentUsage: USAGE[rel],
  };
  summaries[rel] = s;
  writeFileSync(join(dir, "summary.json"), JSON.stringify(s, null, 2));

  const pairs = judges.map((j) => `| ${j.brief} r${j.round} | ${j.winner} | ${r1(mean(DIMS.map((d) => j.baseline[d])))} | ${r1(mean(DIMS.map((d) => j.engine[d])))} | ${j.more_template_like} |`).join("\n");
  const dimRows = DIMS.map((d) => `| ${d} | ${scores.baseline[d]} | ${scores.engine[d]} | ${r1(scores.engine[d] - scores.baseline[d])} |`).join("\n");
  const a = s.automated;
  const md = `# ${rel} results

${s.note}

## Headline

- Blind pairwise judging: **engine won ${wins.engine} / ${judges.length}**, baseline won ${wins.baseline} / ${judges.length}.
- Engine page judged *more template-like* in ${s.engineJudgedMoreTemplateLike} / ${judges.length} pairs.
- Mean judge score (8 dimensions, 1-10): baseline **${s.judgeMeanOverall.baseline}**, engine **${s.judgeMeanOverall.engine}**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
${dimRows}

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
${pairs}

Raw verdicts, with the judges' own rationales where recorded, are in \`raw/judges.json\`. Screenshots and per-site audit JSON are in \`data/\`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | ${a.baseline.sites} | ${a.engine.sites} |
| heuristic quality (0-100) | ${a.baseline.quality} | ${a.engine.quality} |
| originality score (0-100) | ${a.baseline.originalityScore} | ${a.engine.originalityScore} |
| slop score (0-100, higher is cleaner) | ${a.baseline.slopScore} | ${a.engine.slopScore} |
| slop findings | ${a.baseline.slopFindings} | ${a.engine.slopFindings} |
| audit errors | ${a.baseline.auditErrors} | ${a.engine.auditErrors} |
| audit warnings | ${a.baseline.auditWarnings} | ${a.engine.auditWarnings} |
| neutral interaction checks passed | ${a.baseline.neutralChecksPassed} | ${a.engine.neutralChecksPassed} |
| inline SVG illustrations | ${a.baseline.svgs} | ${a.engine.svgs} |
| font families | ${a.baseline.fontFamilies} | ${a.engine.fontFamilies} |
| distinct colours | ${a.baseline.distinctColors} | ${a.engine.distinctColors} |
| spacing on 4px grid (%) | ${a.baseline.spacingOn4px} | ${a.engine.spacingOn4px} |
| source size (KB) | ${a.baseline.sourceKB} | ${a.engine.sourceKB} |

## Engine-arm agent cost

Agents: ${s.engineAgentUsage.agents}. Tokens per agent: ${s.engineAgentUsage.tokens}. Tool calls: ${s.engineAgentUsage.toolCalls}. Wall-clock seconds: ${s.engineAgentUsage.seconds}.
${s.engineAgentUsage.perAgent ? "\n| brief | tokens | tool calls | seconds |\n|---|---|---|---|\n" + Object.entries(s.engineAgentUsage.perAgent).map(([b, u]) => `| ${b} | ${u.tokens.toLocaleString("en-US")} | ${u.toolCalls} | ${u.seconds} |`).join("\n") + "\n" : ""}
## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
`;
  writeFileSync(join(dir, "REPORT.md"), md);
}

const row = (rel) => {
  const s = summaries[rel];
  return `| [${rel}](${rel}/REPORT.md) | ${s.judgements} | ${s.wins.engine} / ${s.judgements} | ${s.judgeMeanOverall.baseline} | ${s.judgeMeanOverall.engine} | ${s.judgeScores.engine.originality} | ${s.judgeScores.engine.product_visual} | ${s.engineAgentUsage.tokens} | ${s.engineAgentUsage.toolCalls} | ${s.engineAgentUsage.seconds} |`;
};
const idx = `# Results by release

Every release of OpenUI Engine is evaluated the same way: the same spec per brief, a clean workspace, a Haiku 5.5 builder with and without the engine, neutral automated measurements, then blind pairwise judging of screenshots.

| release | judgements | engine wins | baseline mean | engine mean | engine originality | engine product visual | engine tokens / agent | tool calls | seconds |
|---|---|---|---|---|---|---|---|---|---|
${releases.map(row).join("\n")}

The v0.1.0 run (three arms, the original experiment) is in [v0.1.0/REPORT.md](v0.1.0/REPORT.md).

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1; judged originality and product-visual scores rose in v0.3.0; and in v0.3.1 the engine won its first blind pairs (2 of 12). v0.3.1 is a replay of v0.3.0's briefs after a layout change made in response to the v0.3.0 judges, so it is tuned to the judged set and is not independent evidence. Across all releases the unguided Haiku baseline still wins the large majority of blind pairs (40 of 42 judgements).

Per-release folders contain \`REPORT.md\`, \`summary.json\`, \`raw/\` (judge verdicts) and \`data/\` (screenshots and audits). Regenerate the reports with \`node benchmark/summarize.mjs\`.
`;
writeFileSync(join("results", "README.md"), idx);
console.log(idx);
