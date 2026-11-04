# v0.2.1 results

Reliability pass: fewer calls, fewer tokens, build_site one-shot. Design identity unchanged.

## Headline

- Blind pairwise judging: **engine won 0 / 12**, baseline won 12 / 12.
- Engine page judged *more template-like* in 12 / 12 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.9**, engine **5.6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.4 | -1.5 |
| typography | 8.3 | 6.1 | -2.2 |
| spacing | 7.7 | 6.2 | -1.5 |
| colour | 7.9 | 5.6 | -2.3 |
| product_visual | 8.2 | 4.5 | -3.7 |
| mobile | 7.3 | 6.4 | -0.9 |
| polish | 7.9 | 6 | -1.9 |
| originality | 7.6 | 3.3 | -4.3 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| minutewise r1 | baseline | 8.1 | 5.9 | engine |
| fieldnote r2 | baseline | 8.1 | 6.1 | engine |
| ledgerline r2 | baseline | 8 | 5.8 | engine |
| ledgerline r1 | baseline | 7.9 | 6.1 | engine |
| gridwise r2 | baseline | 8.1 | 5.3 | engine |
| minutewise r2 | baseline | 8.3 | 5.1 | engine |
| kilnco r2 | baseline | 7.4 | 5.1 | engine |
| atelier r2 | baseline | 7.1 | 5.9 | engine |
| kilnco r1 | baseline | 7.5 | 4.9 | engine |
| fieldnote r1 | baseline | 8.1 | 5.3 | engine |
| gridwise r1 | baseline | 7.9 | 6.3 | engine |
| atelier r1 | baseline | 7.6 | 5 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 6 | 6 |
| heuristic quality (0-100) | 88.7 | 94.2 |
| originality score (0-100) | 95 | 100 |
| slop score (0-100, higher is cleaner) | 95 | 100 |
| slop findings | 0.8 | 0 |
| audit errors | 1.8 | 0 |
| audit warnings | 7.2 | 0 |
| neutral interaction checks passed | 17/18 | 17/18 |
| inline SVG illustrations | 6.8 | 46.7 |
| font families | 2.3 | 3 |
| distinct colours | 18.2 | 13.5 |
| spacing on 4px grid (%) | 85.7 | 89.7 |
| source size (KB) | 53.6 | 83.5 |

## Engine-arm agent cost

Agents: 6. Tokens per agent: 75,739-96,362. Tool calls: 17-36. Wall-clock seconds: 177-358.

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
