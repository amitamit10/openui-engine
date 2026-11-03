/**
 * Model-authored illustration support. A small model can draw a SPECIFIC flat SVG for a concept (a coffee bag, a kiln, a portal)
 * far better than any fixed library can guess it, so the engine accepts SVG from the brief but only after a strict allow-list
 * rewrite: known shapes and presentation attributes only, no scripts, no external references, no styles. Short plain <text> labels are allowed (escaped, length-capped, font forced to the page font).
 */
const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "text", "tspan", "defs", "lineargradient", "radialgradient", "stop", "clippath", "use"]);
const ATTRS = new Set(["viewbox", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "points", "fill", "fill-opacity", "fill-rule", "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-dasharray", "transform", "opacity", "id", "offset", "stop-color", "stop-opacity", "gradienttransform", "gradientunits", "clip-path", "href", "preserveaspectratio", "font-size", "font-weight", "font-style", "text-anchor", "letter-spacing", "dominant-baseline"]);
const BAD_VALUE = /javascript:|data:|expression\(|<|>|&#|@import|url\((?!#)/i;
const REF_ATTR = new Set(["href", "clip-path"]);

export interface ArtResult { svg: string | null; reason?: string }
export const sanitizeArt = (input: unknown): string | null => sanitizeArtDetailed(input).svg;
const esc2 = (t: string) => t.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Same rewrite as sanitizeArt, but says why a drawing was rejected so the build can warn instead of silently falling back. */
export function sanitizeArtDetailed(input: unknown): ArtResult {
  if (typeof input !== "string") return { svg: null, reason: "not a string" };
  const m = input.match(/<svg[\s\S]*<\/svg>/i);
  if (!m) return { svg: null, reason: "no <svg>...</svg> found" };
  if (m[0].length > 24_000) return { svg: null, reason: "larger than 24KB" };
  let out = "", depth = 0, sawRoot = false, textDepth = 0, textNodes = 0;
  const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let t: RegExpExecArray | null;
  while ((t = re.exec(m[0]))) {
    const closing = t[1] === "/", name = t[2]!.toLowerCase(), raw = t[3] ?? "", selfClose = t[4] === "/" || /\/\s*$/.test(raw);
    if (!TAGS.has(name)) { if (name === "script" || name === "foreignobject" || name === "style") return { svg: null, reason: `<${name}> is not allowed` }; continue; }
    if (closing) { if (depth > 0) { out += `</${name}>`; depth--; if (name === "text" || name === "tspan") textDepth = Math.max(0, textDepth - 1); } continue; }
    if (name === "svg" && sawRoot) continue;
    let attrs = "";
    const ar = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g; let a: RegExpExecArray | null;
    while ((a = ar.exec(raw))) {
      const k = a[1]!.toLowerCase(), v = a[3] ?? a[4] ?? "";
      if (k.startsWith("on") || !ATTRS.has(k) || BAD_VALUE.test(v)) { if (k.startsWith("on")) return { svg: null, reason: `event handler attribute "${k}" is not allowed` }; continue; }
      if (REF_ATTR.has(k) && !/^#[\w-]+$|^url\(#[\w-]+\)$/.test(v)) continue;
      attrs += ` ${k === "viewbox" ? "viewBox" : k === "preserveaspectratio" ? "preserveAspectRatio" : k === "gradienttransform" ? "gradientTransform" : k === "gradientunits" ? "gradientUnits" : k}="${v.replace(/"/g, "&quot;")}"`;
    }
    if (name === "svg") { sawRoot = true; if (!/viewBox=/.test(attrs)) attrs += ' viewBox="0 0 400 300"'; attrs = attrs.replace(/\s(width|height)="[^"]*"/g, ""); attrs += ' class="art__svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"'; }
    const tag = name === "lineargradient" ? "linearGradient" : name === "radialgradient" ? "radialGradient" : name === "clippath" ? "clipPath" : name;
    out += `<${tag}${attrs}${selfClose ? "/" : ""}>`;
    if (!selfClose) depth++;
    if ((name === "text" || name === "tspan") && !selfClose) {
      textDepth++;
      const nextTag = m[0].indexOf("<", re.lastIndex), raw2 = m[0].slice(re.lastIndex, nextTag < 0 ? undefined : nextTag).replace(/\s+/g, " ").trim();
      if (raw2 && !BAD_VALUE.test(raw2.replace(/&(amp|lt|gt);/g, "")) && textNodes < 40) { out += esc2(raw2.slice(0, 60)); textNodes++; }
    }
  }
  while (depth-- > 0) out += "</svg>";
  return sawRoot && /<(path|circle|ellipse|rect|line|polyline|polygon)/.test(out) ? { svg: out } : { svg: null, reason: sawRoot ? "no drawable shapes (path, circle, rect...) left after cleaning" : "no <svg> root" };
}

export const renderArt = (svg: unknown, alt?: string): string | null => {
  const clean = sanitizeArt(svg);
  const vb = clean?.match(/viewBox="([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
  const ar = vb && +vb[3]! > 0 && +vb[4]! > 0 ? Math.min(2, Math.max(0.6, +vb[3]! / +vb[4]!)).toFixed(3) : "1.25";
  return clean ? `<figure class="vz vz-art" style="--ar:${ar}"${alt ? ` role="img" aria-label="${String(alt).replace(/[&<>"']/g, "")}"` : ' aria-hidden="true"'}>${clean}</figure>` : null;
};
