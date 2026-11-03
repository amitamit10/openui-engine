import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import type { ServerContext } from "./context.js";

export const SERVER_INFO = { name: "openui-engine", version: "0.5.1" };

export const INSTRUCTIONS = `FASTEST PATH FOR ANY WEBSITE: brief_template → rewrite every field with specific copy for the real product (real data inside the visuals) → build_site (one call; it plans, renders, lints copy, runs the browser QA + anti-slop gate and returns screenshots) → fix what it reports with build_site with a patch → done.\n\nMAKE IT LOOK PROFESSIONAL, NOT TEMPLATED (this is what separates good from generic): (1) Open the screenshots build_site returns and LOOK at them, at desktop and mobile. (2) Read design_review in the result: it lists art-direction problems (flat hero, repeated visuals, thin rhythm) with a concrete brief patch for each; apply the high ones, rebuild, look again. (3) Hero: software/data/API products show the product (heroVisual kind "ui", 5-8 specific blocks); every other kind of business (services, retail, care, food, craft, clinics, interiors, law, energy...) should OMIT heroVisual so the engine draws an illustrated domain scene; either way add heroFloats (2 specific stat chips). (4) Give EVERY feature a specific title, a body with a real number or detail, an icon (lucide:<name>; use search_icons) and 1-2 short bullets: the bullets become floating pills on that feature's generated illustration. Put a data visual (table, chart, kanban, timeline, chat, checklist) on your 2 strongest features. (5) Write a headline of 5-10 words with one *emphasised phrase*. (6) Let the engine pick the art direction from your tone words unless you have a reason; read inspiration in the result for composition principles. Never leave placeholder text, "What it does", or invented badge numbers.\n\nOpenUI Engine gives you curated components, design systems and automated visual QA so you do not have to invent UI from scratch.
Recommended loop: generate_design_system → suggest_layout → compose_page (rewrite copy via sectionProps) → validate_design → capture_preview (LOOK at it) → analyze_visual_quality → fix → repeat; then create_review_session for human feedback (get_visual_feedback / apply_visual_tweaks).
Use discover_components (short ranked lists) before get_component; fetch source only when needed. Never hand-write CSS literals: change tokens or sectionProps so the design stays consistent.`;

export function createMcpServer(ctx: ServerContext): McpServer {
  const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS });
  registerTools(server, ctx);
  return server;
}
