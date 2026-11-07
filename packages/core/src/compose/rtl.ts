/**
 * Right-to-left support. Languages that read right to left get dir="rtl" and a stylesheet that uses CSS logical properties
 * (margin-inline-start, inset-inline-end, text-align: start...) instead of physical left/right, so the browser mirrors the
 * layout itself. Left-to-right builds are not touched.
 */
const RTL_LANGS = new Set(["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ku", "ckb"]);
export const isRtlLang = (lang?: string): boolean => RTL_LANGS.has(String(lang ?? "").toLowerCase().split(/[-_]/)[0]!);

/** Split a CSS value on spaces that are outside parentheses. */
const tokens = (v: string): string[] => { const out: string[] = []; let depth = 0, cur = ""; for (const ch of v.trim()) { if (ch === "(") depth++; if (ch === ")") depth--; if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ""; } else cur += ch; } if (cur) out.push(cur); return out; };
const SIDE = { left: "inline-start", right: "inline-end" } as const;

/** Rewrite physical left/right declarations as logical ones. Conservative: anything it cannot reason about is left untouched. */
export function toLogical(css: string): string {
  return css.replace(/([^{}]*)\{([^{}]*)\}/g, (_whole, sel: string, body: string) => {
    const centred = /(?:^|[;\s])(?:left|right)\s*:\s*50%/.test(body);
    let out = body
      // margin-left, padding-right, scroll-margin-left, border-left, border-left-width ...
      .replace(/(^|[;\s])((?:margin|padding|border|scroll-margin|scroll-padding)-)(left|right)((?:-[a-z]+)?)(\s*:)/g, (_m, a, b, d: "left" | "right", e, f) => `${a}${b}${SIDE[d]}${e}${f}`)
      // border-top-left-radius -> border-start-start-radius and so on
      .replace(/(^|[;\s])border-(top|bottom)-(left|right)-radius(\s*:)/g, (_m, a, v: "top" | "bottom", h: "left" | "right", e) => `${a}border-${v === "top" ? "start" : "end"}-${h === "left" ? "start" : "end"}-radius${e}`)
      // offsets
      .replace(/(^|[;\s])(left|right)(\s*:)/g, (_m, a, d: "left" | "right", e) => `${a}inset-${SIDE[d]}${e}`)
      // values
      .replace(/(text-align)(\s*:\s*)(left|right)\b/g, (_m, p, c, v: "left" | "right") => `${p}${c}${v === "left" ? "start" : "end"}`)
      .replace(/(float|clear)(\s*:\s*)(left|right)\b/g, (_m, p, c, v: "left" | "right") => `${p}${c}${SIDE[v]}`)
      .replace(/\bto (left|right)\b/g, (_m, v) => `to ${v === "left" ? "right" : "left"}`)
      // four-value shorthands: top right bottom left
      .replace(/(^|[;\s])(margin|padding|scroll-margin|scroll-padding|inset)(\s*:\s*)([^;]*)/g, (m, a, p, c, v) => { const t = tokens(v); return t.length === 4 ? `${a}${p}-block${c}${t[0]} ${t[2]};${p}-inline${c}${t[3]} ${t[1]}` : m; })
      .replace(/(^|[;\s])border-radius(\s*:\s*)([^;/]*)(?=;|$)/g, (m, a, c, v) => { const t = tokens(v); return t.length === 4 ? `${a}border-start-start-radius${c}${t[0]};border-start-end-radius${c}${t[1]};border-end-end-radius${c}${t[2]};border-end-start-radius${c}${t[3]}` : m; });
    if (centred) out = out.replace(/translateX\((-?)50%\)/g, (_m, neg) => `translateX(${neg ? "" : "-"}50%)`);
    return `${sel}{${out}}`;
  });
}

/** Kept for callers that used the earlier name. */
export const flipRtl = toLogical;
