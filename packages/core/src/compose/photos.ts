import { PHOTO_ROWS } from "./photos-data.js";
import { esc } from "./util.js";

export interface Photo { id: number; alt: string; tags: string[]; author: string; unsplash: string; w: number; h: number }
export const PHOTOS: Photo[] = PHOTO_ROWS.map(([id, alt, tags, author, unsplash, w, h]) => ({ id, alt, tags, author, unsplash, w, h }));
const BY_ID = new Map(PHOTOS.map((p) => [p.id, p]));

/** A photo reference: a library id (number or numeric string), an https image URL, or an object with alt text. */
export type PhotoRef = number | string | { id?: number | string; url?: string; alt?: string; credit?: string };

const stem = (w: string) => w.replace(/(ing|es|s)$/, "");
/** Offline keyword search over the hand-tagged library. Best matches first. */
export function searchPhotos(query: string, limit = 8): Array<Photo & { score: number }> {
  const words = [...new Set(query.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2).map(stem))];
  if (!words.length) return [];
  return PHOTOS.map((p) => {
    let score = 0;
    const tags = p.tags.map(stem), alt = p.alt.toLowerCase();
    for (const w of words) { if (tags.includes(w)) score += 3; else if (tags.some((t) => t.startsWith(w) || w.startsWith(t))) score += 1.5; if (alt.includes(w)) score += 1; }
    return { ...p, score };
  }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score || a.id - b.id).slice(0, limit);
}

export const photoUrl = (id: number, w: number, h: number) => `https://picsum.photos/id/${id}/${w}/${h}`;
const SAFE_URL = /^https:\/\/[^\s"'<>\\]{4,500}$/;

interface Resolved { src: (w: number, h: number) => string; resizable: boolean; alt: string; credit?: string }
export function resolvePhoto(ref: unknown, fallbackAlt = ""): Resolved | null {
  const o = typeof ref === "object" && ref ? (ref as any) : { id: ref };
  const idNum = o.id !== undefined && o.id !== "" && /^\d+$/.test(String(o.id)) ? Number(o.id) : undefined;
  const lib = idNum !== undefined ? BY_ID.get(idNum) : undefined;
  const urlLike = typeof ref === "string" && SAFE_URL.test(ref) ? ref : o.url;
  const alt = String(o.alt ?? lib?.alt ?? fallbackAlt).replace(/[\r\n]+/g, " ").slice(0, 200);
  if (lib) return { src: (w, h) => photoUrl(lib.id, w, h), resizable: true, alt, credit: lib.author };
  if (typeof urlLike === "string" && SAFE_URL.test(urlLike)) return { src: () => urlLike, resizable: false, alt, credit: o.credit ? String(o.credit).slice(0, 80) : undefined };
  return null;
}

let used = new Map<string, string>();
export const resetPhotoCredits = () => { used = new Map(); };
/** Credits for every photo rendered since the last reset, for the footer. */
export const photoCredits = (): string[] => [...new Set(used.values())];

/** Responsive <figure><img>: explicit width/height (no layout shift), lazy unless eager, descriptive alt. */
export function renderPhoto(ref: unknown, opts: { alt?: string; ratio?: number; eager?: boolean; sizes?: string; caption?: string } = {}): string | null {
  const p = resolvePhoto(ref, opts.alt);
  if (!p) return null;
  const alt = opts.alt && !(typeof ref === "object" && (ref as any)?.alt) ? opts.alt : p.alt;
  if (p.credit) used.set(p.credit, p.credit);
  const r = Math.min(2.2, Math.max(0.6, opts.ratio ?? 1.5)), W = 1200, H = Math.round(W / r);
  const srcset = p.resizable ? [480, 800, 1200].map((w) => `${p.src(w, Math.round(w / r))} ${w}w`).join(", ") : "";
  return `<figure class="vz vz-photo" style="--ar:${r.toFixed(3)}"><img src="${esc(p.src(W, H))}"${srcset ? ` srcset="${esc(srcset)}" sizes="${esc(opts.sizes ?? "(max-width:940px) 100vw, 560px")}"` : ""} alt="${esc(alt)}" width="${W}" height="${H}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">${opts.caption ? `<figcaption>${esc(opts.caption)}</figcaption>` : ""}</figure>`;
}
