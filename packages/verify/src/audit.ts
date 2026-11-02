import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright-core";
import type { DesignTokens } from "@openui-engine/core";
import { getBrowser } from "./browser.js";
import { detectSlop } from "./slop.js";
import { VIEWPORTS, type AuditReport, type Compliance, type Issue, type PageMetrics, type Viewport, type ViewportReport } from "./types.js";

const require = createRequire(import.meta.url);
let axeSource: string | null = null;
const getAxe = () => (axeSource ??= readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));

export interface AuditOptions {
  url: string;
  viewports?: Viewport[];
  tokens?: DesignTokens;
  outDir?: string;
  screenshots?: boolean;
  /** Run axe-core (default true). */
  axe?: boolean;
  label?: string;
  /** Strings that signal unreplaced starter copy; each hit becomes a content warning. */
  starterMarkers?: string[];
}

/** Instant scroll through the page so IntersectionObserver reveals fire, then return to top. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.max(300, innerHeight * 0.6)) {
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      await new Promise((r) => setTimeout(r, 70));
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    await new Promise((r) => setTimeout(r, 450));
  });
}

interface Collected {
  issues: Issue[];
  metrics: PageMetrics;
  raw: { colors: Record<string, number>; fonts: Record<string, number>; sizes: Record<string, number>; spacings: Record<string, number>; radii: Record<string, number>; samples: Record<string, string> };
}

/** In-page DOM audit. Must be self-contained (serialised into the page). */
function collectInPage(isMobile: boolean): Collected {
  const issues: Issue[] = [];
  const vw = innerWidth, vh = innerHeight;
  const idOf = (el: Element): string | undefined => el.closest("[data-openui-id]")?.getAttribute("data-openui-id") ?? undefined;
  const sel = (el: Element): string => {
    const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : "";
    const cls = typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).map((c) => "." + c).join("") : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };
  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  const all = Array.from(document.body.querySelectorAll("*")).filter((e) => !["SCRIPT", "STYLE", "NOSCRIPT", "PATH", "LINE", "STOP", "DEFS", "LINEARGRADIENT", "G", "CIRCLE", "RECT"].includes(e.tagName.toUpperCase()));
  const vis = all.filter(visible);

  // --- overflow ---
  const docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (docOverflow > 1) {
    const offenders: Element[] = [];
    for (const el of vis) {
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 1 && r.left >= -1) continue;
      const pos = getComputedStyle(el).position;
      if (pos === "fixed") continue;
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o !== "visible") { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 1 && pr.left >= -1) { clipped = true; break; } }
      }
      if (!clipped) offenders.push(el);
    }
    issues.push({ severity: "error", category: "overflow", message: `Horizontal overflow: page is ${docOverflow}px wider than the viewport (${vw}px).`, selector: offenders[0] ? sel(offenders[0]) : undefined, openuiId: offenders[0] ? idOf(offenders[0]) : undefined, fix: "Constrain the widest element (max-width:100%, min-width:0, overflow-wrap:anywhere) or reduce its fixed width at this breakpoint." });
    for (const el of offenders.slice(1, 4)) issues.push({ severity: "warning", category: "overflow", message: `Also extends past the viewport: ${sel(el)}`, selector: sel(el), openuiId: idOf(el) });
  }

  // --- content invisible (opacity 0 / reveal never fired) ---
  const hidden = vis.filter((el) => {
    if (el.closest("[aria-hidden='true']")) return false;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) > 0.05) return false;
    return (el.textContent ?? "").trim().length > 3 && !el.closest("[hidden]");
  });
  const hiddenTop = hidden.filter((el) => !hidden.some((o) => o !== el && o.contains(el)));
  if (hiddenTop.length) issues.push({ severity: "error", category: "content", message: `${hiddenTop.length} element(s) with text are invisible (opacity 0) after scrolling — a reveal animation did not complete.`, selector: sel(hiddenTop[0]!), openuiId: idOf(hiddenTop[0]!), fix: "Ensure reveal/entrance states are removed once in view, are JS-gated, and fall back to visible with reduced motion." });

  // --- images / assets ---
  for (const img of Array.from(document.images)) {
    if (!img.complete || img.naturalWidth === 0) issues.push({ severity: "error", category: "assets", message: `Broken image: ${img.currentSrc || img.src}`, selector: sel(img), openuiId: idOf(img), fix: "Fix the src path or add the asset." });
    if (!img.hasAttribute("alt")) issues.push({ severity: "error", category: "a11y", message: "Image without alt attribute.", selector: sel(img), openuiId: idOf(img), fix: 'Add alt text (or alt="" if decorative).' });
  }
  // --- anchors ---
  for (const a of Array.from(document.querySelectorAll("a[href]"))) {
    const href = a.getAttribute("href") ?? "";
    if (href.startsWith("#") && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))) issues.push({ severity: "error", category: "interaction", message: `Anchor ${href} has no matching element id.`, selector: sel(a), openuiId: idOf(a), fix: `Add id="${href.slice(1)}" to the target section.` });
    if (href === "") issues.push({ severity: "warning", category: "interaction", message: "Link with empty href.", selector: sel(a), openuiId: idOf(a) });
  }

  // --- document-level SEO / semantics ---
  const h1s = document.querySelectorAll("h1");
  if (h1s.length !== 1) issues.push({ severity: "error", category: "a11y", message: `Expected exactly one <h1>, found ${h1s.length}.`, fix: "Use a single h1 for the page headline." });
  const heads = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => Number(h.tagName[1]));
  for (let i = 1; i < heads.length; i++) if (heads[i]! - heads[i - 1]! > 1) { issues.push({ severity: "warning", category: "a11y", message: `Heading level skips from h${heads[i - 1]} to h${heads[i]}.`, fix: "Do not skip heading levels." }); break; }
  if (!document.title.trim()) issues.push({ severity: "error", category: "seo", message: "Missing <title>." });
  if (!document.documentElement.lang) issues.push({ severity: "error", category: "a11y", message: "<html> has no lang attribute." });
  if (!document.querySelector('meta[name="viewport"]')) issues.push({ severity: "error", category: "responsive", message: "Missing viewport meta tag." });
  if (!document.querySelector('meta[name="description"]')) issues.push({ severity: "warning", category: "seo", message: "Missing meta description." });
  if (!document.querySelector("main")) issues.push({ severity: "warning", category: "a11y", message: "No <main> landmark." });

  // --- tap targets ---
  const interactive = vis.filter((el) => el.matches("a[href],button,summary,input,select,textarea,[role=button],[role=tab]"));
  for (const el of interactive) {
    if (el.closest("p,li") && el.tagName === "A" && !el.closest(".btn,nav")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) issues.push({ severity: "warning", category: "responsive", message: `Touch target ${Math.round(r.width)}×${Math.round(r.height)}px is below WCAG 2.2 minimum (24px).`, selector: sel(el), openuiId: idOf(el), fix: "Increase min-height/padding to at least 44px for primary controls." });
    else if (isMobile && el.matches(".btn,button") && r.height < 40) issues.push({ severity: "info", category: "responsive", message: `Button ${Math.round(r.height)}px tall on mobile (44px recommended).`, selector: sel(el), openuiId: idOf(el) });
  }

  // --- style statistics for token compliance + typography ---
  const colors: Record<string, number> = {}, fonts: Record<string, number> = {}, sizes: Record<string, number> = {}, spacings: Record<string, number> = {}, radii: Record<string, number> = {};
  const samples: Record<string, string> = {};
  const bump = (m: Record<string, number>, k: string, who: string, kind: string) => { m[k] = (m[k] ?? 0) + 1; const key = `${kind}:${k}`; if (!samples[key]) samples[key] = who; };
  const textNodes = (el: Element) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0);
  const fontSizes: number[] = [];
  let maxLine = 0;
  for (const el of vis) {
    const cs = getComputedStyle(el);
    const who = `${sel(el)}${idOf(el) ? ` [${idOf(el)}]` : ""}`;
    if (textNodes(el)) {
      bump(colors, cs.color, who, "color");
      bump(fonts, cs.fontFamily.split(",")[0]!.replace(/["']/g, "").trim(), who, "font");
      const fs = parseFloat(cs.fontSize);
      bump(sizes, fs.toFixed(1), who, "size");
      fontSizes.push(Math.round(fs));
      if (fs < 12) issues.push({ severity: "warning", category: "typography", message: `Text smaller than 12px (${fs}px).`, selector: sel(el), openuiId: idOf(el) });
      if (el.matches("p,li,blockquote")) { const cpl = Math.min((el.textContent ?? "").trim().length, el.getBoundingClientRect().width / (fs * 0.5)); if (cpl > maxLine) maxLine = cpl; }
    }
    const bg = cs.backgroundColor;
    if (bg && !/rgba?\(0, 0, 0, 0\)|transparent/.test(bg)) bump(colors, bg, who, "color");
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") bump(colors, cs.borderTopColor, who, "color");
    for (const p of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"] as const) {
      const v = parseFloat((cs as any)[p]);
      if (v > 0 && v < 400 && !Number.isNaN(v)) bump(spacings, `${Math.round(v * 10) / 10}`, who, "spacing");
    }
    const rad = cs.borderTopLeftRadius;
    const r = el.getBoundingClientRect();
    if (parseFloat(rad) > 0 && r.width > 28 && r.height > 28) bump(radii, rad.split(" ")[0]!, who, "radius");
  }

  // --- metrics ---
  const h1 = document.querySelector("h1");
  const bodyP = document.querySelector("main p, p");
  const h1Size = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
  const bodySize = bodyP ? parseFloat(getComputedStyle(bodyP).fontSize) : 16;
  const bodyLH = bodyP ? (parseFloat(getComputedStyle(bodyP).lineHeight) || bodySize * 1.5) / bodySize : 1.5;
  const sections = Array.from(document.querySelectorAll("section.section"));
  const sectionPaddings = sections.map((s) => parseFloat(getComputedStyle(s).paddingTop));
  const contentLefts = Array.from(new Set(sections.map((s) => { const c = s.querySelector(".container") ?? s; return Math.round(c.getBoundingClientRect().left); })));
  const foldH = vh * 1.6;
  let visualArea = 0;
  for (const el of vis.filter((e) => e.matches("img,svg,canvas,video,[role=img],.frame"))) {
    const r = el.getBoundingClientRect();
    if (r.top < foldH) visualArea += Math.max(0, Math.min(r.bottom, foldH) - Math.max(r.top, 0)) * r.width;
  }
  // Markup-agnostic: engine markers count, and so does any visible, solid-filled link/button above the fold outside nav/header/footer
  // (hand-written pages style <a> elements as buttons, so requiring a <button> or an engine class was a false positive).
  const isFilledAction = (e: Element) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const parts = m ? m[1]!.split(",").map((x) => parseFloat(x)) : [];
    const solid = parts.length >= 3 && (parts.length < 4 || (parts[3] ?? 1) > 0.5) && !(parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts.length === 4 && parts[3] === 0);
    return solid && r.height >= 36 && r.width >= 80;
  };
  const primaryCtas = vis.filter((e) => {
    const r = e.getBoundingClientRect();
    if (!(r.top < vh && r.top >= 0) || e.closest(".nav,nav,footer") || (e.closest("header") && !e.closest("header")!.querySelector("h1"))) return false;
    return e.matches(".btn--primary,button[type=submit],[data-cta=primary]") || (e.matches("a[href],button") && isFilledAction(e));
  }).length;
  if (primaryCtas === 0) issues.push({ severity: "warning", category: "layout", message: "No primary call-to-action visible in the first viewport.", fix: "Place one primary CTA (button) above the fold in the hero." });
  if (primaryCtas > 2) issues.push({ severity: "warning", category: "layout", message: `${primaryCtas} primary CTAs compete in the first viewport.`, fix: "Keep one primary and demote the rest to ghost/link style." });

  return {
    issues,
    metrics: {
      title: document.title, h1Count: h1s.length, fontSizes, bodyLineHeight: bodyLH, h1Size, bodySize,
      sectionPaddings, contentLefts, visualAreaFold: visualArea / (vw * foldH), primaryCtasInFold: primaryCtas,
      docHeight: document.documentElement.scrollHeight, maxLineChars: Math.round(maxLine), interactiveCount: interactive.length,
    },
    raw: { colors, fonts, sizes, spacings, radii, samples },
  };
}

// ---- token compliance (node side) ----
const parseColor = (c: string): [number, number, number, number] | null => {
  let m = c.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.%]+))?\s*\)$/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : Number(m[4])];
  m = c.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\)$/);
  if (m) return [Number(m[1]) * 255, Number(m[2]) * 255, Number(m[3]) * 255, m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : Number(m[4])];
  return null;
};
const hex = (h: string): [number, number, number] => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const dist = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!);
function segDist(p: number[], a: number[], b: number[]): number {
  const ab = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!]; const ap = [p[0]! - a[0]!, p[1]! - a[1]!, p[2]! - a[2]!];
  const len = ab[0]! ** 2 + ab[1]! ** 2 + ab[2]! ** 2 || 1;
  const t = Math.max(0, Math.min(1, (ap[0]! * ab[0]! + ap[1]! * ab[1]! + ap[2]! * ab[2]!) / len));
  return dist(p, [a[0]! + ab[0]! * t, a[1]! + ab[1]! * t, a[2]! + ab[2]! * t]);
}

