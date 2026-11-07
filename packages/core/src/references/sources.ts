/**
 * Audit of every inspiration / component source named in the project brief.
 * `status` reflects what an HTTP probe from the build sandbox actually returned on 2026-11-02 — not assumptions.
 */
export interface SourceRecord {
  id: string;
  name: string;
  url: string;
  role: "component-library" | "inspiration" | "motion" | "video-visual";
  httpStatus: number | string;
  access: "open-registry" | "open-browse" | "paid" | "freemium" | "blocked" | "no-public-api";
  integration: "live-registry" | "metadata-pointer" | "pattern-knowledge-only" | "excluded";
  license: string;
  notes: string;
}

export const AUDIT_DATE = "2026-11-02";

export const SOURCES: SourceRecord[] = [
  { id: "bencho", name: "Bencho", url: "https://bencho.dev/", role: "component-library", httpStatus: 200, access: "open-browse", integration: "pattern-knowledge-only",
    license: "unverified (source published at github.com/cabralorenzo/bencho; not reachable from the audit sandbox)",
    notes: "~100 interactive React micro-interaction demos (drag, hover, press). No shadcn registry endpoint; each demo is copy-source. Highly bespoke motion (genie effect, slingshot, magnetic letters) — impressive but too idiosyncratic and stateful for reliable AI composition. Used as pattern inspiration for micro-interaction ideas, not imported." },
  { id: "fluid", name: "Fluid Functionalism", url: "https://www.fluidfunctionalism.com/", role: "component-library", httpStatus: 200, access: "open-registry", integration: "live-registry",
    license: "unverified (repo mickadesign/fluid-functionalism not reachable from sandbox)",
    notes: "shadcn-compatible registry at /r/registry.json with 82 items: themes (surfaces, tokens, type-scale), libs (springs, contexts), hooks (fluid hover), and ui/blocks in both Radix and Base UI flavours. Per-item JSON includes full source + registryDependencies. Also publishes /llms.txt. Best fit for app-style UI primitives; integrated as a live registry source." },
  { id: "scrolltide", name: "Scrolltide", url: "https://scrolltide.co/", role: "motion", httpStatus: 308, access: "paid", integration: "metadata-pointer",
    license: "Commercial. Early access / lifetime $299; MCP included with Yearly & Lifetime plans; some templates free preview.",
    notes: "133 cinematic scroll templates (React/Next/GSAP/Three/shaders) with an existing MCP at scrolltide.co/mcp ('no API key'). Not duplicated: OpenUI Engine does not resell or re-host its prompts. Users who hold a licence can run Scrolltide's MCP alongside ours; our compat engine treats its output as high-energy (3) content." },
  { id: "21st", name: "21st.dev", url: "https://21st.dev/", role: "component-library", httpStatus: 200, access: "freemium", integration: "metadata-pointer",
    license: "Per-component author licences; platform ToS.", notes: "12,000+ community components, copy-paste. No public registry listing endpoint found (/r/registry.json → 404), so cannot be indexed without scraping; excluded from the live index. Pointer only." },
  { id: "shadcn", name: "shadcn/ui", url: "https://ui.shadcn.com/", role: "component-library", httpStatus: 200, access: "open-registry", integration: "live-registry",
    license: "MIT (verified 2026-11-03: LICENSE.md in shadcn-ui/ui, Copyright (c) 2023 shadcn)",
    notes: "Item JSON at /r/styles/new-york-v4/<name>.json. Baseline accessible primitives (Radix). Integrated for primitives. Site sections seen 2026-11-03: Docs, Components, Blocks, Charts, Directory, Typeset, Create. Its neutral zinc look (hairline borders, near-black primary, small exact type) is the model for the `shadcn-mono` art direction." },
  { id: "untitledui", name: "Untitled UI React", url: "https://www.untitledui.com/react/components", httpStatus: 200, role: "component-library", access: "open-browse", integration: "pattern-knowledge-only",
    license: "MIT for the open-source components (verified 2026-11-03: LICENSE in github.com/untitleduico/react, Copyright (c) 2025 Untitled UI). Paid Pro content is separate and not used.",
    notes: "Large catalogue of React + Tailwind + React Aria components, marketing sections (hero headers, metrics, pricing, FAQ, social proof, testimonials, CTAs, team, blog, footers) and page templates (landing, pricing, about, contact, legal, 404), plus application screens. Reached through a share.google link that redirects to this page. Used as pattern knowledge for section structure and for the clean, brand-coloured SaaS look; no code is copied." },
  { id: "mui", name: "MUI / Material UI", url: "https://mui.com/", httpStatus: 200, role: "component-library", access: "open-browse", integration: "pattern-knowledge-only",
    license: "MIT for Material UI (verified 2026-11-03: LICENSE in mui/material-ui, Copyright (c) 2014 Call-Em-All). MUI X has paid Pro/Premium tiers and is not used.",
    notes: "Material Design component library (MUI Core, MUI X, Templates, Design Kits). Reached through a share.google link that redirects to this page. Its tonal surfaces, large radii, pill controls and soft elevation are the model for the `material-tonal` art direction; no code is copied." },
  { id: "reactbits", name: "React Bits", url: "https://reactbits.dev/", role: "component-library", httpStatus: 200, access: "open-registry", integration: "live-registry",
    license: "unverified — check repo for custom terms before commercial redistribution",
    notes: "shadcn registry at /r/registry.json; many GSAP/three/OGL effects. Included selectively because most effects add heavy runtimes and high motion energy." },
  { id: "aceternity", name: "Aceternity UI", url: "https://ui.aceternity.com/", role: "component-library", httpStatus: 200, access: "freemium", integration: "live-registry",
    license: "Free registry items + paid Pro; confirm terms.", notes: "Item JSON at /registry/<name>.json. Visually bold; frequently heavy (motion + canvas). Included sparingly and flagged high-energy." },
  { id: "magicui", name: "Magic UI", url: "https://magicui.design/", role: "component-library", httpStatus: 200, access: "open-registry", integration: "live-registry",
    license: "unverified in sandbox (open registry at /r/registry.json)", notes: "Lightweight, mostly CSS-driven effects (marquee, shiny text, bento). Best bundle-size ratio of the effect libraries; preferred for logo scrollers." },
  { id: "oversight-supply", name: "Oversight Supply (sections)", url: "https://supply.madebyoversight.com/sections", role: "inspiration", httpStatus: 200, access: "freemium", integration: "metadata-pointer",
    license: "Commercial templates (Webflow/Framer); 58 sections, 38 free to copy with account, 20 Pro ($15/mo).", notes: "Prompts/templates are commercial; not scraped or repackaged. Used as a category pointer for 'section pattern' discovery." },
  { id: "oversight-videos", name: "Oversight Supply (videos)", url: "https://supply.madebyoversight.com/videos", role: "video-visual", httpStatus: 200, access: "paid", integration: "metadata-pointer",
    license: "Premium skills $9.99/mo.", notes: "Claude video skills; out of scope for UI generation. Pointer only." },
  { id: "cta-gallery", name: "CTA.gallery", url: "https://cta.gallery/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Editorial gallery; submitters retain rights.", notes: "Categories: button, call-to-buy, download, form, modal, navigation, newsletter, pricing. Used to shape CTA-hierarchy rules; no content copied." },
  { id: "godly", name: "Godly", url: "https://godly.website/", role: "inspiration", httpStatus: "200 (redirects to recent.design)", access: "open-browse", integration: "metadata-pointer", license: "Editorial gallery.", notes: "godly.website now serves the Recent design-inspiration site (same content as recent.design). Recorded as moved." },
  { id: "recent", name: "Recent", url: "https://recent.design/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Editorial gallery.", notes: "Filters: Web Interface, Branding, Motion, Illustration, Posters, Print; also launch videos, OG images, resources, skills." },
  { id: "internet-designs", name: "The Internet Designs", url: "https://theinternetdesigns.com/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Aggregates posts from X/Pinterest; rights remain with authors.", notes: "Categories: interfaces, landing page, mobile apps, dashboards, interactions, typography. Do not reproduce." },
  { id: "devault", name: "Devault", url: "https://devault.design/", role: "inspiration", httpStatus: 403, access: "blocked", integration: "excluded", license: "Unknown.", notes: "Cloudflare challenge ('Attention Required') from the sandbox; content could not be inspected. Recorded as inaccessible rather than assumed." },
  { id: "on-design", name: "On Design", url: "https://on.design/", role: "inspiration", httpStatus: 200, access: "no-public-api", integration: "metadata-pointer", license: "Unknown.", notes: "Page is a client-rendered shell ('Design, together — again'); no server-rendered content to evaluate." },
  { id: "inspora", name: "Inspora", url: "https://inspora.design/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Editorial archive.", notes: "Filters: web, branding, product, motion, illustration, 3D, print." },
  { id: "land-book", name: "Land-book", url: "https://land-book.com/", role: "inspiration", httpStatus: 403, access: "blocked", integration: "excluded", license: "Unknown.", notes: "Cloudflare 'Just a moment…' challenge from the sandbox; not inspectable." },
  { id: "supahero", name: "Supahero", url: "https://supahero.io/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Gallery; individual sites retain rights.", notes: "Hero-section library; now part of screensdesign. Directly informs the three hero variants." },
  { id: "footer-design", name: "Footer.design", url: "https://footer.design/", role: "inspiration", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "Editorial gallery.", notes: "Footer types: typographic, small type, illustrative, grid, animated, cards, large type. Informs footer-columns." },
  { id: "60fps", name: "60fps.design", url: "https://60fps.design/", role: "motion", httpStatus: 200, access: "freemium", integration: "metadata-pointer", license: "Gallery + Pro; includes its own MCP.", notes: "2,140 shots / 499 apps / 83 motion entries plus an MCP. Motion references only; we do not duplicate its MCP." },
  { id: "onepromptdesign", name: "OnePromptDesign", url: "https://onepromptdesign.com/", role: "video-visual", httpStatus: 200, access: "open-browse", integration: "metadata-pointer", license: "AI image prompts; check per-prompt terms.", notes: "AI image-prompt library for ads/backdrops/gradients. Useful for generating hero imagery prompts; not integrated." },
];
