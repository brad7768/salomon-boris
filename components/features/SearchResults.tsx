"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchSearchIndex, searchContent } from "@/lib/search";
import type { SearchResult } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/config";

const CATEGORY_HREFS: Record<string, string> = {
  methodes: "/methodes",
  cours: "/cours",
  tablatures: "/tablatures",
  blog: "/blog",
};

interface SearchResultsProps {
  query: string;
  category?: string;
  niveau?: string;
}

export function SearchResults({ query, category, niveau }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexReady, setIndexReady] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);

  // Charge l'index une seule fois
  useEffect(() => {
    fetchSearchIndex().then((idx) => {
      setSearchIndex(idx);
      setIndexReady(true);
    });
  }, []);

  const runSearch = useCallback(() => {
    if (!indexReady) return;
    setLoading(true);
    const res = searchContent(searchIndex, {
      query,
      category: category || undefined,
      niveau: niveau || undefined,
    });
    setResults(res);
    setLoading(false);
  }, [query, category, niveau, indexReady, searchIndex]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <span className="text-4xl block mb-3">🔍</span>
        <p className="text-lg">Tapez votre recherche ci-dessus</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-lg font-medium text-text">Aucun résultat pour &ldquo;{query}&rdquo;</p>
        <p className="text-sm mt-1">Essayez avec d&apos;autres mots-clés</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-text-secondary mb-6">
        {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
        <strong className="text-text">&ldquo;{query}&rdquo;</strong>
      </p>
      <div className="space-y-3">
        {results.map((result) => {
          const href = `${CATEGORY_HREFS[result.category]}/${result.slug}`;
          return (
            <Link
              key={result.id ?? `${result.category}/${result.slug}`}
              href={href}
              className="block bg-white border border-background-neutral rounded-xl p-5 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant="primary">
                      {CATEGORY_LABELS[result.category]}
                    </Badge>
                    {result.niveau && (
                      <Badge niveau={result.niveau} />
                    )}
                  </div>
                  <h3 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                    {result.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                    {result.excerpt}
                  </p>
                  <span className="text-xs text-text-secondary mt-1.5 block">
                    {formatDate(result.date)}
                  </span>
                </div>
                <span className="shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
