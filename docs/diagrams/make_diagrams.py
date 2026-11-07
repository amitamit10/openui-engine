#!/usr/bin/env python3
"""Generates the two architecture diagram drafts from the stack-diagram skill's template.

Layout follows the skill's geometry rules (node box 132x100, tile 60x60, edges anchored to tile sides or
box bottoms). Usage: python3 make_diagrams.py <template.html> <out-dir>
The drafts are then built with the skill's scripts/build.py and rendered with scripts/render_png.py (see README).
"""
import re, sys, pathlib

tpl = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

def node(cx, top, icon, name, role, tile=""):
    return (f'<div class="node" style="left:{cx-66}px;top:{top}px"><div class="tile {tile}"><img src="%%ICON_{icon}%%" alt=""></div>'
            f'<div class="name"><span>{name}</span></div><div class="role"><span>{role}</span></div></div>')

def group(cls, l, t, w, h, label, icon=None, dark=None):
    ic = ""
    if icon and dark: ic = f'<img class="lt" src="%%ICON_{icon}%%" alt=""><img class="dk" src="%%ICON_{dark}%%" alt="">'
    elif icon: ic = f'<img src="%%ICON_{icon}%%" alt="">'
    return f'<div class="group {cls}" style="left:{l}px;top:{t}px;width:{w}px;height:{h}px;"><div class="g-label">{ic}{label}</div></div>'

def build(name, kicker, title, lede, height, groups, edges, nodes, foot):
    t = tpl
    t = t.replace('<!-- KICKER: e.g. stack-diagram / author / 2026-08 -->', kicker)
    t = t.replace('<!-- TITLE -->', title)
    t = t.replace('<!-- LEDE: 1-2 short sentences, or delete this <p> -->', lede)
    t = re.sub(r'height:\s*540px', f'height:{height}px', t)  # .canvas and svg.edges
    s = t.index('<!-- GROUPS'); e = t.index('</div>\n  </div>\n\n  <div class="legend">')
    svg = ('<svg class="edges" viewBox="0 0 1000 %d" aria-hidden="true"><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>%s</svg>' % (height, "".join(edges)))
    t = t[:s] + "\n".join(groups) + "\n" + svg + "\n" + "\n".join(nodes) + "\n" + t[e:]
    t = t.replace('<!-- FOOT-LEFT: author / one-liner -->', foot[0])
    t = re.sub(r'<!-- FOOT-RIGHT:.*?-->', foot[1], t, flags=re.S)
    t = t.replace('<span class="sw n dash"></span>dev / deploy', '<span class="sw n dash"></span>build / deploy')
    (out / f"{name}.html").write_text(t)

E  = lambda d, **k: f'<path class="e" d="{d}" marker-end="url(#ar)"/>'
N  = lambda d: f'<path class="n" d="{d}" marker-end="url(#ar)"/>'
D  = lambda d: f'<path class="n dash" d="{d}" marker-end="url(#ar)"/>'
T  = lambda x, y, s, a=False, anchor="middle": f'<text class="el{" a" if a else ""}" x="{x}" y="{y}" text-anchor="{anchor}">{s}</text>'

FOOT = ("OpenUI Engine · Amit Elgabsi · Apache-2.0", "icons: svgl / Lucide / Devicon")

# ── 1. system architecture ──────────────────────────────────────────────────────────────
build("architecture",
  "openui-engine / architecture", "OpenUI Engine — system architecture",
  "A coding agent calls MCP tools; the engine retrieves components, applies a design system, renders a real site, verifies it in Chromium and takes human feedback back through the editor.",
  680,
  [group("ga", 200, 60, 740, 400, "OpenUI Engine (TypeScript monorepo)", "mcp")],
  [
    E("M134 160 H436"), T(285, 152, "MCP tools", True),
    N("M470 236 V262"), N("M290 262 H830"),            # bus
    N("M290 262 V286"), N("M470 262 V286"), N("M650 262 V286"), N("M830 262 V286"),
    N("M796 160 H504"), T(650, 152, "feedback queue"),
    E("M650 396 V516"), T(662, 462, "git push", False, "start"),
    D("M684 550 H796"), T(740, 542, "deploy"),
  ],
  [
    node(100, 130, "agent", "Coding agent", "Claude Code · Codex"),
    node(470, 130, "mcp", "MCP server", "stdio · HTTP", "dark"),
    node(830, 130, "editor", "Visual editor", "select · tweak"),
    node(290, 290, "registry", "Component registry", "sections + shadcn"),
    node(470, 290, "brain", "Design intelligence", "styles · tokens"),
    node(650, 290, "files", "Project files", "DESIGN.md · dist/"),
    node(830, 290, "playwright", "Browser QA", "Playwright · axe"),
    node(650, 520, "github", "GitHub", "source of truth"),
    node(830, 520, "vercel", "Vercel", "static deploy", "dark"),
  ], FOOT)

# ── 2. quality loop ──────────────────────────────────────────────────────────────────────
build("quality-loop",
  "openui-engine / loop", "Generate → Render → Inspect → Correct → Verify",
  "Every page passes a real-browser gate before a human sees it; human tweaks are persisted as id-keyed CSS overrides, not pasted styles.",
  560,
  [group("gb", 200, 60, 740, 220, "Agent loop (MCP tools)", "mcp")],
  [
    E("M134 160 H256"), T(195, 152, "brief", True),
    E("M324 160 H436"), T(380, 152, "tokens", True),
    E("M504 160 H616"), T(560, 152, "dist/", True),
    E("M684 160 H796"), T(740, 152, "shots", True),
    N("M830 236 V346"), T(842, 296, "fail → fix", False, "start"),
    N("M796 380 H684"), T(740, 372, "pass"),
    N("M616 380 H504"), T(560, 372, "apply"),
    D("M436 380 H324"), T(352, 372, "git push"),
    N("M830 456 V525 H380 V168"), T(605, 517, "fix with sectionProps / tokens, re-render"),
  ],
  [
    node(100, 130, "agent", "Brief", "name · audience"),
    node(290, 130, "design", "Design system", "generate_design_system"),
    node(470, 130, "files", "Compose", "compose_page"),
    node(650, 130, "chromium", "Render", "real Chromium"),
    node(830, 130, "shield", "Inspect", "validate · analyze"),
    node(830, 350, "mcp", "Correct", "props · tokens", "dark"),
    node(650, 350, "editor", "Human review", "comments · tweaks"),
    node(470, 350, "files", "Persist", "overrides.json"),
    node(290, 350, "vercel", "Deploy", "Vercel static", "dark"),
  ], FOOT)
print("drafts written to", out)
