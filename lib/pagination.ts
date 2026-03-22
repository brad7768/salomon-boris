/**
 * lib/pagination.ts — Content pagination utilities.
 *
 * Single source of truth for pagination logic: slicing arrays, building
 * page URLs, and computing the page-number range for the UI.
 *
 * Consumed by lib/getContent.ts (re-exported for backward compat) and
 * directly by page components and the Pagination UI component.
 */

import type { PaginationMeta, PaginatedContent } from "@/lib/types";
import { ITEMS_PER_PAGE }                        from "@/lib/config";

// ─── Constants ────────────────────────────────────────────────────────────────

export { ITEMS_PER_PAGE };

/** Hard upper bound on perPage to prevent accidental huge slices. */
const MAX_PAGE_SIZE = 100;

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Slice `items` to the requested page and return the slice + metadata.
 *
 * - Page is automatically clamped between 1 and totalPages.
 * - perPage is clamped between 1 and MAX_PAGE_SIZE.
 *
 * @param items   - Full sorted + filtered array.
 * @param page    - 1-based page number.
 * @param perPage - Items per page (defaults to ITEMS_PER_PAGE from config).
 */
export function paginateContent<T>(
  items:   T[],
  page:    number = 1,
  perPage: number = ITEMS_PER_PAGE
): PaginatedContent<T> {
  const safePer     = Math.min(Math.max(1, perPage), MAX_PAGE_SIZE);
  const totalItems  = items.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / safePer));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start       = (currentPage - 1) * safePer;
  const end         = Math.min(start + safePer, totalItems);

  return {
    items: items.slice(start, end),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: safePer,
      hasNextPage:  currentPage < totalPages,
      hasPrevPage:  currentPage > 1,
    },
  };
}

// ─── URL builder ──────────────────────────────────────────────────────────────

/**
 * Build a URL targeting a specific page while preserving other search params.
 *
 * The `page` param is always appended last so it's easy to read in the URL bar.
 * When page === 1 the `page` param is omitted (cleaner canonical URLs).
 *
 * @example
 * buildPageUrl("/methodes", 1, { style: "blues" })
 * → "/methodes?style=blues"
 *
 * buildPageUrl("/methodes", 3, { style: "blues", tri: "popularite" })
 * → "/methodes?style=blues&tri=popularite&page=3"
 */
export function buildPageUrl(
  basePath:     string,
  page:         number,
  searchParams: Record<string, string> = {}
): string {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// ─── Page range ───────────────────────────────────────────────────────────────

/**
 * Compute the array of page numbers (and `"..."` ellipsis markers) to render.
 *
 * The first and last pages are always shown. Middle pages are controlled
 * by `siblingCount` (how many pages to show on each side of the current page).
 *
 * Examples (siblingCount = 1):
 *   Page 1  of 10 → [1, 2, "...", 10]
 *   Page 5  of 10 → [1, "...", 4, 5, 6, "...", 10]
 *   Page 10 of 10 → [1, "...", 9, 10]
 *   Total ≤ 7    → [1, 2, 3, 4, 5, 6, 7]  (no ellipsis)
 *
 * @param currentPage   - Active 1-based page number.
 * @param totalPages    - Total number of pages.
 * @param siblingCount  - Pages to show on each side of current (default 1).
 */
export function getPageRange(
  currentPage:  number,
  totalPages:   number,
  siblingCount: number = 1
): Array<number | "..."> {
  if (totalPages <= 1) return [];

  // When the total is small enough, show every page without ellipsis
  const maxWithoutEllipsis = 2 * siblingCount + 5; // 1 + siblings + current + siblings + last
  if (totalPages <= maxWithoutEllipsis) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: Array<number | "..."> = [];
  const left  = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  range.push(1);

  if (left > 2) range.push("...");

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) range.push("...");

  range.push(totalPages);

  return range;
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

/**
 * Safely parse a `page` query-string value into a positive integer.
 *
 * @example
 * parsePage(undefined) → 1
 * parsePage("abc")     → 1
 * parsePage("0")       → 1
 * parsePage("3")       → 3
 */
export function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

// ─── Display helper ───────────────────────────────────────────────────────────

/**
 * Build the "Résultats X–Y sur Z" label for the pagination info bar.
 *
 * @example
 * getResultsLabel({ currentPage: 2, itemsPerPage: 9, totalItems: 25 })
 * → "Résultats 10–18 sur 25"
 */
export function getResultsLabel(meta: PaginationMeta): string {
  const { currentPage, itemsPerPage, totalItems } = meta;
  const first = (currentPage - 1) * itemsPerPage + 1;
  const last  = Math.min(currentPage * itemsPerPage, totalItems);
  return `Résultats ${first}–${last} sur ${totalItems}`;
}
