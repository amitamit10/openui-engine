import type { ComponentMeta } from "./types.js";

export interface LiveItem {
  name: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{ path: string; chars: number; content?: string }>;
  install: string;
  license: ComponentMeta["license"];
}

const cache = new Map<string, { at: number; value: LiveItem }>();

/**
 * Fetch a third-party registry item on demand. Source is returned to the caller
 * (to be installed into *their* project) and is never vendored into this repo.
 */
export async function fetchLiveItem(c: ComponentMeta, opts: { includeSource?: boolean; maxChars?: number; timeoutMs?: number } = {}): Promise<LiveItem> {
  if (!c.registry) throw new Error(`${c.id} is not a registry component`);
  const url = `${c.registry.baseUrl}${c.registry.item}.json`;
  const key = `${url}|${opts.includeSource ? 1 : 0}|${opts.maxChars ?? 0}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.value;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Registry responded ${res.status} for ${url}`);
    const j = (await res.json()) as any;
    const max = opts.maxChars ?? 6000;
    const value: LiveItem = {
      name: j.name ?? c.registry.item,
      dependencies: j.dependencies ?? [],
      registryDependencies: j.registryDependencies ?? [],
      files: (j.files ?? []).map((x: any) => ({
        path: x.path ?? x.target ?? "unknown",
        chars: (x.content ?? "").length,
        ...(opts.includeSource ? { content: String(x.content ?? "").slice(0, max) + ((x.content ?? "").length > max ? `\n/* …truncated ${(x.content ?? "").length - max} chars; run the install command for the full file */` : "") } : {}),
      })),
      install: c.registry.install,
      license: c.license,
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}
