// Indexes live shadcn-compatible registries into a compact JSON the MCP can search offline.
// Only metadata (name, short description, dependencies) is stored — never component source.
// usage: node scripts/sync-registries.mjs        (needs network; run occasionally, commit the result)
import { writeFileSync } from "node:fs";

const LIBS = [
  { id: "shadcn", name: "shadcn/ui", list: "https://ui.shadcn.com/r/index.json", item: (n) => `https://ui.shadcn.com/r/styles/new-york-v4/${n}.json` },
  { id: "magicui", name: "Magic UI", list: "https://magicui.design/r/registry.json", item: (n) => `https://magicui.design/r/${n}.json` },
  { id: "reactbits", name: "React Bits", list: "https://reactbits.dev/r/registry.json", item: (n) => `https://reactbits.dev/r/${n}.json` },
  { id: "aceternity", name: "Aceternity UI", list: "https://ui.aceternity.com/registry.json", item: (n) => `https://ui.aceternity.com/registry/${n}.json` },
  { id: "fluid", name: "Fluid Functionalism", list: "https://www.fluidfunctionalism.com/r/registry.json", item: (n) => `https://www.fluidfunctionalism.com/r/${n}.json` },
  { id: "kibo", name: "Kibo UI", list: "https://www.kibo-ui.com/r/registry.json", item: (n) => `https://www.kibo-ui.com/r/${n}.json` },
  { id: "cult", name: "Cult UI", list: "https://www.cult-ui.com/r/registry.json", item: (n) => `https://www.cult-ui.com/r/${n}.json` },
  { id: "motionprimitives", name: "Motion Primitives", list: "https://motion-primitives.com/c/registry.json", item: (n) => `https://motion-primitives.com/c/${n}.json` },
  { id: "animateui", name: "Animate UI", list: "https://animate-ui.com/r/registry.json", item: (n) => `https://animate-ui.com/r/${n}.json` },
  { id: "eldora", name: "Eldora UI", list: "https://www.eldoraui.site/r/registry.json", item: (n) => `https://www.eldoraui.site/r/${n}.json` },
  { id: "tripled", name: "TripleD UI", list: "https://ui.tripled.work/r/registry.json", item: (n) => `https://ui.tripled.work/r/${n}.json` },
];

const out = { generatedAt: new Date().toISOString().slice(0, 10), libs: {}, items: [] };
for (const lib of LIBS) {
  try {
    const res = await fetch(lib.list, { signal: AbortSignal.timeout(30000) });
    const j = await res.json();
    const items = (j.items ?? j).filter((i) => i && i.name && !["registry:theme", "registry:style", "registry:font"].includes(i.type));
    // verify the per-item URL pattern with one real fetch
    const probe = items.find((i) => i.name !== "index") ?? items[0];
    const pr = await fetch(lib.item(probe.name), { signal: AbortSignal.timeout(20000) });
    out.libs[lib.id] = { name: lib.name, count: items.length, itemUrl: lib.item("{name}"), probe: `${probe.name} → HTTP ${pr.status}`, ok: pr.ok };
    for (const i of items) {
      if (i.name === "index") continue;
      out.items.push({
        l: lib.id, n: i.name, t: (i.title ?? i.name).slice(0, 60), y: (i.type ?? "").replace("registry:", ""),
        d: String(i.description ?? "").replace(/\s+/g, " ").slice(0, 120),
        p: (i.dependencies ?? []).map((x) => String(x).replace(/@\^?[\d.]+.*$/, "")).slice(0, 5),
        c: (i.categories ?? []).slice(0, 3),
      });
    }
    console.log(lib.id.padEnd(17), String(items.length).padStart(5), out.libs[lib.id].probe);
  } catch (e) { console.log(lib.id, "FAILED", e.message); }
}
writeFileSync(new URL("../packages/core/src/registry/external-index.json", import.meta.url), JSON.stringify(out));
console.log("total items:", out.items.length);
