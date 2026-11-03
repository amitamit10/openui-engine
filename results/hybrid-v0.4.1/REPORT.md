# hybrid-v0.4.1 results

NEW ARM, not the generator: HYBRID = the Haiku builder writes the page by hand, exactly like the baseline (own layout, own illustrations; the engine's page generators build_site/compose_page/suggest_layout/brief_template are forbidden), but ALSO has the engine's QA tools (validate_design, detect_ai_slop, analyze_visual_quality, capture_preview, search_icons, generate_design_system) and is required to run validate_design and detect_ai_slop on its page, read the findings and fix them. In this release's data files the hybrid arm is stored under the label 'engine' (so existing scripts work); in the tables below the 'engine' columns ARE the hybrid arm. Four never-seen domains (tidewater marina, ironbark bookshop, loomhouse weaving studio, quartermaster restaurant inventory SaaS), fresh agents for both arms, engine frozen for the run (the CTA false-positive fix in verify was applied BEFORE the evaluation so both arms are scored by the same gate; audit numbers are not strictly comparable to earlier releases). CONFOUNDS, important: (1) the hybrid prompt tells the agent to 'make your own design decisions, your own layout, your own illustrations', wording the baseline prompt lacks - part of the originality gain may be this instruction and not the tools; (2) the hybrid arm did more iteration (18-29 tool calls vs 14-24 and about 8% more tokens): the gain could come from any extra critique loop rather than from the engine tools specifically; that control WAS run afterwards (see control-v0.4.1): a hand-written arm with the same sentence and a generic self-review loop but no engine tools tied the hybrid 4-4 and tied the baseline 4-4, so this release's 7/8 is NOT attributable to the engine tools; (3) n = 4 briefs x 2 label orders, one build per brief and arm, Sonnet judges judging Haiku from screenshots; (4) one hybrid agent made a stray, out-of-scope call to a remote-session creation tool, which the permission system denied (nothing was created); (5) three hybrid agents left the engine's .openui/ preview folder inside site/ (excluded from measurements). The QA gate did catch real defects in hand-written pages that agents then fixed (console 404s, contrast failures, horizontal overflow, sub-12px text, a failing pricing-toggle interaction), and exposed a false positive in the gate itself (fixed).

## Headline

- Blind pairwise judging: **hybrid won 7 / 8**, baseline won 1 / 8.
- Hybrid page judged *more template-like* in 1 / 8 pairs.
- Mean judge score (8 dimensions, 1-10): baseline **6.9**, hybrid **7.6**.

## Judge scores by dimension

| dimension | baseline | hybrid | delta |
|---|---|---|---|
| hierarchy | 7.1 | 7.9 | 0.8 |
| typography | 7.5 | 8 | 0.5 |
| spacing | 7.1 | 7 | -0.1 |
| colour | 7.1 | 7.9 | 0.8 |
| product_visual | 6.8 | 7.6 | 0.8 |
| mobile | 7 | 7 | 0 |
| polish | 6.9 | 7.4 | 0.5 |
| originality | 6 | 7.6 | 1.6 |

## Every judgement (unsealed)

| pair | winner | baseline mean | hybrid mean | more template-like |
|---|---|---|---|---|
| ironbark r1 | hybrid | 6.8 | 7.4 | baseline |
| ironbark r2 | hybrid | 6.9 | 7.6 | baseline |
| loomhouse r1 | hybrid | 6.9 | 7.8 | baseline |
| loomhouse r2 | hybrid | 6.9 | 7.8 | baseline |
| quartermaster r1 | hybrid | 6.8 | 7.6 | baseline |
| quartermaster r2 | baseline | 7.6 | 6.8 | hybrid |
| tidewater r1 | hybrid | 6.9 | 7.6 | baseline |
| tidewater r2 | hybrid | 6.9 | 7.9 | baseline |

Raw verdicts, with the judges' own rationales where recorded, are in `raw/judges.json`. Screenshots and per-site audit JSON are in `data/`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | hybrid |
|---|---|---|
| sites | 4 | 4 |
| heuristic quality (0-100) | 88.3 | 92.8 |
| originality score (0-100) | 92.8 | 96.8 |
| slop score (0-100, higher is cleaner) | 92.8 | 96.8 |
| slop findings | 1.3 | 0.8 |
| audit errors | 2.8 | 0 |
| audit warnings | 4 | 0 |
| neutral interaction checks passed | 11/12 | 9/12 |
| inline SVG illustrations | 7.5 | 7 |
| font families | 2.5 | 2 |
| distinct colours | 16.5 | 17.8 |
| spacing on 4px grid (%) | 82.9 | 83.1 |
| source size (KB) | 52.9 | 55.5 |

## Hybrid-arm agent cost

Agents: 4. Tokens per agent: 104,474-125,480 (baseline arm in the same run: 100,030-116,060). Tool calls: 18-29 (baseline arm: 14-24). Wall-clock seconds: 314-402.

| brief | tokens | tool calls | seconds |
|---|---|---|---|
| tidewater | 125,480 | 29 | 402 |
| ironbark | 104,474 | 18 | 314 |
| loomhouse | 122,665 | 24 | 378 |
| quartermaster | 117,013 | 25 | 366 |

## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
