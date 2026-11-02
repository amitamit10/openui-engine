import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright-core";

/** Locate a Chromium binary: env override → Playwright cache → system paths. */
export function findChromium(): string | undefined {
  const env = process.env.OPENUI_CHROMIUM ?? process.env.CHROME_PATH;
  if (env && existsSync(env)) return env;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers", join(process.env.HOME ?? "", ".cache/ms-playwright")].filter(Boolean) as string[];
  for (const r of roots) {
    if (!existsSync(r)) continue;
    const dirs = readdirSync(r).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      for (const rel of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
        const p = join(r, d, rel);
        if (existsSync(p)) return p;
      }
    }
  }
  for (const p of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) if (existsSync(p)) return p;
  return undefined;
}

let shared: Promise<Browser> | null = null;
export function getBrowser(): Promise<Browser> {
  shared ??= chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  return shared;
}
export async function closeBrowser(): Promise<void> {
  if (shared) { const b = await shared; shared = null; await b.close(); }
}
