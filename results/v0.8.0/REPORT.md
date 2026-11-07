# v0.8.0 results

Controlled benchmark of the engine at commit 98cff9d (v0.7.0 plus the defect fixes, a curated two-tone colour layer, and five new art directions shadcn-mono, material-tonal, swiss-grid, noir-luxe, pastel-play with style routing). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (tideline surf school, hollis architects, brightwater vet clinic, stockroom inventory app), engine frozen for the run. RESULT: engine 2/8, judged more template-like in 6/8: the best generator result so far but still a clear loss. Both engine wins were pages whose hero is a specific product UI mockup (brightwater clinic day sheet, stockroom stock screen). The new swiss-grid style was chosen by the matcher for the architects brief and LOST both pairs: judges called it a loud red-and-black startup look with a generic flat house drawing, a broken final CTA headline, a lopsided testimonials grid and an uneven hero. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: the MCP arm used about 17% more tokens, about 45% more tool calls and about 70% more wall-clock time than the baseline arm this run. DEFECTS named by agents and judges (to fix): swiss-grid CTA and testimonials layout; the schedule hero kind rendered empty; a duplicate id=features in the generated markup that the gate did not flag; last-section padding 31px against 104px elsewhere; brief_template has no good category for service businesses (surf school and services both returned the SaaS template, and search_design_references rejected the category); an agent could not find a logos caption field. CONFOUNDS: the Stockroom MCP agent made one failed send_message call to another session (nothing was sent); several agents deleted their own scratch files; the Stockroom MCP agent used the older field-notes style by its own patch, so the new styles were exercised only on Hollis. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 2 / 8**, baseline won 6 / 8.
- Engine page judged *more template-like* in 6 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.6**, engine **6.5**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.8 | 6.9 | -0.9 |
| typography | 8 | 6.9 | -1.1 |
| spacing | 7.4 | 6.1 | -1.3 |
| colour | 7.8 | 6.6 | -1.2 |
| product_visual | 7.9 | 6.8 | -1.1 |
| mobile | 7.1 | 6.6 | -0.5 |
| polish | 7.6 | 6.1 | -1.5 |
| originality | 7.1 | 6 | -1.1 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| brightwater r1 | baseline | 7.8 | 6.6 | engine |
| brightwater r2 | engine | 6.8 | 7.9 | baseline |
| hollis r1 | baseline | 8.3 | 6.1 | engine |
| hollis r2 | baseline | 7.9 | 5.3 | engine |
| stockroom r1 | engine | 6.9 | 7.9 | baseline |
| stockroom r2 | baseline | 7.6 | 6.6 | engine |
| tideline r1 | baseline | 7.6 | 5.8 | engine |
| tideline r2 | baseline | 7.9 | 5.9 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 88.5 | 94.8 |
| originality score (0-100) | 95 | 98.5 |
| slop score (0-100, higher is cleaner) | 95 | 98.5 |
| slop findings | 1.3 | 0.3 |
| audit errors | 5 | 0 |
| audit warnings | 3 | 0 |
| neutral interaction checks passed | 8/12 | 8/12 |
| inline SVG illustrations | 7.5 | 32 |
| font families | 2 | 3 |
| distinct colours | 18.3 | 14 |
| spacing on 4px grid (%) | 84.7 | 91.3 |
| source size (KB) | 52.9 | 105.1 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 109,155-119,984 (baseline arm in the same run: 91,247-104,064). Tool calls: 20-29 (baseline arm: 15-19). Wall-clock seconds: 237-399 (baseline arm: 156-215).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| tideline | 109,473 | 25 | 294 |
| hollis | 119,984 | 27 | 237 |
| brightwater | 109,155 | 29 | 399 |
| stockroom | 118,960 | 20 | 251 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
