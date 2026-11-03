# v0.12.0 results

Controlled benchmark of the engine at commit 9e385ca (v0.11.0 plus testimonialsTitle and faqTitle brief fields, key aliases and a note for every brief field the engine does not read). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (larkspur language school, atlas removals, brewline craft brewery, payfold payroll software), engine frozen for the run. RESULT: engine 1/8 (baseline 7/8), judged more template-like in 6/8. The previous run's 3/8 therefore did not repeat: over the last four runs the engine won 4 of 32 judgements (0, 0, 3, 1), so v0.11.0 was most likely a favourable draw, not a step change. The single engine win was brewline r2 (bespoke illustrated feature cards, a refined serif with an italic accent). Recurring judge complaints about the engine pages: product-mockup heroes with awkward empty gaps and cramped wrapping (payfold, atlas), generic flat illustrations in place of a specific hero object, and the standard card-grid layout. The atlas MCP agent kept the engine's own style pick (warm-human) for the first time, which is the style matcher working. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 99k-124k vs baseline 102k-127k, tool calls 16-25 vs 12-22, time 206-368 s vs 188-442 s: comparable. DEFECTS named by agents and judges (to fix): ui-kind hero mockups stretch their first column to the height of the second, leaving large vertical gaps; brief_template returns the generic template for brewery and some outdoor-hire categories. CONFOUNDS: one MCP agent made a stray out-of-scope create_session call (denied by the permission system, nothing created); the same agent wrote its QA scripts into the session's shared scratchpad; several agents deleted their own scratch files. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 6 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.6**, engine **6.7**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.9 | -1 |
| typography | 8 | 7.1 | -0.9 |
| spacing | 7.3 | 6.4 | -0.9 |
| colour | 7.9 | 6.9 | -1 |
| product_visual | 7.5 | 6.5 | -1 |
| mobile | 7.3 | 6.9 | -0.4 |
| polish | 7.8 | 6.5 | -1.3 |
| originality | 7 | 6.3 | -0.7 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| atlas r1 | baseline | 8.1 | 6.9 | engine |
| atlas r2 | baseline | 7.8 | 6.8 | engine |
| brewline r1 | baseline | 7.5 | 6.9 | engine |
| brewline r2 | engine | 6.8 | 7.9 | baseline |
| larkspur r1 | baseline | 7.5 | 6.6 | engine |
| larkspur r2 | baseline | 7.8 | 6.8 | engine |
| payfold r1 | baseline | 7.6 | 5.8 | engine |
| payfold r2 | baseline | 7.5 | 5.9 | baseline |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 87 | 95 |
| originality score (0-100) | 87 | 100 |
| slop score (0-100, higher is cleaner) | 87 | 100 |
| slop findings | 2 | 0 |
| audit errors | 2.8 | 0 |
| audit warnings | 6.5 | 0 |
| neutral interaction checks passed | 7/12 | 8/12 |
| inline SVG illustrations | 7.8 | 30.8 |
| font families | 2.3 | 3 |
| distinct colours | 19.8 | 13.8 |
| spacing on 4px grid (%) | 82.8 | 92.2 |
| source size (KB) | 52.6 | 109.1 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 99,128-124,032 (baseline arm in the same run: 101,869-126,500). Tool calls: 16-25 (baseline arm: 12-22). Wall-clock seconds: 206-368 (baseline arm: 188-442).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| larkspur | 124,032 | 25 | 368 |
| atlas | 103,904 | 20 | 295 |
| brewline | 111,257 | 17 | 206 |
| payfold | 99,128 | 16 | 226 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
