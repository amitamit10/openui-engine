# v0.9.0 results

Controlled benchmark of the engine at commit fe2959d (v0.8.0 plus swiss-grid, testimonial-wall, schedule and category fixes, a deeper two-tone secondary accent, and gate checks for invisible text and empty grid holes). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (foxglove florist, kestrel credit union, cadenza music academy, podhaven podcast hosting), engine frozen for the run. RESULT: engine 0/8, judged more template-like in 8/8; a regression from v0.8.0 (2/8) and the worst since v0.5.1. Judges' recurring words for the engine pages: centred hero plus browser-frame mockup, beige and green palette, card grids, weak spacing and empty gaps (a hero card with a dead empty lower strip), abstract or blob feature illustrations; for the baselines: bolder serif headline, richer and more specific palette per brief (plum and apricot for the florist, green and amber for the credit union), a specific hero object (practice card with staff and keys, balance and loan cards, an episode dashboard). The agents again chose the older field-notes or editorial-paper styles by patch, so the new styles were barely exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 105k-129k vs baseline 103k-120k, tool calls 18-40 vs 15-26. DEFECTS named by agents (to fix): features[].art given as an object was silently ignored (only a plain SVG string worked); the florist category fell through to the SaaS template; the engine tints alternate feature cards in a different hue (the new two-tone layer) which an agent read as inconsistent; a hero schedule visual rendered empty on a first attempt. CONFOUNDS: several agents deleted their own scratch files. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 0 / 8**, baseline won 8 / 8.
- Engine page judged *more template-like* in 8 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.7**, engine **6.4**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6.6 | -1.4 |
| typography | 8.3 | 6.8 | -1.5 |
| spacing | 7.5 | 6.5 | -1 |
| colour | 8 | 6.5 | -1.5 |
| product_visual | 7.9 | 6.8 | -1.1 |
| mobile | 7 | 6.5 | -0.5 |
| polish | 7.6 | 6.3 | -1.3 |
| originality | 7.5 | 5.5 | -2 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| cadenza r1 | baseline | 8.1 | 6.5 | engine |
| cadenza r2 | baseline | 8 | 5.9 | engine |
| foxglove r1 | baseline | 7.4 | 6.3 | engine |
| foxglove r2 | baseline | 7.4 | 6.8 | engine |
| kestrel r1 | baseline | 7.6 | 6.5 | engine |
| kestrel r2 | baseline | 7.4 | 6 | engine |
| podhaven r1 | baseline | 7.9 | 6.5 | engine |
| podhaven r2 | baseline | 8 | 7 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 86.3 | 94 |
| originality score (0-100) | 95.3 | 95.5 |
| slop score (0-100, higher is cleaner) | 95.3 | 95.5 |
| slop findings | 1 | 0.5 |
| audit errors | 6 | 0 |
| audit warnings | 2.8 | 0.3 |
| neutral interaction checks passed | 9/12 | 10/12 |
| inline SVG illustrations | 7.8 | 30 |
| font families | 2 | 3 |
| distinct colours | 18.8 | 14.8 |
| spacing on 4px grid (%) | 85.4 | 89.6 |
| source size (KB) | 55.4 | 109.9 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 105,389-129,433 (baseline arm in the same run: 102,811-119,752). Tool calls: 18-40 (baseline arm: 15-26). Wall-clock seconds: 186-352 (baseline arm: 201-224).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| foxglove | 119,956 | 29 | 324 |
| kestrel | 106,030 | 18 | 186 |
| cadenza | 129,433 | 40 | 352 |
| podhaven | 105,389 | 25 | 253 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
