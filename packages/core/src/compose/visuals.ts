import { renderPhoto } from "./photos.js";
import { esc } from "./util.js";

/**
 * Domain visuals: original HTML/SVG "product screenshots" driven by the brief's own data, so a page about
 * incidents shows incidents and a page about invoicing shows an invoice. All values are escaped.
 */
import { renderScene, renderSpot } from "./illustrate.js";
import { renderArt } from "./art.js";
export type VisualKind = "ui" | "dashboard" | "timeline" | "chat" | "code" | "terminal" | "kanban" | "table" | "chart" | "invoice" | "schedule" | "gallery" | "product-cards" | "checklist" | "metrics" | "spot" | "scene" | "svg" | "photo";
export const VISUAL_KINDS: VisualKind[] = ["ui", "dashboard", "timeline", "chat", "code", "terminal", "kanban", "table", "chart", "invoice", "schedule", "gallery", "product-cards", "checklist", "metrics", "spot", "scene", "svg", "photo"];

export interface VisualSpec { kind: VisualKind; title?: string; [k: string]: any }
type Tone = "ok" | "warn" | "bad" | "info" | "now" | "muted";
const tone = (t: unknown): Tone => (["ok", "warn", "bad", "info", "now", "muted"].includes(String(t)) ? (t as Tone) : "muted");

const KW = /\b(const|let|var|function|return|if|else|for|while|await|async|import|from|export|class|new|def|print|true|false|null|None|True|False|in|of|try|catch|throw|type|interface|fn|pub|use|SELECT|FROM|WHERE|INSERT|UPDATE)\b/g;
/** Minimal single-pass highlighter: comments, strings, numbers, keywords, calls. */
export function highlight(code: string): string {
  const out: string[] = [];
  const re = /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*\b)|(\b[A-Za-z_]\w*)(?=\()|(\b[A-Za-z_]\w*\b)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out.push(esc(code.slice(last, m.index)));
    if (m[1]) out.push(`<span class="c">${esc(m[1])}</span>`);
    else if (m[2]) out.push(`<span class="s">${esc(m[2])}</span>`);
    else if (m[3]) out.push(`<span class="n">${esc(m[3])}</span>`);
    else if (m[4]) out.push(KW.test(m[4]) ? `<span class="k">${esc(m[4])}</span>` : `<span class="f">${esc(m[4])}</span>`);
    else out.push((KW.lastIndex = 0, KW.test(m[5]!)) ? `<span class="k">${esc(m[5])}</span>` : esc(m[5]));
    KW.lastIndex = 0; last = re.lastIndex;
  }
  out.push(esc(code.slice(last)));
  return out.join("");
}

const bar = (title: string, right?: string) => `<div class="vz-bar"><span class="frame__dot"></span><span class="frame__dot"></span><span class="frame__dot"></span><span class="vz-title">${esc(title)}</span>${right ? `<span class="vz-right">${esc(right)}</span>` : ""}</div>`;
const pill = (text: unknown, t: unknown) => `<span class="vz-pill vz-${tone(t)}">${esc(text)}</span>`;
const seeded = (seed: string) => { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), ((h >>> 0) % 10000) / 10000); };

function smooth(values: number[], W: number, H: number, max: number, pad = 10): string {
  const step = (W - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, H - pad - (v / max) * (H - pad * 2)] as const);
  let d = `M${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!, cx = (x0 + x1) / 2; d += ` C${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  return d;
}

