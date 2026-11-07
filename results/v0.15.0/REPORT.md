# v0.15.0 — control for v0.14.0: Haiku with NO engine tools but a required review-and-improve loop, vs Haiku + engine

Same six briefs, same specs, same 60-call limit, same Playwright tools. The control arm had no engine tools but was told to run at least three build/review rounds: write its own check script, take full-page and per-section screenshots, critique them as a design director, fix and repeat. Engine arm = the outputs from v0.14.0 (re-evaluated). Sealed, position-swapped Sonnet judges, same rubric. Raw data, sites, prompts, sealed mapping and judge JSON are in this folder (`sites/*-control`; engine sites are in `../v0.14.0/sites`).

## Result: the engine arm lost, 3 wins to 9 of 12 judgements
By brief: control won clearwater 2-0, ember 2-0, kelpline 2-0, tilde 2-0; ines 1-1; **engine won only halden 2-0**. Engine arm judged more template-like in 9 of 12.

| dimension | control (no engine) | Haiku + engine |
|---|---|---|
| hierarchy | 7.75 | 7.25 |
| typography | 8.00 | 7.42 |
| spacing | 7.25 | 7.08 |
| colour | 7.75 | 7.17 |
| product_visual | 7.92 | 6.92 |
| mobile | 7.00 | 6.92 |
| polish | 7.58 | 7.17 |
| originality | 7.50 | 6.17 |

## Cost (harness-reported, per agent mean)
| | Haiku alone (v0.14.0) | control (iterates) | Haiku + engine |
|---|---|---|---|
| tokens | 106,430 | 141,860 | 118,392 |
| tool calls | 15.3 | 29.7 | 24.8 |
| seconds | 218 | 327 | 290 |

The control spent more than the engine arm (+20% tokens, +13% time), so this is not a like-for-like budget comparison; it shows that spending more on review beat the engine's pieces, not that the engine is more efficient.

## What this means
- **The v0.14.0 win (10/12 over plain Haiku) is explained by iteration depth, not by engine content.** When the no-engine control is required to review its own screenshots as a design director would, it beats the engine arm 9-3. This matches the earlier hybrid result (control-v0.4.1: control tied hybrid).
- The one place the engine arm won was halden (architecture), where the agent took the editorial-paper tokens from `generate_design_system`; with n=1 brief that is anecdote, not evidence.
- The objective audit still favours the engine arm (mean errors 0.17 vs 3.50, warnings 0.3 vs 5.7) but that audit is the engine's own checker, which only the engine arm had; it did not translate into better judged design.
- Caveats: 6 briefs, Sonnet judges only, evaluation-environment rendering, control arm spent more budget. Not deployed (no `VERCEL_TOKEN`).

## Consequence for the project
On this evidence the engine does **not** currently make Haiku produce more professional pages than Haiku given a good iteration protocol. The measured lever is the protocol (build, screenshot per section, design-director critique, fix, repeat). Next experiment: put that protocol into the engine (server instructions plus a section-by-section review tool) and test it against the same control, instead of claiming credit for the existing pieces.
