import os,subprocess
briefs={
"kelpline":dict(co="Kelpline Summit",desc="a two-day conference on ocean technology: underwater robotics, seaweed farming, coastal sensing and marine data, held every October in Aberdeen with 40 talks, 6 workshops and a harbour boat session",aud="marine engineers, researchers, startup founders and coastal-authority staff",tone="curious, practical, open",items=("Pass types","Early bird","Standard"),tiers=("Day Pass","Full Summit","Team of Five"),links="Programme, Speakers, Tickets, Venue",cta="Get tickets",wk="How attending works",metrics="talks, workshops, countries, years running"),
"clearwater":dict(co="Clearwater Trust",desc="a registered charity restoring chalk streams and river banks in southern England: gravel and riffle restoration, volunteer planting days, invasive species removal and water-quality monitoring by citizen scientists",aud="local residents, anglers, schools and corporate volunteers who want to help and to see where donations go",tone="hopeful, grounded, transparent",items=("Giving","Monthly","One-off"),tiers=("Rivulet","Chalk Stream","Catchment Champion"),links="Our rivers, Volunteer, Donate, Reports",cta="Donate",wk="How your gift works",metrics="km restored, volunteers, citizen-science sites, of each pound spent on rivers"),
"ines":dict(co="Ines Okafor Photography",desc="an independent photographer in Lisbon shooting weddings, editorial portraits and commercial work for restaurants and boutique hotels; film and digital, natural light, calm direction",aud="couples, magazine art directors and hospitality owners",tone="quiet, confident, warm",items=("Packages","Half day","Full day"),tiers=("Editorial","Wedding","Commercial"),links="Work, Packages, About, Journal",cta="Check my dates",wk="How a shoot works",metrics="weddings shot, magazines published in, years behind the camera, average days to deliver"),
"halden":dict(co="Halden & Voss Architects",desc="a nine-person architecture studio in Leeds designing low-energy homes, school extensions and barn conversions, with a fixed-fee design stage and an in-house structural engineer",aud="homeowners, small developers and school trusts",tone="precise, unfussy, quietly ambitious",items=("Fee stages","Design stage","Full service"),tiers=("Feasibility","Design Stage","Full Service"),links="Projects, Process, Fees, Studio",cta="Book a site visit",wk="How a project runs",metrics="projects completed, average energy saving, awards, weeks from brief to planning submission"),
"tilde":dict(co="Tilde Language School",desc="an online school teaching Portuguese, Polish and Japanese to adults through small live classes of six, a weekly speaking club and a progress report written by a human teacher",aud="adults relocating or learning for family and travel",tone="encouraging, clear, a little witty",items=("Billing","Per term","Monthly"),tiers=("Club","Core Class","Intensive"),links="Courses, Teachers, Pricing, Free trial",cta="Book a free trial lesson",wk="How learning works",metrics="learners, average class size, teacher rating, languages"),
"ember":dict(co="Ember & Rye",desc="a wood-fire restaurant and bar in Bristol: whole-fish and aged-lamb dishes cooked over oak and apple wood, sourdough and rye baked daily, a short natural-wine list and a 24-seat private room",aud="locals, couples, small celebrations and corporate dinners",tone="warm, confident, a little smoky",items=("Booking","Per person","Per table"),tiers=("Set Lunch","Tasting Menu","Private Room"),links="Menu, Private dining, Visit, Gift cards",cta="Book a table",wk="How a visit works",metrics="covers a week, hours of fire before service, local suppliers, years open"),
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
8. Pricing or giving: 3 tiers — {b['tiers'][0]}, {b['tiers'][1]} and {b['tiers'][2]}. Include a working {b['items'][1].lower()}/{b['items'][2].lower()} toggle that changes the displayed prices
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
"""
    for arm in ("baseline","engine"):
        d=f"/home/user/bench16/{k}/{arm}"; os.makedirs(d,exist_ok=True)
        open(d+"/SPEC.md","w").write(spec)
        subprocess.run(["git","init","-q",d]); subprocess.run(["git","-C",d,"add","-A"]); subprocess.run(["git","-C",d,"-c","user.email=b@x","-c","user.name=b","commit","-qm","spec"])
print("ok")