function chartSvg(v: VisualSpec, uid: string): string {
  const given: Array<{ label: string; values: number[] }> = (Array.isArray(v.series) ? v.series : [])
    .map((s: any) => ({ label: String(s?.label ?? "Series"), values: (Array.isArray(s?.values) ? s.values : []).map(Number).filter((n: number) => Number.isFinite(n)) }))
    .filter((s: { values: number[] }) => s.values.length >= 2);
  const series: Array<{ label: string; values: number[] }> = (given.length ? given : [{ label: "Series", values: [12, 18, 15, 24, 22, 31, 29, 38] }]).slice(0, 3);
  const labels: string[] = v.labels ?? [];
  const kind = v.chart ?? "line";
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.15;
  const W = 560, H = 220;
  const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="10" x2="${W - 10}" y1="${(H - 10 - f * (H - 20)).toFixed(1)}" y2="${(H - 10 - f * (H - 20)).toFixed(1)}"/>`).join("");
  let body = "";
  if (kind === "bars") {
    const n = series[0]!.values.length, gw = (W - 20) / n, bw = Math.min(34, gw / (series.length + 0.6));
    body = series.map((s, si) => s.values.map((val, i) => { const h = (val / max) * (H - 20); return `<rect class="b b${si}" x="${(10 + i * gw + (gw - bw * series.length) / 2 + si * bw).toFixed(1)}" y="${(H - 10 - h).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`; }).join("")).join("");
  } else if (kind === "donut") {
    const vals = series[0]!.values, tot = vals.reduce((a, b) => a + b, 0) || 1; let a0 = -Math.PI / 2; const R = 80, r = 52, cx = W / 2, cy = H / 2;
    body = vals.map((val, i) => { const a1 = a0 + (val / tot) * Math.PI * 2; const large = a1 - a0 > Math.PI ? 1 : 0; const p = (R_: number, a: number) => `${(cx + R_ * Math.cos(a)).toFixed(1)} ${(cy + R_ * Math.sin(a)).toFixed(1)}`;
      const d = `M${p(R, a0)} A${R} ${R} 0 ${large} 1 ${p(R, a1 - 0.02)} L${p(r, a1 - 0.02)} A${r} ${r} 0 ${large} 0 ${p(r, a0)}Z`; a0 = a1; return `<path class="d d${i % 5}" d="${d}"/>`; }).join("") +
      `<text x="${cx}" y="${cy + 6}" text-anchor="middle" class="vz-big">${esc(v.center ?? Math.round(tot))}</text>`;
  } else {
    body = series.map((s, si) => { const d = smooth(s.values, W, H, max); return (si === 0 && kind === "area" ? `<path class="ar" d="${d} L${W - 10} ${H - 10} L10 ${H - 10}Z" fill="url(#g${uid})"/>` : "") + `<path class="ln ln${si}" d="${d}"/>`; }).join("");
    if (series[0]) { const last = series[0].values.at(-1)!; const x = W - 10, y = H - 10 - (last / max) * (H - 20); body += `<circle class="dot" cx="${x}" cy="${y.toFixed(1)}" r="4.5"/>`; }
  }
  const xl = kind !== "donut" && labels.length ? `<div class="vz-xl">${labels.map((l) => `<span>${esc(l)}</span>`).join("")}</div>` : "";
  const legend = series.length > 1 || kind === "donut" ? `<div class="vz-legend">${(kind === "donut" ? (v.labels ?? []).map((l: string, i: number) => [l, i]) : series.map((s, i) => [s.label, i])).map(([l, i]: any) => `<span><i class="sw d${i % 5}"></i>${esc(l)}</span>`).join("")}</div>` : "";
  return `<svg class="vz-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(v.title ?? "Chart")}"><defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c-accent)" stop-opacity=".3"/><stop offset="1" stop-color="var(--c-accent)" stop-opacity="0"/></linearGradient></defs><g class="gr">${grid}</g>${body}</svg>${xl}${legend}`;
}

