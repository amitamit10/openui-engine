# Task: Ember & Rye — production-ready website

Build a visually outstanding, production-ready, single-page website for a fictional organisation.

**Organisation:** Ember & Rye — a wood-fire restaurant and bar in Bristol: whole-fish and aged-lamb dishes cooked over oak and apple wood, sourdough and rye baked daily, a short natural-wine list and a 24-seat private room.
**Audience:** locals, couples, small celebrations and corporate dinners. **Tone:** warm, confident, a little smoky.

## Required sections (in this order)
1. Sticky navigation (brand, 4 anchor links such as Menu, Private dining, Visit, Gift cards, sign-in or member link, primary CTA "Book a table") with a working mobile menu
2. Hero: headline, subheadline, primary + secondary CTA, and a convincing visual of the actual product, work or experience (no external images — build it with HTML/CSS/SVG)
3. Social-proof strip (6 fictional partner, press or customer names; no real company logos)
4. Features / offer: at least 5 distinct items, each with a short visual or illustration (HTML/CSS/SVG)
5. "How a visit works" in 3 steps
6. Metrics band (4 figures: covers a week, hours of fire before service, local suppliers, years open)
7. Testimonials (3, fictional people)
8. Pricing or giving: 3 tiers — Set Lunch, Tasting Menu and Private Room. Include a working per person/per table toggle that changes the displayed prices
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
* At most 60 tool calls and about 25 minutes of wall-clock time. Work independently. Do not look at any other directory under /home/user/bench16 except your own workspace.
* When finished, reply with: what you built, what you verified, and anything you could not fix.
