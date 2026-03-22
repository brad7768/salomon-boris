"use client";

import type { SearchResult } from "./types";

export interface SearchOptions {
  query:     string;
  category?: string;
  niveau?:   string;
  style?:    string;
  tags?:     string[];
  limit?:    number;
}

// ─── Normalizer (accent-insensitive, lowercase) ───────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ─── Scorer ───────────────────────────────────────────────────────────────────

function scoreResult(item: SearchResult, query: string): number {
  const q           = normalize(query);
  const titleNorm   = normalize(item.title);
  const excerptNorm = normalize(item.excerpt + " " + (item.description ?? ""));
  const tagsNorm    = item.tags.map(normalize).join(" ");
  const styleNorm   = normalize(item.style ?? "");

  let score = 0;

  // Exact / prefix title match — highest weight
  if (titleNorm === q)           score += 20;
  if (titleNorm.startsWith(q))  score += 8;
  if (titleNorm.includes(q))    score += 6;

  // Excerpt / description
  if (excerptNorm.includes(q))  score += 3;

  // Tags
  if (tagsNorm.includes(q))     score += 4;

  // Style / genre match
  if (styleNorm.includes(q))    score += 3;

  // Multi-word partial matching
  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length < 2) continue;
    if (titleNorm.includes(word))   score += 2;
    if (excerptNorm.includes(word)) score += 1;
    if (tagsNorm.includes(word))    score += 1;
  }

  return score;
}

// ─── Main search function ─────────────────────────────────────────────────────

export function searchContent(
  index:   SearchResult[],
  options: SearchOptions
): SearchResult[] {
  const { query, category, niveau, style, tags, limit = 20 } = options;

  // Pre-filter (no scoring needed)
  let results = index.filter((item) => {
    if (category && item.category !== category) return false;
    if (niveau   && item.niveau   !== niveau)   return false;
    if (style    && item.style    !== style)     return false;
    if (tags?.length && !tags.some((t) => item.tags.includes(t))) return false;
    return true;
  });

  // Score + rank when there's a query
  if (query.trim()) {
    results = results
      .map((item)  => ({ ...item, score: scoreResult(item, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return results.slice(0, limit);
}

// ─── Index fetcher ────────────────────────────────────────────────────────────

export async function fetchSearchIndex(): Promise<SearchResult[]> {
  try {
    const res = await fetch("/search-index.json", {
      next:  { revalidate: 3600 },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    return res.json() as Promise<SearchResult[]>;
  } catch {
    return [];
  }
}
