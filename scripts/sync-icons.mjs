// Indexes icon *names* from public npm packages on jsDelivr (no SVG content stored).
import { writeFileSync } from "node:fs";
const SETS = {
  lucide: { pkg: "lucide-static", dir: "/icons/", license: "ISC", ext: ".svg" },
  tabler: { pkg: "@tabler/icons@3", dir: "/icons/outline/", license: "MIT", ext: ".svg" },
  heroicons: { pkg: "heroicons@2", dir: "/24/outline/", license: "MIT", ext: ".svg" },
  phosphor: { pkg: "@phosphor-icons/core@2", dir: "/assets/regular/", license: "MIT", ext: ".svg" },
};
const out = {};
for (const [id, s] of Object.entries(SETS)) {
  const m = s.pkg.match(/^(@?[^@]+)(?:@(\d+))?$/); const name = m[1], major = m[2];
  const meta = await (await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}`, { signal: AbortSignal.timeout(60000) })).json();
  const versions = Object.keys(meta.versions).filter((v) => !v.includes("-") && (!major || v.startsWith(major + ".")));
  versions.sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
  const ver = `${name}@${versions.at(-1)}`; out[id + "_version"] = ver;
  const r = await fetch(`https://data.jsdelivr.com/v1/package/npm/${ver}/flat`, { signal: AbortSignal.timeout(60000) });
  const j = await r.json();
  const names = j.files.map((f) => f.name).filter((n) => n.startsWith(s.dir) && n.endsWith(s.ext) && !n.includes("-fill") && !n.includes("-bold") && !n.includes("-thin") && !n.includes("-light") && !n.includes("-duotone")).map((n) => n.slice(s.dir.length, -s.ext.length)).filter((n) => !n.includes("/"));
  out[id] = { pkg: s.pkg, dir: s.dir, license: s.license, names: [...new Set(names)].sort() };
  console.log(id, out[id].names.length, "icons", ver);
}
writeFileSync(new URL("../packages/core/src/assets/icons-index.json", import.meta.url), JSON.stringify(out));
