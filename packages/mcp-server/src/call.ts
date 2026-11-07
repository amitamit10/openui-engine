#!/usr/bin/env node
/**
 * Thin MCP *client*: spawns the OpenUI Engine server over stdio and invokes tools through the real protocol.
 *   openui-engine-call list
 *   openui-engine-call <tool> '<json args>'
 * Image results are written to disk and their paths printed (useful for agents that only have a shell).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const [, , cmd, argJson, ...rest] = process.argv;
if (!cmd || cmd === "--help") { console.error("usage: openui-engine-call list | <tool> '<json args>' [--workdir DIR]"); process.exit(cmd ? 0 : 1); }
const wi = rest.indexOf("--workdir");
const workdir = wi >= 0 ? rest[wi + 1]! : process.cwd();
const serverJs = join(dirname(fileURLToPath(import.meta.url)), "cli.js");

const transport = new StdioClientTransport({ command: process.execPath, args: [serverJs, "--workdir", workdir], stderr: "ignore", env: { ...process.env } as Record<string, string> });
const client = new Client({ name: "openui-engine-call", version: "0.6.0" });
await client.connect(transport);
try {
  if (cmd === "list") {
    const { tools } = await client.listTools();
    for (const t of tools) console.log(`${t.name} — ${(t.description ?? "").split(". ")[0]}`);
  } else {
    const res = await client.callTool({ name: cmd, arguments: argJson ? JSON.parse(argJson) : {} }, undefined, { timeout: 300_000 });
    const outDir = join(workdir, ".openui", "mcp-images"); let n = 0;
    for (const c of (res.content as any[]) ?? []) {
      if (c.type === "text") console.log(c.text);
      else if (c.type === "image") { mkdirSync(outDir, { recursive: true }); const p = join(outDir, `${Date.now()}-${n++}.jpg`); writeFileSync(p, Buffer.from(c.data, "base64")); console.log(`[image saved] ${p}`); }
    }
    if (res.isError) process.exitCode = 1;
  }
} finally { await client.close(); }
