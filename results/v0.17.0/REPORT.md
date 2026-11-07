# v0.17.0 — three-arm controlled benchmark on six unseen categories

Engine frozen at the commit in `raw/ENGINE_COMMIT.txt` (`0cb9d61`) for all 18 runs. Fresh Haiku 5.5 agents, identical SPEC.md per brief, 60-call limit, Playwright screenshots available to every arm, independent runs. Briefs were written after the showcase library was finished and none of the library's heroes was designed for them (game studio, veterinary clinic, coworking space, bookkeeping, podcast production, solar installer).

| arm | what the agent had |
|---|---|
| **A control** | no engine; prompt requires ≥3 build/review rounds: own Playwright checks, per-section screenshots, design-director critique |
| **B engine** | normal access to all engine tools, free choice, no workflow guidance (same prompt as v0.14.0/0.16.0) |
| **C hybrid** | engine tools plus a paragraph: write the page yourself; do NOT use build_site/compose_page; after the first version run `enhance_page` and `validate_design`, apply what they find, adapt recommended artefacts, ≥3 rounds |

## Blind judging: 12 three-way judgements (2 position rotations × 6 briefs; Sonnet judges; rank + 8 scores)
| | first place | last place | mean rank (1 best) | judged most template-like |
|---|---|---|---|---|
| **C hybrid** | **8** | 2 | **1.50** | 0 |
| A control | 4 | 0 | 1.67 | 0 |
| B engine | **0** | 10 | 2.83 | 12 |

Pairwise (derived from the rankings): hybrid beats control **8-4**, hybrid beats engine **10-2**, control beats engine **12-0**.
By brief (both rotations agree unless noted): hybrid > control on pixelmoth, lowtide, brightwater; split on ledgerleaf and wren; control > hybrid on dovecote (hybrid last in both). Brief level: hybrid 3 wins, 2 splits, 1 loss against the control.

| dimension | A control | B engine | C hybrid |
|---|---|---|---|
| hierarchy | 7.67 | 7.08 | 7.75 |
| typography | 8.00 | 7.00 | 8.25 |
| spacing | 7.08 | 7.08 | 7.42 |
| colour | 7.83 | 6.92 | 7.83 |
| product_visual | 7.42 | 6.75 | **8.42** |
| mobile | 7.17 | 6.83 | 7.25 |
| polish | 7.00 | 7.17 | 7.33 |
| originality | 7.42 | **5.08** | **8.25** |

## Tool usage (from the agents' own reports; arm C's usage was prompted)
- **B engine** (6 agents): `validate_design` 2/6, `enhance_page` 0/6, `get_showcase` 0/6, `review_sections` 0/6, `generate_design_system` 4/6 (output rejected as generic in all four), `generate_palette` 3/6, `detect_ai_slop` 4/6, `build_site` 0/6. The one B agent that saw the integrated weak-section review dismissed it.
- **C hybrid** (6 agents): `enhance_page` 6/6 (2-4 runs each), `validate_design` 6/6, `get_showcase` 6/6, `review_sections` 1/6. No agent pasted a showcase untouched: they adopted the idea (drawing-sheet hero, timeline-data steps, quote-document letters) and rewrote it in their own code with their own palette.

## Cost (harness-reported per agent)
| | tokens (mean) | tool calls (mean) | seconds (mean) |
|---|---|---|---|
| A control | 143,344 | 42.5 | 331 |
| B engine | 113,029 | 20.3 | 262 |
| C hybrid (5 of 6)* | 144,840 | 43.4 | 462 |

*The brightwater hybrid run was interrupted by a rate limit and resumed, so its counts are not comparable and are excluded. Hybrid used about the same tokens and calls as the control and ~40% more wall-clock time (engine calls drive a browser).

## Objective checks (neutral evaluator; the audit is the engine's own checker, so the gap below is partly circular)
Mean audit errors / warnings: control 2.5 / 4.5, engine 2.5 / 3.3, **hybrid 0.0 / 0.0** (hybrid agents ran the same gate while iterating). Distinct font sizes 21.0 / 15.5 / 18.7; 4px-grid spacing 0.82 / 0.87 / 0.84; source size (bytes) 57k / 58k / 62k.

## Separating iteration from OpenUI
A and C had the same iteration instruction and the same token and call budget, so the hybrid-vs-control difference is not explained by extra iteration; what differs is the engine's tools (and being told to use them). B shows what happens without the instruction: the tools mostly go unused and the arm loses to the control 12-0.

## Verdict (no victory claimed)
- Directionally positive for hybrid mode: first place in 8 of 12 judgements, best product-visual and originality scores, and the only arm with zero audit errors. At brief level it is 3 wins, 2 splits, 1 loss against the control.
- **Not established.** Six briefs, one judge family, brief-level evidence that does not reach significance, and the hybrid arm's tool use was prompted. Dovecote shows hybrid can lose, and its hero has a visible overlap that the engine's checks did not flag.
- The generator path and unguided engine access remain clearly worse than an iterating Haiku with no engine (B loses 12-0 to A).
- Weaknesses found: `generate_design_system` still returns a generic "Clarity Light" direction (rejected by every B agent that tried it); `get_showcase` was called with `name` instead of `id` twice; the weak-section heuristic over-flags sections that already have HTML/CSS-built visuals (agents said so in 4 reports).
- Phase 5 (expanding the library toward 200-300 components) is **not** started: the measured value is directional, not confirmed.

Confounds: arm C prompt tells agents to use the workflow (arm B did not get equivalent guidance); dovecote engine made one stray read-only `list_environments` call and wren hybrid one denied `create_session` call; the resumed brightwater hybrid run; no Vercel deployment (no `VERCEL_TOKEN`).
