import os,subprocess
briefs={
"pixelmoth":dict(co="Pixelmoth Games",desc="a four-person indie studio launching Moss & Lantern, a cozy puzzle game about restoring an overgrown lighthouse island, for PC and Switch, with a demo, a soundtrack and a physical collector's edition",aud="puzzle and cozy-game players, streamers and games press",tone="gentle, playful, a little mysterious",items=("Pricing","Launch week","Regular"),tiers=("Digital","Deluxe","Collector"),links="The game, Demo, Press kit, Community",cta="Wishlist on Steam",wk="How a night on the island plays",metrics="hand-drawn rooms, puzzles, hours of play, languages"),
"wren":dict(co="Wren & Paw Veterinary Clinic",desc="an independent small-animal vet clinic in Norwich with same-day appointments, a cat-only waiting room, in-house lab results in an hour, and monthly care plans for puppies, adults and senior pets",aud="dog and cat owners, first-time pet owners and rescue volunteers",tone="reassuring, practical, kind",items=("Care plans","Per month","Per year"),tiers=("Puppy & Kitten","Adult Care","Senior Care"),links="Services, Care plans, Team, Emergencies",cta="Book an appointment",wk="How a first visit works",metrics="vets and nurses, minutes for lab results, years in Norwich, same-day appointments kept"),
"dovecote":dict(co="Dovecote Studios",desc="a coworking space in a converted Victorian mill in Sheffield with hot desks, resident desks, lockable private studios, a podcast booth, a darkroom and a members' kitchen",aud="freelancers, makers, small creative teams and remote workers",tone="warm, industrious, welcoming",items=("Memberships","Monthly","Annual"),tiers=("Day Desk","Resident Desk","Private Studio"),links="Spaces, Membership, Visit, Community",cta="Book a tour",wk="How membership works",metrics="desks and studios, members, days of fresh tea a week, hours a day open"),
"ledgerleaf":dict(co="Ledgerleaf Bookkeeping",desc="a bookkeeping service for freelancers and sole traders: monthly books, receipt capture, VAT and self-assessment prepared, and a human accountant who answers within a working day",aud="freelancers, sole traders and very small limited companies",tone="calm, plain-spoken, dependable",items=("Plans","Monthly","Annual"),tiers=("Essentials","Steady","Full Books"),links="Services, Pricing, How it works, Accountants",cta="Get a free books check",wk="How your books get done",metrics="clients, hours saved a month, reply time, deadlines missed"),
"lowtide":dict(co="Lowtide Audio",desc="a podcast production studio in Bristol that records, edits, scores and publishes shows for charities, publishers and independent hosts, with remote recording kits posted to guests",aud="podcast hosts, charity comms teams and publishers",tone="warm, precise, a little dry",items=("Packages","Per episode","Per season"),tiers=("Single Episode","Season Pack","Network Retainer"),links="Shows, Process, Pricing, Studio",cta="Plan your show",wk="How an episode gets made",metrics="episodes produced, shows, downloads, working days to publish"),
"brightwater":dict(co="Brightwater Solar",desc="a MCS-certified rooftop solar and battery installer in the South West: surveys, fixed quotes, roof-safe mounting, battery storage and a seven-year monitored guarantee",aud="homeowners, farm owners and small landlords",tone="straightforward, trustworthy, optimistic",items=("Systems","Pay upfront","Finance"),tiers=("Starter Array","Family Array","Farm Array"),links="Systems, Savings, Installation, Reviews",cta="Get a fixed quote",wk="How an installation goes",metrics="roofs fitted, kWh generated, years of monitored guarantee, days from survey to switch-on"),
}
for k,b in briefs.items():
    spec=f"""# Task: {b['co']} — production-ready website

Build a visually outstanding, production-ready, single-page website for a fictional organisation.

**Organisation:** {b['co']} — {b['desc']}.
**Audience:** {b['aud']}. **Tone:** {b['tone']}.

## Required sections (in this order)
1. Sticky navigation (brand, 4 anchor links such as {b['links']}, sign-in or member link, primary CTA "{b['cta']}") with a working mobile menu
2. Hero: headline, subheadline, primary + secondary CTA, and a convincing visual of the actual product, work or experience (no external images — build it with HTML/CSS/SVG)
3. Social-proof strip (6 fictional partner, press or customer names; no real company logos)
4. Features / offer: at least 5 distinct items, each with a short visual or illustration (HTML/CSS/SVG)
5. "{b['wk']}" in 3 steps
6. Metrics band (4 figures: {b['metrics']})
7. Testimonials (3, fictional people)
8. Pricing: 3 tiers — {b['tiers'][0]}, {b['tiers'][1]} and {b['tiers'][2]}. Include a working {b['items'][1].lower()}/{b['items'][2].lower()} toggle that changes the displayed prices
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
"""
    for arm in ("control","engine","hybrid"):
        d=f"/home/user/bench17/{k}/{arm}"; os.makedirs(d,exist_ok=True)
        open(d+"/SPEC.md","w").write(spec)
        subprocess.run(["git","init","-q",d]); subprocess.run(["git","-C",d,"add","-A"]); subprocess.run(["git","-C",d,"-c","user.email=b@x","-c","user.name=b","commit","-qm","spec"])
print("ok")
