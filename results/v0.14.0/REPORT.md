# v0.14.0 — controlled A/B: Haiku alone vs Haiku + OpenUI Engine (6 unseen categories)

Engine frozen at `d944bf8`. Same model (Haiku 5.5), same SPEC.md per brief, same 60-call limit, same normal coding tools and Playwright screenshot feedback in both arms. The only difference: the engine arm also had the OpenUI Engine MCP tools and was free to use them however it liked. Briefs were written fresh for this run (conference, charity, photographer, architecture studio, language school, restaurant); nothing in the engine was tuned to them. Raw outputs, screenshots, sealed mapping, judge JSON, prompts and the generated sites are in this folder.

## Blind judging (12 judgements, each pair shown twice with X/Y swapped; Sonnet judges, 8-dimension rubric)
**Engine arm won 10 of 12** (baseline 2). By brief: clearwater 2-0, ember 2-0, halden 2-0, ines 2-0 to the engine arm; kelpline 1-1; tilde 1-1. Engine arm judged more template-like in 2 of 12.

| dimension | Haiku alone | Haiku + engine |
|---|---|---|
| hierarchy | 7.17 | 7.83 |
| typography | 7.17 | 8.00 |
| spacing | 7.00 | 7.33 |
| colour | 7.17 | 7.75 |
| product_visual | 6.58 | 7.83 |
| mobile | 6.83 | 6.92 |
| polish | 7.17 | 7.50 |
| originality | 5.67 | 7.33 |

Mobile is essentially tied. The two judgements per brief are not independent, so the honest unit is the brief: 4 engine wins, 2 ties, 0 baseline wins.

## Cost
| | Haiku alone | Haiku + engine |
|---|---|---|
| tokens per agent (mean) | 106,430 | 118,392 (+11%) |
| tool calls (mean) | 15.3 | 24.8 (+62%) |
| wall-clock seconds (mean) | 218 | 290 (+33%) |

## Objective checks (neutral evaluator) — read the caveat
Mean audit errors 3.5 vs 0.17, warnings 7.2 vs 0.3; distinct font sizes 19.5 vs 13.8; distinct colours 19.5 vs 15.3; 4px-grid spacing 0.85 vs 0.87. **Caveat: the evaluator's audit is the same engine verify package the engine arm ran as `validate_design`, so the engine arm had effectively been tested against it; the audit gap is not independent evidence.** The evaluator's "pricing toggle" check failed for all 12 pages (it cannot find these custom toggles); every agent verified its own toggle by hand, so that column is excluded.

## How the engine was actually used
No engine agent used `build_site`. All six wrote their pages by hand and used the engine as a reference and checker:
| brief | engine tools called |
|---|---|
| clearwater | generate_palette (rejected), detect_ai_slop, validate_design |
| kelpline | style_pack (output not used: "clarity-light" looked generic), detect_ai_slop |
| tilde | style_pack (palette reference only), validate_design, detect_ai_slop |
| halden | style_pack (not used), generate_design_system (tokens used), validate_design, capture_preview |
| ember | generate_palette, suggest_layout (section order followed), validate_design |
| ines | style_pack (tokens + editorial direction used), validate_design, capture_preview |

Five of six agents had at least one tool call fail on argument shape (missing `outDir`, `name`, etc.).

## What this does and does not show
- Supports: with identical model, budget and screenshot tooling, pages from the engine arm were judged better in 4 of 6 categories and never worse overall, driven by hero product visuals, originality and typography.
- Does NOT isolate the cause. Baseline agents used only 13-19 of 60 allowed calls; engine agents iterated more (25 calls, +33% time). Part of the gain may be extra iteration prompted by `validate_design` findings rather than engine content. A control arm told to iterate to a similar depth is still needed.
- 6 briefs, one judge model family, one rubric. Fonts and rendering are those of the evaluation environment.
- Not deployed: no `VERCEL_TOKEN` in this environment, so no live URLs. Screenshots and the static sites are included instead (`side-by-side/`, `sites/`).
