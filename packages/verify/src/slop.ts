import type { Page } from "playwright-core";
import { BUZZWORDS } from "@openui-engine/core";

export interface SlopFinding { rule: string; severity: "warning" | "info"; message: string; evidence?: string }
export interface SlopReport { score: number; findings: SlopFinding[] }

/**
 * Heuristic "AI-slop" detector on the rendered DOM. Every rule is a measurable proxy — it flags patterns that
 * correlate with template-looking pages, not taste. Score is 100 minus weighted findings.
 */
export async function detectSlop(page: Page): Promise<SlopReport> {
  const raw = await page.evaluate((buzz: string[]) => {
    const f: Array<{ rule: string; severity: "warning" | "info"; message: string; evidence?: string }> = [];
    const vis = (e: Element) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
    const all = [...document.body.querySelectorAll("*")].filter(vis);
    const hsl = (rgb: string) => { const m = rgb.match(/[\d.]+/g)?.map(Number); if (!m || m.length < 3) return null; const [r, g, b] = [m[0]! / 255, m[1]! / 255, m[2]! / 255]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return { h: 0, s: 0, l }; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60; return { h, s, l }; };

    // 1. dominant saturated fill hue (default AI palette = indigo/violet)
    const fills = new Map<string, number>();
    for (const e of all) { const bg = getComputedStyle(e).backgroundColor; if (/rgba?\(0, 0, 0, 0\)/.test(bg)) continue; const h = hsl(bg); if (h && h.s > 0.45 && h.l > 0.25 && h.l < 0.75) fills.set(bg, (fills.get(bg) ?? 0) + 1); }
    const top = [...fills.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) { const h = hsl(top[0])!; if (h.h >= 238 && h.h <= 292) f.push({ rule: "default-palette", severity: "warning", message: "Dominant accent is the default AI indigo/violet (hue " + Math.round(h.h) + "°).", evidence: top[0] }); }

    // 2. gradient text overuse
    const gt = all.filter((e) => { const cs = getComputedStyle(e); return /text/.test((cs as any).webkitBackgroundClip || cs.backgroundClip) && cs.webkitTextFillColor !== undefined && /rgba\(0, 0, 0, 0\)|transparent/.test(cs.color + cs.webkitTextFillColor); }).length;
    if (gt > 2) f.push({ rule: "gradient-text", severity: "warning", message: gt + " gradient-clipped text elements (≥3 reads as template).", evidence: String(gt) });

    // 3. repeated identical icon-card grids
    const sig = (e: Element) => [...e.children].map((c) => c.tagName + (c.className && typeof c.className === "string" ? "" : "")).join(",");
    let cardGrids = 0; const gridDesc: string[] = [];
    for (const p of all) {
      const kids = [...p.children].filter(vis); if (kids.length < 3) continue;
      const cs0 = getComputedStyle(p); if (!/grid|flex/.test(cs0.display)) continue;
      const s0 = kids.map((k) => sig(k)); if (!s0.every((s) => s === s0[0]) || !s0[0]) continue;
      const looksCard = kids.every((k) => { const c = getComputedStyle(k); return parseFloat(c.borderTopWidth) > 0 || !/rgba?\(0, 0, 0, 0\)/.test(c.backgroundColor) || c.boxShadow !== "none"; });
      const iconHeadPara = kids.every((k) => k.querySelector("svg, .ico, .ico-chip, i") && k.querySelector("h2,h3,h4,b,strong") && k.querySelector("p"));
      const hasRealVisual = kids.some((k) => k.querySelector(".vz, canvas, img"));
      if (looksCard && iconHeadPara && !hasRealVisual && kids.length >= 3) { cardGrids++; gridDesc.push(kids.length + " cards"); }
    }
    if (cardGrids >= 2) f.push({ rule: "icon-card-grids", severity: "warning", message: cardGrids + " grids of identical icon + heading + paragraph cards (" + gridDesc.join(", ") + ").", evidence: String(cardGrids) });
    else if (cardGrids === 1) f.push({ rule: "icon-card-grids", severity: "info", message: "One grid of identical icon-cards; fine once, a tell when repeated.", evidence: "1" });

    // 4. emoji used as icons
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const em = all.filter((e) => e.children.length === 0 && emoji.test(e.textContent ?? "") && (e.textContent ?? "").length < 8).length;
    if (em) f.push({ rule: "emoji-icons", severity: "warning", message: em + " emoji used as UI icons.", evidence: String(em) });

    // 5. every heading centered
    const heads = [...document.querySelectorAll("h1,h2")].filter(vis); const centered = heads.filter((h) => getComputedStyle(h).textAlign === "center").length;
    if (heads.length >= 6 && centered / heads.length > 0.85) f.push({ rule: "all-centered", severity: "warning", message: centered + " of " + heads.length + " headings are centered; no left-aligned rhythm.", evidence: centered + "/" + heads.length });

    // 6. real product visuals present?
    const real = all.filter((e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 280 || r.height < 150 || r.top + scrollY > 2400) return false;
      if (e.matches(".vz, .frame, canvas, video, img, picture, [role=img]")) return true;
      if (e.tagName === "SVG" || e.tagName === "svg") return true;
      // hand-built UI mock: a raised/bordered box with several small-type descendants or an inline chart
      const cs = getComputedStyle(e); const raised = cs.boxShadow !== "none" || parseFloat(cs.borderTopWidth) > 0;
      if (!raised || e.tagName === "SECTION" || e.tagName === "MAIN" || e.tagName === "BODY") return false;
      const small = [...e.querySelectorAll("*")].filter((d) => d.children.length === 0 && (d.textContent ?? "").trim() && parseFloat(getComputedStyle(d).fontSize) <= 13.5).length;
      return small >= 4 || e.querySelector("svg") !== null && small >= 2;
    }).length;
    if (real === 0) f.push({ rule: "no-product-visual", severity: "warning", message: "No substantial product visual (screenshot-like UI, chart, image) near the top of the page." });

    // 7. glow/shadow overuse
    const glows = all.filter((e) => { const bs = getComputedStyle(e).boxShadow; return bs !== "none" && /rgba?\(\d+, \d+, \d+, 0?\.[2-9]\d*\) 0px \d+px (\d{2,}px)/.test(bs); }).length;
    if (glows > 4) f.push({ rule: "glow-overuse", severity: "info", message: glows + " large coloured glows.", evidence: String(glows) });

    // 8. buzzwords & stock names in visible text
    const text = document.body.innerText.toLowerCase();
    const hits = buzz.filter((w) => new RegExp("(^|[^a-z])" + w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "([^a-z]|$)", "i").test(text));
    if (hits.length) f.push({ rule: "buzzwords", severity: hits.length > 2 ? "warning" : "info", message: "Generic buzzwords on page: " + hits.slice(0, 6).join(", ") + ".", evidence: hits.join(",") });
    if (/lorem ipsum|dolor sit amet/.test(text)) f.push({ rule: "lorem", severity: "warning", message: "Lorem ipsum placeholder text." });
    if (/\b(john|jane) (doe|smith)\b/.test(text)) f.push({ rule: "stock-names", severity: "warning", message: "Stock testimonial names (John Smith / Jane Doe)." });

    // 9. type/colour monotony: ≤2 distinct section backgrounds on a long page
    const secBgs = new Set([...document.querySelectorAll("section, header, footer")].map((s) => getComputedStyle(s).backgroundColor));
    if (document.querySelectorAll("section").length >= 7 && secBgs.size < 2) f.push({ rule: "flat-rhythm", severity: "info", message: "All sections share one background; no tonal rhythm." });
    return f;
  }, BUZZWORDS);
  const W: Record<string, number> = { "default-palette": 14, "gradient-text": 8, "icon-card-grids": 14, "emoji-icons": 10, "all-centered": 12, "no-product-visual": 20, "glow-overuse": 4, buzzwords: 8, lorem: 30, "stock-names": 8, "flat-rhythm": 4 };
  const score = Math.max(0, Math.round(100 - raw.reduce((a, x) => a + (W[x.rule] ?? 5) * (x.severity === "info" ? 0.4 : 1), 0)));
  return { score, findings: raw };
}
