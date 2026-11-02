# Benchmark report — does OpenUI Engine help a cheap model build a better landing page?

**Short answer: this experiment does not show that it does.** Read the deviations first; they matter more than the numbers.

## 1. Deviations from the brief (stated up front)

| Requested | What actually happened |
|---|---|
| Two **GPT-6 Luna** subagents | **GPT-6 Luna is not available** in this environment (the subagent tool offers only Claude models). I used the cheapest available model, **`claude-haiku-5-5`** — confirmed from each agent's own transcript — for all arms. This is a *substitute*; the results say nothing about Luna. |
| Exactly two agents, identical conditions except engine access | Arm B had the engine available but **made zero MCP calls** (it says so itself). Arm B was therefore effectively a second baseline. I added a **third arm B2** with one extra sentence in the prompt *requiring* engine use. B2's protocol differs from A/B, so B2 is **not** a like-for-like replication; all three arms are reported. |
| Deploy both sites to **Vercel** | **Not done.** No Vercel credential or connector exists in this session and `api.vercel.com` returns 403 from the sandbox. No deployment URLs are claimed. The generated sites are plain static folders (`benchmark/site/<arm>/`) and a ready workflow exists (`.github/workflows/vercel-deploy.yml`, needs `VERCEL_TOKEN`). Screenshots and the comparison page were produced from locally served builds in real Chromium, not from deployed URLs. |
| Publish interactive comparison | `benchmark/site/index.html` (embeds all three sites; also copied into the docs site). Publishing it needs GitHub Pages or Vercel enabled by the repo owner. |

## 2. Setup and fairness

* Same written spec ([`SPEC.md`](SPEC.md)), clean git repos, same model, same tools (Bash/Read/Write/Edit/Glob/Grep + the same pre-installed Playwright), same limits (≤ 60 tool calls, ~25 min). Agents were told not to read the other arms' directories — **the sandbox could not enforce this**; I rely on the agents' reports and transcripts.
* Arms ran concurrently (A, B together; B2 afterwards). Wall-clock numbers are noisy and not comparable across B2.
* Inference settings were the platform defaults (not controlled). One run per arm — **n = 1**, so no variance estimate.
* Engine setup cost (disclosed separately, not charged to the agents): `pnpm install` from a warm store ≈ 1 s, `pnpm build` ≈ 8 s, each MCP call ≈ 1 s process cold-start, `validate_design` (desktop + mobile, real Chromium) ≈ 22 s. The engine was built before the run and **not modified during it** (commit `45c5a44`); fixes made afterwards are listed in §6.

## 3. What each agent did

| | A baseline | B engine available | B2 engine required |
|---|---|---|---|
| MCP calls (at least) | 0 | **0** | ≥ 11 (`list`, `suggest_layout`, `generate_design_system`, `compose_page`, `rebuild_project`, `validate_design`×3, `analyze_visual_quality`, `discover_components`, `get_component`) |
| Tool calls / tokens / time | 15 / 105,031 / 184 s | 28 / 109,669 / 229 s | 51 / 140,858 / 377 s |
| Hand-edited engine output | n/a | n/a | yes (hero mock, feature visuals, step titles — engine copy was not configurable; fixed later) |

Token counts come from the harness's per-agent usage; "tool calls" include file and shell calls.

## 4. Measurable results (identical measurement for every arm)

Measured on exactly what each agent delivered (`site/index.html` at the root, engine project files excluded), in Chromium at 1440 / 820 / 390 px. Raw data: `raw/results.json`.

| Metric | A | B | B2 |
|---|---|---|---|
| axe-core accessibility errors (3 viewports) | 0 | 0 | 0 |
| Horizontal overflow errors | 0 | 0 | 0 |
| Console errors | 0 | 1 (a 404 resource) | 0 |
| Text below 12 px (warnings) | 4 sizes (7.5–11 px) | 2 sizes (10–11 px) | 0 |
| Markup-agnostic behaviour checks (pricing toggle across both modes, FAQ, mobile menu) | 3/3 | 3/3 | 3/3 |
| Distinct text/fill colours | 29 | 30 | **12** |
| Distinct font sizes | 17 | 14 | **9** |
| Spacing values on 4 px grid | 87 % | 91 % | 91 % |
| Source size / lines | 53 KB / 1,618 | 57 KB / 1,900 | 56 KB / 550 (generated) |
| Engine's own heuristic score | 86 | 85 | 95 |

