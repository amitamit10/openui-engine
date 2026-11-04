# Why engine pages read as template-like (from the judges' own words)

Source: every unsealed rationale in `results/*/raw/judges.json` (126 judgements in which the non-engine page won).

| What the winning page was praised for | Rationales mentioning it |
|---|---|
| Hero (a specific object, not a scene or placeholder UI) | 116 of 126 |
| "generic", "template" or "default" used about the losing page | 120 |
| Palette / colour identity | 105 |
| Typography (a committed serif display, italic accent) | 105 |
| Per-feature illustrations or mini-UIs with real data | 24 |
| A specific hero artefact named explicitly | 26 |
| Real forms, readouts, annotations, telemetry | 12-29 |

Reading: the gap is **identity** (display type + deliberate palette) and **a specific hero artefact**, not component count. The v0.15.0 and v0.16.0 winners drew a dimensioned elevation, a field-survey sheet, an order docket, a live class screen and similar objects, filled with real names and numbers. The engine's generator defaults to a sans, a stock accent and a generic product mockup; its style pack was rejected as "clarity-light" by 4 of 6 agents.

What was built in response: `src/showcase/` (8 hero artefacts and 4 below-the-fold showcases drawn from that vocabulary, palette-driven, original), `enhance_page` (reads the page's real fonts/palette and tells the author what is generic), and `validate_design`'s weakest-sections review. None of this is yet shown to improve blind-judged quality; see the v0.17.0 benchmark.
