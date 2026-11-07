# Contributing

1. `pnpm install && pnpm build`. Node ≥ 20, pnpm ≥ 10, a Chromium for the e2e suite (`npx playwright-core install chromium`).
2. Work test-first where possible (`packages/*/src/*.test.ts`, `packages/mcp-server/test/e2e.test.ts`). A bug found by the audit should become a test.
3. Before a PR: `pnpm build && pnpm typecheck && pnpm lint && pnpm test && pnpm run docs:build`.
4. **Design changes** must keep all six art directions at 0 errors in `validate_design` and 0 errors/warnings in `npx @google/design.md lint` (CI checks both).
5. **Components & sources**: never vendor third-party source. Add a registry entry with honest `license.verified` and read the upstream LICENSE before marking it verified. Do not scrape galleries; record status in `references/sources.ts`.
6. **Honesty rule**: measured results and subjective judgement are labelled separately (see `QualityDimension.basis`). Don't add scores that cannot be justified by evidence.
7. Commits: imperative, scoped (`verify: …`). Apache-2.0 — by contributing you license your work under it. No hidden backlinks in generated output.
