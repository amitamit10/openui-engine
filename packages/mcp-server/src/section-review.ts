import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { VIEWPORTS, getBrowser, pixelStats } from "@openui-engine/verify";

export interface SectionFact {
  index: number; id: string | null; tag: string; heading: string | null; heightPx: number; words: number; svgs: number; imgs: number; buttons: number;
  repeatedChildren: number; numeric: number; background: string; pixels?: { inkPct: number; colors: number; edgePct: number }; maxVisualPct: number; tinyIcons: boolean; flags: string[];
}
export interface Weak { index: number; score: number; section: string; why: string[]; try: string[] }

export interface OpenedSections { close: () => Promise<void>; page: any; els: any[]; facts: SectionFact[]; vp: { name: string; width: number; height: number; mobile?: boolean } }

/** Open the page and measure every top-level section (header, each section, footer). */
export async function openSections(url: string, viewport: "desktop" | "mobile"): Promise<OpenedSections> {
  const vp = VIEWPORTS.find((v) => v.name === viewport)!;
  const browser = await getBrowser();
  const bctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  const page = await bctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  const handles = await page.evaluateHandle(() => {
    const seen = new Set<Element>(); const out: Element[] = [];
    const push = (e: Element) => { const r = e.getBoundingClientRect(); if (!seen.has(e) && r.height > 40 && getComputedStyle(e).display !== "none") { seen.add(e); out.push(e); } };
    document.querySelectorAll("body > header, body > nav, main > *, body > section, body > footer, body > main > footer").forEach(push);
    return out;
  });
  const props = await handles.getProperties();
  const els = [...props.values()].map((h: any) => h.asElement()).filter(Boolean);
  const facts: SectionFact[] = []; let prevSig = "";
  for (let i = 0; i < els.length; i++) {
    const f = await els[i].evaluate((el: Element) => {
      const cs = getComputedStyle(el); const txt = (el as HTMLElement).innerText || "";
      const toks = txt.trim().split(/\s+/).filter(Boolean); const words = toks.length; const numeric = toks.length ? toks.filter((t) => /\d/.test(t)).length / toks.length : 0;
      let best = 0; el.querySelectorAll("*").forEach((c: Element) => { const d = getComputedStyle(c).display; if ((d === "grid" || d === "flex") && c.children.length > best) best = c.children.length; });
      const h = el.querySelector("h1,h2,h3"); const rect = el.getBoundingClientRect();
      const vis = [...el.querySelectorAll("svg,img,canvas,video,picture")].map((v) => { const r = v.getBoundingClientRect(); return { w: r.width, h: r.height, a: r.width * r.height }; });
      const maxA = vis.reduce((m, v) => Math.max(m, v.a), 0);
      const svgs = el.querySelectorAll("svg").length;
      // plus HTML "product cards" built from many positioned divs count as a visual when large and bordered/shadowed
      let bigCard = 0; el.querySelectorAll("div,figure,aside").forEach((d: Element) => { const r = d.getBoundingClientRect(); const s = getComputedStyle(d); if (r.width > 260 && r.height > 200 && (s.boxShadow !== "none" || parseFloat(s.borderTopWidth) > 0) && d.querySelectorAll("*").length > 12) bigCard = Math.max(bigCard, r.width * r.height); });
      const area = rect.width * rect.height || 1;
      return { id: (el as HTMLElement).id || null, tag: el.tagName.toLowerCase(), heading: h?.textContent?.trim().slice(0, 70) ?? null, heightPx: Math.round(rect.height), words, svgs, imgs: el.querySelectorAll("img").length, buttons: el.querySelectorAll("a.btn,button,.btn").length, repeatedChildren: best, numeric, background: cs.backgroundColor, maxVisualPct: Math.round((Math.max(maxA, bigCard) / area) * 100), tinyIcons: svgs >= 3 && vis.filter((v) => v.a > 0).every((v) => Math.max(v.w, v.h) <= 72) };
    });
    const sig = `${f.repeatedChildren}x${f.svgs > 0}`; const flags: string[] = [];
    if (f.svgs === 0 && f.imgs === 0 && f.tag === "section") flags.push("no visual element: text only");
    if (f.repeatedChildren >= 3 && sig === prevSig) flags.push("same repeated-card layout as the previous section: vary it");
    if (f.heightPx > vp.height * 1.8) flags.push(`taller than 1.8 screens (${f.heightPx}px): trim or split`);
    if (f.heightPx < 160 && f.tag === "section") flags.push("very short: does it earn its place?");
    prevSig = sig; facts.push({ index: i, ...f, flags });
  }
  return { close: () => bctx.close(), page, els, facts, vp: vp as any };
}

