# v0.3.1 results

Deterministic REPLAY, not a new model run: the six briefs written by the v0.3.0 Haiku agents were rebuilt unchanged with the engine after two fixes (split hero respects its mobile breakpoint; feature section defaults to alternating rows so every product visual is on screen, instead of one-at-a-time tabs). No hand edits. It isolates the engine change but is NOT a fair estimate of a fresh agent run: the briefs were written while the agents looked at tab-based output, and the layout change was designed after reading the v0.3.0 judges' complaints about those same sites (tuning to the judged set).

## Headline

- Blind pairwise judging: **engine won 2 / 12**, baseline won 10 / 12.
- Engine page judged *more template-like* in 10 / 12 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.7**, engine **6.5**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6.8 | -1.2 |
| typography | 8.1 | 6.9 | -1.2 |
| spacing | 7.8 | 6.3 | -1.5 |
| colour | 7.8 | 6.4 | -1.4 |
| product_visual | 7.5 | 7.2 | -0.3 |
| mobile | 7.3 | 6.3 | -1 |
| polish | 8 | 6.5 | -1.5 |
| originality | 7.3 | 5.6 | -1.7 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| atelier r1 | baseline | 7.8 | 5.6 | engine |
| atelier r2 | baseline | 7.6 | 6.3 | engine |
| fieldnote r1 | baseline | 8 | 6.9 | engine |
| fieldnote r2 | baseline | 7.9 | 6.8 | engine |
| gridwise r1 | baseline | 8 | 6.6 | engine |
| gridwise r2 | baseline | 7.9 | 5.6 | engine |
| kilnco r1 | baseline | 7.9 | 6 | engine |
| kilnco r2 | baseline | 7.9 | 5.9 | engine |
| ledgerline r1 | baseline | 7.8 | 6 | engine |
| ledgerline r2 | baseline | 7.6 | 6.4 | engine |
| minutewise r1 | engine | 7.1 | 8 | baseline |
| minutewise r2 | engine | 7.3 | 7.9 | baseline |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 6 | 6 |
| heuristic quality (0-100) | 88.7 | 94.7 |
| originality score (0-100) | 95 | 100 |
| slop score (0-100, higher is cleaner) | 95 | 100 |
| slop findings | 0.8 | 0 |
| audit errors | 1.8 | 0 |
| audit warnings | 7.2 | 0 |
| neutral interaction checks passed | 17/18 | 18/18 |
| inline SVG illustrations | 6.8 | 32 |
| font families | 2.3 | 2.8 |
| distinct colours | 18.2 | 12.5 |
| spacing on 4px grid (%) | 85.6 | 88.7 |
| source size (KB) | 53.6 | 82.5 |

## Engine-arm agent cost

Agents: 0. Tokens per agent: 0 (deterministic replay). Tool calls: 0. Wall-clock seconds: about 30 per build.

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
