import { esc } from "./util.js";
import { sanitizeArt } from "./art.js";

export const LOGO_MARKS = ["monogram", "arch", "leaf", "petal", "stack", "diamond", "orbit", "hex", "wave", "spark"] as const;
export type LogoMark = (typeof LOGO_MARKS)[number];

const BY_STYLE: Record<string, LogoMark[]> = {
  "aurora-dark": ["orbit", "spark", "hex", "monogram"], "clarity-light": ["monogram", "stack", "hex", "diamond"],
  "editorial-paper": ["monogram", "arch", "diamond"], "terminal-dev": ["stack", "monogram", "hex"],
  "warm-human": ["petal", "leaf", "arch", "wave"], "field-notes": ["leaf", "wave", "arch", "petal"], "neo-brutal": ["diamond", "spark", "monogram", "stack"],
};
const hash = (t: string) => { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
export const initialOf = (name: string) => [...String(name).trim()][0]?.toUpperCase() ?? "•";

export function pickMark(name: string, style?: string): LogoMark {
  const list = BY_STYLE[style ?? ""] ?? [...LOGO_MARKS];
  return list[hash(name) % list.length]!;
}

/** Inner shapes on a 32x32 canvas. `bg` is the tile colour, `fg` the glyph colour (hex or CSS var). */
function shapes(kind: LogoMark, initial: string, bg: string, fg: string): string {
  const tile = `<rect width="32" height="32" rx="8" fill="${bg}"/>`;
  switch (kind) {
    case "arch": return `${tile}<path d="M9 25V15a7 7 0 0 1 14 0v10z" fill="${fg}"/>`;
    case "leaf": return `${tile}<path d="M8 24C8 14 14 8 24 8c0 10-6 16-16 16z" fill="${fg}"/><path d="M10 22 20 12" stroke="${bg}" stroke-width="1.6" stroke-linecap="round"/>`;
    case "petal": return `${tile}<g fill="${fg}"><circle cx="12.5" cy="12.5" r="5"/><circle cx="19.5" cy="12.5" r="5" opacity=".7"/><circle cx="12.5" cy="19.5" r="5" opacity=".7"/><circle cx="19.5" cy="19.5" r="5"/></g>`;
    case "stack": return `${tile}<g fill="${fg}"><rect x="8" y="9" width="16" height="4" rx="2"/><rect x="8" y="14" width="11" height="4" rx="2" opacity=".75"/><rect x="8" y="19" width="14" height="4" rx="2" opacity=".5"/></g>`;
    case "diamond": return `${tile}<path d="M16 7l9 9-9 9-9-9z" fill="${fg}"/>`;
    case "orbit": return `${tile}<circle cx="16" cy="16" r="8" fill="none" stroke="${fg}" stroke-width="2"/><circle cx="22" cy="10.5" r="3" fill="${fg}"/>`;
    case "hex": return `<path d="M16 2l12.1 7v14L16 30 3.9 23V9z" fill="${bg}"/><path d="M16 10l5.2 3v6L16 22l-5.2-3v-6z" fill="${fg}"/>`;
    case "wave": return `${tile}<g fill="none" stroke="${fg}" stroke-width="2.2" stroke-linecap="round"><path d="M7 14c3-4 6-4 9 0s6 4 9 0"/><path d="M7 21c3-4 6-4 9 0s6 4 9 0" opacity=".65"/></g>`;
    case "spark": return `${tile}<path d="M16 6c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="${fg}"/>`;
    default: return `${tile}<text x="16" y="22.5" text-anchor="middle" font-size="18" font-weight="700" font-family="Georgia,'Times New Roman',serif" fill="${fg}">${esc(initial)}</text>`;
  }
}

/** Inline mark that follows the page palette (CSS variables). */
export function inlineMark(name: string, kind: LogoMark): string {
  return `<svg viewBox="0 0 32 32" class="brand__svg" aria-hidden="true" focusable="false">${shapes(kind, initialOf(name), "var(--c-accent)", "var(--c-accent-fg)")}</svg>`;
}
/** Standalone files in explicit hex: favicon.svg (mark only) and logo.svg (mark + name). */
export function logoFiles(name: string, kind: LogoMark, accent: string, accentFg: string, text: string): Record<string, string> {
  const m = shapes(kind, initialOf(name), accent, accentFg);
  const w = Math.max(120, 52 + String(name).length * 15);
  return {
    "favicon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${m}</svg>\n`,
    "logo.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 32" width="${w}" height="32"><g>${m}</g><text x="42" y="22.5" font-size="19" font-weight="700" font-family="system-ui,Segoe UI,Arial,sans-serif" fill="${text}">${esc(name)}</text></svg>\n`,
  };
}
/** A model-supplied logo SVG, sanitised by the same allow-list as drawn art. Returns inline markup or null. */
export function customLogo(svg: unknown): string | null {
  const clean = sanitizeArt(svg);
  return clean ? clean.replace(/class="art__svg"/, 'class="brand__svg"').replace(/ preserveAspectRatio="[^"]*"/, ' preserveAspectRatio="xMidYMid meet"') : null;
}
