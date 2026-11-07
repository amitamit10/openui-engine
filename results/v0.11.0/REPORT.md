# v0.11.0 results

Controlled benchmark of the engine at commit 4850f56 (v0.10.0 plus: the icon sanitiser fix so rect-based Lucide icons draw, brand-tinted surfaces reverted to opt-in, style keywords for outdoor, catering, tree and forms briefs, and the earlier two-tone colour, gate and layout fixes). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (copperline plumbers, pagebound bookshop, saffron restaurant, tempo time-tracking software), engine frozen for the run. RESULT: engine 3/8 (baseline 5/8), judged more template-like in 5/8 (it was 8/8 in v0.9.0 and v0.10.0): the best generator result since the hybrid experiment, but still a loss. The three engine wins were tempo r1 and r2 (a software brief: editorial-paper, a Week 44 timesheet mockup hero, italic-accent serif headline) and copperline r2 (custom feature illustrations, a boiler hero). Typography is nearly tied (7.50 vs 7.38) and colour 7.50 vs 7.00. CAUTION: this is one run of 8 judgements over 4 briefs, the wins cluster on two briefs, and several things changed at once (icon fix, tint revert, matcher, new briefs), so the improvement cannot be attributed to any one change; the previous two runs went 0/8. The agents again patched style, so the new styles were largely not exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 104k-118k vs baseline 96k-130k, tool calls 18-24 vs 11-21, time 186-274 s vs 181-310 s: roughly comparable this run. DEFECTS named by agents (to fix): the brief patch did not take the testimonials, pricing and FAQ section title keys, so those headings stay generic; one agent's own report miscounted its feature cards (the page had 5, the report said 4). CONFOUNDS: one MCP agent left a preview-screenshots folder inside its deliverable (the evaluator ignores it); one baseline agent edited its HTML after its last browser check; several agents deleted their own scratch files. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 3 / 8**, baseline won 5 / 8.
- Engine page judged *more template-like* in 5 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.3**, engine **6.8**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.8 | 7 | -0.8 |
| typography | 7.5 | 7.4 | -0.1 |
| spacing | 7.1 | 6.5 | -0.6 |
| colour | 7.5 | 7 | -0.5 |
| product_visual | 7.3 | 6.5 | -0.8 |
| mobile | 7.1 | 6.8 | -0.3 |
| polish | 7.4 | 6.8 | -0.6 |
| originality | 6.8 | 6.1 | -0.7 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| copperline r1 | baseline | 7.9 | 6.5 | engine |
| copperline r2 | engine | 7.1 | 8 | baseline |
| pagebound r1 | baseline | 7.5 | 6.6 | engine |
| pagebound r2 | baseline | 7.6 | 5.4 | engine |
| saffron r1 | baseline | 7.6 | 6 | engine |
| saffron r2 | baseline | 7.8 | 5.9 | engine |
| tempo r1 | engine | 6.6 | 7.9 | baseline |
| tempo r2 | engine | 6.3 | 7.8 | baseline |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 86 | 95 |
| originality score (0-100) | 93.8 | 100 |
| slop score (0-100, higher is cleaner) | 93.8 | 100 |
| slop findings | 1.3 | 0 |
| audit errors | 5 | 0 |
| audit warnings | 4.3 | 0 |
| neutral interaction checks passed | 9/12 | 9/12 |
| inline SVG illustrations | 8.8 | 29.3 |
| font families | 2.5 | 3 |
| distinct colours | 16.5 | 13.3 |
| spacing on 4px grid (%) | 70.9 | 93.5 |
| source size (KB) | 50.6 | 103.9 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 103,575-118,324 (baseline arm in the same run: 96,499-129,832). Tool calls: 18-24 (baseline arm: 11-21). Wall-clock seconds: 186-274 (baseline arm: 181-310).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| copperline | 107,853 | 18 | 272 |
| pagebound | 118,324 | 20 | 274 |
| saffron | 113,562 | 24 | 272 |
| tempo | 103,575 | 20 | 186 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
