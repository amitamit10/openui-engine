#!/usr/bin/env node
import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createContext } from "./context.js";
import { createMcpServer } from "./server.js";

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const flag = (n: string) => process.argv.includes(`--${n}`);

if (flag("help") || flag("h")) {
  console.error(`openui-engine-mcp — MCP server for professional AI-generated UI

  stdio (default):   openui-engine-mcp [--workdir DIR] [--editor-port N]
  HTTP (remote):     openui-engine-mcp --http [--port 3333] [--host 127.0.0.1] [--token SECRET] [--workdir DIR] [--allowed-host example.com]

Options
  --workdir DIR        root all project paths must stay inside (default: cwd)
  --editor-port N      port for the visual editor (default: random)
  --http               serve MCP over Streamable HTTP at /mcp (bearer token required)
  --token SECRET       bearer token for --http (default: $OPENUI_MCP_TOKEN or generated)
  --allowed-host H     extra Host header accepted (use with tunnels / reverse proxies)`);
  process.exit(0);
}

const ctx = createContext({
  workdir: arg("workdir"),
  editor: { port: arg("editor-port") ? Number(arg("editor-port")) : undefined, host: arg("editor-host"), allowedHosts: arg("allowed-host") ? [arg("allowed-host")!] : undefined },
});

if (flag("http")) {
  const host = arg("host", "127.0.0.1")!; const port = Number(arg("port", "3333"));
  const token = arg("token") ?? process.env.OPENUI_MCP_TOKEN ?? randomBytes(24).toString("base64url");
  const allowedHosts = new Set(["localhost", "127.0.0.1", "[::1]", ...(arg("allowed-host") ? [arg("allowed-host")!] : [])]);
  const authOk = (h: string | undefined) => { const t = h?.startsWith("Bearer ") ? h.slice(7) : ""; const a = Buffer.from(t), b = Buffer.from(token); return a.length === b.length && timingSafeEqual(a, b); };
  const http = createServer(async (req, res) => {
    const reqHost = (req.headers.host ?? "").replace(/:\d+$/, "");
    if (!allowedHosts.has(reqHost)) { res.writeHead(421).end("Host not allowed"); return; }
    if (req.url === "/healthz") { res.writeHead(200, { "content-type": "application/json" }).end('{"ok":true}'); return; }
    if (!req.url?.startsWith("/mcp")) { res.writeHead(404).end("Not found"); return; }
    if (!authOk(req.headers.authorization)) { res.writeHead(401, { "www-authenticate": "Bearer" }).end("Unauthorized"); return; }
    // Stateless mode: one server + transport per request, shared context (editor sessions persist).
    const server = createMcpServer(ctx);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => { void transport.close(); void server.close(); });
    try { await server.connect(transport); await transport.handleRequest(req, res); }
    catch (e) { if (!res.headersSent) res.writeHead(500).end(String(e)); }
  });
  http.listen(port, host, () => {
    console.error(`OpenUI Engine MCP (Streamable HTTP) listening on http://${host}:${port}/mcp`);
    console.error(`Authorization: Bearer ${process.env.OPENUI_MCP_TOKEN || arg("token") ? "<your token>" : token}`);
    if (!["127.0.0.1", "localhost", "::1"].includes(host)) console.error("WARNING: bound beyond loopback — terminate TLS in front of this server.");
  });
} else {
  const server = createMcpServer(ctx);
  await server.connect(new StdioServerTransport());
  console.error(`OpenUI Engine MCP ready on stdio (workdir: ${ctx.workdir})`);
}
const shutdown = async () => { await ctx.closeAll(); process.exit(0); };
process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
