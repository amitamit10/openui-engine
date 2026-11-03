/**
 * Model-authored illustration support. A small model can draw a SPECIFIC flat SVG for a concept (a coffee bag, a kiln, a portal)
 * far better than any fixed library can guess it, so the engine accepts SVG from the brief but only after a strict allow-list
 * rewrite: known shapes and presentation attributes only, no scripts, no external references, no text, no styles.
 */
const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "clippath", "use"]);
const ATTRS = new Set(["viewbox", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "points", "fill", "fill-opacity", "fill-rule", "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-dasharray", "transform", "opacity", "id", "offset", "stop-color", "stop-opacity", "gradienttransform", "gradientunits", "clip-path", "href", "preserveaspectratio"]);
const BAD_VALUE = /javascript:|data:|expression\(|<|>|&#|@import|url\((?!#)/i;
const REF_ATTR = new Set(["href", "clip-path"]);

export function sanitizeArt(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const m = input.match(/<svg[\s\S]*<\/svg>/i);
  if (!m || m[0].length > 24_000) return null;
  let out = "", depth = 0, sawRoot = false;
  const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let t: RegExpExecArray | null;
  while ((t = re.exec(m[0]))) {
    const closing = t[1] === "/", name = t[2]!.toLowerCase(), raw = t[3] ?? "", selfClose = t[4] === "/" || /\/\s*$/.test(raw);
    if (!TAGS.has(name)) { if (name === "script" || name === "foreignobject" || name === "style") return null; continue; }
    if (closing) { if (depth > 0) { out += `</${name}>`; depth--; } continue; }
    if (name === "svg" && sawRoot) continue;
    let attrs = "";
    const ar = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g; let a: RegExpExecArray | null;
    while ((a = ar.exec(raw))) {
      const k = a[1]!.toLowerCase(), v = a[3] ?? a[4] ?? "";
      if (k.startsWith("on") || !ATTRS.has(k) || BAD_VALUE.test(v)) { if (k.startsWith("on")) return null; continue; }
      if (REF_ATTR.has(k) && !/^#[\w-]+$|^url\(#[\w-]+\)$/.test(v)) continue;
      attrs += ` ${k === "viewbox" ? "viewBox" : k === "preserveaspectratio" ? "preserveAspectRatio" : k === "gradienttransform" ? "gradientTransform" : k === "gradientunits" ? "gradientUnits" : k}="${v.replace(/"/g, "&quot;")}"`;
    }
    if (name === "svg") { sawRoot = true; if (!/viewBox=/.test(attrs)) attrs += ' viewBox="0 0 400 300"'; attrs = attrs.replace(/\s(width|height)="[^"]*"/g, ""); attrs += ' class="art__svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"'; }
    const tag = name === "lineargradient" ? "linearGradient" : name === "radialgradient" ? "radialGradient" : name === "clippath" ? "clipPath" : name;
    out += `<${tag}${attrs}${selfClose ? "/" : ""}>`;
    if (!selfClose) depth++;
  }
  while (depth-- > 0) out += "</svg>";
  return sawRoot && /<(path|circle|ellipse|rect|line|polyline|polygon)/.test(out) ? out : null;
}

export const renderArt = (svg: unknown, alt?: string): string | null => {
  const clean = sanitizeArt(svg);
  const vb = clean?.match(/viewBox="([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
  const ar = vb && +vb[3]! > 0 && +vb[4]! > 0 ? Math.min(2, Math.max(0.6, +vb[3]! / +vb[4]!)).toFixed(3) : "1.25";
  return clean ? `<figure class="vz vz-art" style="--ar:${ar}"${alt ? ` role="img" aria-label="${String(alt).replace(/[&<>"']/g, "")}"` : ' aria-hidden="true"'}>${clean}</figure>` : null;
};
