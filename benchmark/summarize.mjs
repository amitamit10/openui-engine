// Builds results/<release>/summary.json + REPORT.md and results/README.md from raw data.
// usage: node benchmark/summarize.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIMS = ["hierarchy", "typography", "spacing", "colour", "product_visual", "mobile", "polish", "originality"];

// Agent usage as reported by the harness completion notifications (engine arm only).
// v0.2.0 / v0.2.1: ranges recorded at the time; v0.3.0: per agent.
const USAGE = {
  "v0.2.0": { agents: 3, tokens: "118,871-145,517", toolCalls: "42-62", seconds: "321-519", perAgent: null },
  "v0.2.1": { agents: 6, tokens: "75,739-96,362", toolCalls: "17-36", seconds: "177-358", perAgent: null },
  "v0.11.0": {
    agents: 4, tokens: "103,575-118,324 (baseline arm in the same run: 96,499-129,832)", toolCalls: "18-24 (baseline arm: 11-21)", seconds: "186-274 (baseline arm: 181-310)", perAgent: {
      copperline: { tokens: 107853, toolCalls: 18, seconds: 272 },
      pagebound: { tokens: 118324, toolCalls: 20, seconds: 274 },
      saffron: { tokens: 113562, toolCalls: 24, seconds: 272 },
      tempo: { tokens: 103575, toolCalls: 20, seconds: 186 },
    },
  },
  "v0.10.0": {
    agents: 4, tokens: "112,796-133,694 (baseline arm in the same run: 99,587-110,995)", toolCalls: "17-32 (baseline arm: 12-21)", seconds: "246-310 (baseline arm: 192-244)", perAgent: {
      ironbark: { tokens: 123361, toolCalls: 19, seconds: 273 },
      formwell: { tokens: 133694, toolCalls: 32, seconds: 310 },
      harvest: { tokens: 112796, toolCalls: 17, seconds: 246 },
      driftwood: { tokens: 113038, toolCalls: 22, seconds: 274 },
    },
  },
  "v0.9.0": {
    agents: 4, tokens: "105,389-129,433 (baseline arm in the same run: 102,811-119,752)", toolCalls: "18-40 (baseline arm: 15-26)", seconds: "186-352 (baseline arm: 201-224)", perAgent: {
      foxglove: { tokens: 119956, toolCalls: 29, seconds: 324 },
      kestrel: { tokens: 106030, toolCalls: 18, seconds: 186 },
      cadenza: { tokens: 129433, toolCalls: 40, seconds: 352 },
      podhaven: { tokens: 105389, toolCalls: 25, seconds: 253 },
    },
  },
  "v0.8.0": {
    agents: 4, tokens: "109,155-119,984 (baseline arm in the same run: 91,247-104,064)", toolCalls: "20-29 (baseline arm: 15-19)", seconds: "237-399 (baseline arm: 156-215)", perAgent: {
      tideline: { tokens: 109473, toolCalls: 25, seconds: 294 },
      hollis: { tokens: 119984, toolCalls: 27, seconds: 237 },
      brightwater: { tokens: 109155, toolCalls: 29, seconds: 399 },
      stockroom: { tokens: 118960, toolCalls: 20, seconds: 251 },
    },
  },
  "v0.7.0": {
    agents: 4, tokens: "101,494-153,494 (baseline arm in the same run: 107,128-131,863)", toolCalls: "18-38 (baseline arm: 14-31)", seconds: "251-355 (baseline arm: 199-338)", perAgent: {
      saltmarsh: { tokens: 119353, toolCalls: 18, seconds: 251 },
      lumen: { tokens: 101494, toolCalls: 18, seconds: 254 },
      plotline: { tokens: 115632, toolCalls: 24, seconds: 267 },
      marlowe: { tokens: 153494, toolCalls: 38, seconds: 355 },
    },
  },
  "v0.6.0": {
    agents: 4, tokens: "108,281-112,685 (baseline arm in the same run: 104,727-141,711)", toolCalls: "17-32 (baseline arm: 14-30)", seconds: "221-305 (baseline arm: 233-299)", perAgent: {
      quillstone: { tokens: 112685, toolCalls: 17, seconds: 221 },
      bluebell: { tokens: 110176, toolCalls: 20, seconds: 273 },
      rivet: { tokens: 108281, toolCalls: 32, seconds: 305 },
      tallyho: { tokens: 111884, toolCalls: 22, seconds: 274 },
    },
  },
  "v0.5.1": {
    agents: 4, tokens: "78,651-126,416 (baseline arm in the same run: 100,470-134,409)", toolCalls: "17-40 (baseline arm: 14-42)", seconds: "166-464 (baseline arm: 192-333)", perAgent: {
      ashby: { tokens: 111252, toolCalls: 29, seconds: 464 },
      cornerstone: { tokens: 87494, toolCalls: 20, seconds: 255 },
      oakhaven: { tokens: 78651, toolCalls: 17, seconds: 166 },
      cadence: { tokens: 126416, toolCalls: 40, seconds: 452 },
    },
  },
  "v0.5.0": {
    agents: 4, tokens: "85,541-125,121 (baseline arm in the same run: 100,053-123,576)", toolCalls: "18-50 (baseline arm: 16-24)", seconds: "195-512 (baseline arm: 187-263)", perAgent: {
      fernwood: { tokens: 113188, toolCalls: 32, seconds: 302 },
      skyplot: { tokens: 93129, toolCalls: 24, seconds: 201 },
      heronfinch: { tokens: 85541, toolCalls: 18, seconds: 195 },
      kinfolk: { tokens: 125121, toolCalls: 50, seconds: 512 },
    },
  },
  "hybrid-v0.4.1": {
    agents: 4, tokens: "104,474-125,480 (baseline arm in the same run: 100,030-116,060)", toolCalls: "18-29 (baseline arm: 14-24)", seconds: "314-402", perAgent: {
      tidewater: { tokens: 125480, toolCalls: 29, seconds: 402 },
      ironbark: { tokens: 104474, toolCalls: 18, seconds: 314 },
      loomhouse: { tokens: 122665, toolCalls: 24, seconds: 378 },
      quartermaster: { tokens: 117013, toolCalls: 25, seconds: 366 },
    },
  },
  "v0.4.0": {
    agents: 4, tokens: "77,598-95,242", toolCalls: "14-30", seconds: "175-346", perAgent: {
      crumbco: { tokens: 77598, toolCalls: 14, seconds: 175 },
      helio: { tokens: 85276, toolCalls: 24, seconds: 218 },
      codewell: { tokens: 94685, toolCalls: 22, seconds: 217 },
      reedlaw: { tokens: 95242, toolCalls: 30, seconds: 346 },
    },
  },
  "v0.3.1-heldout": {
    agents: 4, tokens: "80,420-95,448", toolCalls: "21-29", seconds: "263-488", perAgent: {
      pawpath: { tokens: 80420, toolCalls: 21, seconds: 263 },
      parlato: { tokens: 95448, toolCalls: 26, seconds: 279 },
      freightly: { tokens: 91242, toolCalls: 29, seconds: 364 },
      summitworks: { tokens: 87330, toolCalls: 29, seconds: 488 },
    },
  },
  "v0.3.1": { agents: 0, tokens: "0 (deterministic replay)", toolCalls: "0", seconds: "about 30 per build", perAgent: null },
  "v0.3.0": {
    agents: 6, tokens: "88,456-104,393", toolCalls: "23-40", seconds: "222-415",
    perAgent: {
      fieldnote: { tokens: 89773, toolCalls: 26, seconds: 377 },
      ledgerline: { tokens: 88456, toolCalls: 23, seconds: 258 },
      minutewise: { tokens: 99681, toolCalls: 40, seconds: 415 },
      atelier: { tokens: 104393, toolCalls: 35, seconds: 357 },
      kilnco: { tokens: 89415, toolCalls: 25, seconds: 258 },
      gridwise: { tokens: 91189, toolCalls: 27, seconds: 222 },
    },
  },
};

