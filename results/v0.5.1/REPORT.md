# v0.5.1 results

Controlled benchmark of the v0.5.1 engine (drawn domain scenes for non-software heroes, bigger headline tiers, dark featured pricing tier). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (ashby coffee roastery, cornerstone conveyancing law firm, oakhaven pottery studio, cadence restaurant-scheduling software), engine frozen for the run. RESULT: WORSE than v0.5.0 (engine 0/8; product-visual 5.25 vs 8.13). DIAGNOSIS from the judges' own words: the generic library scenes read as generic or wrong (a courthouse for conveyancing where the baseline showed a specific client-portal UI; a LOOM for a pottery studio because the keyword router matched 'craft'; a generic cafe where the baseline drew a labelled coffee bag with a cupping panel) and the engine's feature illustrations (one icon on an abstract motif) were weaker than the baselines' bespoke per-feature drawings. The scene override also replaced product mockups that were the better hero. CONFOUNDS: the Ashby MCP agent's first build accidentally used a brief another agent had overwritten in the shared scratchpad (it noticed and rebuilt); the Cadence MCP agent had to force heroStyle:'product' (the software check was too fragile, fixed afterwards) and hand-edited the footer tagline and touch-target sizes; the Ashby MCP agent hand-edited the billing-button height. Next version (v0.6.0): let the model draw bespoke SVG for the hero and each feature, give it an illustration kit to compose from, and never override a supplied product mockup.

## Headline

- Blind pairwise judging: **engine won 0 / 8**, baseline won 8 / 8.
- Engine page judged *more template-like* in 8 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.7**, engine **6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6.4 | -1.6 |
| typography | 7.9 | 6.6 | -1.3 |
| spacing | 7.4 | 6.1 | -1.3 |
| colour | 8 | 6.1 | -1.9 |
| product_visual | 8.1 | 5.3 | -2.8 |
| mobile | 7.3 | 6.3 | -1 |
| polish | 7.5 | 5.9 | -1.6 |
| originality | 7.4 | 4.9 | -2.5 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| ashby r1 | baseline | 8 | 5.9 | engine |
| ashby r2 | baseline | 7.8 | 5.6 | engine |
| cadence r1 | baseline | 7.3 | 6.3 | engine |
| cadence r2 | baseline | 7.5 | 6.9 | engine |
| cornerstone r1 | baseline | 7.8 | 5.6 | engine |
| cornerstone r2 | baseline | 8 | 5.9 | engine |
| oakhaven r1 | baseline | 7.9 | 6.3 | engine |
| oakhaven r2 | baseline | 7.4 | 5.1 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 87.3 | 93.8 |
| originality score (0-100) | 96.3 | 92 |
| slop score (0-100, higher is cleaner) | 96.3 | 92 |
| slop findings | 1 | 1 |
| audit errors | 4.3 | 0 |
| audit warnings | 9.8 | 0.3 |
| neutral interaction checks passed | 8/12 | 8/12 |
| inline SVG illustrations | 12 | 33 |
| font families | 2.3 | 3 |
| distinct colours | 15.3 | 12 |
| spacing on 4px grid (%) | 73.3 | 89.6 |
| source size (KB) | 55 | 100.5 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 78,651-126,416 (baseline arm in the same run: 100,470-134,409). Tool calls: 17-40 (baseline arm: 14-42). Wall-clock seconds: 166-464 (baseline arm: 192-333).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| ashby | 111,252 | 29 | 464 |
| cornerstone | 87,494 | 20 | 255 |
| oakhaven | 78,651 | 17 | 166 |
| cadence | 126,416 | 40 | 452 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
