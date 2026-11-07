// Regenerates examples/saas-landing with the engine (same API the MCP tools call).
import { generateTokens, defaultPageSpec, saveProject } from "../packages/core/dist/index.js";
const brief = { name: "Lumen", tagline: "Turn raw events into *decisions* your whole team trusts", description: "Lumen unifies your product data, automates the busywork and shows every team exactly what changed and why." };
const tokens = generateTokens({ name: brief.name, description: "AI analytics platform, dark modern premium", category: "ai-product" });
const spec = defaultPageSpec(brief, tokens);
const r = saveProject({ dir: new URL("../examples/saas-landing", import.meta.url).pathname, tokens, spec, overrides: {} });
console.log("example written:", tokens.meta.style, r.files.length, "files");