/** Section capture without the sticky/fixed bars drawn over it. */
export async function shootSection(o: OpenedSections, i: number, file: string): Promise<boolean> {
  const isChrome = ["header", "nav"].includes(o.facts[i]!.tag);
  await o.els[i].scrollIntoViewIfNeeded().catch(() => {});
  const hidden = isChrome ? 0 : await o.page.evaluate(() => { let n = 0; document.querySelectorAll("*").forEach((e: Element) => { const p = getComputedStyle(e).position; if ((p === "fixed" || p === "sticky") && (e as HTMLElement).style.visibility !== "hidden") { (e as HTMLElement).dataset.ouiHid = "1"; (e as HTMLElement).style.visibility = "hidden"; n++; } }); return n; });
  await o.els[i].screenshot({ path: file, type: "jpeg", quality: 64 }).catch(() => {});
  if (hidden) await o.page.evaluate(() => document.querySelectorAll("[data-oui-hid]").forEach((e: Element) => { (e as HTMLElement).style.visibility = ""; delete (e as HTMLElement).dataset.ouiHid; }));
  return existsSync(file);
}

/** Measure how the section actually looks (from its rendering), not just its markup. */
export async function measureLook(o: OpenedSections): Promise<void> {
  for (let i = 0; i < o.facts.length; i++) {
    const f = o.facts[i]!; if (["header", "nav", "footer"].includes(f.tag) || f.heightPx > 2600) continue;
    await o.els[i].scrollIntoViewIfNeeded().catch(() => {});
    const buf: Buffer | null = await o.els[i].screenshot({ type: "png" }).catch(() => null);
    if (buf) f.pixels = pixelStats(buf);
  }
}

const SKIP = /faq|question|footer|legal|newsletter|cta|final/i;

