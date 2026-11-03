# Design & component source audit

> Generated from `packages/core/src/references/sources.ts` — status reflects what an HTTP probe from the build sandbox actually returned on **2026-11-02**. Nothing here is assumed; blocked or paid sources are recorded as such.

| Source | Role | HTTP | Access | Integration | Licence / terms |
|---|---|---|---|---|---|
| [Bencho](https://bencho.dev/) | component-library | 200 | open-browse | pattern-knowledge-only | unverified (source published at github.com/cabralorenzo/bencho; not reachable from the audit sandbox) |
| [Fluid Functionalism](https://www.fluidfunctionalism.com/) | component-library | 200 | open-registry | live-registry | unverified (repo mickadesign/fluid-functionalism not reachable from sandbox) |
| [Scrolltide](https://scrolltide.co/) | motion | 308 | paid | metadata-pointer | Commercial. Early access / lifetime $299; MCP included with Yearly & Lifetime plans; some templates free preview. |
| [21st.dev](https://21st.dev/) | component-library | 200 | freemium | metadata-pointer | Per-component author licences; platform ToS. |
| [shadcn/ui](https://ui.shadcn.com/) | component-library | 200 | open-registry | live-registry | MIT (verified 2026-11-03: LICENSE.md in shadcn-ui/ui, Copyright (c) 2023 shadcn) |
| [Untitled UI React](https://www.untitledui.com/react/components) | component-library | 200 | open-browse | pattern-knowledge-only | MIT for the open-source components (verified 2026-11-03: LICENSE in github.com/untitleduico/react, Copyright (c) 2025 Untitled UI). Paid Pro content is separate and not used. |
| [MUI / Material UI](https://mui.com/) | component-library | 200 | open-browse | pattern-knowledge-only | MIT for Material UI (verified 2026-11-03: LICENSE in mui/material-ui, Copyright (c) 2014 Call-Em-All). MUI X has paid Pro/Premium tiers and is not used. |
| [React Bits](https://reactbits.dev/) | component-library | 200 | open-registry | live-registry | unverified — check repo for custom terms before commercial redistribution |
| [Aceternity UI](https://ui.aceternity.com/) | component-library | 200 | freemium | live-registry | Free registry items + paid Pro; confirm terms. |
| [Magic UI](https://magicui.design/) | component-library | 200 | open-registry | live-registry | unverified in sandbox (open registry at /r/registry.json) |
| [Oversight Supply (sections)](https://supply.madebyoversight.com/sections) | inspiration | 200 | freemium | metadata-pointer | Commercial templates (Webflow/Framer); 58 sections, 38 free to copy with account, 20 Pro ($15/mo). |
| [Oversight Supply (videos)](https://supply.madebyoversight.com/videos) | video-visual | 200 | paid | metadata-pointer | Premium skills $9.99/mo. |
| [CTA.gallery](https://cta.gallery/) | inspiration | 200 | open-browse | metadata-pointer | Editorial gallery; submitters retain rights. |
| [Godly](https://godly.website/) | inspiration | 200 (redirects to recent.design) | open-browse | metadata-pointer | Editorial gallery. |
| [Recent](https://recent.design/) | inspiration | 200 | open-browse | metadata-pointer | Editorial gallery. |
| [The Internet Designs](https://theinternetdesigns.com/) | inspiration | 200 | open-browse | metadata-pointer | Aggregates posts from X/Pinterest; rights remain with authors. |
| [Devault](https://devault.design/) | inspiration | 403 | blocked | excluded | Unknown. |
| [On Design](https://on.design/) | inspiration | 200 | no-public-api | metadata-pointer | Unknown. |
| [Inspora](https://inspora.design/) | inspiration | 200 | open-browse | metadata-pointer | Editorial archive. |
| [Land-book](https://land-book.com/) | inspiration | 403 | blocked | excluded | Unknown. |
| [Supahero](https://supahero.io/) | inspiration | 200 | open-browse | metadata-pointer | Gallery; individual sites retain rights. |
| [Footer.design](https://footer.design/) | inspiration | 200 | open-browse | metadata-pointer | Editorial gallery. |
| [60fps.design](https://60fps.design/) | motion | 200 | freemium | metadata-pointer | Gallery + Pro; includes its own MCP. |
| [OnePromptDesign](https://onepromptdesign.com/) | video-visual | 200 | open-browse | metadata-pointer | AI image prompts; check per-prompt terms. |

## Notes per source

- **Bencho** — ~100 interactive React micro-interaction demos (drag, hover, press). No shadcn registry endpoint; each demo is copy-source. Highly bespoke motion (genie effect, slingshot, magnetic letters) — impressive but too idiosyncratic and stateful for reliable AI composition. Used as pattern inspiration for micro-interaction ideas, not imported.
- **Fluid Functionalism** — shadcn-compatible registry at /r/registry.json with 82 items: themes (surfaces, tokens, type-scale), libs (springs, contexts), hooks (fluid hover), and ui/blocks in both Radix and Base UI flavours. Per-item JSON includes full source + registryDependencies. Also publishes /llms.txt. Best fit for app-style UI primitives; integrated as a live registry source.
- **Scrolltide** — 133 cinematic scroll templates (React/Next/GSAP/Three/shaders) with an existing MCP at scrolltide.co/mcp ('no API key'). Not duplicated: OpenUI Engine does not resell or re-host its prompts. Users who hold a licence can run Scrolltide's MCP alongside ours; our compat engine treats its output as high-energy (3) content.
- **21st.dev** — 12,000+ community components, copy-paste. No public registry listing endpoint found (/r/registry.json → 404), so cannot be indexed without scraping; excluded from the live index. Pointer only.
- **shadcn/ui** — Item JSON at /r/styles/new-york-v4/<name>.json. Baseline accessible primitives (Radix). Integrated for primitives. Site sections seen 2026-11-03: Docs, Components, Blocks, Charts, Directory, Typeset, Create. Its neutral zinc look (hairline borders, near-black primary, small exact type) is the model for the `shadcn-mono` art direction.
- **Untitled UI React** — Large catalogue of React + Tailwind + React Aria components, marketing sections (hero headers, metrics, pricing, FAQ, social proof, testimonials, CTAs, team, blog, footers) and page templates (landing, pricing, about, contact, legal, 404), plus application screens. Reached through a share.google link that redirects to this page. Used as pattern knowledge for section structure and for the clean, brand-coloured SaaS look; no code is copied.
- **MUI / Material UI** — Material Design component library (MUI Core, MUI X, Templates, Design Kits). Reached through a share.google link that redirects to this page. Its tonal surfaces, large radii, pill controls and soft elevation are the model for the `material-tonal` art direction; no code is copied.
- **React Bits** — shadcn registry at /r/registry.json; many GSAP/three/OGL effects. Included selectively because most effects add heavy runtimes and high motion energy.
- **Aceternity UI** — Item JSON at /registry/<name>.json. Visually bold; frequently heavy (motion + canvas). Included sparingly and flagged high-energy.
- **Magic UI** — Lightweight, mostly CSS-driven effects (marquee, shiny text, bento). Best bundle-size ratio of the effect libraries; preferred for logo scrollers.
- **Oversight Supply (sections)** — Prompts/templates are commercial; not scraped or repackaged. Used as a category pointer for 'section pattern' discovery.
- **Oversight Supply (videos)** — Claude video skills; out of scope for UI generation. Pointer only.
- **CTA.gallery** — Categories: button, call-to-buy, download, form, modal, navigation, newsletter, pricing. Used to shape CTA-hierarchy rules; no content copied.
- **Godly** — godly.website now serves the Recent design-inspiration site (same content as recent.design). Recorded as moved.
- **Recent** — Filters: Web Interface, Branding, Motion, Illustration, Posters, Print; also launch videos, OG images, resources, skills.
- **The Internet Designs** — Categories: interfaces, landing page, mobile apps, dashboards, interactions, typography. Do not reproduce.
- **Devault** — Cloudflare challenge ('Attention Required') from the sandbox; content could not be inspected. Recorded as inaccessible rather than assumed.
- **On Design** — Page is a client-rendered shell ('Design, together — again'); no server-rendered content to evaluate.
- **Inspora** — Filters: web, branding, product, motion, illustration, 3D, print.
- **Land-book** — Cloudflare 'Just a moment…' challenge from the sandbox; not inspectable.
- **Supahero** — Hero-section library; now part of screensdesign. Directly informs the three hero variants.
- **Footer.design** — Footer types: typographic, small type, illustrative, grid, animated, cards, large type. Informs footer-columns.
- **60fps.design** — 2,140 shots / 499 apps / 83 motion entries plus an MCP. Motion references only; we do not duplicate its MCP.
- **OnePromptDesign** — AI image-prompt library for ads/backdrops/gradients. Useful for generating hero imagery prompts; not integrated.

## Integration policy

- **live-registry**: metadata is curated in this repo; *source code is fetched on demand from the project's own registry* by `get_component` and installed into the user's project. Nothing third-party is vendored here.
- **metadata-pointer**: we link to the gallery for human browsing. No pages are scraped, no thumbnails are cached, no markup is reproduced.
- **pattern-knowledge-only / excluded**: used as inspiration or not at all (see notes).
- Patterns in `search_design_references` are *original* descriptions of composition principles.
