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
  "v0.4.0": {
    agents: 4, tokens: "77,598-95,242", toolCalls: "14-30", seconds: "175-346", perAgent: {
      crumbco: { tokens: 77598, toolCalls: 14, seconds: 175 },
      helio: { tokens: 85276, toolCalls: 24, seconds: 218 },
      codewell: { tokens: 94685, toolCalls: 22, seconds: 217 },
      reedlaw: { tokens: 95242, toolCalls: 30, seconds: 346 },
    },
  },
  "v0.3.1-heldout": {
    agents: 4, tokens: "80,420-95,448", toolCalls: "21-29", seconds: "263-488", perAgent: {
      pawpath: { tokens: 80420, toolCalls: 21, seconds: 263 },
      parlato: { tokens: 95448, toolCalls: 26, seconds: 279 },
      freightly: { tokens: 91242, toolCalls: 29, seconds: 364 },
      summitworks: { tokens: 87330, toolCalls: 29, seconds: 488 },
    },
  },
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
  "v0.4.0": "FRESH run on four never-seen domains (reedlaw employment-law firm, crumbco artisan bakery, helio rooftop solar, codewell coding bootcamp): new Haiku 5.5 builders for both arms, original builder prompts verbatim, engine frozen at v0.4.0 (art-direction variety, layered hero floats, dark metrics band, feature-rows, chart and rebuild fixes), then blind pairwise judging. No engine-arm agent needed a hand edit this time. CAVEATS: the style keywords added for v0.4.0 were informed by the PREVIOUS held-out briefs' domains (pets, climbing, freight, tutoring), not these four; three agents independently reported that the hero float chips partly cover other hero content (a defect, fixed after this run); the reedlaw agent reported duplicate section ids, a hardcoded 'Save 20%' badge and no per-tier pricing unit (all fixed after this run); baseline agents shared a scratchpad directory and several had their check scripts overwritten by other agents' (they re-verified with unique names).",
  "v0.3.1-heldout": "FRESH, HELD-OUT run: four briefs the engine was never tuned on (pawpath vet network, summitworks climbing gym, freightly freight tracking, parlato Italian tutoring), new Haiku 5.5 builders for both arms using the original builder prompts verbatim, the engine as of the feature-rows commit, then blind pairwise judging. This is the cleanest evidence in the repo. CONFOUNDS: (1) the parlato and freightly engine agents hit a real bug (feature-rows silently dropped the 5th feature, which the spec requires) and hand-added it (parlato in HTML; freightly via page.json plus rebuild_project and a manual copy of dist/ into site/; freightly also swapped one chart visual for a table after a renderer crash); parlato also hand-edited the features heading. (2) I rebuilt the engine dist while the summitworks engine agent was still running, so part of that run used a newer build. (3) The fixes for the dropped feature, the chart crash and rebuild_project deploy are in later commits and are NOT reflected in these sites. (4) The shared scratchpad let one baseline agent's check script be overwritten by another's.",
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

const releases = ["v0.2.0", "v0.2.1", "v0.3.0", "v0.3.1", "v0.3.1-heldout", "v0.4.0"];
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

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1; judged originality and product-visual scores rose in v0.3.0; and in the v0.3.1 replay the engine won its first blind pairs (2 of 12) - but that replay reuses v0.3.0's briefs after a layout change made in response to those same judges, so it is tuned to the judged set. The fresh held-out run on four new briefs is the honest test: the engine won 1 of 8, and was judged more template-like in 5 of 8. The v0.4.0 fresh run on four unseen domains is the latest honest test: engine 1 of 8, judged more template-like in 7 of 8. Across all releases the unguided Haiku baseline wins the large majority of blind pairs (54 of 58 judgements).

Per-release folders contain \`REPORT.md\`, \`summary.json\`, \`raw/\` (judge verdicts) and \`data/\` (screenshots and audits). Regenerate the reports with \`node benchmark/summarize.mjs\`.
`;
writeFileSync(join("results", "README.md"), idx);
console.log(idx);