function mkCompliance(counts: Record<string, number>, ok: (k: string) => boolean): Compliance {
  let checked = 0, good = 0; const bad: Compliance["offenders"] = [];
  for (const [k, n] of Object.entries(counts)) { checked += n; if (ok(k)) good += n; else bad.push({ value: k, count: n }); }
  bad.sort((a, b) => b.count - a.count);
  return { checked, compliant: good, ratio: checked ? good / checked : 1, offenders: bad.slice(0, 6) };
}

export function complianceFor(tokens: DesignTokens, raw: Collected["raw"]): ViewportReport["compliance"] {
  const palette = Object.entries(tokens.color).filter(([, v]) => /^#/.test(v)).map(([, v]) => hex(v));
  const bases = [tokens.color.bg, tokens.color.surface, tokens.color.surface2, tokens.color.text].map(hex);
  const colorOk = (c: string) => {
    const p = parseColor(c); if (!p) return true;
    const rgb = [p[0], p[1], p[2]];
    if (p[3] < 0.02) return true;
    if (palette.some((t) => dist(rgb, t) <= 10)) return true;
    // derived colors: any blend of a token with a base surface/text (what color-mix / rgba overlays produce)
    for (const t of palette) for (const b of bases) if (segDist(rgb, t, b) <= 10) return true;
    // translucent white/black overlays
    if (p[3] < 1 && (dist(rgb, [255, 255, 255]) < 6 || dist(rgb, [0, 0, 0]) < 6)) return true;
    return false;
  };
  const fam = new Set([tokens.font.display, tokens.font.body, tokens.font.mono].map((f) => f.split(",")[0]!.replace(/['"]/g, "").trim().toLowerCase()));
  const ranges = Object.values(tokens.type.scale).map((s) => [s.min, s.max] as const);
  const sizeOk = (k: string) => { const v = Number(k); return ranges.some(([a, b]) => v >= a - 0.7 && v <= b + 0.7); };
  const grid = tokens.space.unit;
  const secMin = tokens.layout.sectionY.min, secMax = tokens.layout.sectionY.max;
  const spaceOk = (k: string) => { const v = Number(k); return Math.abs(v / grid - Math.round(v / grid)) < 0.13 || (v >= secMin && v <= secMax) || v <= 2 || Math.abs(v % 2) < 0.13 && v <= 12; };
  const radii = new Set(Object.values(tokens.radius));
  const radOk = (k: string) => { if (k.endsWith("%")) return true; const v = parseFloat(k); return v === 0 || radii.has(v) || v >= tokens.radius.pill / 2 || [...radii].some((r) => Math.abs(r - v) < 0.6); };
  return {
    color: mkCompliance(raw.colors, colorOk),
    font: mkCompliance(raw.fonts, (k) => fam.has(k.toLowerCase()) || /^(ui-monospace|sfmono|menlo)/i.test(k)),
    fontSize: mkCompliance(raw.sizes, sizeOk),
    spacing: mkCompliance(raw.spacings, spaceOk),
    radius: mkCompliance(raw.radii, radOk),
  };
}

async function interactionTests(page: Page, isMobile: boolean, vpHeight: number): Promise<ViewportReport["interactions"]> {
  const out: ViewportReport["interactions"] = [];
  const t = async (name: string, fn: () => Promise<string | undefined | void>) => {
    try { const d = await fn(); out.push({ name, passed: true, ...(d ? { detail: String(d) } : {}) }); }
    catch (e) { out.push({ name, passed: false, detail: String((e as Error).message).split("\n")[0] }); }
  };
  const first = async (sel: string) => { const l = page.locator(sel).first(); return (await l.count()) ? l : null; };

  // <details>
  const closedLoc = page.locator("details:not([open]) > summary").first();
  const closed = (await closedLoc.count()) ? await closedLoc.elementHandle() : null;
  if (closed) await t("details/accordion toggles open", async () => {
    await closed.scrollIntoViewIfNeeded(); await closed.click();
    const open = await closed.evaluate((s) => (s.parentElement as HTMLDetailsElement).open);
    if (!open) throw new Error("details did not open on click");
  });
  // aria-expanded toggles
  const exp = page.locator("button[aria-expanded]:visible").first();
  if (await exp.count()) await t("aria-expanded control flips state", async () => {
    const before = await exp.getAttribute("aria-expanded"); await exp.click();
    const after = await exp.getAttribute("aria-expanded");
    if (before === after) throw new Error("aria-expanded did not change");
    await exp.click();
  });
  // billing toggle
  const yearly = await first("[data-billing=yearly]");
  if (yearly) await t("pricing toggle updates prices", async () => {
    const price = page.locator("[data-price]").nth(1);
    await yearly.scrollIntoViewIfNeeded();
    const before = await price.textContent(); await yearly.click(); const after = await price.textContent();
    if (before === after) throw new Error("price text unchanged after toggle");
    if ((await yearly.getAttribute("aria-pressed")) !== "true") throw new Error("aria-pressed not updated");
    return `${before?.trim()} → ${after?.trim()}`;
  });
  // anchor navigation
  if (!isMobile) {
    const links = page.locator(".nav__links a[href^='#']:visible");
    const n = Math.min(await links.count(), 4);
    for (let i = 0; i < n; i++) {
      const l = links.nth(i); const href = (await l.getAttribute("href"))!;
      await t(`nav link ${href} scrolls to target`, async () => {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
        await l.click(); await page.waitForTimeout(900);
        const top = await page.evaluate((h) => document.querySelector(h)?.getBoundingClientRect().top ?? 9999, href);
        const limit = vpHeight * 0.45;
        if (top > limit || top < -40) throw new Error(`target top is ${Math.round(top)}px after click (expected within the top 45% of the viewport)`);
      });
    }
  }
  // keyboard focus visibility
  await t("keyboard focus is visible on first 8 tab stops", async () => {
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); });
    let bad = 0;
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const ok = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null; if (!el || el === document.body) return true;
        const cs = getComputedStyle(el);
        return (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== "none" && cs.boxShadow !== "");
      });
      if (!ok) bad++;
    }
    if (bad) throw new Error(`${bad} of 8 focused elements had no visible focus indicator`);
  });
  return out;
}

