# Results by release

Every release of OpenUI Engine is evaluated the same way: the same spec per brief, a clean workspace, a Haiku 5.5 builder with and without the engine, neutral automated measurements, then blind pairwise judging of screenshots.

| release | judgements | engine wins | baseline mean | engine mean | engine originality | engine product visual | engine tokens / agent | tool calls | seconds |
|---|---|---|---|---|---|---|---|---|---|
| [v0.2.0](v0.2.0/REPORT.md) | 6 | 0 / 6 | 7.9 | 5.6 | 3.5 | 5.2 | 118,871-145,517 | 42-62 | 321-519 |
| [v0.2.1](v0.2.1/REPORT.md) | 12 | 0 / 12 | 7.9 | 5.6 | 3.3 | 4.5 | 75,739-96,362 | 17-36 | 177-358 |
| [v0.3.0](v0.3.0/REPORT.md) | 12 | 0 / 12 | 7.8 | 5.8 | 5.1 | 6 | 88,456-104,393 | 23-40 | 222-415 |

The v0.1.0 run (three arms, the original experiment) is in [v0.1.0/REPORT.md](v0.1.0/REPORT.md).

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1, and judged originality and product-visual scores rose again in v0.3.0, but the baseline still won every blind pair in every release so far. The engine does not yet beat an unguided Haiku on overall design quality as judged.

Per-release folders contain `REPORT.md`, `summary.json`, `raw/` (judge verdicts) and `data/` (screenshots and audits). Regenerate the reports with `node benchmark/summarize.mjs`.
