# Security

## Threat model
The MCP server executes on a developer machine on behalf of an agent; the editor shows generated (trusted) or localhost (user-owned) pages to a human.

| Surface | Controls |
|---|---|
| Filesystem | Every tool path is resolved against `--workdir`; `..` escapes are rejected (tested) |
| MCP over HTTP | Mandatory bearer token (constant-time compare), Host allow-list, loopback bind by default |
| Editor | 192-bit session token → HttpOnly SameSite=Strict cookie, Host allow-list, same-origin Origin check + JSON-only mutations, CSP on the shell, `nosniff`, no-referrer, 64 KB body cap, per-session rate limit, 8 h expiry, token never persisted |
| Proxying a dev server | Loopback targets only unless `allowRemoteTargets` (SSRF) |
| Persisted tweaks | Property allow-list + value character allow-list; `url()`, `expression`, `@import`, `javascript:` rejected (tested) |
| Generated HTML | All copy is HTML-escaped (tested); no inline event handlers |
| Third-party code | Never executed or vendored by the server; registry source is returned as text |

**Out of scope / known limits:** the preview iframe is same-origin with the editor shell (needed for the bridge), so only review *trusted* pages. Review sessions are not designed for multi-tenant hosting.

Report vulnerabilities privately via GitHub security advisories on `amitamit10/openui-engine`.
