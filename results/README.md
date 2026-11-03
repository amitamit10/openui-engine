# Results by release

Every release of OpenUI Engine is evaluated the same way: the same spec per brief, a clean workspace, a Haiku 5.5 builder with and without the engine, neutral automated measurements, then blind pairwise judging of screenshots.

| release | judgements | engine wins | baseline mean | engine mean | engine originality | engine product visual | engine tokens / agent | tool calls | seconds |
|---|---|---|---|---|---|---|---|---|---|
| [v0.2.0](v0.2.0/REPORT.md) | 6 | 0 / 6 | 7.9 | 5.6 | 3.5 | 5.2 | 118,871-145,517 | 42-62 | 321-519 |
| [v0.2.1](v0.2.1/REPORT.md) | 12 | 0 / 12 | 7.9 | 5.6 | 3.3 | 4.5 | 75,739-96,362 | 17-36 | 177-358 |
| [v0.3.0](v0.3.0/REPORT.md) | 12 | 0 / 12 | 7.8 | 5.8 | 5.1 | 6 | 88,456-104,393 | 23-40 | 222-415 |
| [v0.3.1](v0.3.1/REPORT.md) | 12 | 2 / 12 | 7.7 | 6.5 | 5.6 | 7.2 | 0 (deterministic replay) | 0 | about 30 per build |
| [v0.3.1-heldout](v0.3.1-heldout/REPORT.md) | 8 | 1 / 8 | 7.5 | 6.1 | 5.6 | 6.6 | 80,420-95,448 | 21-29 | 263-488 |
| [v0.4.0](v0.4.0/REPORT.md) | 8 | 1 / 8 | 7.6 | 6.3 | 5.5 | 7.4 | 77,598-95,242 | 14-30 | 175-346 |
| [hybrid-v0.4.1](hybrid-v0.4.1/REPORT.md) | 8 | 7 / 8 | 6.9 | 7.6 | 7.6 | 7.6 | 104,474-125,480 (baseline arm in the same run: 100,030-116,060) | 18-29 (baseline arm: 14-24) | 314-402 |
| [v0.5.0](v0.5.0/REPORT.md) | 8 | 1 / 8 | 7.5 | 6.6 | 6.3 | 7.5 | 85,541-125,121 (baseline arm in the same run: 100,053-123,576) | 18-50 (baseline arm: 16-24) | 195-512 (baseline arm: 187-263) |
| [v0.5.1](v0.5.1/REPORT.md) | 8 | 0 / 8 | 7.7 | 6 | 4.9 | 5.3 | 78,651-126,416 (baseline arm in the same run: 100,470-134,409) | 17-40 (baseline arm: 14-42) | 166-464 (baseline arm: 192-333) |
| [v0.6.0](v0.6.0/REPORT.md) | 8 | 1 / 8 | 7.6 | 6.3 | 5.6 | 6 | 108,281-112,685 (baseline arm in the same run: 104,727-141,711) | 17-32 (baseline arm: 14-30) | 221-305 (baseline arm: 233-299) |
| [v0.7.0](v0.7.0/REPORT.md) | 8 | 1 / 8 | 7.7 | 6.6 | 5.8 | 6.6 | 101,494-153,494 (baseline arm in the same run: 107,128-131,863) | 18-38 (baseline arm: 14-31) | 251-355 (baseline arm: 199-338) |
| [v0.8.0](v0.8.0/REPORT.md) | 8 | 2 / 8 | 7.6 | 6.5 | 6 | 6.8 | 109,155-119,984 (baseline arm in the same run: 91,247-104,064) | 20-29 (baseline arm: 15-19) | 237-399 (baseline arm: 156-215) |
| [v0.9.0](v0.9.0/REPORT.md) | 8 | 0 / 8 | 7.7 | 6.4 | 5.5 | 6.8 | 105,389-129,433 (baseline arm in the same run: 102,811-119,752) | 18-40 (baseline arm: 15-26) | 186-352 (baseline arm: 201-224) |
| [v0.10.0](v0.10.0/REPORT.md) | 8 | 0 / 8 | 7.7 | 6 | 4.9 | 6.1 | 112,796-133,694 (baseline arm in the same run: 99,587-110,995) | 17-32 (baseline arm: 12-21) | 246-310 (baseline arm: 192-244) |
| [v0.11.0](v0.11.0/REPORT.md) | 8 | 3 / 8 | 7.3 | 6.8 | 6.1 | 6.5 | 103,575-118,324 (baseline arm in the same run: 96,499-129,832) | 18-24 (baseline arm: 11-21) | 186-274 (baseline arm: 181-310) |
| [v0.12.0](v0.12.0/REPORT.md) | 8 | 1 / 8 | 7.6 | 6.7 | 6.3 | 6.5 | 99,128-124,032 (baseline arm in the same run: 101,869-126,500) | 16-25 (baseline arm: 12-22) | 206-368 (baseline arm: 188-442) |

The v0.1.0 run (three arms, the original experiment) is in [v0.1.0/REPORT.md](v0.1.0/REPORT.md). The control experiment that tests whether the hybrid's win came from the engine tools is in [control-v0.4.1/REPORT.md](control-v0.4.1/REPORT.md) (result: it did not, as far as 8 judgements can tell).

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1; judged originality and product-visual scores rose in v0.3.0; and in the v0.3.1 replay the engine won its first blind pairs (2 of 12) - but that replay reuses v0.3.0's briefs after a layout change made in response to those same judges, so it is tuned to the judged set. The fresh held-out run on four new briefs is the honest test: the engine won 1 of 8, and was judged more template-like in 5 of 8. The v0.4.0 fresh run on four unseen domains: engine (generator) 1 of 8, judged more template-like in 7 of 8. The new **hybrid** arm (hand-written page + the engine's QA tools) won 7 of 8 on four more unseen domains - its row's 'engine' columns are the hybrid arm - but see its report for confounds: it does not yet isolate the engine tools from extra iteration and from a prompt sentence that asked for original design. The generator beat the baseline in 4 of 66 judgements overall; the hybrid beat it in 7 of 8, but the follow-up control arm (no engine tools) tied both the hybrid and the baseline 4-4, so the engine tools are not shown to be the cause - see [control-v0.4.1](control-v0.4.1/REPORT.md).

Per-release folders contain `REPORT.md`, `summary.json`, `raw/` (judge verdicts) and `data/` (screenshots and audits). Regenerate the reports with `node benchmark/summarize.mjs`.
