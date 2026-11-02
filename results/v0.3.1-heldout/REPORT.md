# v0.3.1-heldout results

FRESH, HELD-OUT run: four briefs the engine was never tuned on (pawpath vet network, summitworks climbing gym, freightly freight tracking, parlato Italian tutoring), new Haiku 5.5 builders for both arms using the original builder prompts verbatim, the engine as of the feature-rows commit, then blind pairwise judging. This is the cleanest evidence in the repo. CONFOUNDS: (1) the parlato and freightly engine agents hit a real bug (feature-rows silently dropped the 5th feature, which the spec requires) and hand-added it (parlato in HTML; freightly via page.json plus rebuild_project and a manual copy of dist/ into site/; freightly also swapped one chart visual for a table after a renderer crash); parlato also hand-edited the features heading. (2) I rebuilt the engine dist while the summitworks engine agent was still running, so part of that run used a newer build. (3) The fixes for the dropped feature, the chart crash and rebuild_project deploy are in later commits and are NOT reflected in these sites. (4) The shared scratchpad let one baseline agent's check script be overwritten by another's.

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 5 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.5**, engine **6.1**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.1 | -1.8 |
| typography | 7.6 | 6.4 | -1.2 |
| spacing | 7.1 | 5.6 | -1.5 |
| colour | 7.9 | 6.4 | -1.5 |
| product_visual | 7.8 | 6.6 | -1.2 |
| mobile | 7.1 | 6 | -1.1 |
| polish | 7.5 | 5.8 | -1.7 |
| originality | 7 | 5.6 | -1.4 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| freightly r1 | baseline | 7.1 | 6.3 | baseline |
| freightly r2 | baseline | 7.6 | 5.4 | baseline |
| parlato r1 | baseline | 7.6 | 5.5 | engine |
| parlato r2 | baseline | 7.6 | 6 | engine |
| pawpath r1 | engine | 7 | 7.8 | baseline |
| pawpath r2 | baseline | 7.6 | 6 | engine |
| summitworks r1 | baseline | 7.6 | 6 | engine |
| summitworks r2 | baseline | 7.6 | 5.6 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 85.5 | 95 |
| originality score (0-100) | 94.5 | 100 |
| slop score (0-100, higher is cleaner) | 94.5 | 100 |
| slop findings | 1.5 | 0 |
| audit errors | 4 | 0 |
| audit warnings | 5.3 | 0 |
| neutral interaction checks passed | 10/12 | 12/12 |
| inline SVG illustrations | 10.5 | 31.3 |
| font families | 2 | 3 |
| distinct colours | 18 | 13.3 |
| spacing on 4px grid (%) | 74.1 | 89 |
| source size (KB) | 59.3 | 83.4 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 80,420-95,448. Tool calls: 21-29. Wall-clock seconds: 263-488.

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| pawpath | 80,420 | 21 | 263 |
| parlato | 95,448 | 26 | 279 |
| freightly | 91,242 | 29 | 364 |
| summitworks | 87,330 | 29 | 488 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