export async function auditViewport(url: string, vp: Viewport, opts: AuditOptions): Promise<ViewportReport> {
  const browser = await getBrowser();
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const issues: Issue[] = [];
  page.on("console", (m) => { if (m.type() === "error") issues.push({ severity: "error", category: "console", message: `console.error: ${m.text().slice(0, 240)}` }); });
  page.on("pageerror", (e) => issues.push({ severity: "error", category: "console", message: `Uncaught: ${String(e).slice(0, 240)}` }));
  page.on("requestfailed", (r) => { const u = r.url(); issues.push({ severity: /fonts\.(googleapis|gstatic)/.test(u) ? "warning" : "error", category: "network", message: `Request failed: ${u.slice(0, 160)} (${r.failure()?.errorText})` }); });
  page.on("response", (r) => { if (r.status() >= 400) issues.push({ severity: "error", category: "network", message: `HTTP ${r.status()} for ${r.url().slice(0, 160)}`, fix: "Add the missing asset or remove the reference." }); });

  await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await scrollThrough(page);

  const collected = (await page.evaluate(collectInPage, !!vp.mobile)) as Collected;
  issues.push(...collected.issues);

  // axe
  if (opts.axe !== false) {
    try {
      await page.evaluate(getAxe());
      const res = await page.evaluate(async () => {
        const r = await (window as any).axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }, resultTypes: ["violations"] });
        return r.violations.map((v: any) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n: any) => ({ target: n.target.join(" "), summary: (n.failureSummary ?? "").split("\n").slice(0, 2).join(" ").slice(0, 200) })), count: v.nodes.length, url: v.helpUrl }));
      });
      for (const v of res as any[]) issues.push({ severity: v.impact === "critical" || v.impact === "serious" ? "error" : v.impact === "moderate" ? "warning" : "info", category: "a11y", message: `axe ${v.id} (${v.impact}, ${v.count}×): ${v.help}. ${v.nodes[0]?.summary ?? ""}`, selector: v.nodes[0]?.target, fix: v.url });
    } catch (e) { issues.push({ severity: "warning", category: "a11y", message: `axe-core could not run: ${(e as Error).message}` }); }
  }

  const shots: ViewportReport["screenshots"] = {};
  if (opts.screenshots !== false && opts.outDir) {
    mkdirSync(opts.outDir, { recursive: true });
    const base = join(opts.outDir, `${opts.label ?? "page"}-${vp.name}`);
    await page.screenshot({ path: `${base}-fold.png` }); shots.fold = `${base}-fold.png`;
    await page.screenshot({ path: `${base}-full.png`, fullPage: true }); shots.full = `${base}-full.png`;
  }

  if (opts.starterMarkers?.length) {
    const body = await page.evaluate(() => document.body.innerText);
    const hit = opts.starterMarkers.filter((m) => body.includes(m));
    if (hit.length) issues.push({ severity: "warning", category: "content", message: `Starter placeholder copy is still on the page: ${hit.slice(0, 6).map((h) => `"${h}"`).join(", ")}${hit.length > 6 ? ` (+${hit.length - 6})` : ""}.`, fix: "Rewrite those sections via compose_page sectionProps (mock/visual data are configurable) so no unrelated demo content ships." });
  }
  let slop: ViewportReport["slop"];
  if (!vp.mobile && vp.width >= 1000) {
    slop = await detectSlop(page);
    for (const f of slop.findings) if (f.severity === "warning") issues.push({ severity: "warning", category: "content", message: `[slop:${f.rule}] ${f.message}`, fix: "Replace the generic pattern with something specific to this product (see detect_ai_slop guidance)." });
  }
  const interactions = await interactionTests(page, !!vp.mobile, vp.height);
  for (const i of interactions) if (!i.passed) issues.push({ severity: "error", category: "interaction", message: `Interaction failed — ${i.name}: ${i.detail}` });

  // motion: normal animation count, then reduced-motion emulation
  const runningNormal = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await scrollThrough(page);
  const reduced = await page.evaluate(() => ({
    infinite: document.getAnimations().filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().iterations ?? 1) === Infinity).length,
    hidden: Array.from(document.querySelectorAll(".reveal")).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length,
  }));
  if (reduced.infinite > 0) issues.push({ severity: "error", category: "motion", message: `${reduced.infinite} infinite animation(s) still run under prefers-reduced-motion: reduce.`, fix: "Wrap animations in @media (prefers-reduced-motion: no-preference)." });
  if (reduced.hidden > 0) issues.push({ severity: "error", category: "motion", message: `${reduced.hidden} reveal element(s) remain hidden under prefers-reduced-motion.` });

  const compliance = opts.tokens ? complianceFor(opts.tokens, collected.raw) : undefined;
  if (compliance) {
    const th: Record<string, number> = { color: 0.9, font: 0.97, fontSize: 0.9, spacing: 0.85, radius: 0.85 };
    for (const [k, c] of Object.entries(compliance)) {
      if (c.ratio < th[k]!) issues.push({ severity: "warning", category: "tokens", message: `Design-token compliance for ${k}: ${(c.ratio * 100).toFixed(0)}% (needs ≥ ${(th[k]! * 100).toFixed(0)}%). Off-token: ${c.offenders.slice(0, 3).map((o) => `${o.value}×${o.count}`).join(", ")}`, fix: "Replace literals with var(--…) tokens from tokens.css." });
    }
  }
  await ctx.close();
  return { viewport: vp, issues: dedupe(issues), slop, compliance, metrics: collected.metrics, interactions, screenshots: shots, animations: { runningNormal, infiniteReduced: reduced.infinite } };
}

function dedupe(list: Issue[]): Issue[] {
  const seen = new Set<string>(); const out: Issue[] = [];
  for (const i of list) { const k = `${i.category}|${i.message}`; if (!seen.has(k)) { seen.add(k); out.push(i); } }
  return out;
}

export async function runAudit(opts: AuditOptions): Promise<AuditReport> {
  const vps = opts.viewports ?? VIEWPORTS;
  const reports: ViewportReport[] = [];
  for (const vp of vps) reports.push(await auditViewport(opts.url, vp, opts));
  const all = reports.flatMap((r) => r.issues);
  const totals = { errors: all.filter((i) => i.severity === "error").length, warnings: all.filter((i) => i.severity === "warning").length, infos: all.filter((i) => i.severity === "info").length };
  return { url: opts.url, generatedAt: new Date().toISOString(), viewports: reports, totals, passed: totals.errors === 0 };
}
