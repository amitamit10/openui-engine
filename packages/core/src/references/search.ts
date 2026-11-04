import { PATTERNS, type PatternRef } from "./patterns.js";
import { SOURCES, type SourceRecord } from "./sources.js";
import type { SiteCategory, StyleId } from "../design/types.js";

export interface RefQuery { category?: SiteCategory; style?: StyleId; slot?: string; intent?: string; limit?: number }

export function searchPatterns(q: RefQuery): Array<PatternRef & { score: number }> {
  const intent = (q.intent ?? "").toLowerCase().split(/[\s,]+/).filter(Boolean);
  return PATTERNS.map((p) => {
    let score = 0;
    if (q.category && p.categories.includes(q.category)) score += 3;
    if (q.style && p.styles.includes(q.style)) score += 3;
    if (q.slot && p.slot === q.slot) score += 4;
    for (const w of intent) if (p.intent.some((i) => i.includes(w)) || p.name.toLowerCase().includes(w) || p.principles.some((x) => x.toLowerCase().includes(w))) score += 2;
    return { ...p, score };
  }).filter((p) => p.score > 0 || (!q.category && !q.style && !q.slot && !q.intent))
    .sort((a, b) => b.score - a.score).slice(0, q.limit ?? 5);
}

export function getSources(filter?: { role?: SourceRecord["role"]; access?: SourceRecord["access"] }): SourceRecord[] {
  return SOURCES.filter((s) => (!filter?.role || s.role === filter.role) && (!filter?.access || s.access === filter.access));
}
