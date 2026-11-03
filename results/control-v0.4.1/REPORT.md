# control-v0.4.1: is it the engine's tools, or the prompt and the extra review?

The hybrid arm (hand-written page + the engine's QA tools) beat the unguided baseline 7 of 8 in [hybrid-v0.4.1](../hybrid-v0.4.1/REPORT.md), but it had two confounds: its prompt told the agent to "make your own design decisions", and it iterated more. This release adds the **control** arm that removes the engine tools but keeps both: same hand-written instruction, same *required* self-review loop (screenshots, overflow/console/contrast/tap-target checks, fix, re-check) using plain Playwright. Same four briefs (tidewater, ironbark, loomhouse, quartermaster), fresh Haiku 5.5 agents, blind Sonnet judges, both label orders.

## Result

| comparison | wins | judged more template-like | mean of 8 dimensions |
|---|---|---|---|
| **control vs hybrid** | control 4 / hybrid 4 | control 5 / hybrid 3 | control 7.3 / hybrid 7.25 |
| **baseline vs control** | baseline 4 / control 4 | baseline 4 / control 4 | baseline 7.17 / control 7.33 |

**Reading it honestly:** the control, which has *no engine tools*, ties the hybrid (4-4) and ties the baseline (4-4). So the earlier 7/8 for the hybrid cannot be credited to the engine's tools: a generic design-it-yourself prompt plus a self-review loop does about as well, and the three arms are close on judged design quality. With 8 judgements per comparison, a 4-4 split cannot detect a small difference either way, and the 7/8 earlier result is an outlier against these two ties (judge calibration also differs between pair sets, so the three comparisons are not strictly comparable). In each brief both label orders picked the same winner (control won ironbark and quartermaster; hybrid won loomhouse and tidewater), so this is not a position-bias artefact.

### Control vs hybrid, by dimension

| dimension | control | hybrid | hybrid - control |
|---|---|---|---|
| hierarchy | 7.5 | 7.5 | 0 |
| typography | 7.63 | 7.75 | 0.12 |
| spacing | 7.38 | 6.88 | -0.5 |
| colour | 7.5 | 7.5 | 0 |
| product_visual | 7.38 | 7.5 | 0.12 |
| mobile | 7 | 6.88 | -0.12 |
| polish | 7.38 | 7 | -0.38 |
| originality | 6.63 | 7 | 0.37 |

| pair | winner | more template-like |
|---|---|---|
| ironbark r1 | control | hybrid |
| ironbark r2 | control | control |
| loomhouse r1 | hybrid | control |
| loomhouse r2 | hybrid | control |
| quartermaster r1 | control | hybrid |
| quartermaster r2 | control | hybrid |
| tidewater r1 | hybrid | control |
| tidewater r2 | hybrid | control |

### Baseline vs control, by dimension

| dimension | baseline | control | control - baseline |
|---|---|---|---|
| hierarchy | 7.5 | 7.5 | 0 |
| typography | 7.63 | 7.75 | 0.12 |
| spacing | 7.25 | 7.25 | 0 |
| colour | 7.5 | 7.5 | 0 |
| product_visual | 6.88 | 7.63 | 0.75 |
| mobile | 7 | 6.88 | -0.12 |
| polish | 7.13 | 7.38 | 0.25 |
| originality | 6.5 | 6.75 | 0.25 |

| pair | winner | more template-like |
|---|---|---|
| ironbark r1 | control | baseline |
| ironbark r2 | control | baseline |
| loomhouse r1 | baseline | control |
| loomhouse r2 | baseline | control |
| quartermaster r1 | control | baseline |
| quartermaster r2 | control | baseline |
| tidewater r1 | baseline | control |
| tidewater r2 | baseline | control |

## Where the engine's tools do show an objective advantage

Automated gate on all 12 sites (same gate for every arm; sum over 4 sites):

| arm | audit errors | audit warnings | heuristic quality | slop score |
|---|---|---|---|---|
| baseline | 11 | 16 | 88.25 | 92.75 |
| control (generic self-review) | 7 | 0 | 90.5 | 93.75 |
| hybrid (engine QA tools) | 0 | 0 | 92.75 | 96.75 |

The hybrid shipped **0 audit errors on all four sites**; the control, despite a required self-review, still shipped 7 (axe-type issues such as contrast and small text that a hand-rolled check missed); the baseline 11. Caveat: the hybrid agents were optimising against this very gate (validate_design uses the same audit code), so this is partly circular, though axe-core accessibility violations are real defects regardless of who measures them.

## What this means for the product

* **Supported:** the engine's QA gate reliably removes real defects (contrast, overflow, console errors, tap targets, broken interactions) from hand-written pages, beyond what a generic self-review catches.
* **Not supported:** that the engine makes a cheap model's design *look better* than that model working freely with a good prompt and a review loop. Judged design quality is about the same across baseline, control and hybrid.
* **Not supported (and falsified for the generator path):** that composing the page from the engine's templates helps; see the generator releases (engine 1 of 8 twice on unseen domains).

## Limits

n = 4 briefs, 8 judgements per comparison, one build per brief and arm, Sonnet judging Haiku from screenshots, shared scratchpad between agents (several re-verified after their scripts were overwritten; no cross-contamination found in the delivered sites), and the judges for the three arm comparisons ran as separate pair sets. Substitute model: Haiku 5.5 for the GPT-6 Luna the original brief named.