Interpretation, carefully:
* **B2 is more disciplined** (fewer colours and sizes, no sub-12 px text) — this is what a token system should buy, and it is real.
* The **engine heuristic score is biased in the engine's favour** (it was designed around the engine's own markup and tokens) and must not be used as evidence of quality. Two of its checks (`primary CTA in first viewport`, the pricing-toggle selector test) are engine-markup-specific and produced false failures for A and B; I excluded them from the table above and from conclusions (see §7).
* Accessibility, overflow and basic function were **indistinguishable** between arms.

## 5. Subjective design quality (labelled subjective)

**Blind judge** (a different model, `claude-sonnet`, randomised labels, static screenshots only; mapping unsealed afterwards):

| Arm | Hierarchy | Type | Spacing | Colour | Product visual | Mobile | Polish | Rank |
|---|---|---|---|---|---|---|---|---|
| B (engine unused) | 8 | 8 | 7 | 8 | 8 | 7 | 8 | **1** |
| A baseline | 7 | 7 | 7 | 7 | 7 | 7 | 7 | 2 |
| B2 (engine required) | 7 | 7 | 6 | 6 | 6 | 7 | 6 | **3** |

The judge called B2 "generic SaaS … indigo/purple gradients … do not read as calm or incident-focused", with repeated/padded features and uneven rhythm. Judge confidence: moderate; one judge, one pass.

**My own impression** (I built the engine, so weigh this accordingly): A and B have domain-specific, bespoke hero visuals (incident card, SLO burn chart, timeline) that read as "incident management" immediately. B2 is typographically clean and consistent but visually closer to a template, and its dashboard mock is a generic area chart. The cheap model's own bespoke art direction beat the engine's generic sections on *fit to the brief*.

## 6. What the experiment taught us (engine fixes made *after* the runs)

1. **Hero mock and feature visuals were hard-coded** (revenue dashboard inside an incident product). They are now configurable (`hero.mock`, per-card `data`) — the agent had to hand-edit output.
2. **`validate_design` silently regenerated `dist/`, clobbering hand edits.** It now rebuilds only when `dist/` is missing or older than its sources (regression-tested).
3. **The QA gate could not tell that starter copy shipped.** It now warns when engine placeholder copy is still on the page (regression-tested).
4. **Still open, and the judge's strongest criticism:** the section library is generic; the registry does not yet produce *domain-specific* product visuals, and there is no mechanism that makes a composed page feel art-directed for a particular product. That is the real gap between "consistent" and "outstanding".

## 7. Errors in my own evaluation (found and corrected before publishing)

* My first audit used selectors from the engine's markup (`[data-price]`, `.btn--primary`), falsely failing A and B on the pricing toggle and primary-CTA checks → replaced with markup-agnostic checks.
* My toggle check clicked the already-active option in A (Yearly default) → now exercises both modes.
* For B2 I first evaluated `dist/` (regenerated, placeholder content) instead of the delivered `site/index.html` → now stages exactly the delivered files. The 2 earlier numbers were discarded, not reported.

## 8. Confounds and limitations

* Different model from the one requested; n = 1 per arm; no inference-parameter control; concurrency noise.
* B2's prompt differs (mandatory tool use). Its extra tokens/time include learning an unfamiliar tool API ("several calls first failed on argument validation").
* The measurement harness is part of the engine repo (author bias); the accessibility result relies on third-party axe-core, the rest is my own code.
* The blind judge is one model viewing downscaled screenshots; it cannot assess interaction, copy quality or hover states.
* Agents could technically read each other's directories; instruction-level isolation only.
* Placeholder links (`#`) exist in every arm.

## 9. Conclusion supported by the evidence

* The engine reliably produces **accessible, overflow-free, token-consistent** pages and its gate catches real defects (including ones it found in its own output during development).
* **It did not make a cheap model's landing page look better**; in the one blind review it looked worse than the model's own unaided output, mainly through generic composition.
* A cheap model given the tools *did not use them* when use was optional — adoption is a problem to design for (stronger server instructions, a one-call "build me a page" tool, domain-aware visual generation).
* Larger-n, multi-brief replication with the originally requested model is required before any claim about effectiveness.
