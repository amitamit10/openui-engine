# Raw agent hand-backs (verbatim excerpts of what each agent said it did)

These are model self-reports; they are **claims**, re-measured independently in `results.json`.

## A — baseline (claude-haiku-5-5, 15 tool calls, 105,031 tokens, 184 s)
Built `site/index.html` + `styles.css` + `script.js`; "No automated axe audit … full WCAG AA is unverified beyond those pairs."

## B — engine available (claude-haiku-5-5, 28 tool calls, 109,669 tokens, 229 s)
"MCP tools called: **none**. I built the page directly with the file tools and did not use the OpenUI engine CLI at all."

## B2 — engine required (claude-haiku-5-5, 51 tool calls, 140,858 tokens, 377 s)
"ENGINE TOOLS CALLED (via call.js): list; suggest_layout (category saas, style clarity-light); generate_design_system; compose_page; rebuild_project (after editing openui.page.json); validate_design ×3; analyze_visual_quality. discover_components and get_component were used for steps, logo-cloud, feature-bento and hero-centered-product. Several calls first failed on argument validation and were retried with the correct schema."
"The hero dashboard mock, the feature visual text … are hand-edited in site/dist/index.html and site/index.html. Running rebuild_project or compose_page again will regenerate the engine's starter text for those visuals."
"Footer and mobile text links are about 29px tall (touch-target lint)."

## Blind judge (claude-sonnet, 13 tool calls, 63,113 tokens)
Labels X/Y/Z were randomised (mapping kept sealed until after scoring: X = B, Y = A, Z = B2).
Ranking: **X (B) > Y (A) > Z (B2)**. Scores (hierarchy/type/spacing/colour/visual/mobile/polish): X 8/8/7/8/8/7/8, Y 7/7/7/7/7/7/7, Z 7/7/6/6/6/7/6.
Judge's flaws for Z (B2, engine-built): "generic SaaS: indigo/purple gradients and a purple logo tile that do not read as calm or incident-focused"; "two alternating feature rows sit on top of the grid of six cards, so the features repeat and feel padded"; "plain purple bar charts and a toggle UI that does not relate to incident management"; "uneven section rhythm … big empty gaps".
Confidence stated by the judge: moderate (static downscaled screenshots; Y vs Z close).
