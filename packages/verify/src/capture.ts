import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { getBrowser } from "./browser.js";
import { scrollThrough } from "./audit.js";
import { VIEWPORTS, type Viewport } from "./types.js";

export interface CaptureResult { viewport: string; width: number; height: number; fold: string; full: string; pageHeight: number }

/** Capture JPEG (small, model-friendly) fold + full-page screenshots per viewport. */
export async function capture(url: string, outDir: string, names: string[] = ["desktop", "mobile"], label = "preview"): Promise<CaptureResult[]> {
  mkdirSync(outDir, { recursive: true });
  const browser = await getBrowser();
  const out: CaptureResult[] = [];
  for (const name of names) {
    const vp: Viewport | undefined = VIEWPORTS.find((v) => v.name === name);
    if (!vp) throw new Error(`Unknown viewport "${name}". Use: ${VIEWPORTS.map((v) => v.name).join(", ")}`);
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.evaluate(() => document.fonts?.ready);
    await scrollThrough(page);
    const fold = join(outDir, `${label}-${name}-fold.jpg`), full = join(outDir, `${label}-${name}-full.jpg`);
    await page.screenshot({ path: fold, type: "jpeg", quality: 72 });
    await page.screenshot({ path: full, type: "jpeg", quality: 62, fullPage: true });
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    out.push({ viewport: name, width: vp.width, height: vp.height, fold, full, pageHeight });
    await ctx.close();
  }
  return out;
}