const GALLERY_SHAPES = (rnd: () => number, i: number) => {
  const k = Math.floor(rnd() * 4);
  const a = (n: number) => (rnd() * n).toFixed(0);
  if (k === 0) return `<circle cx="${a(200)}" cy="${a(140)}" r="${40 + Number(a(50))}" class="s${i % 3}"/><circle cx="${a(200)}" cy="${a(140)}" r="${20 + Number(a(30))}" class="s${(i + 1) % 3}"/>`;
  if (k === 1) return `<rect x="${a(80)}" y="${a(50)}" width="${70 + Number(a(80))}" height="${60 + Number(a(60))}" rx="${a(30)}" class="s${i % 3}"/><rect x="${a(120)}" y="${a(80)}" width="${50 + Number(a(70))}" height="${50 + Number(a(50))}" rx="${a(24)}" class="s${(i + 2) % 3}"/>`;
  if (k === 2) return `<path d="M0 ${100 + Number(a(40))} Q 80 ${a(60)} 160 ${80 + Number(a(40))} T 320 ${60 + Number(a(60))} V160 H0Z" class="s${i % 3}"/><path d="M0 ${130 + Number(a(20))} Q 100 ${60 + Number(a(40))} 200 ${120 + Number(a(30))} T 320 ${90 + Number(a(40))} V160 H0Z" class="s${(i + 1) % 3}"/>`;
  return Array.from({ length: 6 }, (_, j) => `<rect x="${j * 54}" y="0" width="50" height="160" class="s${(i + j) % 3}" opacity="${(0.35 + (j % 3) * 0.25).toFixed(2)}"/>`).join("");
};

/** Accept the shapes small models naturally write (aliases, bare arrays, row objects) and normalise them. */
export function normalizeVisual(v: any): VisualSpec | undefined {
  if (!v || typeof v !== "object" || !v.kind) return v;
  const o: any = { ...v };
  if (o.kind === "chart") {
    if (!o.series) { const raw = o.values ?? o.data ?? o.points; if (Array.isArray(raw)) o.series = [{ label: o.label ?? o.title ?? "Series", values: raw.map(Number).filter((n: number) => !Number.isNaN(n)) }]; }
    if (Array.isArray(o.series)) o.series = o.series.map((s: any, i: number) => Array.isArray(s) ? { label: `Series ${i + 1}`, values: s.map(Number) } : s && typeof s === "object" ? { label: s.label ?? s.name ?? `Series ${i + 1}`, values: (s.values ?? s.data ?? []).map(Number) } : { label: `Series ${i + 1}`, values: [Number(s)] });
    if (o.type && !o.chart) o.chart = o.type;
    if (o.chart === "line" && o.area) o.chart = "area";
  }
  if (o.kind === "table") {
    o.columns = o.columns ?? o.headers ?? o.head;
    if (Array.isArray(o.rows) && o.rows.length && !Array.isArray(o.rows[0]) && typeof o.rows[0] === "object") { o.columns = o.columns ?? Object.keys(o.rows[0]); o.rows = o.rows.map((r: any) => (o.columns as string[]).map((c) => r[c])); }
  }
  if (o.kind === "ui") o.blocks = o.blocks ?? o.items ?? o.content ?? o.elements;
  if (o.kind === "timeline") o.items = o.items ?? o.events ?? o.entries;
  if (o.kind === "kanban") o.columns = o.columns ?? o.lanes ?? o.boards;
  if (o.kind === "chat") o.messages = o.messages ?? o.items ?? o.conversation;
  if (o.kind === "checklist" || o.kind === "gallery" || o.kind === "metrics" || o.kind === "product-cards") o.items = o.items ?? o.rows ?? o.entries;
  if (o.kind === "schedule") {
    // Small models describe appointments naturally (rows of times with items); accept those shapes instead of rendering an empty grid.
    const rows = o.rows ?? o.items ?? o.entries ?? o.slots ?? o.appointments ?? o.events;
    const days: string[] | undefined = Array.isArray(o.days) ? o.days.map(String) : undefined;
    const dayIndex = (d: unknown, fallback: number): number => {
      if (typeof d === "number" && d >= 0) return d;
      if (typeof d === "string" && days) { const i = days.findIndex((x) => x.toLowerCase().startsWith(d.slice(0, 3).toLowerCase())); if (i >= 0) return i; }
      return fallback;
    };
    if (Array.isArray(rows)) o.rows = rows.map((r: any) => {
      if (!r || typeof r !== "object") return { label: String(r ?? ""), blocks: [] };
      const raw = r.blocks ?? r.cells ?? r.items ?? r.appointments ?? r.slots ?? [];
      const blocks = (Array.isArray(raw) ? raw : []).map((b: any, i: number) => (typeof b === "string" ? { day: i, label: b } : { ...b, day: dayIndex(b.day ?? b.col, i), label: b.label ?? b.title ?? b.text ?? b.name }));
      return { ...r, label: r.label ?? r.name ?? r.title ?? r.time ?? "", blocks };
    });
  }
  if (o.kind === "code" || o.kind === "terminal") o.code = o.code ?? (Array.isArray(o.lines) ? o.lines.join("\n") : o.snippet ?? o.content);
  return o;
}


