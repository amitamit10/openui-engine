# v0.2.0 results

First engine-guided run with the 19-tool surface. Engine agents needed many calls to get a passing build.

## Headline

- Blind pairwise judging: **engine won 0 / 6**, baseline won 6 / 6.
- Engine page judged *more template-like* in 6 / 6 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.9**, engine **5.6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6.3 | -1.7 |
| typography | 8.3 | 5.7 | -2.6 |
| spacing | 7.3 | 6.3 | -1 |
| colour | 8 | 5.5 | -2.5 |
| product_visual | 8.8 | 5.2 | -3.6 |
| mobile | 7.3 | 6.3 | -1 |
| polish | 8 | 6.3 | -1.7 |
| originality | 7.8 | 3.5 | -4.3 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| fieldnote r1 | baseline | 8.3 | 5.1 | engine |
| fieldnote r2 | baseline | 8 | 5.5 | engine |
| ledgerline r1 | baseline | 7.9 | 6.3 | engine |
| ledgerline r2 | baseline | 7.9 | 5.4 | engine |
| minutewise r1 | baseline | 7.6 | 6.3 | engine |
| minutewise r2 | baseline | 8.1 | 5.4 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 3 | 3 |
| heuristic quality (0-100) | 87 | 94 |
| originality score (0-100) | 94.7 | 100 |
| slop score (0-100, higher is cleaner) | 94.7 | 100 |
| slop findings | 0.7 | 0 |
| audit errors | 3 | 0 |
| audit warnings | 7.3 | 0 |
| neutral interaction checks passed | 9/9 | 9/9 |
| inline SVG illustrations | 6.7 | 43 |
| font families | 2.3 | 3 |
| distinct colours | 18 | 10.7 |
| spacing on 4px grid (%) | 85.1 | 79.9 |
| source size (KB) | 55.6 | 80.2 |

## Engine-arm agent cost

Agents: 3. Tokens per agent: 118,871-145,517. Tool calls: 42-62. Wall-clock seconds: 321-519.

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
