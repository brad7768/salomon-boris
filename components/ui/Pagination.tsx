import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPageRange, buildPageUrl, getResultsLabel } from "@/lib/pagination";
import type { PaginationMeta } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PaginationProps {
  pagination:   PaginationMeta;
  basePath:     string;
  /** Active search params to preserve in page links (e.g. style, tri, ordre). */
  searchParams?: Record<string, string>;
  /**
   * "full"    (default) — page numbers + prev/next labels + results info.
   * "compact" — prev/next with current/total only (for sidebars, mobile).
   */
  variant?: "full" | "compact";
  className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared link/span ─────────────────────────────────────────────────────────

interface PageItemProps {
  href?:       string;
  active?:     boolean;
  disabled?:   boolean;
  "aria-label"?: string;
  children:    React.ReactNode;
  className?:  string;
}

function PageItem({
  href,
  active,
  disabled,
  children,
  className,
  "aria-label": ariaLabel,
}: PageItemProps) {
  const base = cn(
    "inline-flex items-center justify-center h-9 min-w-[2.25rem] px-2.5",
    "rounded-lg text-sm font-medium select-none transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
    active
      ? "bg-primary text-white shadow-sm shadow-primary/25 pointer-events-none"
      : disabled
        ? "text-text-secondary/40 cursor-not-allowed pointer-events-none"
        : "text-text-secondary bg-white border border-background-neutral hover:border-primary/40 hover:text-primary hover:bg-primary/[0.04] active:scale-[0.96]",
    className
  );

  if (!href || disabled || active) {
    return (
      <span className={base} aria-label={ariaLabel} aria-current={active ? "page" : undefined}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={base}
      aria-label={ariaLabel}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

// ─── Ellipsis ─────────────────────────────────────────────────────────────────

function Ellipsis() {
  return (
    <span
      className="inline-flex items-center justify-center h-9 w-8 text-text-secondary/50 text-sm select-none"
      aria-hidden
    >
      ···
    </span>
  );
}

// ─── Compact variant ──────────────────────────────────────────────────────────

function CompactPagination({
  pagination,
  basePath,
  searchParams = {},
  className,
}: Omit<PaginationProps, "variant">) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <PageItem
        href={hasPrevPage ? buildPageUrl(basePath, currentPage - 1, searchParams) : undefined}
        disabled={!hasPrevPage}
        aria-label="Page précédente"
        className="gap-1.5 px-3"
      >
        <ChevronLeft /> Précédent
      </PageItem>

      <span className="text-sm text-text-secondary font-medium tabular-nums">
        {currentPage} <span className="text-text-secondary/40">/</span> {totalPages}
      </span>

      <PageItem
        href={hasNextPage ? buildPageUrl(basePath, currentPage + 1, searchParams) : undefined}
        disabled={!hasNextPage}
        aria-label="Page suivante"
        className="gap-1.5 px-3"
      >
        Suivant <ChevronRight />
      </PageItem>
    </nav>
  );
}

// ─── Full variant ─────────────────────────────────────────────────────────────

function FullPagination({
  pagination,
  basePath,
  searchParams = {},
  className,
}: Omit<PaginationProps, "variant">) {
  const {
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
  } = pagination;

  if (totalPages <= 1) return null;

  const pageRange = getPageRange(currentPage, totalPages, 1);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>

      {/* ── Results info ── */}
      <p className="text-sm text-text-secondary tabular-nums">
        {getResultsLabel(pagination)}
      </p>

      {/* ── Nav row ── */}
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        {/* Prev */}
        <PageItem
          href={hasPrevPage ? buildPageUrl(basePath, currentPage - 1, searchParams) : undefined}
          disabled={!hasPrevPage}
          aria-label="Page précédente"
          className="gap-1.5 pr-3 pl-2.5 hidden sm:inline-flex"
        >
          <ChevronLeft /> Précédent
        </PageItem>

        {/* Prev — icon only on mobile */}
        <PageItem
          href={hasPrevPage ? buildPageUrl(basePath, currentPage - 1, searchParams) : undefined}
          disabled={!hasPrevPage}
          aria-label="Page précédente"
          className="sm:hidden"
        >
          <ChevronLeft />
        </PageItem>

        {/* Separator */}
        <span className="hidden sm:inline w-px h-5 bg-background-neutral mx-1" aria-hidden />

        {/* Page numbers */}
        {pageRange.map((page, idx) =>
          page === "..." ? (
            <Ellipsis key={`ellipsis-${idx}`} />
          ) : (
            <PageItem
              key={page}
              href={buildPageUrl(basePath, page, searchParams)}
              active={page === currentPage}
              aria-label={`Page ${page}`}
            >
              {page}
            </PageItem>
          )
        )}

        {/* Separator */}
        <span className="hidden sm:inline w-px h-5 bg-background-neutral mx-1" aria-hidden />

        {/* Next — label on desktop */}
        <PageItem
          href={hasNextPage ? buildPageUrl(basePath, currentPage + 1, searchParams) : undefined}
          disabled={!hasNextPage}
          aria-label="Page suivante"
          className="gap-1.5 pl-3 pr-2.5 hidden sm:inline-flex"
        >
          Suivant <ChevronRight />
        </PageItem>

        {/* Next — icon only on mobile */}
        <PageItem
          href={hasNextPage ? buildPageUrl(basePath, currentPage + 1, searchParams) : undefined}
          disabled={!hasNextPage}
          aria-label="Page suivante"
          className="sm:hidden"
        >
          <ChevronRight />
        </PageItem>
      </nav>

      {/* ── Page X of Y — always visible ── */}
      <p className="text-xs text-text-secondary/50 tabular-nums sm:hidden">
        Page {currentPage} sur {totalPages}
      </p>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Pagination — renders a page navigation bar.
 *
 * @example
 * // In a list page (server component):
 * <Pagination
 *   pagination={pagination}
 *   basePath="/methodes"
 *   searchParams={{ style: "blues", tri: "popularite" }}
 * />
 *
 * @example
 * // Compact variant for sidebar or narrow containers:
 * <Pagination
 *   pagination={pagination}
 *   basePath="/blog"
 *   variant="compact"
 * />
 */
export function Pagination({
  variant = "full",
  ...props
}: PaginationProps) {
  if (variant === "compact") {
    return <CompactPagination {...props} />;
  }
  return <FullPagination {...props} />;
}
