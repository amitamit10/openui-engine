# v0.3.0 results

Design-identity pass: tone-driven art direction (new field-notes style), composable product screens (`ui` visual), non-violet accents. CONFOUND: 5 of 6 agents hand-patched a real engine CSS bug (the split hero ignored its mobile breakpoint, so the product panel overlapped the headline at 390px) in the delivered site; the atelier agent also hand-edited price formatting and copy. The bug is fixed in source afterwards (see v0.3.1 / commit da2cb88) but these results measure the sites as delivered, hand edits included.

## Headline

- Blind pairwise judging: **engine won 0 / 12**, baseline won 12 / 12.
- Engine page judged *more template-like* in 11 / 12 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.8**, engine **5.8**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6 | -2 |
| typography | 8.2 | 6.3 | -1.9 |
| spacing | 7.6 | 5.3 | -2.3 |
| colour | 8 | 6.1 | -1.9 |
| product_visual | 8.2 | 6 | -2.2 |
| mobile | 7.3 | 6.1 | -1.2 |
| polish | 7.9 | 5.5 | -2.4 |
| originality | 7.5 | 5.1 | -2.4 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| atelier r1 | baseline | 7.9 | 5.6 | engine |
| atelier r2 | baseline | 7.8 | 6 | engine |
| fieldnote r1 | baseline | 8.1 | 6 | engine |
| fieldnote r2 | baseline | 7.8 | 5.8 | engine |
| gridwise r1 | baseline | 8 | 5.9 | engine |
| gridwise r2 | baseline | 7.9 | 5.9 | engine |
| kilnco r1 | baseline | 8 | 5.6 | engine |
| kilnco r2 | baseline | 7.8 | 5.8 | engine |
| ledgerline r1 | baseline | 7.6 | 5.6 | engine |
| ledgerline r2 | baseline | 7.8 | 5.6 | engine |
| minutewise r1 | baseline | 7.6 | 5.8 | engine |
| minutewise r2 | baseline | 7.9 | 6.1 | baseline |

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
| inline SVG illustrations | 6.8 | 39.5 |
| font families | 2.3 | 2.8 |
| distinct colours | 18.2 | 12.2 |
| spacing on 4px grid (%) | 85.6 | 91.3 |
| source size (KB) | 53.6 | 87.4 |

## Engine-arm agent cost

Agents: 6. Tokens per agent: 88,456-104,393. Tool calls: 23-40. Wall-clock seconds: 222-415.

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| fieldnote | 89,773 | 26 | 377 |
| ledgerline | 88,456 | 23 | 258 |
| minutewise | 99,681 | 40 | 415 |
| atelier | 104,393 | 35 | 357 |
| kilnco | 89,415 | 25 | 258 |
| gridwise | 91,189 | 27 | 222 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
