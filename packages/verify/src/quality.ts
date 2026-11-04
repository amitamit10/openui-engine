import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import type { AuditReport, ViewportReport } from "./types.js";

export interface QualityDimension {
  id: string;
  label: string;
  /** 0–100, heuristic. */
  score: number;
  /** "measured" = deterministic from DOM/pixels; "heuristic" = rule-of-thumb proxy for a subjective quality. */
  basis: "measured" | "heuristic";
  evidence: string[];
  suggestions: string[];
}

export interface QualityReport {
  overall: number;
  note: string;
  dimensions: QualityDimension[];
  deadZones: Array<{ viewport: string; fromY: number; toY: number }>;
  needsVisualReview: string[];
}

export interface BandStats { deadZones: Array<{ fromY: number; toY: number }>; contentRatio: number; bands: number }

/** Scan a full-page PNG in horizontal bands; a band is "empty" if ≥ 99.7% of its pixels equal its modal colour. */
export function analyzePng(path: string, bandH = 40): BandStats {
  const png = PNG.sync.read(readFileSync(path));
  const { width, height, data } = png;
  const bands = Math.ceil(height / bandH);
  const empty: boolean[] = [];
  for (let b = 0; b < bands; b++) {
    const y0 = b * bandH, y1 = Math.min(height, y0 + bandH);
    const hist = new Map<number, number>(); let total = 0;
    for (let y = y0; y < y1; y += 2) for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * 4;
      const key = ((data[i]! >> 3) << 10) | ((data[i + 1]! >> 3) << 5) | (data[i + 2]! >> 3);
      hist.set(key, (hist.get(key) ?? 0) + 1); total++;
    }
    const top = Math.max(...hist.values());
    empty.push(top / total >= 0.997);
  }
  const zones: BandStats["deadZones"] = [];
  let start = -1;
  for (let b = 0; b <= bands; b++) {
    if (b < bands && empty[b]) { if (start < 0) start = b; }
    else if (start >= 0) { zones.push({ fromY: start * bandH, toY: b * bandH }); start = -1; }
  }
  return { deadZones: zones, contentRatio: 1 - empty.filter(Boolean).length / bands, bands };
}

/** Look-based statistics of a rendered section (PNG buffer): how much of it is ink vs empty background, how many distinct colours it uses, how much edge detail it has. */
export function pixelStats(buf: Buffer): { inkPct: number; colors: number; edgePct: number } {
  const png = PNG.sync.read(buf); const { width, height, data } = png;
  const hist = new Map<number, number>(); let total = 0; let edges = 0; let pairs = 0;
  const key = (i: number) => ((data[i]! >> 4) << 8) | ((data[i + 1]! >> 4) << 4) | (data[i + 2]! >> 4);
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width - 3; x += 3) {
    const i = (y * width + x) * 4; const k = key(i);
    hist.set(k, (hist.get(k) ?? 0) + 1); total++;
    const j = (y * width + x + 3) * 4; pairs++;
    if (Math.abs(data[i]! - data[j]!) + Math.abs(data[i + 1]! - data[j + 1]!) + Math.abs(data[i + 2]! - data[j + 2]!) > 60) edges++;
  }
  const top = Math.max(...hist.values());
  return { inkPct: Math.round((1 - top / total) * 100), colors: [...hist.values()].filter((v) => v / total > 0.004).length, edgePct: Math.round((edges / Math.max(1, pairs)) * 1000) / 10 };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sd = (a: number[]) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };

