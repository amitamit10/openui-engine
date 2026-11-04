# v0.6.0 results

Controlled benchmark of the v0.6.0 engine (model-drawn bespoke SVG for hero and feature cards, illustration_kit, supplied mockups never overridden). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (quillstone bookbindery, bluebell nursery school, rivet bike shop, tallyho expense software), engine frozen at 15c928f. RESULT: engine 1/8, judged more template-like in 7/8; mean about 6.3 vs 7.5. The single win (bluebell r2) was praised for bespoke feature-card illustrations. Judges still prefer baselines on specific product visuals in the hero, dark metrics bands, palette distinctiveness and polish. DEFECTS found: Quillstone engine page showed an empty black block where the ink metrics band should be plus a clipped trust strip; model-drawn art overflowed its column on mobile; preserveAspectRatio slice cropped drawings; closing-form label 'Work email' is generic for non-SaaS. CONFOUNDS: Bluebell MCP agent hand-edited the closing-form label; Rivet MCP agent made two hand edits (a style block for .vz-art width, and preserveAspectRatio changed to meet); the Rivet baseline agent left a stray http.server on port 8765; several agents shared a scratchpad and some check scripts or briefs were overwritten. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 7 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.6**, engine **6.3**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.8 | -1.1 |
| typography | 7.8 | 6.8 | -1 |
| spacing | 7.3 | 6.1 | -1.2 |
| colour | 7.8 | 6.5 | -1.3 |
| product_visual | 7.9 | 6 | -1.9 |
| mobile | 7.1 | 6.4 | -0.7 |
| polish | 7.6 | 6 | -1.6 |
| originality | 7.4 | 5.6 | -1.8 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| bluebell r1 | baseline | 7.8 | 6.6 | engine |
| bluebell r2 | engine | 6.9 | 7.4 | baseline |
| quillstone r1 | baseline | 7.8 | 5.5 | engine |
| quillstone r2 | baseline | 7.4 | 5.3 | engine |
| rivet r1 | baseline | 7.5 | 6.5 | engine |
| rivet r2 | baseline | 7.4 | 5.5 | engine |
| tallyho r1 | baseline | 8.1 | 6.6 | engine |
| tallyho r2 | baseline | 7.9 | 6.8 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 88.5 | 94.3 |
| originality score (0-100) | 94.8 | 98.5 |
| slop score (0-100, higher is cleaner) | 94.8 | 98.5 |
| slop findings | 1.5 | 0.3 |
| audit errors | 4.8 | 0.3 |
| audit warnings | 4 | 0 |
| neutral interaction checks passed | 8/12 | 8/12 |
| inline SVG illustrations | 9.3 | 30 |
| font families | 2.3 | 3 |
| distinct colours | 17.3 | 10 |
| spacing on 4px grid (%) | 89.4 | 92.2 |
| source size (KB) | 55.3 | 94.3 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 108,281-112,685 (baseline arm in the same run: 104,727-141,711). Tool calls: 17-32 (baseline arm: 14-30). Wall-clock seconds: 221-305 (baseline arm: 233-299).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| quillstone | 112,685 | 17 | 221 |
| bluebell | 110,176 | 20 | 273 |
| rivet | 108,281 | 32 | 305 |
| tallyho | 111,884 | 22 | 274 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
