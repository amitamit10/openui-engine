// Generates docs/SOURCES.md and docs/COMPONENTS.md from the registry data so documentation cannot drift from code.
import { writeFileSync } from "node:fs";
import { SOURCES, AUDIT_DATE, ALL_COMPONENTS, STYLES, PATTERNS } from "../packages/core/dist/index.js";

const esc = (s) => String(s).replace(/\|/g, "\\|");
let md = `# Design & component source audit\n\n> Generated from \`packages/core/src/references/sources.ts\` — status reflects what an HTTP probe from the build sandbox actually returned on **${AUDIT_DATE}**. Nothing here is assumed; blocked or paid sources are recorded as such.\n\n`;
md += `| Source | Role | HTTP | Access | Integration | Licence / terms |\n|---|---|---|---|---|---|\n`;
for (const s of SOURCES) md += `| [${s.name}](${s.url}) | ${s.role} | ${s.httpStatus} | ${s.access} | ${s.integration} | ${esc(s.license)} |\n`;
md += `\n## Notes per source\n\n`;
for (const s of SOURCES) md += `- **${s.name}** — ${s.notes}\n`;
md += `\n## Integration policy\n\n- **live-registry**: metadata is curated in this repo; *source code is fetched on demand from the project's own registry* by \`get_component\` and installed into the user's project. Nothing third-party is vendored here.\n- **metadata-pointer**: we link to the gallery for human browsing. No pages are scraped, no thumbnails are cached, no markup is reproduced.\n- **pattern-knowledge-only / excluded**: used as inspiration or not at all (see notes).\n- Patterns in \`search_design_references\` are *original* descriptions of composition principles.\n`;
writeFileSync(new URL("../docs/SOURCES.md", import.meta.url), md);

let c = `# Component inventory\n\n> Generated from \`packages/core/src/registry/components.ts\`. ${ALL_COMPONENTS.length} curated entries (quality over registry size — the MCP never returns the whole list).\n\n`;
c += `| ID | Slot | Source | Framework | Runtimes | Motion | Styles | Licence |\n|---|---|---|---|---|---|---|---|\n`;
for (const k of ALL_COMPONENTS) c += `| \`${k.id}\` | ${k.slot} | ${k.source} | ${k.requires.framework} | ${k.requires.runtimes.join(", ")} | ${k.traits.energy}/3 | ${k.styles.length === 6 ? "all" : k.styles.join(", ")} | ${k.license.spdx}${k.license.verified ? "" : " (unverified)"} |\n`;
c += `\n## Art directions\n\n| Style | Mode | Motion budget | Categories | Signature |\n|---|---|---|---|---|\n`;
for (const s of Object.values(STYLES)) c += `| **${s.name}** (\`${s.id}\`) | ${s.mode} | ${s.maxMotion}/3 | ${s.categories.join(", ")} | ${esc(s.signatures[0])} |\n`;
c += `\n## Composition patterns\n\n${PATTERNS.map((p) => `- \`${p.id}\` — ${p.name} (${p.slot})`).join("\n")}\n`;
writeFileSync(new URL("../docs/COMPONENTS.md", import.meta.url), c);
console.log("docs written:", SOURCES.length, "sources,", ALL_COMPONENTS.length, "components");
