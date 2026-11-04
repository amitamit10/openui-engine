# v0.10.0 results

Controlled benchmark of the engine at commit bc7de0c (v0.9.0 plus brand-tinted paper surfaces on the light styles, features[].art object fix, florist category, selector and snippet on gate issues, RTL support). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (ironbark tree surgeons, formwell forms software, harvest catering, driftwood kayak hire), engine frozen for the run. RESULT: engine 0/8, judged more template-like in 8/8; engine originality 4.9 and colour 5.75, the lowest of any run. The brand-tinted surfaces BACKFIRED: with the agents' green accents the whole page became mint, and judges called the engine pages a 'mint-green SaaS template' and 'mint-on-mint', while the baselines' 'warm cream, forest and amber' palettes won; the tinting is therefore reverted to opt-in. All four MCP agents patched the style to the older field-notes or warm-human, so the new styles were not exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 113k-134k vs baseline 100k-111k, tool calls 17-32 vs 12-21, time 246-310 s vs 192-244 s. DEFECTS named by agents (to fix): the matcher first chose the loud neo-brutal style for a relaxed outdoor hire brand; brief_template returns the generic SaaS template for food and outdoor-activity categories; a decorative hero icon tile rendered blank (a missing icon). CONFOUNDS: several agents deleted their own scratch files; one agent made an unnecessary read_documentation call. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 0 / 8**, baseline won 8 / 8.
- Engine page judged *more template-like* in 8 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.7**, engine **6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 8 | 6.4 | -1.6 |
| typography | 8.3 | 6.3 | -2 |
| spacing | 7.5 | 5.9 | -1.6 |
| colour | 8 | 5.8 | -2.2 |
| product_visual | 7.5 | 6.1 | -1.4 |
| mobile | 7.1 | 6.3 | -0.8 |
| polish | 7.8 | 6 | -1.8 |
| originality | 7.4 | 4.9 | -2.5 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| driftwood r1 | baseline | 7.6 | 5.9 | engine |
| driftwood r2 | baseline | 7.8 | 6.3 | engine |
| formwell r1 | baseline | 8 | 6.5 | engine |
| formwell r2 | baseline | 7.9 | 5.6 | engine |
| harvest r1 | baseline | 7.6 | 6 | engine |
| harvest r2 | baseline | 7.4 | 5.3 | engine |
| ironbark r1 | baseline | 7.6 | 5.4 | engine |
| ironbark r2 | baseline | 7.6 | 6.6 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 86.3 | 95 |
| originality score (0-100) | 95.5 | 100 |
| slop score (0-100, higher is cleaner) | 95.5 | 100 |
| slop findings | 0.8 | 0 |
| audit errors | 8 | 0 |
| audit warnings | 3 | 0.3 |
| neutral interaction checks passed | 10/12 | 10/12 |
| inline SVG illustrations | 7.5 | 28.5 |
| font families | 2 | 3 |
| distinct colours | 15 | 11.5 |
| spacing on 4px grid (%) | 89.3 | 93.2 |
| source size (KB) | 53.2 | 107.3 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 112,796-133,694 (baseline arm in the same run: 99,587-110,995). Tool calls: 17-32 (baseline arm: 12-21). Wall-clock seconds: 246-310 (baseline arm: 192-244).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| ironbark | 123,361 | 19 | 273 |
| formwell | 133,694 | 32 | 310 |
| harvest | 112,796 | 17 | 246 |
| driftwood | 113,038 | 22 | 274 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
