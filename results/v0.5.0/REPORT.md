# v0.5.0 results

The controlled benchmark you specified, on the v0.5.0 engine (art-director pass: generative illustration layer, illustrated feature cards, hero scene, count-up metrics, design_review loop). Haiku 5.5 WITHOUT the MCP vs Haiku 5.5 WITH the MCP, the exact same specification (identical SPEC.md), the same 60-tool-call budget, four never-seen domains (fernwood dental practice, skyplot satellite-imagery API, heronfinch interior design studio, kinfolk in-home care), engine frozen for the run, no hand edits by any MCP-arm agent. Blind Sonnet judges, both label orders. NOT deployed to Vercel (no VERCEL_TOKEN in this environment); screenshots are in the data folder and the side-by-side pages. Observed afterwards: the engine's hero is still an app-window mockup even for non-software briefs, which judges call template-like; fixes for that, a dark featured pricing tier, bigger headline tiers and balanced hero cards follow in v0.5.1. Defects the MCP agents reported (fixed afterwards): prices without thousands separators, footer tagline truncated with an ellipsis, footer links 29px tall.

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 6 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.5**, engine **6.6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.8 | -1.1 |
| typography | 7.9 | 6.9 | -1 |
| spacing | 7.4 | 6.1 | -1.3 |
| colour | 7.8 | 6.6 | -1.2 |
| product_visual | 7.6 | 7.5 | -0.1 |
| mobile | 7 | 6.4 | -0.6 |
| polish | 7.8 | 6.3 | -1.5 |
| originality | 6.8 | 6.3 | -0.5 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| fernwood r1 | baseline | 7.8 | 6.3 | engine |
| fernwood r2 | engine | 6.8 | 7.9 | baseline |
| heronfinch r1 | baseline | 7.8 | 6.6 | engine |
| heronfinch r2 | baseline | 7.5 | 5.9 | engine |
| kinfolk r1 | baseline | 7.4 | 6.6 | engine |
| kinfolk r2 | baseline | 7.6 | 6.9 | engine |
| skyplot r1 | baseline | 7.5 | 6.8 | baseline |
| skyplot r2 | baseline | 7.8 | 5.9 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 89.3 | 93.5 |
| originality score (0-100) | 96.8 | 94 |
| slop score (0-100, higher is cleaner) | 96.8 | 94 |
| slop findings | 0.8 | 1 |
| audit errors | 4 | 0 |
| audit warnings | 4.5 | 0 |
| neutral interaction checks passed | 10/12 | 10/12 |
| inline SVG illustrations | 6.8 | 35.5 |
| font families | 2 | 2.8 |
| distinct colours | 22.5 | 13.5 |
| spacing on 4px grid (%) | 83.8 | 88.1 |
| source size (KB) | 53.1 | 101.9 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 85,541-125,121 (baseline arm in the same run: 100,053-123,576). Tool calls: 18-50 (baseline arm: 16-24). Wall-clock seconds: 195-512 (baseline arm: 187-263).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| fernwood | 113,188 | 32 | 302 |
| skyplot | 93,129 | 24 | 201 |
| heronfinch | 85,541 | 18 | 195 |
| kinfolk | 125,121 | 50 | 512 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
