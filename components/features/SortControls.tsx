"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, nextSortOrder } from "@/lib/sort";
import type { SortOption, SortOrder } from "@/lib/types";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowUp({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M6 10V2m0 0L3 5m3-3l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDown({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M6 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SortControlsProps {
  currentSort?:  SortOption;
  currentOrder?: SortOrder;
  className?:    string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SortControls({
  currentSort  = "date",
  currentOrder = "desc",
  className,
}: SortControlsProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  function applySort(sort: SortOption) {
    const newOrder = nextSortOrder(sort, currentSort, currentOrder);
    const params   = new URLSearchParams(searchParams.toString());

    params.set("tri", sort);
    params.set("ordre", newOrder);
    params.delete("page"); // reset to page 1 on sort change

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-sm text-text-secondary font-medium shrink-0">
        Trier :
      </span>

      <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Options de tri">
        {SORT_OPTIONS.map((opt) => {
          const isActive = currentSort === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applySort(opt.value)}
              aria-label={opt.ariaLabel + (isActive ? ` — ${currentOrder === "desc" ? "décroissant" : "croissant"}` : "")}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border",
                "font-medium transition-all duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                "active:scale-[0.97]",
                isActive
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "bg-white text-text-secondary border-background-neutral hover:border-primary/40 hover:text-primary hover:bg-primary/[0.04]"
              )}
            >
              {opt.label}
              {isActive && (
                <span className="opacity-80">
                  {currentOrder === "desc" ? <ArrowDown /> : <ArrowUp />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
