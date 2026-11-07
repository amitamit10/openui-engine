# v0.16.0 — engine with `review_sections` (6 fresh agents) vs the no-engine iterating control

Same six briefs, specs, 60-call limit, Playwright. Engine arm: fresh Haiku 5.5 agents, the **same prompt as v0.14.0** (no mention of the new tool), engine frozen at `0c42919` (adds `review_sections`, tolerant arguments, loose style names, pack fixes). Opponent: the v0.15.0 control (no engine tools, required review loop). Sealed, position-swapped Sonnet judges, same rubric. Raw data, sites (`sites/*-engine2`; control sites in `../v0.15.0/sites`), mapping and judge JSON are in this folder.

## Result: control won 11 of 12 judgements
By brief: control won clearwater, halden, ines, kelpline and tilde 2-0; ember split 1-1. Engine arm judged more template-like in 11 of 12.

| dimension | control | Haiku + engine (this round) |
|---|---|---|
| hierarchy | 7.92 | 7.00 |
| typography | 8.08 | 7.25 |
| spacing | 7.42 | 6.92 |
| colour | 8.00 | 6.83 |
| product_visual | 8.17 | 6.42 |
| mobile | 7.08 | 7.00 |
| polish | 7.83 | 6.83 |
| originality | 7.83 | 5.75 |

Cost per agent (mean, harness-reported): engine arm 120,920 tokens, 27.3 tool calls, 275 s; control 141,860 tokens, 29.7 calls, 327 s.

## What happened with the new tool
Only **1 of 6** agents called `review_sections` (ember: three calls; that brief split 1-1). The other five used the same pattern as before: `list`, a reference-only `style_pack` or `generate_design_system` (rejected as generic "clarity-light" in 4 of 6), `validate_design`, sometimes `detect_ai_slop`, then a hand-written page. So this round mostly measures a second sample of the engine arm; it does not test whether the section review helps, because agents did not use it. Having it in `list` and in the server instructions was not enough.

## Across all three comparisons on these six briefs
- Haiku alone vs Haiku + engine (v0.14.0): engine arm 10-2.
- Iterating control vs the same engine arm (v0.15.0): control 9-3.
- Iterating control vs a fresh engine arm (this round): control 11-1.
The consistent signal is that a Haiku that reviews and iterates on its own output beats a Haiku that has the engine's pieces but does not. The engine's own checker still favours its arm (mean audit errors 1.33 vs 3.50, warnings 0.17 vs 5.67), but that checker is the engine's and does not translate to judged design.

## Caveats
6 briefs, Sonnet judges only, rendering in the evaluation environment, control spent ~17% more tokens. Not deployed (no `VERCEL_TOKEN`).
