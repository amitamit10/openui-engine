# Skills audit

Source audited: `amitamit10/openclew-projects-amit` → `hermes-backup/skills` (private repo, cloned shallow, read-only).
It contains **228 `SKILL.md` files** in two mirrored trees (`skills/…` and `skills/skills/…`, which differ only in a few files such as usage metadata).
The same `hermes-backup` folder also holds personal files (`MEMORY.md`, `SOUL.md`, `USER.md`, `config.yaml`, cron jobs). **None of those were read, copied or referenced**, and no skill script was run except where noted below.

## Decision table

| Skill (licence) | What it actually says | Decision | How it shaped OpenUI Engine |
|---|---|---|---|
| `creative/claude-design` (MIT, v1.3.0) | Process + taste: pick one of seven **surface archetypes** *before* tokens; hero + 3 cards is correct only for Decide/Learn; art-direction concept with 3 signatures and 2 tropes to avoid; verify at 390×844 / ~768 / desktop incl. console, overflow, focus, reduced motion | **Integrated (product + dev process)** | `suggest_layout` names the surface and justifies each section; every art direction carries `signatures` and `doNot` lists (tropes to avoid); verification checklist became the `validate_design` gate |
| `creative/design-md` (MIT; spec is Apache-2.0) | Google DESIGN.md: YAML tokens + ordered prose sections; `npx @google/design.md lint/diff/export`; pitfalls (quote hex, quote negative dims, `0em`, variants are sibling keys) | **Integrated** | `generate_design_system` writes spec-conformant DESIGN.md. The official linter found two real defects in my first output (`letterSpacing: 0` is not a dimension; orphaned colour tokens) — fixed; all six art directions now lint at **0 errors / 0 warnings** |
| `creative/popular-web-designs` (MIT; templates sourced from VoltAgent/awesome-design-md) | 54 ready-to-paste design systems that mimic Stripe, Linear, Vercel, … | **Reference only, not bundled** | Re-using brand-replica systems would ship look-alikes of real companies and the upstream licence of the extracted values is not stated in the skill. Used during development to sanity-check type scale and radius ranges; original art directions are provided instead |
| `creative/sketch` (MIT) | Throwaway HTML mockups: 2–3 variants to compare | **Dev-time; productised** | The six art directions + hero variants (`hero-centered-product / split / editorial`) and the editor's variant switcher are the durable form of "compare variants" |
| `software-development/web-ui-verification` (mit) | "A green build ≠ a correct UI": CDP screenshot + console + DOM assertion; stale CSS pitfalls; mobile emulation | **Principles integrated; scripts superseded** | Playwright (`packages/verify`) replaces the hand-rolled CDP/`ws` harness, keeps the principle, and adds axe, overflow, interactions, token compliance. The skill's *screenshot-before-trusting* rule directly caught a real bug (reveal content invisible after `scroll-behavior:smooth`) |
| `web-development/frontend-cdp-verification` (mit) | Same slice for deployed sites; 5 s waits too short, keyframe typos, CSS-hash staleness | **Principles integrated** | Wait for `networkidle` + fonts + instant scroll-through; invisible-content detector; deploy verification step in the benchmark runbook |
| `software-development/test-driven-development` (MIT) | RED → GREEN → REFACTOR | **Followed during development** | Property tests over all styles × adversarial brand accents (found a genuine WCAG failure for pure-red on `warm-human`); e2e test written against tool contracts |
| `software-development/systematic-debugging` (MIT) | Root-cause before fixing | **Followed during development** | Blank full-page screenshot → traced to smooth-scroll defeating IntersectionObserver rather than patching the screenshot; five audit "failures" were triaged as harness bugs vs product bugs before any fix |
| `vercel-web-app-builder`, `infra/vercel-free-deploy`, `web/nextjs-vercel-gist-db` (no licence field) | Next.js on Vercel free tier with a GitHub Gist as DB; notes on write-protected agent config | **Inspected, excluded** | Different problem (stateful Next apps). OpenUI output is static (`dist/`) which deploys to Vercel without a framework; no Gist DB, no tokens used. Deployment attempt is documented in `benchmark/` |
| `creative/architecture-diagram` (MIT, Cocoon AI) | Dark SVG diagrams as HTML | **Fallback only** | Superseded by stack-diagram as requested |
| `caru-ini/stack-diagram` (MIT; **public repo, not in the private collection**) | Brand-logo architecture diagrams with a geometry rulebook, built to self-contained HTML | **Used** | Scripts were reviewed before running (stdlib only; network limited to icon CDNs; `share.py` public-gallery upload deliberately **not** run). See `docs/diagrams/` |
| `cdp-browser-automation`, `headless-browser-cdp` (MIT) | Raw CDP drivers | **Excluded (duplicate)** | Playwright covers it |
| `creative/artifact-builder`, `comfyui`, `touchdesigner-mcp` | Unrelated to web UI generation | **Excluded** | — |
| UI/UX Pro Max, web-design-guidelines | Referenced by claude-design as optional | **Not available** | Not present in the collection or this execution environment; no equivalent was fabricated |

## Duplicate functionality identified
`web-ui-verification` ≈ `frontend-cdp-verification` ≈ `cdp-browser-automation` ≈ `headless-browser-cdp` (all hand-driven CDP) → one Playwright-based package.
`popular-web-designs` ≈ the *concept* of `generate_design_system` → we keep the DESIGN.md output format and drop brand imitation.

## Attribution & licensing inventory (skills)
All consumed skills are MIT (or Apache-2.0 for the DESIGN.md spec) and authored by the repository owner and/or credited upstreams (obra/superpowers, Cocoon AI, VoltAgent, gsd-build). No skill text is redistributed in this repository; ideas are re-implemented as original code.