const NOTES = {
  "v0.11.0": "Controlled benchmark of the engine at commit 4850f56 (v0.10.0 plus: the icon sanitiser fix so rect-based Lucide icons draw, brand-tinted surfaces reverted to opt-in, style keywords for outdoor, catering, tree and forms briefs, and the earlier two-tone colour, gate and layout fixes). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (copperline plumbers, pagebound bookshop, saffron restaurant, tempo time-tracking software), engine frozen for the run. RESULT: engine 3/8 (baseline 5/8), judged more template-like in 5/8 (it was 8/8 in v0.9.0 and v0.10.0): the best generator result since the hybrid experiment, but still a loss. The three engine wins were tempo r1 and r2 (a software brief: editorial-paper, a Week 44 timesheet mockup hero, italic-accent serif headline) and copperline r2 (custom feature illustrations, a boiler hero). Typography is nearly tied (7.50 vs 7.38) and colour 7.50 vs 7.00. CAUTION: this is one run of 8 judgements over 4 briefs, the wins cluster on two briefs, and several things changed at once (icon fix, tint revert, matcher, new briefs), so the improvement cannot be attributed to any one change; the previous two runs went 0/8. The agents again patched style, so the new styles were largely not exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 104k-118k vs baseline 96k-130k, tool calls 18-24 vs 11-21, time 186-274 s vs 181-310 s: roughly comparable this run. DEFECTS named by agents (to fix): the brief patch did not take the testimonials, pricing and FAQ section title keys, so those headings stay generic; one agent's own report miscounted its feature cards (the page had 5, the report said 4). CONFOUNDS: one MCP agent left a preview-screenshots folder inside its deliverable (the evaluator ignores it); one baseline agent edited its HTML after its last browser check; several agents deleted their own scratch files. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.10.0": "Controlled benchmark of the engine at commit bc7de0c (v0.9.0 plus brand-tinted paper surfaces on the light styles, features[].art object fix, florist category, selector and snippet on gate issues, RTL support). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (ironbark tree surgeons, formwell forms software, harvest catering, driftwood kayak hire), engine frozen for the run. RESULT: engine 0/8, judged more template-like in 8/8; engine originality 4.9 and colour 5.75, the lowest of any run. The brand-tinted surfaces BACKFIRED: with the agents' green accents the whole page became mint, and judges called the engine pages a 'mint-green SaaS template' and 'mint-on-mint', while the baselines' 'warm cream, forest and amber' palettes won; the tinting is therefore reverted to opt-in. All four MCP agents patched the style to the older field-notes or warm-human, so the new styles were not exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 113k-134k vs baseline 100k-111k, tool calls 17-32 vs 12-21, time 246-310 s vs 192-244 s. DEFECTS named by agents (to fix): the matcher first chose the loud neo-brutal style for a relaxed outdoor hire brand; brief_template returns the generic SaaS template for food and outdoor-activity categories; a decorative hero icon tile rendered blank (a missing icon). CONFOUNDS: several agents deleted their own scratch files; one agent made an unnecessary read_documentation call. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.9.0": "Controlled benchmark of the engine at commit fe2959d (v0.8.0 plus swiss-grid, testimonial-wall, schedule and category fixes, a deeper two-tone secondary accent, and gate checks for invisible text and empty grid holes). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (foxglove florist, kestrel credit union, cadenza music academy, podhaven podcast hosting), engine frozen for the run. RESULT: engine 0/8, judged more template-like in 8/8; a regression from v0.8.0 (2/8) and the worst since v0.5.1. Judges' recurring words for the engine pages: centred hero plus browser-frame mockup, beige and green palette, card grids, weak spacing and empty gaps (a hero card with a dead empty lower strip), abstract or blob feature illustrations; for the baselines: bolder serif headline, richer and more specific palette per brief (plum and apricot for the florist, green and amber for the credit union), a specific hero object (practice card with staff and keys, balance and loan cards, an episode dashboard). The agents again chose the older field-notes or editorial-paper styles by patch, so the new styles were barely exercised. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: engine arm tokens 105k-129k vs baseline 103k-120k, tool calls 18-40 vs 15-26. DEFECTS named by agents (to fix): features[].art given as an object was silently ignored (only a plain SVG string worked); the florist category fell through to the SaaS template; the engine tints alternate feature cards in a different hue (the new two-tone layer) which an agent read as inconsistent; a hero schedule visual rendered empty on a first attempt. CONFOUNDS: several agents deleted their own scratch files. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.8.0": "Controlled benchmark of the engine at commit 98cff9d (v0.7.0 plus the defect fixes, a curated two-tone colour layer, and five new art directions shadcn-mono, material-tonal, swiss-grid, noir-luxe, pastel-play with style routing). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (tideline surf school, hollis architects, brightwater vet clinic, stockroom inventory app), engine frozen for the run. RESULT: engine 2/8, judged more template-like in 6/8: the best generator result so far but still a clear loss. Both engine wins were pages whose hero is a specific product UI mockup (brightwater clinic day sheet, stockroom stock screen). The new swiss-grid style was chosen by the matcher for the architects brief and LOST both pairs: judges called it a loud red-and-black startup look with a generic flat house drawing, a broken final CTA headline, a lopsided testimonials grid and an uneven hero. The spec forbids external images for both arms, so the photo, logo-prompt and placeholder tools were not exercised. COST: the MCP arm used about 17% more tokens, about 45% more tool calls and about 70% more wall-clock time than the baseline arm this run. DEFECTS named by agents and judges (to fix): swiss-grid CTA and testimonials layout; the schedule hero kind rendered empty; a duplicate id=features in the generated markup that the gate did not flag; last-section padding 31px against 104px elsewhere; brief_template has no good category for service businesses (surf school and services both returned the SaaS template, and search_design_references rejected the category); an agent could not find a logos caption field. CONFOUNDS: the Stockroom MCP agent made one failed send_message call to another session (nothing was sent); several agents deleted their own scratch files; the Stockroom MCP agent used the older field-notes style by its own patch, so the new styles were exercised only on Hollis. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.7.0": "Controlled benchmark of the engine at commit 7cdfd76 (v0.6.0 plus per-brief accents for field-notes/warm-human, steer to a specific customer artefact for non-software heroes, photo/logo/palette/legal tools, prompt placeholders and add_image). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (saltmarsh sauna club, marlowe maths tutors, lumen heirloom seeds, plotline screenwriting app), engine frozen for the run. RESULT: engine 1/8 again (judged more template-like in 7/8); the one win was a split pair on lumen. The spec forbids external images for BOTH arms, so the new photo, logo-prompt and placeholder flow was deliberately NOT exercised: this run measures the generator, not the asset tools. DEFECTS named by judges and agents (fixed afterwards): five features render as an orphaned 3+2 grid; pale or muted palettes and flat feature illustrations; hero floats overlapping the headline or mockup; the art sanitiser silently strips <text> (a drawn hero lost its labels, and a rejected feature art fell back to generic art with no warning); a sixth supplied feature silently dropped; desktop nav and footer links 17-30px tall; the build keeps nagging about a missing logo even when the text wordmark is wanted. CONFOUNDS: the Plotline MCP agent hand-appended a footer min-height rule to overrides.css; the Marlowe MCP agent replaced its svg hero with a ui mockup after the sanitiser stripped its labels; the Lumen MCP agent patched the style to field-notes; several agents deleted their own scratch files, so their working is not inspectable. Judge sessions were short (about 13-22 s each) but every verdict carried all 8 dimension scores and a specific rationale. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.6.0": "Controlled benchmark of the v0.6.0 engine (model-drawn bespoke SVG for hero and feature cards, illustration_kit, supplied mockups never overridden). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (quillstone bookbindery, bluebell nursery school, rivet bike shop, tallyho expense software), engine frozen at 15c928f. RESULT: engine 1/8, judged more template-like in 7/8; mean about 6.3 vs 7.5. The single win (bluebell r2) was praised for bespoke feature-card illustrations. Judges still prefer baselines on specific product visuals in the hero, dark metrics bands, palette distinctiveness and polish. DEFECTS found: Quillstone engine page showed an empty black block where the ink metrics band should be plus a clipped trust strip; model-drawn art overflowed its column on mobile; preserveAspectRatio slice cropped drawings; closing-form label 'Work email' is generic for non-SaaS. CONFOUNDS: Bluebell MCP agent hand-edited the closing-form label; Rivet MCP agent made two hand edits (a style block for .vz-art width, and preserveAspectRatio changed to meet); the Rivet baseline agent left a stray http.server on port 8765; several agents shared a scratchpad and some check scripts or briefs were overwritten. NOT deployed to Vercel (no VERCEL_TOKEN in this environment).",
  "v0.5.1": "Controlled benchmark of the v0.5.1 engine (drawn domain scenes for non-software heroes, bigger headline tiers, dark featured pricing tier). Haiku 5.5 without vs with the MCP, identical SPEC.md, same 60-call budget, four never-seen domains (ashby coffee roastery, cornerstone conveyancing law firm, oakhaven pottery studio, cadence restaurant-scheduling software), engine frozen for the run. RESULT: WORSE than v0.5.0 (engine 0/8; product-visual 5.25 vs 8.13). DIAGNOSIS from the judges' own words: the generic library scenes read as generic or wrong (a courthouse for conveyancing where the baseline showed a specific client-portal UI; a LOOM for a pottery studio because the keyword router matched 'craft'; a generic cafe where the baseline drew a labelled coffee bag with a cupping panel) and the engine's feature illustrations (one icon on an abstract motif) were weaker than the baselines' bespoke per-feature drawings. The scene override also replaced product mockups that were the better hero. CONFOUNDS: the Ashby MCP agent's first build accidentally used a brief another agent had overwritten in the shared scratchpad (it noticed and rebuilt); the Cadence MCP agent had to force heroStyle:'product' (the software check was too fragile, fixed afterwards) and hand-edited the footer tagline and touch-target sizes; the Ashby MCP agent hand-edited the billing-button height. Next version (v0.6.0): let the model draw bespoke SVG for the hero and each feature, give it an illustration kit to compose from, and never override a supplied product mockup.",
  "v0.5.0": "The controlled benchmark you specified, on the v0.5.0 engine (art-director pass: generative illustration layer, illustrated feature cards, hero scene, count-up metrics, design_review loop). Haiku 5.5 WITHOUT the MCP vs Haiku 5.5 WITH the MCP, the exact same specification (identical SPEC.md), the same 60-tool-call budget, four never-seen domains (fernwood dental practice, skyplot satellite-imagery API, heronfinch interior design studio, kinfolk in-home care), engine frozen for the run, no hand edits by any MCP-arm agent. Blind Sonnet judges, both label orders. NOT deployed to Vercel (no VERCEL_TOKEN in this environment); screenshots are in the data folder and the side-by-side pages. Observed afterwards: the engine's hero is still an app-window mockup even for non-software briefs, which judges call template-like; fixes for that, a dark featured pricing tier, bigger headline tiers and balanced hero cards follow in v0.5.1. Defects the MCP agents reported (fixed afterwards): prices without thousands separators, footer tagline truncated with an ellipsis, footer links 29px tall.",
  "hybrid-v0.4.1": "NEW ARM, not the generator: HYBRID = the Haiku builder writes the page by hand, exactly like the baseline (own layout, own illustrations; the engine's page generators build_site/compose_page/suggest_layout/brief_template are forbidden), but ALSO has the engine's QA tools (validate_design, detect_ai_slop, analyze_visual_quality, capture_preview, search_icons, generate_design_system) and is required to run validate_design and detect_ai_slop on its page, read the findings and fix them. In this release's data files the hybrid arm is stored under the label 'engine' (so existing scripts work); in the tables below the 'engine' columns ARE the hybrid arm. Four never-seen domains (tidewater marina, ironbark bookshop, loomhouse weaving studio, quartermaster restaurant inventory SaaS), fresh agents for both arms, engine frozen for the run (the CTA false-positive fix in verify was applied BEFORE the evaluation so both arms are scored by the same gate; audit numbers are not strictly comparable to earlier releases). CONFOUNDS, important: (1) the hybrid prompt tells the agent to 'make your own design decisions, your own layout, your own illustrations', wording the baseline prompt lacks - part of the originality gain may be this instruction and not the tools; (2) the hybrid arm did more iteration (18-29 tool calls vs 14-24 and about 8% more tokens): the gain could come from any extra critique loop rather than from the engine tools specifically; that control WAS run afterwards (see control-v0.4.1): a hand-written arm with the same sentence and a generic self-review loop but no engine tools tied the hybrid 4-4 and tied the baseline 4-4, so this release's 7/8 is NOT attributable to the engine tools; (3) n = 4 briefs x 2 label orders, one build per brief and arm, Sonnet judges judging Haiku from screenshots; (4) one hybrid agent made a stray, out-of-scope call to a remote-session creation tool, which the permission system denied (nothing was created); (5) three hybrid agents left the engine's .openui/ preview folder inside site/ (excluded from measurements). The QA gate did catch real defects in hand-written pages that agents then fixed (console 404s, contrast failures, horizontal overflow, sub-12px text, a failing pricing-toggle interaction), and exposed a false positive in the gate itself (fixed).",
  "v0.4.0": "FRESH run on four never-seen domains (reedlaw employment-law firm, crumbco artisan bakery, helio rooftop solar, codewell coding bootcamp): new Haiku 5.5 builders for both arms, original builder prompts verbatim, engine frozen at v0.4.0 (art-direction variety, layered hero floats, dark metrics band, feature-rows, chart and rebuild fixes), then blind pairwise judging. No engine-arm agent needed a hand edit this time. CAVEATS: the style keywords added for v0.4.0 were informed by the PREVIOUS held-out briefs' domains (pets, climbing, freight, tutoring), not these four; three agents independently reported that the hero float chips partly cover other hero content (a defect, fixed after this run); the reedlaw agent reported duplicate section ids, a hardcoded 'Save 20%' badge and no per-tier pricing unit (all fixed after this run); baseline agents shared a scratchpad directory and several had their check scripts overwritten by other agents' (they re-verified with unique names).",
  "v0.3.1-heldout": "FRESH, HELD-OUT run: four briefs the engine was never tuned on (pawpath vet network, summitworks climbing gym, freightly freight tracking, parlato Italian tutoring), new Haiku 5.5 builders for both arms using the original builder prompts verbatim, the engine as of the feature-rows commit, then blind pairwise judging. This is the cleanest evidence in the repo. CONFOUNDS: (1) the parlato and freightly engine agents hit a real bug (feature-rows silently dropped the 5th feature, which the spec requires) and hand-added it (parlato in HTML; freightly via page.json plus rebuild_project and a manual copy of dist/ into site/; freightly also swapped one chart visual for a table after a renderer crash); parlato also hand-edited the features heading. (2) I rebuilt the engine dist while the summitworks engine agent was still running, so part of that run used a newer build. (3) The fixes for the dropped feature, the chart crash and rebuild_project deploy are in later commits and are NOT reflected in these sites. (4) The shared scratchpad let one baseline agent's check script be overwritten by another's.",
  "v0.3.1": "Deterministic REPLAY, not a new model run: the six briefs written by the v0.3.0 Haiku agents were rebuilt unchanged with the engine after two fixes (split hero respects its mobile breakpoint; feature section defaults to alternating rows so every product visual is on screen, instead of one-at-a-time tabs). No hand edits. It isolates the engine change but is NOT a fair estimate of a fresh agent run: the briefs were written while the agents looked at tab-based output, and the layout change was designed after reading the v0.3.0 judges' complaints about those same sites (tuning to the judged set).",
  "v0.2.0": "First engine-guided run with the 19-tool surface. Engine agents needed many calls to get a passing build.",
  "v0.2.1": "Reliability pass: fewer calls, fewer tokens, build_site one-shot. Design identity unchanged.",
  "v0.3.0": "Design-identity pass: tone-driven art direction (new field-notes style), composable product screens (`ui` visual), non-violet accents. " +
    "CONFOUND: 5 of 6 agents hand-patched a real engine CSS bug (the split hero ignored its mobile breakpoint, so the product panel overlapped the headline at 390px) in the delivered site; the atelier agent also hand-edited price formatting and copy. The bug is fixed in source afterwards (see v0.3.1 / commit da2cb88) but these results measure the sites as delivered, hand edits included.",
};

