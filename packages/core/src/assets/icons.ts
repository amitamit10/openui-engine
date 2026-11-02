import raw from "./icons-index.json" with { type: "json" };

type SetId = "lucide" | "tabler" | "heroicons" | "phosphor";
interface SetIndex { pkg: string; dir: string; license: string; names: string[] }
const INDEX = raw as unknown as Record<SetId, SetIndex>;

export const ICON_SETS: Array<{ id: SetId; license: string; count: number }> = (Object.keys(INDEX) as string[])
  .filter((k): k is SetId => !k.endsWith("_version"))
  .map((id) => ({ id, license: INDEX[id].license, count: INDEX[id].names.length }));

const CDN: Record<SetId, (n: string) => string> = {
  lucide: (n) => `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${n}.svg`,
  tabler: (n) => `https://cdn.jsdelivr.net/npm/@tabler/icons@3/icons/outline/${n}.svg`,
  heroicons: (n) => `https://cdn.jsdelivr.net/npm/heroicons@2/24/outline/${n}.svg`,
  phosphor: (n) => `https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2/assets/regular/${n}.svg`,
};

/** Concepts small models reach for → icon-name stems that exist in the sets. */
const SYNONYMS: Record<string, string[]> = {
  incident: ["siren", "alert", "triangle-alert", "bell-ring"], alert: ["bell", "siren", "alert-triangle"], monitoring: ["activity", "gauge", "chart-line"],
  security: ["shield", "lock", "shield-check"], payment: ["credit-card", "wallet", "banknote"], invoice: ["receipt", "file-text", "file-invoice"],
  money: ["banknote", "coins", "wallet", "currency-dollar"], analytics: ["chart-bar", "chart-line", "bar-chart", "trending-up"], team: ["users", "user-group"],
  chat: ["message-square", "messages", "message-circle"], ai: ["sparkles", "bot", "brain", "wand"], code: ["code", "terminal", "braces"], speed: ["zap", "gauge", "rocket", "bolt"],
  automation: ["workflow", "repeat", "cog", "zap"], integration: ["plug", "puzzle", "blocks", "link"], calendar: ["calendar", "calendar-days"], clock: ["clock", "timer", "history"],
  search: ["search", "magnifying-glass"], document: ["file-text", "file", "notebook"], cloud: ["cloud", "server", "database"], mobile: ["smartphone", "device-mobile"],
  design: ["palette", "pen-tool", "brush"], shop: ["shopping-bag", "shopping-cart", "store"], health: ["heart-pulse", "activity", "heart"], journal: ["notebook-pen", "book-open", "pencil"],
  check: ["check", "circle-check", "badge-check"], star: ["star", "sparkle"], globe: ["globe", "world"], mail: ["mail", "envelope"], location: ["map-pin", "map"], rocket: ["rocket"],
};

export interface IconHit { ref: string; set: string; name: string }

export function searchIcons(opts: { query: string; set?: SetId; limit?: number }): IconHit[] {
  const q = opts.query.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");
  const toks = q.split(/[\s-]+/).filter(Boolean);
  const stems = new Set<string>([q, ...toks, ...toks.flatMap((t) => SYNONYMS[t] ?? []), ...(SYNONYMS[q] ?? [])]);
  const sets = opts.set ? [opts.set] : (["lucide", "phosphor", "heroicons", "tabler"] as SetId[]);
  const scored: Array<IconHit & { s: number }> = [];
  for (const set of sets) {
    for (const name of INDEX[set].names) {
      let s = 0;
      for (const st of stems) {
        if (name === st) s = Math.max(s, 100);
        else if (name.startsWith(st + "-") || name.endsWith("-" + st)) s = Math.max(s, 70);
        else if (name.includes(st) && st.length > 2) s = Math.max(s, 45);
      }
      if (s) scored.push({ ref: `${set}:${name}`, set, name, s: s - (set === "tabler" ? 3 : 0) - name.length * 0.1 });
    }
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, opts.limit ?? 12).map(({ s: _s, ...h }) => h);
}

export const iconExists = (ref: string): boolean => {
  const [set, name] = ref.split(":") as [SetId, string];
  return !!INDEX[set]?.names.includes(name);
};

/** Strip anything executable and normalise sizing so icons inherit colour and font-size. */
export function sanitizeSvg(svg: string): string | null {
  const m = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (!m || m[0].length > 12_000) return null;
  let s = m[0];
  if (/<script|<foreignObject|javascript:|onload=|onerror=|<style|<image|xlink:href="http/i.test(s)) return null;
  s = s.replace(/\s(width|height)="[^"]*"/g, "").replace(/<svg/i, '<svg class="ico" aria-hidden="true" focusable="false"');
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ");
}

/** Refs look like `lucide:siren`. Returns found SVGs; failures are omitted (the renderer falls back). */
export async function fetchIcons(refs: string[], timeoutMs = 12_000): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all([...new Set(refs)].map(async (ref) => {
    const [set, name] = ref.split(":") as [SetId, string];
    if (!CDN[set] || !iconExists(ref)) return;
    try {
      const res = await fetch(CDN[set](name), { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) return;
      const svg = sanitizeSvg(await res.text());
      if (svg) out[ref] = svg;
    } catch { /* offline: renderer uses built-in fallback */ }
  }));
  return out;
}

const REF = /^(lucide|tabler|heroicons|phosphor):[a-z0-9-]+$/;
/** Collect icon refs anywhere inside a page spec. */
export function collectIconRefs(v: unknown, acc: Set<string> = new Set()): Set<string> {
  if (typeof v === "string") { if (REF.test(v)) acc.add(v); }
  else if (Array.isArray(v)) v.forEach((x) => collectIconRefs(x, acc));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => collectIconRefs(x, acc));
  return acc;
}

const P = (d: string) => `<svg class="ico" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
/** Original, offline fallbacks so pages never render an empty chip. */
export const FALLBACK_ICON = P('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>');
export const FALLBACK_BY_KEYWORD: Array<[RegExp, string]> = [
  [/siren|alert|bell|warning/, P('<path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4 17h16M10 21h4"/>')],
  [/shield|lock|secur/, P('<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>')],
  [/chart|activity|trend|gauge|analytic/, P('<path d="M4 19V5M4 19h16"/><path d="M8 15l3-4 3 2 4-6"/>')],
  [/user|team|people/, P('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.2 0 4 1.8 4 4"/>')],
  [/zap|bolt|speed|rocket/, P('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>')],
  [/code|terminal|api/, P('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>')],
  [/check|done|ok/, P('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>')],
  [/file|doc|invoice|receipt/, P('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>')],
  [/message|chat/, P('<path d="M4 5h16v11H9l-5 4z"/>')],
  [/plug|integr|link/, P('<path d="M9 3v5M15 3v5M6 8h12v4a6 6 0 0 1-12 0zM12 18v3"/>')],
  [/calendar|clock|time/, P('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>')],
];
export function iconSvg(ref: string | undefined, cache: Record<string, string> = {}): string {
  if (!ref) return FALLBACK_ICON;
  if (cache[ref]) return cache[ref]!;
  const name = ref.split(":")[1] ?? ref;
  return FALLBACK_BY_KEYWORD.find(([re]) => re.test(name))?.[1] ?? FALLBACK_ICON;
}