const wave = (seed: string, n = 36) => { const r = seeded(seed); return Array.from({ length: n }, (_, i) => `<i style="height:${Math.round(18 + Math.abs(Math.sin(i / 3.1 + r() * 2)) * 70)}%"></i>`).join(""); };
const initials = (n: string) => String(n).split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();

/** One block of a composable product screen. Every field is escaped. */
function uiBlock(b: any, i: number): string {
  const t = String(b?.type ?? "text");
  const cls = `vz-b vz-b-${t}${b?.side ? " side" : ""}`;
  switch (t) {
    case "heading": return `<h4 class="${cls}">${esc(b.text)}</h4>`;
    case "text": return `<p class="${cls}${b.style === "italic" ? " it" : b.style === "muted" ? " mu" : b.style === "strong" ? " st" : ""}">${b.label ? `<small>${esc(b.label)}</small>` : ""}${esc(b.text)}</p>`;
    case "chips": return `<div class="${cls}">${(b.items ?? []).slice(0, 8).map((c: any) => typeof c === "string" ? `<span class="vz-chip">${esc(c)}</span>` : `<span class="vz-chip vz-${tone(c.tone)}">${esc(c.text)}</span>`).join("")}</div>`;
    case "mood": { const max = Math.min(10, Number(b.max ?? 10)); const val = Number(b.value ?? 0); return `<div class="${cls}"><small>${esc(b.label ?? "Mood")}</small><div class="dots" role="img" aria-label="${val} of ${max}">${Array.from({ length: max }, (_, k) => `<i class="${k < val ? "on" : ""}"></i>`).join("")}</div>${b.note ? `<small>${esc(b.note)}</small>` : ""}</div>`; }
    case "toggle": return `<div class="${cls}"><span>${esc(b.label)}</span><i class="sw${b.on ? " on" : ""}"></i></div>`;
    case "progress": return `<div class="${cls}"><div class="row"><span>${esc(b.label)}</span><small>${esc(b.meta ?? `${b.value ?? 0}%`)}</small></div><div class="bar"><i style="width:${Math.max(0, Math.min(100, Number(b.value ?? 0)))}%"></i></div></div>`;
    case "stat": return `<div class="${cls}"><small>${esc(b.label)}</small><strong>${esc(b.value)}</strong>${b.delta ? `<em class="${/^[-−▼]/.test(String(b.delta)) ? "dn" : "up"}">${esc(b.delta)}</em>` : ""}</div>`;
    case "list": return `<ul class="${cls}">${(b.items ?? []).slice(0, 6).map((it: any) => `<li><span class="lt"><b>${esc(it.title)}</b>${it.meta ? `<small>${esc(it.meta)}</small>` : ""}</span>${it.tag ? pill(it.tag, it.tone) : ""}</li>`).join("")}</ul>`;
    case "people": return `<ul class="${cls}">${(b.items ?? []).slice(0, 5).map((p: any) => `<li><span class="av" aria-hidden="true">${esc(initials(p.name))}</span><span class="lt"><b>${esc(p.name)}</b>${p.role ? `<small>${esc(p.role)}</small>` : ""}</span>${p.status ? pill(p.status, p.tone) : ""}</li>`).join("")}</ul>`;
    case "quote": return `<blockquote class="${cls}"><p>${esc(b.text)}</p>${b.by ? `<small>${esc(b.by)}</small>` : ""}</blockquote>`;
    case "callout": return `<div class="${cls} vz-${tone(b.tone)}"><span>${esc(b.text)}</span></div>`;
    case "wave": return `<div class="${cls}"><div class="wv" role="img" aria-label="${esc(b.label ?? "Audio waveform")}">${wave(String(b.label ?? i))}</div>${b.label ? `<small>${esc(b.label)}</small>` : ""}</div>`;
    case "buttons": return `<div class="${cls}">${(b.items ?? []).slice(0, 3).map((x: string, k: number) => `<span class="vz-btn${k === 0 ? " pri" : ""}">${esc(x)}</span>`).join("")}</div>`;
    case "divider": return `<hr class="${cls}">`;
    default: return "";
  }
}