const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const r1 = (n) => Math.round(n * 10) / 10;

function armMetrics(res, arm) {
  const rows = Object.entries(res).filter(([k]) => k.endsWith("-" + arm)).map(([, v]) => v);
  if (!rows.length) return null;
  return {
    sites: rows.length,
    quality: r1(mean(rows.map((x) => x.quality.overall))),
    originalityScore: r1(mean(rows.map((x) => x.quality.dimensions.originality ?? 0))),
    slopScore: r1(mean(rows.map((x) => x.slop.score))),
    slopFindings: r1(mean(rows.map((x) => x.slop.findings.length))),
    auditErrors: r1(mean(rows.map((x) => x.audit.totals.errors))),
    auditWarnings: r1(mean(rows.map((x) => x.audit.totals.warnings))),
    neutralChecksPassed: `${rows.reduce((a, x) => a + x.neutral.filter((n) => n.passed).length, 0)}/${rows.reduce((a, x) => a + x.neutral.length, 0)}`,
    svgs: r1(mean(rows.map((x) => x.discipline.svgs))),
    fontFamilies: r1(mean(rows.map((x) => x.discipline.fontFamilies.length))),
    distinctColors: r1(mean(rows.map((x) => x.discipline.distinctTextColorsAndFills))),
    spacingOn4px: r1(mean(rows.map((x) => x.discipline.spacingOn4pxGrid)) * 100),
    sourceKB: r1(mean(rows.map((x) => x.source.totalBytes)) / 1024),
  };
}

