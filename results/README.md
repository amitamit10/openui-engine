# Results by release

Every release of OpenUI Engine is evaluated the same way: the same spec per brief, a clean workspace, a Haiku 5.5 builder with and without the engine, neutral automated measurements, then blind pairwise judging of screenshots.

| release | judgements | engine wins | baseline mean | engine mean | engine originality | engine product visual | engine tokens / agent | tool calls | seconds |
|---|---|---|---|---|---|---|---|---|---|
| [v0.2.0](v0.2.0/REPORT.md) | 6 | 0 / 6 | 7.9 | 5.6 | 3.5 | 5.2 | 118,871-145,517 | 42-62 | 321-519 |
| [v0.2.1](v0.2.1/REPORT.md) | 12 | 0 / 12 | 7.9 | 5.6 | 3.3 | 4.5 | 75,739-96,362 | 17-36 | 177-358 |
| [v0.3.0](v0.3.0/REPORT.md) | 12 | 0 / 12 | 7.8 | 5.8 | 5.1 | 6 | 88,456-104,393 | 23-40 | 222-415 |
| [v0.3.1](v0.3.1/REPORT.md) | 12 | 2 / 12 | 7.7 | 6.5 | 5.6 | 7.2 | 0 (deterministic replay) | 0 | about 30 per build |
| [v0.3.1-heldout](v0.3.1-heldout/REPORT.md) | 8 | 1 / 8 | 7.5 | 6.1 | 5.6 | 6.6 | 80,420-95,448 | 21-29 | 263-488 |

The v0.1.0 run (three arms, the original experiment) is in [v0.1.0/REPORT.md](v0.1.0/REPORT.md).

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1; judged originality and product-visual scores rose in v0.3.0; and in the v0.3.1 replay the engine won its first blind pairs (2 of 12) - but that replay reuses v0.3.0's briefs after a layout change made in response to those same judges, so it is tuned to the judged set. The fresh held-out run on four new briefs is the honest test: the engine won 1 of 8, and was judged more template-like in 5 of 8. Across all releases the unguided Haiku baseline wins the large majority of blind pairs (47 of 50 judgements).

Per-release folders contain `REPORT.md`, `summary.json`, `raw/` (judge verdicts) and `data/` (screenshots and audits). Regenerate the reports with `node benchmark/summarize.mjs`.