/** Rank sections by how generic they look from measurable signals. Hero is weighted most. */
export function weakestSections(facts: SectionFact[], vp: { height: number; width: number }, n = 3): Weak[] {
  const out: Weak[] = [];
  let heroSeen = false;
  facts.forEach((f, i) => {
    if (f.tag === "header" || f.tag === "nav" || f.tag === "footer") return;
    const stripOrMetrics = f.numeric > 0.22 || (f.heightPx < 260 && f.words < 70);
    const why: string[] = []; const tryIt: string[] = []; let score = 0;
    const label = `${f.id ? "#" + f.id : "section " + i}${f.heading ? ` "${f.heading.slice(0, 48)}"` : ""}`;
    const isHero = !heroSeen; heroSeen = true;
    if (isHero) {
      if (f.maxVisualPct < 18 || f.tinyIcons) { score += 5; why.push("the hero has no dominant, specific object (the largest visual fills <18% of it)"); tryIt.push("draw ONE specific artefact of this business at 40-50% of the hero width (a ticket, a dimensioned drawing, a survey sheet, a class screen, a menu card) filled with real names, times and numbers; get_showcase lists tested starting points"); }
      else if (f.svgs <= 1 && f.words > 160) { score += 1.5; why.push("hero is text-heavy"); tryIt.push("cut the hero copy to a headline, one sentence and two buttons"); }
    } else {
      if (f.tinyIcons && f.repeatedChildren >= 3) { score += 3; why.push("small-icon + title + sentence cards (the most template-like pattern)"); tryIt.push("replace icons with one small specific mini-visual per card (a real chart, label, timetable, price) or make 1-2 cards larger in a bento layout"); }
      else if (!stripOrMetrics && f.svgs === 0 && f.imgs === 0 && f.maxVisualPct < 12 && !SKIP.test(`${f.id ?? ""} ${f.heading ?? ""}`)) { score += 2; why.push("text only, no visual element"); tryIt.push("add a specific visual: a number readout, diagram, quote with a dated source, or a product detail"); }
      if (f.flags.some((x) => x.startsWith("same repeated-card"))) { score += 2; why.push("same card grid as the section above"); tryIt.push("change the structure (rows, a timeline, a two-column feature with a large visual, a table)"); }
      if (f.heightPx > vp.height * 1.8) { score += 1.5; why.push(`very tall (${f.heightPx}px)`); tryIt.push("tighten padding or show fewer, richer items"); }
      if (f.heightPx < 160 && f.tag === "section" && !stripOrMetrics) { score += 1; why.push("very short strip"); }
    }
    const px = f.pixels;
    if (px && !stripOrMetrics) {
      if (px.inkPct < 9) { score += 2.5; why.push(`looks empty: ${px.inkPct}% of the section is anything but background`); tryIt.push("fill the space with the one thing this section is about: a specific object, a larger heading with a supporting number, or tighten the padding"); }
      else if (px.colors <= 3 && px.edgePct < 3) { score += 1.5; why.push("looks flat: almost one colour and little detail"); tryIt.push("add a tint, a rule, a dark band or a detailed visual so the section has a focal point"); }
    }
    const prev = facts[i - 1], prev2 = facts[i - 2];
    if (!isHero && prev && prev2 && f.background === prev.background && f.background === prev2.background && f.tag === "section") { score += 1; why.push("same background as the two sections above (no rhythm)"); tryIt.push("alternate the background (tint, dark band, paper) to create a rhythm"); }
    if (score >= 2) out.push({ index: i, score, section: label, why, try: tryIt });
  });
  return out.sort((a, b) => b.score - a.score).slice(0, n);
}

/** Compact digest for validate_design: the weakest sections, why, what to try, and their images. */
export async function reviewDigest(url: string, outDir: string, n = 3, withMobile = true): Promise<{ summary: any; images: Array<{ file: string; label: string }> }> {
  mkdirSync(outDir, { recursive: true });
  const d = await openSections(url, "desktop");
  try {
    await measureLook(d);
    const weak = weakestSections(d.facts, d.vp, n);
    const images: Array<{ file: string; label: string }> = [];
    for (const w of weak) { const file = join(outDir, `weak-desktop-${w.index}.jpg`); if (await shootSection(d, w.index, file)) images.push({ file, label: w.section }); }
    let mobile: string[] = [];
    if (withMobile) {
      const m = await openSections(url, "mobile");
      try { mobile = m.facts.filter((f) => f.tag === "section" && f.heightPx > m.vp.height * 3).map((f) => `${f.id ? "#" + f.id : "section " + f.index} is ${Math.round(f.heightPx / m.vp.height * 10) / 10} screens tall on mobile`); } finally { await m.close(); }
    }
    return { summary: weak.length ? { weakest_sections: weak.map((w) => ({ section: w.section, why: w.why.join("; "), try: w.try.slice(0, 2) })), mobile: mobile.length ? mobile : undefined, images: "one image per weak section follows (desktop)", next: "Fix these, then run validate_design again. Do not stop while the hero has no specific artefact." } : { weakest_sections: [], note: "no section scored as generic by the measurable checks; still LOOK at the full-page screenshot and ask whether each section is distinct and specific" } , images };
  } finally { await d.close(); }
}
