"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { fetchSearchIndex, searchContent } from "@/lib/search";
import { cn, formatDate, truncate } from "@/lib/utils";
import { CATEGORY_LABELS, NIVEAU_LABELS } from "@/lib/config";
import type { SearchResult, ContentCategory } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_HREFS: Record<ContentCategory, string> = {
  methodes:   "/methodes",
  cours:      "/cours",
  tablatures: "/tablatures",
  blog:       "/blog",
};

const CATEGORY_ORDER: ContentCategory[] = ["methodes", "cours", "tablatures", "blog"];

const MAX_RESULTS = 10;

type GroupedResults = Partial<Record<ContentCategory, SearchResult[]>>;

function groupByCategory(results: SearchResult[]): GroupedResults {
  const grouped: GroupedResults = {};
  for (const result of results) {
    if (!grouped[result.category]) grouped[result.category] = [];
    grouped[result.category]!.push(result);
  }
  return grouped;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GlobalSearchProps {
  open:    boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query,      setQuery]     = useState("");
  const [results,    setResults]   = useState<SearchResult[]>([]);
  const [index,      setIndex]     = useState<SearchResult[]>([]);
  const [indexReady, setReady]     = useState(false);
  const [activeIdx,  setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();

  // Close + reset on navigation
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIdx(-1);
    }
  }, [open]);

  // Lazy-load index on first open
  useEffect(() => {
    if (open && !indexReady) {
      fetchSearchIndex().then((idx) => {
        setIndex(idx);
        setReady(true);
      });
    }
  }, [open, indexReady]);

  // Auto-focus input
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Live search
  useEffect(() => {
    if (!query.trim() || !indexReady) {
      setResults([]);
      setActiveIdx(-1);
      return;
    }
    const res = searchContent(index, { query, limit: MAX_RESULTS });
    setResults(res);
    setActiveIdx(-1);
  }, [query, index, indexReady]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;

        case "ArrowDown":
          e.preventDefault();
          setActiveIdx((i) => {
            const next = Math.min(i + 1, results.length - 1);
            scrollActiveIntoView(listRef.current, next);
            return next;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIdx((i) => {
            const prev = Math.max(i - 1, -1);
            scrollActiveIntoView(listRef.current, prev);
            return prev;
          });
          break;

        case "Enter":
          e.preventDefault();
          if (activeIdx >= 0 && results[activeIdx]) {
            const r = results[activeIdx];
            router.push(`${CATEGORY_HREFS[r.category]}/${r.slug}`);
            onClose();
          } else if (query.trim()) {
            router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
            onClose();
          }
          break;
      }
    },
    [results, activeIdx, query, onClose, router]
  );

  if (!open) return null;

  const grouped     = groupByCategory(results);
  const hasResults  = results.length > 0;
  const showResults = query.trim().length > 0;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[#22223B]/50 backdrop-blur-sm"
      />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche globale"
        className="fixed top-[14vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <div className="bg-white rounded-2xl shadow-[0_32px_80px_rgba(3,4,94,0.22)] overflow-hidden border border-background-neutral/60">

          {/* ── Input row ── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-background-neutral">
            <SearchIcon className="shrink-0 text-text-secondary" />

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher méthodes, cours, tablatures, articles…"
              className="flex-1 bg-transparent outline-none text-text placeholder:text-text-secondary text-[0.95rem] min-w-0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={hasResults}
            />

            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-text-secondary hover:text-text hover:bg-background-neutral transition-colors"
                aria-label="Effacer"
              >
                <XSmallIcon />
              </button>
            ) : (
              <kbd className="shrink-0 hidden sm:inline-flex items-center text-[11px] font-mono text-text-secondary bg-background-neutral border border-background-neutral/80 rounded px-1.5 py-0.5">
                Esc
              </kbd>
            )}
          </div>

          {/* ── Results area ── */}
          <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain">
            {!indexReady && showResults ? (
              <IndexLoading />
            ) : !showResults ? (
              <QuickLinks onClose={onClose} />
            ) : !hasResults ? (
              <NoResults query={query} />
            ) : (
              <ResultsList
                grouped={grouped}
                results={results}
                activeIdx={activeIdx}
                onHover={setActiveIdx}
                onSelect={onClose}
              />
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-background-neutral bg-background-neutral/40">
            {hasResults && query ? (
              <Link
                href={`/recherche?q=${encodeURIComponent(query.trim())}`}
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline underline-offset-2 transition-colors"
              >
                Voir tous les résultats
                <ArrowRightIcon />
              </Link>
            ) : (
              <span className="text-xs text-text-secondary">
                {hasResults
                  ? `${results.length} résultat${results.length > 1 ? "s" : ""}`
                  : "Commencez à taper…"}
              </span>
            )}

            {/* Keyboard hints */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-secondary">
              <Key>↑↓</Key> naviguer
              <Key>↵</Key> ouvrir
              <Key>Esc</Key> fermer
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Quick links (empty state) ────────────────────────────────────────────────

const QUICK_LINKS: { label: string; href: string; category: ContentCategory; description: string }[] = [
  { label: "Méthodes",   href: "/methodes",   category: "methodes",   description: "Programmes complets" },
  { label: "Cours",      href: "/cours",       category: "cours",      description: "Leçons vidéo" },
  { label: "Tablatures", href: "/tablatures",  category: "tablatures", description: "Partitions & tabs" },
  { label: "Blog",       href: "/blog",        category: "blog",       description: "Articles & conseils" },
];

function QuickLinks({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary px-3 pb-2.5 pt-1">
        Explorer
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background-neutral transition-colors group"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CategoryIcon category={link.category} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-text group-hover:text-primary transition-colors leading-tight">
                {link.label}
              </p>
              <p className="text-[11px] text-text-secondary leading-tight">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── No results ───────────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-14 px-6 space-y-2">
      <p className="font-semibold text-text">
        Aucun résultat pour &ldquo;{query}&rdquo;
      </p>
      <p className="text-sm text-text-secondary">
        Essayez avec d&apos;autres mots-clés ou consultez nos méthodes.
      </p>
    </div>
  );
}

// ─── Index loading spinner ────────────────────────────────────────────────────

function IndexLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// ─── Results list (grouped by category) ──────────────────────────────────────

interface ResultsListProps {
  grouped:   GroupedResults;
  results:   SearchResult[];
  activeIdx: number;
  onHover:   (idx: number) => void;
  onSelect:  () => void;
}

function ResultsList({ grouped, results, activeIdx, onHover, onSelect }: ResultsListProps) {
  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div className="p-3 space-y-3">
      {orderedCategories.map((category) => {
        const items = grouped[category]!;
        return (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-2 px-3 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="text-[10px] text-text-secondary bg-background-neutral rounded-full px-1.5 py-0.5">
                {items.length}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {items.map((item) => {
                const flatIdx = results.findIndex(
                  (r) => r.slug === item.slug && r.category === item.category
                );
                const isActive = flatIdx === activeIdx;
                const href = `${CATEGORY_HREFS[item.category]}/${item.slug}`;

                return (
                  <Link
                    key={item.id ?? `${item.category}/${item.slug}`}
                    href={href}
                    onClick={onSelect}
                    onMouseEnter={() => onHover(flatIdx)}
                    data-result-idx={flatIdx}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
                      isActive ? "bg-primary/8" : "hover:bg-background-neutral"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 transition-colors",
                        isActive ? "bg-primary/15 text-primary" : "bg-background-neutral text-text-secondary"
                      )}
                    >
                      <CategoryIcon category={item.category} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-semibold text-sm leading-snug truncate transition-colors",
                          isActive ? "text-primary" : "text-text"
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {truncate(item.excerpt, 90)}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="shrink-0 flex flex-col items-end gap-1 pl-2">
                      {item.niveau && (
                        <span className="text-[10px] text-text-secondary whitespace-nowrap">
                          {NIVEAU_LABELS[item.niveau]}
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function scrollActiveIntoView(container: HTMLElement | null, idx: number) {
  if (!container) return;
  const el = container.querySelector<HTMLElement>(`[data-result-idx="${idx}"]`);
  el?.scrollIntoView({ block: "nearest" });
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 bg-white border border-background-neutral rounded text-[10px] font-mono text-text-secondary">
      {children}
    </kbd>
  );
}

function CategoryIcon({ category }: { category: ContentCategory }) {
  switch (category) {
    case "methodes":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "cours":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "tablatures":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "blog":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
  }
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
