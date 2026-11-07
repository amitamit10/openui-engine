# Task: Northstar — production-ready SaaS landing page

Build a visually outstanding, production-ready, single-page marketing website for a fictional SaaS product.

**Product:** Northstar — AI-assisted incident management for engineering teams. It detects incidents from monitoring signals,
pages the right on-call engineer, drafts the timeline and postmortem automatically, and tracks reliability (MTTR, SLO burn).
**Audience:** engineering leaders and on-call engineers at 50–2,000-person software companies. **Tone:** calm, precise, trustworthy, modern.

## Required sections (in this order)
1. Sticky navigation (brand, 4 anchor links, sign-in, primary CTA) with a working mobile menu
2. Hero: headline, subheadline, primary + secondary CTA, and a convincing product visual (no external images — build it with HTML/CSS/SVG)
3. Social-proof strip (6 fictional customer names; do not use real company logos)
4. Features: at least 5 distinct capabilities, each with a short visual or illustration (HTML/CSS/SVG)
5. "How it works" in 3 steps
6. Metrics band (4 figures)
7. Testimonials (3, fictional people)
8. Pricing: 3 tiers (Starter / Team / Enterprise) with a working monthly/yearly toggle that changes the displayed prices
9. FAQ (6 questions) as an accessible accordion
10. Final CTA band
11. Footer with 3 link columns and a legal line

## Requirements
* Deliverable: a static site in `site/` with `site/index.html` at its root (CSS/JS may be separate files). No build step required to view it; it must be deployable as-is to any static host (e.g. Vercel).
* No external images or network assets other than Google Fonts. All copy must be written by you (no lorem ipsum).
* Responsive and polished from 390px to 1440px wide: no horizontal overflow, readable type, touch targets ≥ 44px for primary controls.
* Accessible: semantic landmarks, one h1, correct heading order, alt text where needed, visible keyboard focus, WCAG AA contrast, respects prefers-reduced-motion.
* No console errors, no broken anchors, all interactions (menu, pricing toggle, accordion) working.
* Cohesive visual design: a deliberate type scale, spacing system, colour palette and consistent component styling.
* Verify your work in a real browser (a headless Chromium with Playwright is installed at /opt/pw-browsers; `require('playwright')` works from /opt/node-tools or via NODE_PATH=/opt/node-tools/node_modules) — take desktop and mobile screenshots, look at them, and fix problems before finishing.

## Limits
* At most 60 tool calls and about 25 minutes of wall-clock time. Work independently. Do not look at any other directory under /home/user/bench except your own workspace.
* When finished, reply with: what you built, what you verified, and anything you could not fix.
