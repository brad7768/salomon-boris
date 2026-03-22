/**
 * lib/sort.ts — Content sorting utilities.
 *
 * Single source of truth for sort logic and sort option configuration.
 * Consumed by lib/getContent.ts, components/features/SortControls.tsx,
 * and any other module that needs to sort content arrays.
 */

import type { ContentMeta, SortOption, SortOrder } from "@/lib/types";

// ─── Niveau ranking ───────────────────────────────────────────────────────────

/** Numeric rank for ascending niveau sort (débutant → avancé). */
export const NIVEAU_RANK: Record<string, number> = {
  debutant:      0,
  intermediaire: 1,
  avance:        2,
  tous:          3,
};

// ─── Sort option configuration ────────────────────────────────────────────────

export interface SortOptionConfig {
  /** Value stored in the `tri` URL search param. */
  value:        SortOption;
  /** Short label shown in the UI. */
  label:        string;
  /** Longer label for screen readers. */
  ariaLabel:    string;
  /** Natural default direction for this criterion. */
  defaultOrder: SortOrder;
}

/**
 * Ordered list of available sort options.
 * Import this in SortControls to avoid maintaining a separate list.
 */
export const SORT_OPTIONS: SortOptionConfig[] = [
  {
    value:        "date",
    label:        "Date",
    ariaLabel:    "Trier par date",
    defaultOrder: "desc",
  },
  {
    value:        "popularite",
    label:        "Popularité",
    ariaLabel:    "Trier par popularité",
    defaultOrder: "desc",
  },
  {
    value:        "niveau",
    label:        "Niveau",
    ariaLabel:    "Trier par niveau (débutant → avancé)",
    defaultOrder: "asc",
  },
  {
    value:        "titre",
    label:        "Titre A–Z",
    ariaLabel:    "Trier par titre (ordre alphabétique)",
    defaultOrder: "asc",
  },
];

// ─── Core sort function ───────────────────────────────────────────────────────

/**
 * Sort a content array by the given criterion and direction.
 *
 * Pure function — returns a new array, never mutates the input.
 *
 * When primary fields are equal the sort falls back to descending date
 * so the order is always deterministic (no random jumping between renders).
 *
 * @param items  - Full filtered array to sort.
 * @param sortBy - Sort criterion (default: "date").
 * @param order  - Direction (default: "desc").
 */
export function sortContent(
  items:  ContentMeta[],
  sortBy: SortOption = "date",
  order:  SortOrder  = "desc"
): ContentMeta[] {
  const sorted = [...items].sort(getCompareFn(sortBy));
  return order === "asc" ? sorted.reverse() : sorted;
}

/** Date tiebreaker — newest first. */
function tiebreak(a: ContentMeta, b: ContentMeta): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getCompareFn(
  sortBy: SortOption
): (a: ContentMeta, b: ContentMeta) => number {
  switch (sortBy) {
    case "popularite":
      return (a, b) => {
        const diff = (b.views ?? 0) - (a.views ?? 0);
        return diff !== 0 ? diff : tiebreak(a, b);
      };

    case "niveau":
      return (a, b) => {
        const diff =
          (NIVEAU_RANK[a.niveau ?? "tous"] ?? 3) -
          (NIVEAU_RANK[b.niveau ?? "tous"] ?? 3);
        return diff !== 0 ? diff : tiebreak(a, b);
      };

    case "titre":
      return (a, b) =>
        a.title.localeCompare(b.title, "fr", { sensitivity: "base" });

    case "date":
    default:
      return tiebreak;
  }
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

/**
 * Safely parse a `tri` query-string value into a valid SortOption.
 *
 * @example
 * parseSort("popularite")     → "popularite"
 * parseSort("random_garbage") → "date"
 */
export function parseSort(
  raw:      string | undefined,
  fallback: SortOption = "date"
): SortOption {
  return SORT_OPTIONS.some((o) => o.value === raw)
    ? (raw as SortOption)
    : fallback;
}

/**
 * Safely parse an `ordre` query-string value into "asc" | "desc".
 *
 * @example
 * parseOrder("asc")  → "asc"
 * parseOrder("down") → "desc"
 */
export function parseOrder(
  raw:      string | undefined,
  fallback: SortOrder = "desc"
): SortOrder {
  return raw === "asc" || raw === "desc" ? raw : fallback;
}

/** Get the UI label for a sort option value. */
export function getSortLabel(value: SortOption): string {
  return SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/**
 * Compute the new sort order when a user clicks a sort button.
 *
 * Rules:
 * - Clicking an **active** sort → toggle direction.
 * - Clicking an **inactive** sort → use that option's `defaultOrder`.
 */
export function nextSortOrder(
  clickedValue:  SortOption,
  currentValue:  SortOption,
  currentOrder:  SortOrder
): SortOrder {
  if (clickedValue !== currentValue) {
    return SORT_OPTIONS.find((o) => o.value === clickedValue)?.defaultOrder ?? "desc";
  }
  return currentOrder === "desc" ? "asc" : "desc";
}
