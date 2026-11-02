<div align="center">

# OpenUI Engine

**Design intelligence, a visual editor and real-browser QA for AI coding agents — exposed as an MCP server.**

[Apache-2.0](LICENSE) · TypeScript · MCP (stdio + Streamable HTTP) · Playwright · by [Amit Elgabsi](https://github.com/amitamit10)

</div>

Cheap coding models are fine at code and poor at *design decisions*. OpenUI Engine moves those decisions out of the model:
it hands the agent a **curated, compatibility-checked component registry**, a **WCAG-verified design system** (`DESIGN.md` + tokens), a **browser editor** where a human can comment and tweak, and a **Chromium QA gate** that proves the page actually looks right — then lets the agent iterate until it does.

![architecture](docs/diagrams/architecture.png)

## What's in the box

| Package | What it does |
|---|---|
| [`@openui-engine/core`](packages/core) | Art directions (6), token generator + WCAG linting, DESIGN.md / DTCG / CSS exporters, component registry with structured compatibility metadata, composition checker, reference/pattern search, section renderers and page builder |
| [`@openui-engine/verify`](packages/verify) | Playwright audit: overflow, axe-core, console/network errors, broken assets & anchors, interaction tests, reduced-motion, invisible-content detection, **design-token compliance**, pixel-scan whitespace analysis, heuristic quality scoring |
| [`@openui-engine/editor`](packages/editor) | Browser editor: select, comment, live-tweak typography/spacing/colour/radius/shadow/layout, switch component variants, natural-language requests → agent. Token-authenticated sessions |
| [`@openui-engine/mcp-server`](packages/mcp-server) | The MCP server (`openui-engine-mcp`) and a protocol-level CLI client (`openui-engine-call`) |

### MCP tools (13)

| Tool | Purpose |
|---|---|
| `discover_components` | Short ranked list (fit score + reason + install command) for a slot/style — never the whole registry |
| `get_component` | Metadata, compatibility, licence status; `detail=source` returns an example (OpenUI) or **live-fetched** registry source |
| `search_design_references` | Composition patterns (principles, pitfalls, implementing components) + audited inspiration-source status |
| `generate_design_system` | Chooses an art direction from the brief; writes `DESIGN.md`, `tokens.json` (DTCG), `tokens.css`, `openui.tokens.json`; returns lint |
| `suggest_layout` | Surface-first section sequence with reasons |
| `compose_page` | Create/update a project and render `dist/` (static, deployable). Edit copy via `sectionProps`, restructure via add/remove |
| `update_design_tokens` / `rebuild_project` | Change tokens by path and re-render |
| `validate_design` | The QA gate (desktop/tablet/mobile) with fix-oriented, id-addressed issues |
| `capture_preview` | Real screenshots returned as images so a multimodal model can *look* |
| `analyze_visual_quality` | Evidence-backed scores (measured vs heuristic labelled) |
| `create_review_session` | Starts the editor, returns a private tokenised URL |
| `get_visual_feedback` | Comments, requests and pending tweaks as CSS patches; long-poll supported |
| `apply_visual_tweaks` | Persist approved tweaks to `openui.overrides.json` (id-keyed CSS) and rebuild |

## Quick start

```bash
git clone https://github.com/amitamit10/openui-engine && cd openui-engine
pnpm install && pnpm build            # Node ≥ 20; set OPENUI_CHROMIUM=/path/to/chrome if Playwright's cache is not present
node packages/mcp-server/dist/call.js list                      # real MCP round-trip over stdio
node packages/mcp-server/dist/call.js generate_design_system '{"name":"Acme","description":"dark AI platform","outDir":"acme"}'
node packages/mcp-server/dist/call.js compose_page '{"projectDir":"acme","brief":{"name":"Acme","description":"…"}}'
node packages/mcp-server/dist/call.js validate_design '{"target":"acme"}'
```

Register it with your agent → **[docs/MCP_SETUP.md](docs/MCP_SETUP.md)** (Claude Code, Codex, Cursor, generic stdio and remote HTTP).

## The loop

![loop](docs/diagrams/quality-loop.png)

`Generate → Render → Screenshot → Inspect → Correct → Verify` — a successful build is not treated as a visually correct site. The gate has already paid for itself during development: it found invisible content after scroll (smooth-scroll vs IntersectionObserver), three contrast failures in non-default styles, and a WCAG failure for pure-red brand colours that the unit test suite then locked down.

## Design intelligence, not keyword search

* **Art directions** (`aurora-dark`, `clarity-light`, `editorial-paper`, `terminal-dev`, `warm-human`, `neo-brutal`) define type ratio, palette, radii, shadows, motion budget, hero composition, CTA hierarchy, image treatment and section transitions — plus signatures and *don'ts*.
* **Compatibility**: each component declares styles it is native to, motion energy, density, runtimes (Radix vs Base UI, GSAP vs Motion), framework and licence status. `checkComposition` flags framework mixes, duplicate slots, animation-runtime mixes, energy spread and style misfits.
* **Tokens are enforced**, not decorative: the verifier computes colour/font/size/spacing/radius compliance of the rendered DOM against `tokens.json`.
* **DESIGN.md** follows Google's alpha spec and is checked with the official linter in CI.

## Visual editor

`create_review_session` → open the URL → click any element → change type, spacing, colour, radius, shadow, layout → comment → "Ask agent". Everything reaches the agent through `get_visual_feedback`; **Apply** persists tweaks as stable `[data-openui-id="…"]` rules in `openui.overrides.json`, regenerates the site, and the diff is reviewable in git. Any localhost dev server can be reviewed too (tweaks are then returned as CSS patches).

Security: loopback only by default, 192-bit per-session secret exchanged for an HttpOnly/SameSite=Strict cookie, Host allow-list (DNS-rebinding), Origin + JSON-only mutations (CSRF), CSP, 64 KB body cap, rate limit, SSRF guard on proxy targets, property/value allow-list for persisted CSS, 8 h expiry, secrets never written to disk. See [SECURITY.md](SECURITY.md).

## Sources & licences

Component and inspiration sources were audited with real HTTP probes — **including the ones that turned out to be blocked, paid or moved** — in [docs/SOURCES.md](docs/SOURCES.md). Third-party component source is never vendored; it's fetched from each project's own registry on demand. The author's private skill collection audit is in [docs/SKILLS_AUDIT.md](docs/SKILLS_AUDIT.md). Component inventory: [docs/COMPONENTS.md](docs/COMPONENTS.md).

## Benchmark (read before quoting it)

A controlled experiment was run with a **substitute model** (`claude-haiku-5-5`; GPT-6 Luna is unavailable here). Headline findings, in order of importance:

* The "engine available" agent **made zero MCP calls**, so it was effectively a second baseline; a third arm with *required* engine use was added.
* In a **blind design review the engine-built page ranked last**; measured token discipline (12 vs ~30 colours, 9 vs 14–17 font sizes) and zero sub-12 px text *were* better. Accessibility/overflow/function were indistinguishable.
* **No Vercel deployment was possible** (no credentials in the session); no live URLs are claimed.
* n = 1 per arm. This is **not** evidence that the engine improves a cheap model's design — see [`results/v0.1.0/REPORT.md`](results/v0.1.0/REPORT.md) for confounds, the three flaws it exposed (all fixed) and the open gap (generic composition). Interactive side-by-side: [`results/v0.1.0/site`](results/v0.1.0/site/index.html).

## Results by release

Each release is tested the same way (same spec, clean workspace, Haiku 5.5 builder with and without the engine, neutral measurements, blind pairwise judging of screenshots). Full tables, every unsealed verdict and raw data: [`results/`](results/README.md).

| release | judged pairs | engine wins | judge mean (baseline / engine) | engine originality | engine product visual | engine tokens per agent | tool calls |
|---|---|---|---|---|---|---|---|
| [v0.2.0](results/v0.2.0/REPORT.md) | 6 | 0 | 7.9 / 5.6 | 3.5 | 5.2 | 118,871-145,517 | 42-62 |
| [v0.2.1](results/v0.2.1/REPORT.md) | 12 | 0 | 7.9 / 5.6 | 3.3 | 4.5 | 75,739-96,362 | 17-36 |
| [v0.3.0](results/v0.3.0/REPORT.md) | 12 | 0 | 7.8 / 5.8 | 5.1 | 6.0 | 88,456-104,393 | 23-40 |
| [v0.3.1](results/v0.3.1/REPORT.md) (replay) | 12 | 2 | 7.7 / 6.5 | 5.6 | 7.2 | n/a (no model run) | n/a |
| [v0.3.1 held-out](results/v0.3.1-heldout/REPORT.md) (4 new briefs, fresh agents) | 8 | 1 | 7.5 / 6.1 | 5.6 | 6.6 | 80,420-95,448 | 21-29 |

What the data says, plainly: the engine got cheaper and more reliable (v0.2.1) and its judged originality and product-visual scores rose, but **an unguided Haiku still wins the blind comparison: 47 of 50 judgements across all runs.** The v0.3.1 replay (engine 2/12) is not independent evidence - it reuses the v0.3.0 briefs after a change I made in response to the v0.3.0 judges. The fresh **held-out run on four new briefs is the honest test: engine 1 of 8, and its pages were judged more template-like in 5 of 8.** The judges credit the baselines with bold, brief-specific identity (a climbing-wall hero for a gym, layered lesson cards for a language tutor) while the engine reached for the same cream-green-serif look on three unrelated briefs. Where the engine does win is engineering hygiene: 0 audit errors on every held-out site versus 1-6 on every baseline. Those held-out runs also exposed three real engine bugs (the feature section silently dropped a fifth feature, a chart crash on malformed data, `rebuild_project` not deploying), all fixed in later commits but not reflected in the measured sites. So: the engine currently improves *correctness* of what a cheap model ships; it does **not** yet improve how *good it looks* versus that model working freely. Regenerate with `node benchmark/summarize.mjs`.

## Status & honest limitations

* Output target today is **static HTML/CSS/JS** with original sections (zero runtime deps). React/shadcn/Fluid components are *discoverable and installable* but not composed into generated pages yet.
* `analyze_visual_quality` measures engineering quality; it cannot judge taste, brand fit or imagery. Always look at `capture_preview`.
* Third-party licences are marked *unverified* where the upstream repositories were not reachable from the audit sandbox.
* The editor persists to OpenUI projects; arbitrary codebases get CSS patches, not source rewrites.

## Development

```bash
pnpm build && pnpm typecheck && pnpm lint && pnpm test   # unit + browser e2e (needs Chromium)
pnpm run docs:build && pnpm run site:build                  # regenerate inventories and the docs site (itself built with the engine)
```

## Attribution

Created by **Amit Elgabsi** ([@amitamit10](https://github.com/amitamit10)). Attribution lives in this README, `NOTICE` and the docs site footer. **Generated client sites contain no backlinks or hidden credits.** Diagrams made with [stack-diagram](https://github.com/caru-ini/stack-diagram) (MIT).
