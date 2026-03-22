"use client";

import { Suspense } from "react";
import { ContentCard } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import {
  StyleFilter,
  NiveauFilter,
  TagFilter,
  ActiveFilters,
} from "@/components/features/CategoryFilter";
import { SortControls } from "@/components/features/SortControls";
import type {
  ContentMeta,
  PaginationMeta,
  NiveauType,
  SortOption,
} from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryPageContentProps {
  items:           ContentMeta[];
  pagination:      PaginationMeta;
  totalCount:      number;

  /** Styles / genres disponibles dans cette catégorie */
  allStyles?:      string[];
  /** Compteur d'items par style, pour afficher "Blues (3)" */
  styleCounts?:    Record<string, number>;
  selectedStyle?:  string;
  showStyle?:      boolean;

  allTags:         string[];
  selectedTag?:    string;
  showTags?:       boolean;

  selectedNiveau?: NiveauType;
  showNiveau?:     boolean;

  currentSort?:    SortOption;
  currentOrder?:   "asc" | "desc";

  basePath:        string;
  searchParams:    Record<string, string>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryPageContent({
  items,
  pagination,
  totalCount,
  allStyles      = [],
  styleCounts    = {},
  selectedStyle,
  showStyle      = true,
  allTags,
  selectedTag,
  showTags       = true,
  selectedNiveau,
  showNiveau     = true,
  currentSort,
  currentOrder,
  basePath,
  searchParams,
}: CategoryPageContentProps) {
  const hasFilters = allStyles.length > 0 || allTags.length > 0 || showNiveau;

  return (
    <div className="py-8 md:py-12 space-y-8">

      {/* ── Filter panel ── */}
      {hasFilters && (
        <div className="bg-white rounded-2xl border border-background-neutral p-5 md:p-6 space-y-5 shadow-sm">

          {/* Sort + Active filters row */}
          <Suspense fallback={null}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SortControls currentSort={currentSort} currentOrder={currentOrder} />
              <ActiveFilters
                selectedStyle={selectedStyle}
                selectedNiveau={selectedNiveau}
                selectedTag={selectedTag}
                totalCount={totalCount}
                filteredCount={pagination.totalItems}
              />
            </div>
          </Suspense>

          <Suspense fallback={null}>
            <div className="space-y-4 pt-1 border-t border-background-neutral">
              {/* Genre / Style filter */}
              {showStyle && allStyles.length > 0 && (
                <StyleFilter
                  styles={allStyles}
                  counts={styleCounts}
                  selectedStyle={selectedStyle}
                />
              )}

              {/* Niveau filter */}
              {showNiveau && (
                <NiveauFilter selectedNiveau={selectedNiveau} />
              )}

              {/* Tag filter */}
              {showTags && allTags.length > 0 && (
                <TagFilter tags={allTags} selectedTag={selectedTag} />
              )}
            </div>
          </Suspense>
        </div>
      )}

      {/* ── Results grid ── */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ContentCard key={item.slug} item={item} showCategory={false} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        pagination={pagination}
        basePath={basePath}
        searchParams={searchParams}
      />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-background-neutral flex items-center justify-center">
        <GuitarIcon />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-text text-lg">Aucun contenu trouvé</p>
        <p className="text-sm text-text-secondary max-w-xs">
          Essayez de modifier ou supprimer certains filtres pour voir plus de résultats.
        </p>
      </div>
    </div>
  );
}

function GuitarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6C6C6C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
