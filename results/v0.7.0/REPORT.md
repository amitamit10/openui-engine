# v0.7.0 results

Controlled benchmark of the engine at commit 7cdfd76 (v0.6.0 plus per-brief accents for field-notes/warm-human, steer to a specific customer artefact for non-software heroes, photo/logo/palette/legal tools, prompt placeholders and add_image). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (saltmarsh sauna club, marlowe maths tutors, lumen heirloom seeds, plotline screenwriting app), engine frozen for the run. RESULT: engine 1/8 again (judged more template-like in 7/8); the one win was a split pair on lumen. The spec forbids external images for BOTH arms, so the new photo, logo-prompt and placeholder flow was deliberately NOT exercised: this run measures the generator, not the asset tools. DEFECTS named by judges and agents (fixed afterwards): five features render as an orphaned 3+2 grid; pale or muted palettes and flat feature illustrations; hero floats overlapping the headline or mockup; the art sanitiser silently strips <text> (a drawn hero lost its labels, and a rejected feature art fell back to generic art with no warning); a sixth supplied feature silently dropped; desktop nav and footer links 17-30px tall; the build keeps nagging about a missing logo even when the text wordmark is wanted. CONFOUNDS: the Plotline MCP agent hand-appended a footer min-height rule to overrides.css; the Marlowe MCP agent replaced its svg hero with a ui mockup after the sanitiser stripped its labels; the Lumen MCP agent patched the style to field-notes; several agents deleted their own scratch files, so their working is not inspectable. Judge sessions were short (about 13-22 s each) but every verdict carried all 8 dimension scores and a specific rationale. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).

## Headline

- Blind pairwise judging: **engine won 1 / 8**, baseline won 7 / 8.
- Engine page judged *more template-like* in 7 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **7.7**, engine **6.6**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
| hierarchy | 7.9 | 6.9 | -1 |
| typography | 8.1 | 7 | -1.1 |
| spacing | 7.3 | 6.5 | -0.8 |
| colour | 8 | 6.8 | -1.2 |
| product_visual | 7.9 | 6.6 | -1.3 |
| mobile | 7.1 | 6.5 | -0.6 |
| polish | 7.6 | 6.5 | -1.1 |
| originality | 7.5 | 5.8 | -1.7 |

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
| lumen r1 | baseline | 7.5 | 7 | engine |
| lumen r2 | engine | 6.8 | 7.8 | baseline |
| marlowe r1 | baseline | 8 | 6.9 | engine |
| marlowe r2 | baseline | 7.9 | 6.4 | engine |
| plotline r1 | baseline | 7.9 | 6.3 | engine |
| plotline r2 | baseline | 7.5 | 5.8 | engine |
| saltmarsh r1 | baseline | 7.8 | 5.9 | engine |
| saltmarsh r2 | baseline | 8.1 | 6.6 | engine |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 90 | 94.8 |
| originality score (0-100) | 96 | 98.5 |
| slop score (0-100, higher is cleaner) | 96 | 98.5 |
| slop findings | 1 | 0.3 |
| audit errors | 2.8 | 0 |
| audit warnings | 6 | 0 |
| neutral interaction checks passed | 9/12 | 9/12 |
| inline SVG illustrations | 6.3 | 31 |
| font families | 2.3 | 3 |
| distinct colours | 19.8 | 11 |
| spacing on 4px grid (%) | 74.4 | 92.3 |
| source size (KB) | 53.2 | 104.3 |

## Engine-arm agent cost

Agents: 4. Tokens per agent: 101,494-153,494 (baseline arm in the same run: 107,128-131,863). Tool calls: 18-38 (baseline arm: 14-31). Wall-clock seconds: 251-355 (baseline arm: 199-338).

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| saltmarsh | 119,353 | 18 | 251 |
| lumen | 101,494 | 18 | 254 |
| plotline | 115,632 | 24 | 267 |
| marlowe | 153,494 | 38 | 355 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