/** Render a domain visual. `id` namespaces SVG gradient ids so several can share a page. */
export function renderVisual(input: VisualSpec | undefined, id = "v"): string {
  const v = normalizeVisual(input);
  if (!v || !v.kind) return "";
  const uid = id.replace(/[^a-z0-9]/gi, "");
  switch (v.kind) {
    case "photo": return renderPhoto((v as any).photo ?? (v as any).id ?? (v as any).url, { alt: (v as any).alt ?? (v as any).title, caption: (v as any).caption, ratio: Number((v as any).ratio) || 1.25, eager: true }) ?? "";
    case "svg": return renderArt((v as any).svg, (v as any).alt ?? (v as any).title) ?? "";
    case "spot": return renderSpot(v as any, uid);
    case "scene": return renderScene(v as any, uid);
    case "timeline": {
      const items: any[] = (v.items ?? []).slice(0, 7);
      return `<div class="vz vz-timeline" role="img" aria-label="${esc(v.title ?? "Activity timeline")}">${bar(v.title ?? "Timeline", v.right)}<ol class="vz-tl">${items.map((it) => `<li class="vz-${tone(it.status)}"><time>${esc(it.time ?? "")}</time><div><b>${esc(it.title)}</b>${it.detail ? `<small>${esc(it.detail)}</small>` : ""}</div>${it.tag ? pill(it.tag, it.status) : ""}</li>`).join("")}</ol></div>`;
    }
    case "chat": {
      const msgs: any[] = (v.messages ?? []).slice(0, 6);
      return `<div class="vz vz-chat" role="img" aria-label="${esc(v.title ?? "Conversation")}">${bar(v.title ?? "Assistant", v.right)}<div class="vz-msgs">${msgs.map((m) => `<div class="vz-msg ${m.role === "user" ? "me" : "bot"}"><p>${esc(m.text)}</p>${m.meta ? `<small>${esc(m.meta)}</small>` : ""}</div>`).join("")}</div>${(v.suggestions ?? []).length ? `<div class="vz-sugs">${(v.suggestions as string[]).slice(0, 3).map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}<div class="vz-input"><span>${esc(v.placeholder ?? "Ask anything…")}</span><i></i></div></div>`;
    }
    case "code":
    case "terminal": {
      const code = String(v.code ?? "").split("\n").slice(0, 16);
      const isTerm = v.kind === "terminal";
      return `<div class="vz vz-code" role="img" aria-label="${esc(v.title ?? "Code")}">${bar(v.filename ?? v.title ?? (isTerm ? "terminal" : "index.ts"), v.right)}<pre><code>${code.map((l, i) => `<span class="ln">${isTerm ? "" : i + 1}</span>${isTerm && /^\$ /.test(l) ? `<span class="pr">$ </span>${highlight(l.slice(2))}` : highlight(l)}`).join("\n")}</code></pre></div>`;
    }
    case "kanban": {
      const cols: any[] = (v.columns ?? []).slice(0, 4);
      return `<div class="vz vz-kanban" role="img" aria-label="${esc(v.title ?? "Board")}">${bar(v.title ?? "Board", v.right)}<div class="vz-cols">${cols.map((c) => `<div class="vz-col"><h4>${esc(c.title)} <em>${(c.cards ?? []).length}</em></h4>${(c.cards ?? []).slice(0, 4).map((k: any) => `<div class="vz-card"><b>${esc(k.title)}</b>${k.meta ? `<small>${esc(k.meta)}</small>` : ""}${k.tag ? pill(k.tag, k.tone) : ""}</div>`).join("")}</div>`).join("")}</div></div>`;
    }
    case "table": {
      const cols: string[] = v.columns ?? []; const rows: any[][] = (v.rows ?? []).slice(0, 7);
      const cell = (c: any) => (c && typeof c === "object" ? pill(c.text, c.tone) : esc(c));
      return `<div class="vz vz-table" role="group" aria-label="${esc(v.title ?? "Table")}">${bar(v.title ?? "Records", v.right)}<div class="vz-scroll" tabindex="0" role="region" aria-label="${esc(v.title ?? "Table")} (scrollable)"><table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
    }
    case "chart":
      return `<div class="vz vz-chart" role="img" aria-label="${esc(v.title ?? "Chart")}">${bar(v.title ?? "Overview", v.right)}<div class="vz-pad">${v.headline ? `<div class="vz-head"><strong>${esc(v.headline)}</strong>${v.delta ? `<em>${esc(v.delta)}</em>` : ""}</div>` : ""}${chartSvg(v, uid)}</div></div>`;
    case "invoice": {
      const items: any[] = (v.items ?? []).slice(0, 5);
      return `<div class="vz vz-invoice" role="group" aria-label="${esc(v.title ?? "Invoice")}">${bar(v.title ?? "Invoice", v.right)}<div class="vz-pad vz-scroll" tabindex="0" role="region" aria-label="${esc(v.title ?? "Invoice")} (scrollable)"><div class="vz-inv-head"><div><small>${esc(v.number ?? "INV-0001")}</small><strong>${esc(v.to ?? "Customer")}</strong><small>${esc(v.from ?? "")}</small></div>${v.status ? pill(v.status, v.statusTone ?? "ok") : ""}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${items.map((i) => `<tr><td>${esc(i.desc)}</td><td>${esc(i.qty ?? 1)}</td><td>${esc(i.price)}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="2">Total</td><td>${esc(v.total ?? "")}</td></tr></tfoot></table></div></div>`;
    }
    case "schedule": {
      const days: string[] = v.days ?? ["Mon", "Tue", "Wed", "Thu", "Fri"]; const rows: any[] = (v.rows ?? []).slice(0, 5);
      return `<div class="vz vz-schedule" role="img" aria-label="${esc(v.title ?? "Schedule")}">${bar(v.title ?? "Schedule", v.right)}<div class="vz-sg" style="--cols:${days.length}"><span></span>${days.map((d) => `<b>${esc(d)}</b>`).join("")}${rows.map((r) => `<span class="rl">${esc(r.label)}</span>${days.map((_, di) => { const b = (r.blocks ?? []).find((x: any) => x.day === di); return b ? `<i class="blk vz-${tone(b.tone)}" style="${b.len > 1 ? `grid-column:span ${Math.min(b.len, days.length - di)}` : ""}">${esc(b.label ?? "")}</i>` : ((r.blocks ?? []).some((x: any) => x.day < di && x.day + (x.len ?? 1) > di) ? "" : "<i></i>"); }).join("")}`).join("")}</div></div>`;
    }
    case "gallery": {
      const items: any[] = (v.items ?? []).slice(0, 6);
      return `<div class="vz vz-gallery" role="img" aria-label="${esc(v.title ?? "Selected work")}">${items.map((it, i) => { const r = seeded(String(it.seed ?? it.title ?? i)); return `<figure class="g${i % 3}"><svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="160" class="s-bg"/>${GALLERY_SHAPES(r, i)}</svg><figcaption><b>${esc(it.title)}</b>${it.caption ? `<small>${esc(it.caption)}</small>` : ""}</figcaption></figure>`; }).join("")}</div>`;
    }
    case "product-cards": {
      const items: any[] = (v.items ?? []).slice(0, 4);
      return `<div class="vz vz-products" role="img" aria-label="${esc(v.title ?? "Products")}">${items.map((it, i) => { const r = seeded(String(it.name)); return `<div class="vz-prod"><div class="ph"><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="120" class="s-bg"/>${GALLERY_SHAPES(r, i).replace(/320/g, "160")}</svg>${it.tag ? `<span class="vz-pill vz-info">${esc(it.tag)}</span>` : ""}</div><b>${esc(it.name)}</b><div class="pr"><span>${esc(it.price)}</span>${it.note ? `<small>${esc(it.note)}</small>` : ""}</div></div>`; }).join("")}</div>`;
    }
    case "checklist": {
      const items: any[] = (v.items ?? []).slice(0, 7);
      return `<div class="vz vz-check" role="img" aria-label="${esc(v.title ?? "Checklist")}">${bar(v.title ?? "Checklist", v.right)}<ul>${items.map((it) => `<li class="${it.done ? "done" : ""}"><i></i><span>${esc(it.text)}</span>${it.meta ? `<small>${esc(it.meta)}</small>` : ""}</li>`).join("")}</ul></div>`;
    }
    case "metrics": {
      const items: any[] = (v.items ?? []).slice(0, 4);
      return `<div class="vz vz-metrics" role="img" aria-label="${esc(v.title ?? "Key metrics")}">${items.map((m, i) => { const sp: number[] = m.spark ?? [4, 6, 5, 8, 7, 10, 9, 12]; const d = smooth(sp, 120, 36, Math.max(...sp) * 1.1, 3); return `<div class="vz-metric"><small>${esc(m.label)}</small><strong>${esc(m.value)}</strong>${m.delta ? `<em class="${/^[-−▼]/.test(String(m.delta)) ? "dn" : "up"}">${esc(m.delta)}</em>` : ""}<svg viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true"><path class="ln ln${i % 2}" d="${d}"/></svg></div>`; }).join("")}</div>`;
    }
    case "ui": {
      const blocks: any[] = (v.blocks ?? []).slice(0, 14);
      const main = blocks.filter((b) => !b.side), side = blocks.filter((b) => b.side);
      return `<div class="vz vz-ui" role="img" aria-label="${esc(v.title ?? "Product screen")}">${bar(v.title ?? "Screen", v.right)}<div class="vz-uigrid${side.length ? " two" : ""}"><div class="vz-uimain">${main.map(uiBlock).join("")}</div>${side.length ? `<div class="vz-uiside">${side.map(uiBlock).join("")}</div>` : ""}</div></div>`;
    }
    case "dashboard": {
      const kpis: any[] = (v.kpis ?? v.items ?? []).slice(0, 3);
      const side: string[] = v.sidebar ?? [];
      return `<div class="vz vz-dash" role="img" aria-label="${esc(v.title ?? "Dashboard")}">${bar(v.url ?? v.title ?? "Dashboard", v.right)}<div class="vz-dashgrid${side.length ? "" : " nosb"}">${side.length ? `<div class="vz-side">${side.slice(0, 6).map((x, i) => `<span class="${i === 0 ? "on" : ""}">${esc(x)}</span>`).join("")}</div>` : ""}<div class="vz-main"><div class="vz-head"><strong>${esc(v.title ?? "Overview")}</strong>${v.period ? pill(v.period, "info") : ""}</div>${kpis.length ? `<div class="vz-kpis">${kpis.map((k) => `<div class="vz-kpi"><small>${esc(k.label)}</small><strong>${esc(k.value)}</strong>${k.delta ? `<em>${esc(k.delta)}</em>` : ""}</div>`).join("")}</div>` : ""}${chartSvg({ ...v, chart: v.chart ?? "area", series: v.series ?? [{ label: "Trend", values: [4, 6, 5, 8, 7, 10, 9, 13] }] }, uid)}</div></div></div>`;
    }
    default: return "";
  }
}

/** Visuals that already provide their own title bar/frame. */
export const FRAMELESS: VisualKind[] = ["photo", "gallery", "product-cards", "metrics"];
