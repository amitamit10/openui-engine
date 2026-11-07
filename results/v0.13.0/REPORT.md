# v0.13.0 — toolkit mode vs plain Haiku (experiment, not a generator release)

**What was compared.** Fresh Haiku 5.5 agents, identical SPEC.md, 60-call budget, engine frozen at `bc9bc0e`.
- *baseline*: no engine tools.
- *toolkit* (labelled `engine` in the raw files because the evaluator expects that label): `style_pack` + `validate_design` + `capture_preview`; the agent writes its own HTML from the pack. `build_site`/`compose_page` were forbidden.

Briefs: marrow (butchers), willow (yoga), nimbus (weather API), tidewater (insurance). Each pair judged twice with X/Y swapped by blind Sonnet judges (8 judgements).

## Result
Wins: **baseline 4, toolkit 4** (marrow 2/0 and tidewater 2/0 to toolkit; nimbus 0/2 and willow 0/2 to baseline).

| dimension | baseline | toolkit |
|---|---|---|
| hierarchy | 7.63 | 7.38 |
| typography | 7.50 | 7.00 |
| spacing | 7.25 | 7.00 |
| colour | 7.75 | 6.88 |
| product_visual | 7.00 | **7.88** |
| mobile | 7.13 | 6.88 |
| polish | 7.50 | 7.00 |
| originality | 7.00 | 6.63 |

Toolkit judged more template-like in 4/8.

## Reading it honestly
- A tie, but the best engine-side result so far (previous generator rounds won 0-3 of 8). Judges credited toolkit pages for specific hero product cards and per-feature mini-UIs; they marked them down on colour and typographic identity.
- n=8 judgements over 4 briefs: not significant. **No control arm** (Haiku with no engine tools but the same iterate-with-screenshots encouragement), so the result cannot be attributed to the engine.
- Pack defects the toolkit agents had to hand-fix: hero glow ungated by `data-style`, low-contrast featured pricing card, doubled step counters from a `::before` counter, 33px mobile footer overflow. Two agents' first `style_pack` calls were rejected for an invalid style name.
- Confounds: willow baseline made one failed stray `send_message`; nimbus toolkit made and withdrew one stray `spawn_task`. Neither affected the outputs.
- Toolkit agents used ~118-150k tokens and 24-34 calls vs ~100-111k and 14-24 for baseline.
- No Vercel deployment: `VERCEL_TOKEN` is not available in this environment.