export function analyzeQuality(audit: AuditReport): QualityReport {
  const desktop = audit.viewports.find((v) => v.viewport.name === "desktop") ?? audit.viewports[0]!;
  const mobile = audit.viewports.find((v) => v.viewport.name === "mobile");
  const dims: QualityDimension[] = [];
  const zonesOut: QualityReport["deadZones"] = [];

  // 1. Accessibility (measured)
  {
    const a11y = audit.viewports.flatMap((v) => v.issues.filter((i) => i.category === "a11y"));
    const err = new Set(a11y.filter((i) => i.severity === "error").map((i) => i.message.slice(0, 32))).size;
    const warn = new Set(a11y.filter((i) => i.severity === "warning").map((i) => i.message.slice(0, 32))).size;
    dims.push({ id: "accessibility", label: "Accessibility (axe-core + semantics)", basis: "measured", score: clamp(100 - err * 18 - warn * 5),
      evidence: [`${err} distinct errors, ${warn} warnings across ${audit.viewports.length} viewports`], suggestions: a11y.filter((i) => i.severity !== "info").slice(0, 3).map((i) => `${i.message}${i.fix ? ` → ${i.fix}` : ""}`) });
  }
  // 2. Typography
  {
    const m = desktop.metrics;
    const distinct = new Set(m.fontSizes).size;
    const ratio = m.bodySize ? m.h1Size / m.bodySize : 0;
    let s = 100; const ev: string[] = [], sug: string[] = [];
    ev.push(`${distinct} distinct font sizes; H1 ${m.h1Size.toFixed(0)}px vs body ${m.bodySize.toFixed(0)}px (ratio ${ratio.toFixed(1)}); body line-height ${m.bodyLineHeight.toFixed(2)}; longest line ≈ ${m.maxLineChars} chars`);
    if (distinct > 11) { s -= (distinct - 11) * 5; sug.push("Too many font sizes — snap to the token type scale."); }
    if (ratio < 2.2) { s -= 18; sug.push("Weak headline hierarchy: H1 should be ≥ 2.2× body size."); }
    if (m.bodyLineHeight < 1.4 || m.bodyLineHeight > 1.8) { s -= 10; sug.push("Body line-height outside 1.4–1.8."); }
    if (m.maxLineChars > 85) { s -= 10; sug.push("Paragraph measure exceeds ~80 characters; add max-width in ch."); }
    if (desktop.compliance) { const f = desktop.compliance.fontSize.ratio; ev.push(`font-size token compliance ${(f * 100).toFixed(0)}%`); s -= (1 - f) * 40; }
    dims.push({ id: "typography", label: "Typography & hierarchy", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 3. Spacing rhythm
  {
    const m = desktop.metrics; let s = 100; const ev: string[] = [], sug: string[] = [];
    const secSd = sd(m.sectionPaddings);
    ev.push(`section vertical padding: ${m.sectionPaddings.map((p) => Math.round(p)).join(", ") || "n/a"} (σ=${secSd.toFixed(1)})`);
    if (secSd > 24) { s -= 20; sug.push("Section padding is inconsistent; use one fluid --section-y."); }
    if (desktop.compliance) { const c = desktop.compliance.spacing.ratio; ev.push(`4px-grid compliance ${(c * 100).toFixed(0)}%`); s -= (1 - c) * 60; if (c < 0.85) sug.push("Spacing values off the 4px grid: " + desktop.compliance.spacing.offenders.slice(0, 3).map((o) => o.value + "px").join(", ")); }
    dims.push({ id: "spacing", label: "Spacing rhythm & grid", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 4. Colour discipline
  {
    let s = 100; const ev: string[] = [], sug: string[] = [];
    if (desktop.compliance) { const c = desktop.compliance.color.ratio; ev.push(`palette compliance ${(c * 100).toFixed(0)}% of ${desktop.compliance.color.checked} colour uses`); s -= (1 - c) * 120; if (c < 0.9) sug.push("Off-palette colours: " + desktop.compliance.color.offenders.slice(0, 3).map((o) => o.value).join("; ")); }
    else { ev.push("no tokens supplied; palette compliance not measured"); s = 70; }
    dims.push({ id: "color", label: "Colour discipline", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 5. Layout & alignment
  {
    const m = desktop.metrics; let s = 100; const ev: string[] = [], sug: string[] = [];
    ev.push(`distinct content left-edges across sections: ${m.contentLefts.length} (${m.contentLefts.join(", ")})`);
    if (m.contentLefts.length > 2) { s -= (m.contentLefts.length - 2) * 12; sug.push("Sections do not share one container edge."); }
    ev.push(`primary CTAs in first viewport: ${m.primaryCtasInFold}; visual area in first 1.6 screens: ${(m.visualAreaFold * 100).toFixed(0)}%`);
    if (m.primaryCtasInFold === 0) { s -= 25; sug.push("Add a visible primary CTA above the fold."); }
    if (m.primaryCtasInFold > 2) { s -= 15; sug.push("Too many competing primary CTAs."); }
    if (m.visualAreaFold < 0.12) { s -= 12; sug.push("Hero lacks a substantial product visual (SVG/image/frame)."); }
    dims.push({ id: "layout", label: "Layout, alignment & CTA hierarchy", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 6. Whitespace balance via pixels
  {
    let s = 100; const ev: string[] = [], sug: string[] = [];
    for (const vp of audit.viewports) {
      const p = vp.screenshots.full; if (!p) continue;
      const st = analyzePng(p);
      const big = st.deadZones.filter((z) => z.toY - z.fromY >= (vp.viewport.mobile ? 520 : 440));
      ev.push(`${vp.viewport.name}: ${(st.contentRatio * 100).toFixed(0)}% of page bands contain content; ${big.length} dead zone(s) ≥ ${vp.viewport.mobile ? 520 : 440}px`);
      for (const z of big) { zonesOut.push({ viewport: vp.viewport.name, ...z }); s -= 12; sug.push(`${vp.viewport.name}: empty band y=${z.fromY}–${z.toY}px (invisible content or excess spacing).`); }
    }
    if (!ev.length) { ev.push("no screenshots available"); s = 60; }
    dims.push({ id: "whitespace", label: "Whitespace balance (pixel scan)", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 7. Responsiveness
  {
    let s = 100; const ev: string[] = [], sug: string[] = [];
    const resp = audit.viewports.flatMap((v) => v.issues.filter((i) => i.category === "overflow" || i.category === "responsive"));
    const over = resp.filter((i) => i.category === "overflow" && i.severity === "error");
    const taps = resp.filter((i) => i.category === "responsive" && i.severity === "warning");
    ev.push(`${over.length} overflow error(s), ${new Set(taps.map((t) => t.message)).size} touch-target warning(s) over ${audit.viewports.map((v) => v.viewport.width).join("/")}px`);
    s -= over.length * 30 + new Set(taps.map((t) => t.message)).size * 4;
    if (mobile) ev.push(`mobile page height ${mobile.metrics.docHeight}px`);
    for (const i of resp.slice(0, 3)) sug.push(i.message);
    dims.push({ id: "responsive", label: "Responsive behaviour", basis: "measured", score: clamp(s), evidence: ev, suggestions: sug });
  }
  // 8. Robustness (console/network/interactions/motion)
  {
    const rob = audit.viewports.flatMap((v) => v.issues.filter((i) => ["console", "network", "assets", "interaction", "motion", "content"].includes(i.category) && i.severity === "error"));
    const uniq = new Set(rob.map((i) => i.message));
    const inter = desktop.interactions; const pass = inter.filter((i) => i.passed).length;
    dims.push({ id: "robustness", label: "Robustness (console, assets, interactions, motion)", basis: "measured", score: clamp(100 - uniq.size * 20),
      evidence: [`${uniq.size} distinct runtime errors; ${pass}/${inter.length} interaction checks passed (desktop)`, `reduced-motion: ${desktop.animations.infiniteReduced} infinite animations; normal: ${desktop.animations.runningNormal} running`], suggestions: [...uniq].slice(0, 3) });
  }

  // 9. Originality (anti-slop proxy)
  {
    const sl = desktop.slop;
    if (sl) dims.push({ id: "originality", label: "Originality (anti-template heuristics)", basis: "heuristic", score: sl.score, evidence: sl.findings.length ? sl.findings.map((x) => x.message) : ["no template tells detected"], suggestions: sl.findings.filter((x) => x.severity === "warning").slice(0, 4).map((x) => x.message) });
  }

  const weights: Record<string, number> = { originality: 1.6, accessibility: 1.2, typography: 1.2, spacing: 1, color: 1, layout: 1.2, whitespace: 1, responsive: 1.2, robustness: 1.2 };
  const wsum = dims.reduce((a, d) => a + (weights[d.id] ?? 1), 0);
  const overall = clamp(dims.reduce((a, d) => a + d.score * (weights[d.id] ?? 1), 0) / wsum);
  return {
    overall,
    note: "Heuristic engineering score (0–100). Every dimension is computed from DOM measurements or pixel scans — it cannot judge taste, brand fit, imagery quality or copy. Review the screenshots listed in needsVisualReview before calling a design finished.",
    dimensions: dims,
    deadZones: zonesOut,
    needsVisualReview: audit.viewports.flatMap((v) => [v.screenshots.fold, v.screenshots.full]).filter((x): x is string => !!x),
  };
}

export function formatReport(audit: AuditReport, q?: QualityReport): string {
  const L: string[] = [`Audit ${audit.url} — ${audit.passed ? "PASS" : "FAIL"} (${audit.totals.errors} errors, ${audit.totals.warnings} warnings, ${audit.totals.infos} info)`];
  for (const v of audit.viewports) {
    L.push(`\n[${v.viewport.name} ${v.viewport.width}px] ${v.issues.filter((i) => i.severity === "error").length} errors / ${v.issues.filter((i) => i.severity === "warning").length} warnings; interactions ${v.interactions.filter((i) => i.passed).length}/${v.interactions.length}`);
    for (const i of v.issues.filter((x) => x.severity !== "info").slice(0, 12)) L.push(`  ${i.severity === "error" ? "✖" : "▲"} [${i.category}] ${i.message}${i.openuiId ? ` {id:${i.openuiId}}` : ""}${i.fix ? `\n      fix: ${i.fix}` : ""}`);
  }
  if (q) { L.push(`\nQuality ${q.overall}/100 (heuristic)`); for (const d of q.dimensions) L.push(`  ${d.score.toString().padStart(3)}  ${d.label}`); }
  return L.join("\n");
}

export type { ViewportReport };
