import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import type { ServerContext } from "./context.js";

export const SERVER_INFO = { name: "openui-engine", version: "0.2.1" };

export const INSTRUCTIONS = `FASTEST PATH FOR ANY WEBSITE: brief_template → rewrite every field with specific copy for the real product (real data inside the visuals) → build_site (one call; it plans, renders, lints copy, runs the browser QA + anti-slop gate and returns screenshots) → fix what it reports with build_site with a patch → done.\n\nOpenUI Engine gives you curated components, design systems and automated visual QA so you do not have to invent UI from scratch.
Recommended loop: generate_design_system → suggest_layout → compose_page (rewrite copy via sectionProps) → validate_design → capture_preview (LOOK at it) → analyze_visual_quality → fix → repeat; then create_review_session for human feedback (get_visual_feedback / apply_visual_tweaks).
Use discover_components (short ranked lists) before get_component; fetch source only when needed. Never hand-write CSS literals: change tokens or sectionProps so the design stays consistent.`;

export function createMcpServer(ctx: ServerContext): McpServer {
  const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS });
  registerTools(server, ctx);
  return server;
}
