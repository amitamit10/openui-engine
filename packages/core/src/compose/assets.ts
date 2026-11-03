import { esc } from "./util.js";

/** Image slots a project can fill by dropping a file in <project>/images/. Slot "hero", "feature-<n>" or "logo"; any of png, jpg, jpeg, webp, avif (logo also svg). */
export type AssetMap = Record<string, string>;
let assets: AssetMap = {};
export const setAssets = (a: AssetMap) => { assets = a; };
export const getAsset = (slot: string): string | undefined => assets[slot];

export const ASPECTS: Record<string, [number, number]> = { "16:10": [1600, 1000], "1:1": [1200, 1200], "4:3": [1400, 1050], "3:2": [1500, 1000], "21:9": [1800, 770], "4:5": [1200, 1500], "3:4": [1050, 1400] };
export const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "avif", "svg"];
const slotOk = (s: unknown): s is string => typeof s === "string" && /^[a-z0-9][a-z0-9-]{0,30}$/.test(s);

const LOOK: Record<string, string> = {
  "aurora-dark": "moody low-key lighting, deep blue-black tones, subtle cool highlights",
  "clarity-light": "clean bright natural light, neutral uncluttered background, crisp modern photography",
  "editorial-paper": "editorial magazine photography, soft paper-warm tones, considered composition",
  "terminal-dev": "dark technical mood, high contrast, minimal, cool tones",
  "warm-human": "warm natural daylight, candid and human, golden tones",
  "field-notes": "soft natural light, muted earthy palette, documentary feel",
  "neo-brutal": "bold flat colour, hard light, graphic composition",
};
export const styleSuffix = (style: string, accent: string, aspect: string, extra?: string) =>
  `Overall look (secondary to the subject above): ${LOOK[style] ?? "natural light, professional photography"}${extra ? `, ${extra}` : ""}. Colours that harmonise with ${accent}. No text, logos, watermarks or UI overlays. Photorealistic, high resolution, ${aspect} aspect ratio.`;

export const logoPromptFor = (name: string, what: string, accent: string, _style?: string) =>
  `Design a logo for "${name}"${what ? `, ${what.replace(/[.\s]+$/, "")}` : ""}. A simple, distinctive, memorable mark next to the wordmark "${name}". Flat vector style, at most two colours (${accent} and near-black), no gradients, no shadows, no mockup, no extra text, plain white background. It must stay legible at 32px. Deliver as SVG if you can, otherwise a transparent PNG.`;

export interface ImageRequest { slot: string; kind: "photo" | "logo"; file: string; aspect: string; size: string; alt: string; prompt: string; status: "missing" | "provided"; provided?: string; /** true: the site already looks right without it (a text wordmark stands in for a missing logo). */ optional?: boolean }

/** The image slots described by a PageSpec: everything with a `prompt` and `slot` (hero, features) plus the logo. */
export function collectImageRequests(spec: { brand?: any; sections: Array<{ props: any }> }, found: AssetMap = {}): ImageRequest[] {
  const out: ImageRequest[] = [];
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v.prompt === "string" && slotOk(v.slot)) {
      const aspect = ASPECTS[v.aspect] ? v.aspect : "3:2", [w, h] = ASPECTS[aspect]!;
      out.push({ slot: v.slot, kind: "photo", file: `images/${v.slot}.png`, aspect, size: `${w}x${h}`, alt: String(v.alt ?? ""), prompt: String(v.fullPrompt ?? v.prompt), status: found[v.slot] ? "provided" : "missing", provided: found[v.slot] });
    } else Object.values(v).forEach(walk);
  };
  spec.sections.forEach((s) => walk(s.props));
  if (spec.brand?.logoPrompt) out.push({ slot: "logo", kind: "logo", file: "images/logo.svg", aspect: "4:1", size: "svg or png, about 512px wide", alt: `${spec.brand.name} logo`, prompt: String(spec.brand.logoPrompt), status: found.logo ? "provided" : "missing", provided: found.logo, optional: true });
  const seen = new Set<string>();
  return out.filter((r) => !seen.has(r.slot) && seen.add(r.slot));
}

export function imageInstructions(reqs: ImageRequest[]): string | undefined {
  const photos = reqs.filter((r) => r.status === "missing" && !r.optional);
  const logo = reqs.find((r) => r.status === "missing" && r.optional);
  const parts: string[] = [];
  if (photos.length) parts.push(`IMAGES: ${photos.length} image slot(s) still show a placeholder. FIRST decide whether you can generate images yourself (an image-generation tool). If you can, generate each prompt below and save it with add_image (slot + file), then call rebuild_project. If you cannot, do NOT invent image URLs and do NOT leave this out: tell the user plainly that they need to copy-paste each prompt below into ChatGPT (or any image generator), save the result into the project's images/ folder with the file name shown (for example images/hero.png), and ask you to run rebuild_project, which swaps the placeholders for the real images automatically.`);
  if (logo) parts.push(`LOGO (optional): the site is using a clean text wordmark, which is fine to ship. If the user wants a designed logo, give them the logo prompt to paste into ChatGPT and save the result as images/logo.svg or images/logo.png; do not treat the wordmark as an error.`);
  return parts.length ? parts.join(" ") : undefined;
}

/** Placeholder or real <img> for a prompt-described slot. */
export function renderImageSlot(ref: { slot?: string; prompt: string; fullPrompt?: string; alt?: string; aspect?: string }, opts: { alt?: string; ratio?: number; eager?: boolean; sizes?: string } = {}): string | null {
  if (!slotOk(ref.slot)) return null;
  const aspect = ASPECTS[ref.aspect ?? ""] ? ref.aspect! : "3:2", [aw, ah] = ASPECTS[aspect]!;
  const ratio = (aw / ah).toFixed(3), alt = String(ref.alt ?? opts.alt ?? "").replace(/[\r\n]+/g, " ").slice(0, 200);
  const src = getAsset(ref.slot);
  if (src) return `<figure class="vz vz-photo" style="--ar:${ratio}" data-image-slot="${esc(ref.slot)}"><img src="${esc(src)}" alt="${esc(alt)}" width="${aw}" height="${ah}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>`;
  const prompt = String(ref.fullPrompt ?? ref.prompt);
  return `<figure class="vz vz-photo vz-photo--ph" style="--ar:${ratio}" role="img" aria-label="${esc(alt || "Image placeholder")}" data-image-slot="${esc(ref.slot)}" data-image-prompt="${esc(prompt)}"><div class="ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg><strong>Image to add: ${esc(ref.slot)}</strong><span>${esc(aspect)} · save as images/${esc(ref.slot)}.png</span><p>${esc(prompt)}</p></div></figure>`;
}
