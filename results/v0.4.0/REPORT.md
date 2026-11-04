# v0.4.0 results

FRESH run on four never-seen domains (reedlaw employment-law firm, crumbco artisan bakery, helio rooftop solar, codewell coding bootcamp): new Haiku 5.5 builders for both arms, original builder prompts verbatim, engine frozen at v0.4.0 (art-direction variety, layered hero floats, dark metrics band, feature-rows, chart and rebuild fixes), then blind pairwise judging. No engine-arm agent needed a hand edit this time. CAVEATS: the style keywords added for v0.4.0 were informed by the PREVIOUS held-out briefs' domains (pets, climbing, freight, tutoring), not these four; three agents independently reported that the hero float chips partly cover other hero content (a defect, fixed after this run); the reedlaw agent reported duplicate section ids, a hardcoded 'Save 20%' badge and no per-tier pricing unit (all fixed after this run); baseline agents shared a scratchpad directory and several had their check scripts overwritten by other agents' (they re-verified with unique names).

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 7 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.6**, engine **6.3**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.5 | -1.4 |
| typography | 8.3 | 6.3 | -2 |
| spacing | 7.4 | 6.1 | -1.3 |
| colour | 7.9 | 6.3 | -1.6 |
| product_visual | 7.1 | 7.4 | 0.3 |
| mobile | 6.9 | 6.4 | -0.5 |
| polish | 7.6 | 5.9 | -1.7 |
| originality | 7.4 | 5.5 | -1.9 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| codewell r1 | baseline | 7.6 | 5.6 | engine |
| codewell r2 | baseline | 8 | 5.8 | engine |
| crumbco r1 | baseline | 7.8 | 6.5 | engine |
| crumbco r2 | baseline | 7.6 | 6 | engine |
| helio r1 | engine | 6.1 | 7.5 | baseline |
| helio r2 | baseline | 7.5 | 6.1 | engine |
| reedlaw r1 | baseline | 7.8 | 6 | engine |
| reedlaw r2 | baseline | 8 | 6.8 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 81.8 | 95 |
| originality score (0-100) | 91.5 | 100 |
| slop score (0-100, higher is cleaner) | 91.5 | 100 |
| slop findings | 1 | 0 |
| audit errors | 6.3 | 0 |
| audit warnings | 7.8 | 0 |
| neutral interaction checks passed | 9/12 | 11/12 |
| inline SVG illustrations | 5.5 | 33 |
| font families | 2.5 | 3 |
| distinct colours | 18.5 | 14.3 |
| spacing on 4px grid (%) | 86.1 | 86.9 |
| source size (KB) | 53.7 | 86.2 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 77,598-95,242. Tool calls: 14-30. Wall-clock seconds: 175-346.

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| crumbco | 77,598 | 14 | 175 |
| helio | 85,276 | 24 | 218 |
| codewell | 94,685 | 22 | 217 |
| reedlaw | 95,242 | 30 | 346 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
