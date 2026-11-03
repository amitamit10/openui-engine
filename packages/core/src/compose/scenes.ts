/**
 * Domain scenes: original flat-style SVG illustrations composed from a small object library, drawn entirely in the page's own
 * palette (CSS variables), so a bakery, a marina, a dental practice and a law firm each get a hero that says what they are.
 * Objects live in a 100x100 box; scenes place them on a 400x320 canvas. No third-party artwork.
 */
export type SceneId = "interior" | "care" | "clinic" | "food" | "marine" | "books" | "craft" | "solar" | "law" | "climb" | "field";

const C = {
  a: "var(--c-accent)", s: "var(--c-accent-soft)", t: "var(--c-text)", u: "var(--c-surface)", b: "var(--c-border)", w: "var(--c-bg)", g: "var(--c-success)",
  deep: "color-mix(in srgb,var(--c-accent) 55%,var(--c-text))", mid: "color-mix(in srgb,var(--c-accent) 70%,var(--c-bg))",
  leaf: "color-mix(in srgb,var(--c-success) 80%,var(--c-text))", wood: "color-mix(in srgb,var(--c-accent) 35%,var(--c-text) 45%)",
  floor: "color-mix(in srgb,var(--c-accent-soft) 55%,var(--c-text) 12%)", sky: "color-mix(in srgb,var(--c-accent-soft) 70%,var(--c-bg))",
};
const f = (c: string, extra = "") => `fill="${c}"${extra ? " " + extra : ""}`;
const place = (svg: string, x: number, y: number, s = 1, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-100 0)" : ""}">${svg}</g>`;

/** Object library, each drawn in a 100x100 box. */
const OBJ: Record<string, string> = {
  sofa: `<rect x="6" y="12" width="88" height="44" rx="14" ${f(C.deep)}/><rect x="0" y="40" width="100" height="34" rx="14" ${f(C.deep)}/><rect x="14" y="36" width="34" height="22" rx="8" ${f(C.mid)}/><rect x="52" y="36" width="34" height="22" rx="8" ${f(C.mid)}/><rect x="14" y="72" width="8" height="12" rx="3" ${f(C.wood)}/><rect x="78" y="72" width="8" height="12" rx="3" ${f(C.wood)}/><circle cx="26" cy="30" r="9" ${f(C.s)}/>`,
  armchair: `<rect x="14" y="8" width="62" height="52" rx="18" ${f(C.deep)}/><rect x="2" y="36" width="86" height="36" rx="14" ${f(C.deep)}/><rect x="18" y="38" width="54" height="22" rx="9" ${f(C.mid)}/><rect x="14" y="70" width="8" height="14" rx="3" ${f(C.wood)}/><rect x="68" y="70" width="8" height="14" rx="3" ${f(C.wood)}/>`,
  lamp: `<rect x="48" y="30" width="4" height="62" ${f(C.t, 'fill-opacity=".7"')}/><ellipse cx="50" cy="94" rx="14" ry="4" ${f(C.t, 'fill-opacity=".7"')}/><path d="M30 32 L38 6 H62 L70 32Z" ${f(C.s)} stroke="${C.b}" stroke-width="1.5"/><path d="M38 6 H62" stroke="${C.a}" stroke-width="3" stroke-linecap="round"/>`,
  plant: `<path d="M30 70 H70 L64 98 H36Z" ${f(C.a, 'fill-opacity=".85"')}/><g ${f(C.leaf)}><ellipse cx="50" cy="40" rx="9" ry="28"/><ellipse cx="34" cy="48" rx="8" ry="24" transform="rotate(-28 34 48)"/><ellipse cx="66" cy="48" rx="8" ry="24" transform="rotate(28 66 48)"/><ellipse cx="24" cy="60" rx="6" ry="16" transform="rotate(-55 24 60)"/><ellipse cx="76" cy="60" rx="6" ry="16" transform="rotate(55 76 60)"/></g>`,
  frame: `<rect x="4" y="4" width="92" height="92" rx="4" ${f(C.w)} stroke="${C.t}" stroke-width="5"/><circle cx="36" cy="36" r="11" ${f(C.a)}/><path d="M12 84 L40 52 L58 70 L72 56 L88 84Z" ${f(C.deep)}/>`,
  windowArch: `<path d="M6 100 V44 a44 44 0 0 1 88 0 V100Z" ${f(C.sky)} stroke="${C.w}" stroke-width="6"/><path d="M50 0 V100 M6 58 H94" stroke="${C.w}" stroke-width="4"/>`,
  rug: `<ellipse cx="50" cy="50" rx="50" ry="14" ${f(C.a, 'fill-opacity=".85"')}/><ellipse cx="50" cy="50" rx="36" ry="9" fill="none" stroke="${C.w}" stroke-width="2"/>`,
  table: `<ellipse cx="50" cy="22" rx="38" ry="9" ${f(C.wood)}/><rect x="46" y="22" width="8" height="64" ${f(C.wood)}/><ellipse cx="50" cy="88" rx="22" ry="5" ${f(C.wood)}/>`,
  cup: `<path d="M24 36 H70 V62 a20 20 0 0 1 -20 20 H44 a20 20 0 0 1 -20 -20Z" ${f(C.w)} stroke="${C.t}" stroke-width="4"/><path d="M70 42 a12 12 0 0 1 0 22" fill="none" stroke="${C.t}" stroke-width="4"/><path d="M38 28 q-6 -8 0 -16 M54 28 q-6 -8 0 -16" fill="none" stroke="${C.a}" stroke-width="3" stroke-linecap="round"/>`,
  loaf: `<ellipse cx="50" cy="60" rx="46" ry="30" ${f(C.wood)}/><ellipse cx="50" cy="54" rx="40" ry="24" ${f(C.a, 'fill-opacity=".75"')}/><path d="M26 44 q6 -6 12 2 M44 38 q6 -6 12 2 M62 44 q6 -6 12 2" fill="none" stroke="${C.s}" stroke-width="4" stroke-linecap="round"/>`,
  tooth: `<path d="M50 8 C30 -2 8 12 10 36 C12 56 22 60 24 80 C25 94 38 96 40 80 C41 70 45 66 50 66 C55 66 59 70 60 80 C62 96 75 94 76 80 C78 60 88 56 90 36 C92 12 70 -2 50 8Z" ${f(C.w)} stroke="${C.t}" stroke-width="4" stroke-linejoin="round"/><path d="M26 22 q8 -8 18 -6" fill="none" stroke="${C.s}" stroke-width="5" stroke-linecap="round"/>`,
  heart: `<path d="M50 90 C14 62 4 40 10 24 C16 8 38 8 50 28 C62 8 84 8 90 24 C96 40 86 62 50 90Z" ${f(C.a)}/>`,
  sparkle: `<path d="M50 4 Q54 46 96 50 Q54 54 50 96 Q46 54 4 50 Q46 46 50 4Z" ${f(C.a)}/>`,
  boat: `<path d="M6 62 H94 L80 88 H20Z" ${f(C.deep)}/><rect x="49" y="8" width="3" height="54" ${f(C.t)}/><path d="M54 10 L90 56 H54Z" ${f(C.w)} stroke="${C.t}" stroke-width="2"/><path d="M46 18 L14 56 H46Z" ${f(C.s)} stroke="${C.t}" stroke-width="2"/>`,
  lighthouse: `<path d="M34 98 L42 30 H58 L66 98Z" ${f(C.w)} stroke="${C.t}" stroke-width="3"/><path d="M37 78 L39 62 H61 L63 78Z M40 50 L42 36 H58 L60 50Z" ${f(C.a)}/><rect x="38" y="16" width="24" height="16" ${f(C.s)} stroke="${C.t}" stroke-width="3"/><path d="M34 16 H66 L50 2Z" ${f(C.deep)}/>`,
  sun: `<circle cx="50" cy="50" r="22" ${f(C.a)}/><g stroke="${C.a}" stroke-width="5" stroke-linecap="round"><path d="M50 6 V16 M50 84 V94 M6 50 H16 M84 50 H94 M19 19 L26 26 M74 74 L81 81 M81 19 L74 26 M26 74 L19 81"/></g>`,
  house: `<rect x="14" y="44" width="72" height="50" ${f(C.w)} stroke="${C.t}" stroke-width="3"/><path d="M6 48 L50 12 L94 48Z" ${f(C.deep)}/><rect x="42" y="62" width="16" height="32" ${f(C.a)}/><rect x="20" y="54" width="14" height="14" ${f(C.sky)}/><rect x="66" y="54" width="14" height="14" ${f(C.sky)}/>`,
  panels: `<g ${f(C.t, 'fill-opacity=".85"')} stroke="${C.s}" stroke-width="2"><path d="M12 44 L40 22 H58 L30 44Z"/><path d="M34 44 L62 22 H80 L52 44Z"/><path d="M56 44 L84 22 H94 L66 44Z"/></g>`,
  tree: `<rect x="46" y="54" width="8" height="42" ${f(C.wood)}/><circle cx="50" cy="36" r="30" ${f(C.leaf)}/><circle cx="34" cy="46" r="18" ${f(C.g, 'fill-opacity=".7"')}/>`,
  columns: `<path d="M4 30 L50 4 L96 30Z" ${f(C.deep)}/><g ${f(C.w)} stroke="${C.t}" stroke-width="2.5"><rect x="12" y="34" width="12" height="52"/><rect x="38" y="34" width="12" height="52"/><rect x="64" y="34" width="12" height="52"/></g><rect x="4" y="86" width="92" height="9" rx="2" ${f(C.t)}/>`,
  scales: `<rect x="48" y="14" width="4" height="74" ${f(C.t)}/><rect x="30" y="86" width="40" height="8" rx="3" ${f(C.t)}/><path d="M12 24 H88" stroke="${C.t}" stroke-width="4" stroke-linecap="round"/><path d="M12 24 L2 52 H22Z M88 24 L78 52 H98Z" ${f(C.a)}/><path d="M2 52 a10 7 0 0 0 20 0 M78 52 a10 7 0 0 0 20 0" ${f(C.deep)}/>`,
  books: `<rect x="6" y="64" width="88" height="14" rx="2" ${f(C.deep)}/><rect x="14" y="48" width="74" height="14" rx="2" ${f(C.a)}/><rect x="8" y="32" width="68" height="14" rx="2" ${f(C.mid)} transform="rotate(-4 42 39)"/><rect x="20" y="80" width="60" height="6" rx="2" ${f(C.t, 'fill-opacity=".5"')}/>`,
  bookshelf: `<rect x="2" y="2" width="96" height="96" rx="4" ${f(C.wood)}/><g ${f(C.w)}><rect x="8" y="8" width="84" height="26"/><rect x="8" y="38" width="84" height="26"/><rect x="8" y="68" width="84" height="24"/></g><g><rect x="12" y="12" width="8" height="22" ${f(C.a)}/><rect x="22" y="16" width="7" height="18" ${f(C.deep)}/><rect x="31" y="10" width="9" height="24" ${f(C.mid)}/><rect x="44" y="14" width="7" height="20" ${f(C.t, 'fill-opacity=".7"')}/><rect x="54" y="12" width="9" height="22" ${f(C.s)}/><rect x="70" y="16" width="8" height="18" ${f(C.a)}/><rect x="14" y="42" width="9" height="22" ${f(C.mid)}/><rect x="25" y="46" width="7" height="18" ${f(C.a)}/><rect x="36" y="40" width="8" height="24" ${f(C.deep)}/><rect x="60" y="44" width="9" height="20" ${f(C.t, 'fill-opacity=".7"')}/><rect x="72" y="42" width="8" height="22" ${f(C.s)}/><rect x="12" y="72" width="8" height="20" ${f(C.deep)}/><rect x="24" y="74" width="9" height="18" ${f(C.a)}/><rect x="52" y="72" width="8" height="20" ${f(C.mid)}/><rect x="64" y="76" width="9" height="16" ${f(C.s)}/></g>`,
  loom: `<rect x="6" y="6" width="88" height="88" rx="4" fill="none" stroke="${C.wood}" stroke-width="7"/><g stroke="${C.t}" stroke-width="1.6" stroke-opacity=".55">${Array.from({ length: 13 }, (_, i) => `<path d="M${16 + i * 6} 12 V88"/>`).join("")}</g><rect x="12" y="30" width="76" height="9" ${f(C.a)}/><rect x="12" y="42" width="76" height="9" ${f(C.deep)}/><rect x="12" y="54" width="76" height="9" ${f(C.mid)}/><rect x="12" y="66" width="76" height="9" ${f(C.s)}/>`,
  yarn: `<circle cx="50" cy="50" r="34" ${f(C.a)}/><path d="M20 40 q30 18 60 0 M18 52 q32 20 64 0 M24 64 q26 14 52 0" fill="none" stroke="${C.w}" stroke-width="3" stroke-opacity=".75"/><path d="M80 66 q16 6 12 22" fill="none" stroke="${C.a}" stroke-width="3"/>`,
  wall: `<rect x="4" y="4" width="92" height="92" rx="6" ${f(C.u)} stroke="${C.t}" stroke-width="4"/><g><circle cx="26" cy="24" r="7" ${f(C.a)}/><circle cx="58" cy="18" r="6" ${f(C.deep)}/><circle cx="72" cy="40" r="8" ${f(C.mid)}/><circle cx="34" cy="50" r="6" ${f(C.s)} stroke="${C.t}" stroke-width="1.5"/><circle cx="62" cy="68" r="7" ${f(C.a)}/><circle cx="24" cy="78" r="8" ${f(C.deep)}/><circle cx="80" cy="84" r="5" ${f(C.mid)}/></g><path d="M44 4 Q40 40 46 64 T40 96" fill="none" stroke="${C.t}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>`,
  mountain: `<path d="M0 100 L34 34 L52 62 L70 24 L100 100Z" ${f(C.deep)}/><path d="M70 24 L60 44 L70 40 L78 46Z" ${f(C.w)}/>`,
  satellite: `<rect x="40" y="34" width="20" height="30" rx="4" ${f(C.t)}/><g ${f(C.a)} stroke="${C.w}" stroke-width="1.5"><rect x="2" y="38" width="34" height="22"/><rect x="64" y="38" width="34" height="22"/></g><path d="M50 34 V22 M44 22 H56" stroke="${C.t}" stroke-width="3"/>`,
  bunting: `<path d="M0 6 Q100 34 200 6" fill="none" stroke="${C.t}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${10 + i * 24} ${10 + Math.sin(i / 7 * Math.PI) * 14} l10 0 l-5 16Z" ${f([C.a, C.s, C.deep, C.mid][i % 4]!)}/>`).join("")}`,
  fields: `${Array.from({ length: 24 }, (_, i) => { const x = (i % 6) * 17, y = Math.floor(i / 6) * 25; const col = [C.leaf, C.g, C.s, C.mid][(i * 7 + Math.floor(i / 3)) % 4]!; return `<rect x="${x}" y="${y}" width="16" height="24" ${f(col, 'fill-opacity=".85"')}/>`; }).join("")}`,
  basket: `<path d="M8 40 H92 L82 92 H18Z" ${f(C.wood)}/><path d="M12 56 H88 M14 72 H86" stroke="${C.w}" stroke-width="2" stroke-opacity=".6"/><path d="M14 40 C14 8 86 8 86 40" fill="none" stroke="${C.wood}" stroke-width="5"/>`,
};

/** The object kit (100x100 boxes) and palette, exposed so a model can compose and adapt its own illustration. */
export const OBJECTS: Record<string, string> = OBJ;
export const PALETTE_VARS = ["var(--c-accent)", "var(--c-accent-soft)", "var(--c-text)", "var(--c-surface)", "var(--c-bg)", "var(--c-border)", "var(--c-success)", "color-mix(in srgb,var(--c-accent) 55%,var(--c-text))"];
const obj = (name: string, x: number, y: number, s = 1, flip = false) => place(OBJ[name] ?? "", x, y, s, flip);
const rect = (x: number, y: number, w: number, h: number, c: string, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${f(c, extra)}/>`;
const circ = (x: number, y: number, r: number, c: string, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" ${f(c, extra)}/>`;

const room = (inner: string) => `${rect(0, 0, 400, 320, C.s, 'fill-opacity=".75"')}${rect(0, 236, 400, 84, C.floor)}${inner}`;

const SCENES: Record<SceneId, () => string> = {
  interior: () => room(`${obj("windowArch", 24, 44, 1.25)}${obj("frame", 176, 48, 0.75)}${obj("frame", 264, 72, 0.45)}${obj("lamp", 296, 88, 1.3)}${obj("rug", 110, 262, 2.1)}${obj("sofa", 86, 160, 1.8)}${obj("plant", 16, 176, 1.2)}`),
  care: () => room(`${obj("windowArch", 24, 44, 1.25)}${obj("frame", 176, 50, 0.7)}${obj("heart", 194, 68, 0.28)}${obj("lamp", 296, 90, 1.3)}${obj("rug", 110, 266, 2.0)}${obj("armchair", 96, 168, 1.6)}${obj("table", 262, 186, 0.9)}${obj("cup", 282, 164, 0.45)}${obj("plant", 14, 184, 1.1)}`),
  clinic: () => room(`${obj("windowArch", 24, 44, 1.25)}${circ(262, 150, 96, C.w, 'fill-opacity=".7"')}${obj("tooth", 210, 86, 1.05)}${obj("sparkle", 318, 66, 0.4)}${obj("sparkle", 196, 62, 0.22)}${obj("plant", 322, 190, 1.1)}${obj("table", 56, 196, 0.9)}${obj("cup", 76, 172, 0.45)}`),
  food: () => `${rect(0, 0, 400, 320, C.s, 'fill-opacity=".75"')}${rect(0, 232, 400, 88, C.wood)}${obj("bunting", 0, 10, 1.0)}${obj("bunting", 200, 10, 1.0)}${obj("windowArch", 270, 56, 1.2)}${obj("basket", 30, 150, 1.5)}${obj("loaf", 46, 124, 1.15)}${obj("loaf", 132, 166, 0.8)}${obj("cup", 240, 178, 0.95)}${obj("plant", 322, 172, 1.0)}`,
  marine: () => `${rect(0, 0, 400, 320, C.sky)}${obj("sun", 130, 8, 1.15)}${rect(0, 190, 400, 130, C.mid, 'fill-opacity=".9"')}<path d="M0 214 Q50 196 100 214 T200 214 T300 214 T400 214 V320 H0Z" ${f(C.deep, 'fill-opacity=".9"')}/><path d="M0 252 Q50 236 100 252 T200 252 T300 252 T400 252 V320 H0Z" ${f(C.a, 'fill-opacity=".35"')}/>${obj("lighthouse", 256, 70, 1.9)}${obj("boat", 64, 124, 1.9)}`,
  books: () => room(`${obj("bookshelf", 28, 28, 2.3)}${obj("lamp", 296, 70, 1.4)}${obj("armchair", 214, 178, 1.45)}${obj("books", 322, 232, 0.6)}`),
  craft: () => room(`${obj("loom", 40, 34, 2.7)}${obj("yarn", 292, 208, 0.9)}${obj("yarn", 340, 236, 0.6)}${obj("plant", 312, 84, 1.1)}`),
  solar: () => `${rect(0, 0, 400, 320, C.sky)}${obj("sun", 250, 10, 1.5)}<path d="M0 250 Q100 210 200 244 T400 236 V320 H0Z" ${f(C.leaf, 'fill-opacity=".85"')}/><path d="M0 286 Q120 258 240 284 T400 276 V320 H0Z" ${f(C.g, 'fill-opacity=".6"')}/>${obj("house", 80, 120, 2.4)}${obj("panels", 80, 120, 2.4)}${obj("tree", 300, 186, 1.1)}`,
  law: () => `${rect(0, 0, 400, 320, C.s, 'fill-opacity=".75"')}${rect(0, 262, 400, 58, C.deep)}${obj("columns", 34, 56, 2.5)}${obj("scales", 276, 112, 1.2)}${obj("books", 290, 214, 0.7)}`,
  climb: () => `${rect(0, 0, 400, 320, C.sky)}${obj("sun", 14, 14, 0.8)}${obj("mountain", 0, 150, 3.2)}${obj("wall", 120, 30, 2.8)}${rect(0, 292, 400, 28, C.deep)}`,
  field: () => `${rect(0, 0, 400, 320, C.sky)}${obj("fields", 0, 110, 3.9)}<path d="M20 120 Q200 -40 380 110" fill="none" stroke="${C.t}" stroke-width="2" stroke-dasharray="3 7" stroke-opacity=".5"/>${obj("satellite", 150, 22, 1.3)}${obj("sun", 300, 16, 0.9)}`,
};

/** Keyword routing: which domain scene fits this brief (null = none, e.g. software products keep the product mockup). */
const ROUTES: Array<[SceneId, RegExp]> = [
  ["clinic", /\b(dent(al|ist)|orthodon|teeth|tooth|smile|hygien)/],
  ["care", /\b(care (home|agency|worker)|in-home|carer|elder|older adult|nursing|home care|dementia|hospice|wellbeing visit)/],
  ["interior", /\b(interior|furnitur|renovat|decor|home staging|upholster|kitchen design|architect|joiner|carpent)/],
  ["marine", /\b(marina|boat|sail|yacht|harbou?r|coast|ferry|fishing|surf|dive|diving|kayak)/],
  ["food", /\b(bakery|bread|sourdough|pastr|cafe|café|coffee|roast|restaurant|catering|kitchen|chocolate|brewer|deli|grocer|farm shop)/],
  ["books", /\b(book(shop|store|seller)|library|publisher|reading|literary)/],
  ["craft", /\b(weav|loom|knit|ceramic|pottery|craft|textile|yarn|sewing|workshop class)/],
  ["law", /\b(law( |yer|firm)|solicitor|attorney|legal|barrister|tribunal|notary|conveyanc)/],
  ["solar", /\b(solar|photovoltaic|renewable|heat pump|insulation|roofing|energy (supplier|saving))/],
  ["climb", /\b(climb|boulder|gym|fitness|yoga|pilates|martial|crossfit|trampolin)/],
  ["field", /\b(satellite|crop|agri|farm(ing|er)?|harvest|vineyard|irrigation|soil)/],
];

export function pickScene(text: string): SceneId | null {
  const t = text.toLowerCase();
  let best: { id: SceneId; at: number } | null = null;
  for (const [id, re] of ROUTES) { const m = re.exec(t); if (m && (!best || m.index < best.at)) best = { id, at: m.index }; }
  return best?.id ?? null;
}

export const SCENE_IDS = Object.keys(SCENES) as SceneId[];
/** The scene artwork as an SVG fragment in a 400x320 viewBox. */
export function sceneSvg(id: SceneId): string { return (SCENES[id] ?? SCENES.interior)(); }
export const sceneMarkup = (id: SceneId) => `<svg class="scene__art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${sceneSvg(id)}</svg>`;