const releases = ["v0.2.0", "v0.2.1", "v0.3.0", "v0.3.1", "v0.3.1-heldout", "v0.4.0", "hybrid-v0.4.1", "v0.5.0", "v0.5.1", "v0.6.0", "v0.7.0", "v0.8.0", "v0.9.0", "v0.10.0", "v0.11.0"];
const summaries = {};
for (const rel of releases) {
  const dir = join("results", rel);
  const res = JSON.parse(readFileSync(join(dir, "data", "results.json"), "utf8"));
  const judges = JSON.parse(readFileSync(join(dir, "raw", "judges.json"), "utf8"));
  const wins = { baseline: 0, engine: 0 };
  judges.forEach((j) => wins[j.winner]++);
  const scores = {};
  for (const arm of ["baseline", "engine"]) scores[arm] = Object.fromEntries(DIMS.map((d) => [d, r1(mean(judges.map((j) => j[arm][d])))]));
  const meanAll = (arm) => r1(mean(DIMS.map((d) => scores[arm][d])));
  const s = {
    release: rel, note: NOTES[rel],
    briefs: [...new Set(judges.map((j) => j.brief))],
    judgements: judges.length, wins,
    engineWinRatePct: Math.round((wins.engine / judges.length) * 100),
    engineJudgedMoreTemplateLike: judges.filter((j) => j.more_template_like === "engine").length,
    judgeScores: scores, judgeMeanOverall: { baseline: meanAll("baseline"), engine: meanAll("engine") },
    automated: { baseline: armMetrics(res, "baseline"), engine: armMetrics(res, "engine") },
    engineAgentUsage: USAGE[rel],
  };
  summaries[rel] = s;
  writeFileSync(join(dir, "summary.json"), JSON.stringify(s, null, 2));

  const pairs = judges.map((j) => `| ${j.brief} r${j.round} | ${j.winner} | ${r1(mean(DIMS.map((d) => j.baseline[d])))} | ${r1(mean(DIMS.map((d) => j.engine[d])))} | ${j.more_template_like} |`).join("\n");
  const dimRows = DIMS.map((d) => `| ${d} | ${scores.baseline[d]} | ${scores.engine[d]} | ${r1(scores.engine[d] - scores.baseline[d])} |`).join("\n");
  const a = s.automated;
  let md = `# ${rel} results

${s.note}

## Headline

- Blind pairwise judging: **engine won ${wins.engine} / ${judges.length}**, baseline won ${wins.baseline} / ${judges.length}.
- Engine page judged *more template-like* in ${s.engineJudgedMoreTemplateLike} / ${judges.length} pairs.
- Mean judge score (8 dimensions, 1-10): baseline **${s.judgeMeanOverall.baseline}**, engine **${s.judgeMeanOverall.engine}**.

## Judge scores by dimension

| dimension | baseline | engine | delta |
|---|---|---|---|
${dimRows}

## Every judgement (unsealed)

| pair | winner | baseline mean | engine mean | more template-like |
|---|---|---|---|---|
${pairs}

Raw verdicts, with the judges' own rationales where recorded, are in \`raw/judges.json\`. Screenshots and per-site audit JSON are in \`data/\`.

## Automated, markup-agnostic measurements (mean per site)

| metric | baseline | engine |
|---|---|---|
| sites | ${a.baseline.sites} | ${a.engine.sites} |
| heuristic quality (0-100) | ${a.baseline.quality} | ${a.engine.quality} |
| originality score (0-100) | ${a.baseline.originalityScore} | ${a.engine.originalityScore} |
| slop score (0-100, higher is cleaner) | ${a.baseline.slopScore} | ${a.engine.slopScore} |
| slop findings | ${a.baseline.slopFindings} | ${a.engine.slopFindings} |
| audit errors | ${a.baseline.auditErrors} | ${a.engine.auditErrors} |
| audit warnings | ${a.baseline.auditWarnings} | ${a.engine.auditWarnings} |
| neutral interaction checks passed | ${a.baseline.neutralChecksPassed} | ${a.engine.neutralChecksPassed} |
| inline SVG illustrations | ${a.baseline.svgs} | ${a.engine.svgs} |
| font families | ${a.baseline.fontFamilies} | ${a.engine.fontFamilies} |
| distinct colours | ${a.baseline.distinctColors} | ${a.engine.distinctColors} |
| spacing on 4px grid (%) | ${a.baseline.spacingOn4px} | ${a.engine.spacingOn4px} |
| source size (KB) | ${a.baseline.sourceKB} | ${a.engine.sourceKB} |

## Engine-arm agent cost

Agents: ${s.engineAgentUsage.agents}. Tokens per agent: ${s.engineAgentUsage.tokens}. Tool calls: ${s.engineAgentUsage.toolCalls}. Wall-clock seconds: ${s.engineAgentUsage.seconds}.
${s.engineAgentUsage.perAgent ? "\n| brief | tokens | tool calls | seconds |\n|---|---|---|---|\n" + Object.entries(s.engineAgentUsage.perAgent).map(([b, u]) => `| ${b} | ${u.tokens.toLocaleString("en-US")} | ${u.toolCalls} | ${u.seconds} |`).join("\n") + "\n" : ""}
## Honest limits

- Builder model is Claude Haiku 5.5, a substitute for the GPT-6 Luna the original brief named (not available here).
- n = 1 build per brief and arm; judges are the same model family as the builders (Sonnet judging Haiku).
- Judges saw only screenshots, in randomised and position-swapped pairs; the arm mapping was sealed until after scoring.
- Nothing was deployed to Vercel (no token in this environment).
- The slop detector was tuned on the v0.1.0 data, so its scores are not independent evidence.
`;
  if (rel.startsWith("hybrid")) md = md.replace(/\*\*engine won/g, "**hybrid won").replace("Engine page judged", "Hybrid page judged").replace(/\*\*engine\*\*/g, "**hybrid**").replace(/\| engine \|/g, "| hybrid |").replace("| engine mean |", "| hybrid mean |").replace("Engine-arm agent cost", "Hybrid-arm agent cost").replace(", engine **", ", hybrid **").replace(/\| baseline \| engine \|/g, "| baseline | hybrid |");
  writeFileSync(join(dir, "REPORT.md"), md);
}

