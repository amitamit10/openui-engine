# Task: Ledgerleaf Bookkeeping — production-ready website

Build a visually outstanding, production-ready, single-page website for a fictional organisation.

**Organisation:** Ledgerleaf Bookkeeping — a bookkeeping service for freelancers and sole traders: monthly books, receipt capture, VAT and self-assessment prepared, and a human accountant who answers within a working day.
**Audience:** freelancers, sole traders and very small limited companies. **Tone:** calm, plain-spoken, dependable.

## Required sections (in this order)
1. Sticky navigation (brand, 4 anchor links such as Services, Pricing, How it works, Accountants, sign-in or member link, primary CTA "Get a free books check") with a working mobile menu
2. Hero: headline, subheadline, primary + secondary CTA, and a convincing visual of the actual product, work or experience (no external images — build it with HTML/CSS/SVG)
3. Social-proof strip (6 fictional partner, press or customer names; no real company logos)
4. Features / offer: at least 5 distinct items, each with a short visual or illustration (HTML/CSS/SVG)
5. "How your books get done" in 3 steps
6. Metrics band (4 figures: clients, hours saved a month, reply time, deadlines missed)
7. Testimonials (3, fictional people)
8. Pricing: 3 tiers — Essentials, Steady and Full Books. Include a working monthly/annual toggle that changes the displayed prices
9. FAQ (6 questions) as an accessible accordion
10. Final CTA band
11. Footer with 3 link columns and a legal line

## Requirements
* Deliverable: a static site in `site/` with `site/index.html` at its root (CSS/JS may be separate files). No build step required to view it; it must be deployable as-is to any static host (e.g. Vercel).
* No external images or network assets other than Google Fonts. All copy must be written by you (no lorem ipsum). Copy must be specific to this organisation, not generic marketing filler.
* Responsive and polished from 390px to 1440px wide: no horizontal overflow, readable type, touch targets ≥ 44px for primary controls.
* Accessible: semantic landmarks, one h1, correct heading order, alt text where needed, visible keyboard focus, WCAG AA contrast, respects prefers-reduced-motion.
* No console errors, no broken anchors, all interactions (menu, toggle, accordion) working.
* Cohesive, distinctive visual design that does not look like a generic AI-generated template: a deliberate type scale, spacing system, colour palette and consistent component styling.
* Verify your work in a real browser (headless Chromium with Playwright is installed at /opt/pw-browsers; `require('playwright')` works from /opt/node-tools or via NODE_PATH=/opt/node-tools/node_modules) — take desktop and mobile screenshots, look at them with the Read tool, and fix problems before finishing.

## Limits
* At most 60 tool calls and about 25 minutes of wall-clock time. Work independently. Do not look at any other directory under /home/user/bench17 except your own workspace.
* When finished, reply with: what you built, what you verified, and anything you could not fix.
