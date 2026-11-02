# MCP setup

Build once (`pnpm install && pnpm build`), then point your client at `packages/mcp-server/dist/cli.js`.
Use an absolute path. `--workdir` is the root every tool path must stay inside (default: the client's cwd).

## Claude Code
```bash
claude mcp add openui-engine -- node /abs/path/openui-engine/packages/mcp-server/dist/cli.js --workdir "$PWD"
```
or project-level `.mcp.json`:
```json
{ "mcpServers": { "openui-engine": { "command": "node", "args": ["/abs/path/openui-engine/packages/mcp-server/dist/cli.js", "--workdir", "."] } } }
```

## Codex CLI (`~/.codex/config.toml`)
```toml
[mcp_servers.openui-engine]
command = "node"
args = ["/abs/path/openui-engine/packages/mcp-server/dist/cli.js", "--workdir", "/abs/path/to/your/project"]
```

## Cursor / Windsurf / VS Code (`mcp.json`)
```json
{ "mcpServers": { "openui-engine": { "command": "node", "args": ["/abs/path/openui-engine/packages/mcp-server/dist/cli.js"] } } }
```

## Agents without MCP support
`node packages/mcp-server/dist/call.js <tool> '<json>' --workdir DIR` speaks real MCP over stdio to a fresh server and prints results (images are saved to `.openui/mcp-images/`). One process per call, so editor sessions started this way end with the call — use a real MCP client for review sessions.

## Remote (Streamable HTTP)
```bash
OPENUI_MCP_TOKEN=$(openssl rand -base64 24) node packages/mcp-server/dist/cli.js --http --port 3333 --workdir /srv/projects
# client: POST http://host:3333/mcp  with  Authorization: Bearer $OPENUI_MCP_TOKEN
```
* A bearer token is mandatory (generated and printed if you do not supply one).
* Binds to `127.0.0.1`; to expose it use `--host 0.0.0.0 --allowed-host your.domain` **behind TLS** (reverse proxy / tunnel).
* The visual editor runs on its own port (`--editor-port`) and has its own per-session secret; tunnel it explicitly if reviewers are remote (`--editor-host 0.0.0.0 --allowed-host …`).

## Environment notes
* Chromium: auto-discovered in `PLAYWRIGHT_BROWSERS_PATH`, `/opt/pw-browsers`, `~/.cache/ms-playwright`, system paths; override with `OPENUI_CHROMIUM`. Install one with `npx playwright-core install chromium`.
* Live registry fetch (`get_component detail=source`) uses Node's `fetch`. Behind a proxy set `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21) and `NODE_EXTRA_CA_CERTS`. The `openui-engine-call` client forwards your environment to the server.

## Recommended agent prompt
> Use the openui-engine MCP. Call generate_design_system, then compose_page and rewrite all copy via sectionProps. Run validate_design and capture_preview and fix every error with tokens/sectionProps (no hand-written CSS literals). Finish with analyze_visual_quality and look at the screenshots.