const row = (rel) => {
  const s = summaries[rel];
  return `| [${rel}](${rel}/REPORT.md) | ${s.judgements} | ${s.wins.engine} / ${s.judgements} | ${s.judgeMeanOverall.baseline} | ${s.judgeMeanOverall.engine} | ${s.judgeScores.engine.originality} | ${s.judgeScores.engine.product_visual} | ${s.engineAgentUsage.tokens} | ${s.engineAgentUsage.toolCalls} | ${s.engineAgentUsage.seconds} |`;
};
const idx = `# Results by release

Every release of OpenUI Engine is evaluated the same way: the same spec per brief, a clean workspace, a Haiku 5.5 builder with and without the engine, neutral automated measurements, then blind pairwise judging of screenshots.

| release | judgements | engine wins | baseline mean | engine mean | engine originality | engine product visual | engine tokens / agent | tool calls | seconds |
|---|---|---|---|---|---|---|---|---|---|
${releases.map(row).join("\n")}

The v0.1.0 run (three arms, the original experiment) is in [v0.1.0/REPORT.md](v0.1.0/REPORT.md). The control experiment that tests whether the hybrid's win came from the engine tools is in [control-v0.4.1/REPORT.md](control-v0.4.1/REPORT.md) (result: it did not, as far as 8 judgements can tell).

**Reading it honestly:** reliability (tokens, calls, time) improved from v0.2.0 to v0.2.1; judged originality and product-visual scores rose in v0.3.0; and in the v0.3.1 replay the engine won its first blind pairs (2 of 12) - but that replay reuses v0.3.0's briefs after a layout change made in response to those same judges, so it is tuned to the judged set. The fresh held-out run on four new briefs is the honest test: the engine won 1 of 8, and was judged more template-like in 5 of 8. The v0.4.0 fresh run on four unseen domains: engine (generator) 1 of 8, judged more template-like in 7 of 8. The new **hybrid** arm (hand-written page + the engine's QA tools) won 7 of 8 on four more unseen domains - its row's 'engine' columns are the hybrid arm - but see its report for confounds: it does not yet isolate the engine tools from extra iteration and from a prompt sentence that asked for original design. The generator beat the baseline in 4 of 66 judgements overall; the hybrid beat it in 7 of 8, but the follow-up control arm (no engine tools) tied both the hybrid and the baseline 4-4, so the engine tools are not shown to be the cause - see [control-v0.4.1](control-v0.4.1/REPORT.md).

Per-release folders contain \`REPORT.md\`, \`summary.json\`, \`raw/\` (judge verdicts) and \`data/\` (screenshots and audits). Regenerate the reports with \`node benchmark/summarize.mjs\`.
`;
writeFileSync(join("results", "README.md"), idx);
console.log(idx);
