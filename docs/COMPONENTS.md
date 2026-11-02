# Component inventory

> Generated from `packages/core/src/registry/components.ts`. 32 curated entries (quality over registry size — the MCP never returns the whole list).

| ID | Slot | Source | Framework | Runtimes | Motion | Styles | Licence |
|---|---|---|---|---|---|---|---|
| `openui/navbar-glass` | navbar | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/hero-centered-product` | hero | openui | html | none | 2/3 | aurora-dark, clarity-light, warm-human | Apache-2.0 |
| `openui/hero-split` | hero | openui | html | none | 1/3 | terminal-dev, warm-human, clarity-light, aurora-dark | Apache-2.0 |
| `openui/hero-editorial` | hero | openui | html | none | 1/3 | editorial-paper, neo-brutal | Apache-2.0 |
| `openui/logo-cloud` | logos | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/feature-bento` | features | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/feature-rows` | features | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/metrics` | metrics | openui | html | none | 0/3 | all | Apache-2.0 |
| `openui/steps` | steps | openui | html | none | 0/3 | all | Apache-2.0 |
| `openui/testimonials` | testimonials | openui | html | none | 0/3 | all | Apache-2.0 |
| `openui/pricing` | pricing | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/faq` | faq | openui | html | none | 0/3 | all | Apache-2.0 |
| `openui/cta-band` | cta | openui | html | none | 1/3 | all | Apache-2.0 |
| `openui/footer-columns` | footer | openui | html | none | 0/3 | all | Apache-2.0 |
| `fluid/tabs` | primitive | fluid | react | tailwind, radix, motion | 2/3 | clarity-light, aurora-dark, warm-human | unverified (unverified) |
| `fluid/button` | primitive | fluid | react | tailwind, radix, motion | 1/3 | clarity-light, aurora-dark, warm-human | unverified (unverified) |
| `fluid/accordion` | faq | fluid | react | tailwind, radix, motion | 1/3 | clarity-light, aurora-dark, warm-human | unverified (unverified) |
| `fluid/dialog` | primitive | fluid | react | tailwind, radix, motion | 1/3 | clarity-light, aurora-dark, warm-human | unverified (unverified) |
| `fluid/card` | primitive | fluid | react | tailwind, motion | 1/3 | clarity-light, aurora-dark | unverified (unverified) |
| `fluid/table` | primitive | fluid | react | tailwind, motion | 1/3 | clarity-light, aurora-dark, terminal-dev | unverified (unverified) |
| `fluid/sidebar` | layout | fluid | react | tailwind, radix, motion | 1/3 | clarity-light, aurora-dark | unverified (unverified) |
| `fluid/surfaces` | layout | fluid | react | tailwind, none | 0/3 | clarity-light, aurora-dark | unverified (unverified) |
| `shadcn/button` | primitive | shadcn | react | tailwind, radix | 0/3 | all | MIT (unverified) |
| `shadcn/accordion` | faq | shadcn | react | tailwind, radix | 0/3 | all | MIT (unverified) |
| `shadcn/dialog` | primitive | shadcn | react | tailwind, radix | 0/3 | all | MIT (unverified) |
| `shadcn/navigation-menu` | navbar | shadcn | react | tailwind, radix | 0/3 | all | MIT (unverified) |
| `shadcn/tabs` | primitive | shadcn | react | tailwind, radix | 0/3 | all | MIT (unverified) |
| `magicui/marquee` | logos | magicui | react | tailwind, tailwind | 2/3 | aurora-dark, clarity-light, warm-human | unverified (unverified) |
| `magicui/bento-grid` | features | magicui | react | tailwind, tailwind | 1/3 | aurora-dark, clarity-light | unverified (unverified) |
| `magicui/animated-shiny-text` | text-effect | magicui | react | tailwind, tailwind | 2/3 | aurora-dark, clarity-light | unverified (unverified) |
| `aceternity/bento-grid` | features | aceternity | react | tailwind, tailwind, motion | 2/3 | aurora-dark | unverified (unverified) |
| `reactbits/animated-content` | layout | reactbits | react | tailwind, gsap | 2/3 | warm-human, neo-brutal, aurora-dark | unverified (unverified) |

## Art directions

| Style | Mode | Motion budget | Categories | Signature |
|---|---|---|---|---|
| **Aurora Dark** (`aurora-dark`) | dark | 2/3 | saas, ai-product, devtool, fintech | Hairline 1px borders on every surface |
| **Clarity Light** (`clarity-light`) | light | 2/3 | saas, fintech, consumer-app, ai-product | Layered soft shadows instead of borders |
| **Editorial Paper** (`editorial-paper`) | light | 1/3 | agency, portfolio, saas, ecommerce | Serif display at large optical size with an italic emphasis word |
| **Terminal Dev** (`terminal-dev`) | dark | 1/3 | devtool, ai-product, saas | Monospace display type |
| **Warm Human** (`warm-human`) | light | 3/3 | consumer-app, saas, ecommerce | Large corner radii |
| **Neo Brutal** (`neo-brutal`) | light | 3/3 | agency, portfolio, consumer-app, ecommerce | 3px black outlines |

## Composition patterns

- `hero.product-led` — Product-led centered hero (hero)
- `hero.split-technical` — Split hero with code or UI (hero)
- `hero.editorial-type` — Type-led editorial hero (hero)
- `nav.glass-sticky` — Sticky glass navigation (navbar)
- `proof.logo-strip` — Quiet logo strip (logos)
- `features.bento` — Bento feature grid (features)
- `features.deep-rows` — Alternating deep-dive rows (features)
- `proof.stat-band` — Stat band (metrics)
- `proof.quotes` — Quote cards (testimonials)
- `convert.pricing-3` — Three-tier pricing with toggle (pricing)
- `convert.faq` — Objection-handling FAQ (faq)
- `convert.final-cta` — Closing CTA band (cta)
- `chrome.footer` — Columned footer (footer)
- `motion.restraint` — Restrained scroll reveal (motion)
