"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NIVEAU_LABELS, STYLE_LABELS } from "@/lib/config";
import type { NiveauType } from "@/lib/types";

// ─── Shared pill style ────────────────────────────────────────────────────────

function pill(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full border",
    "font-medium transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    active
      ? "bg-primary text-white border-primary shadow-sm"
      : "bg-white text-text-secondary border-background-neutral hover:border-primary/40 hover:text-primary"
  );
}

// ─── StyleFilter ──────────────────────────────────────────────────────────────

interface StyleFilterProps {
  styles: string[];
  /** Nombre d'items par style (pour afficher "Blues (3)") */
  counts?: Record<string, number>;
  selectedStyle?: string;
}

export function StyleFilter({ styles, counts, selectedStyle }: StyleFilterProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  if (!styles.length) return null;

  function setStyle(style: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (style) params.set("style", style);
    else params.delete("style");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div role="group" aria-label="Filtrer par genre">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary mb-2.5">
        Genre
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStyle(null)}
          className={pill(!selectedStyle)}
          aria-pressed={!selectedStyle}
        >
          Tous les genres
        </button>

        {styles.map((style) => {
          const label = STYLE_LABELS[style] ?? style;
          const count = counts?.[style];
          const active = selectedStyle === style;
          return (
            <button
              key={style}
              type="button"
              onClick={() => setStyle(active ? null : style)}
              className={pill(active)}
              aria-pressed={active}
            >
              {label}
              {count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-background-neutral text-text-secondary"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TagFilter ────────────────────────────────────────────────────────────────

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
}

export function TagFilter({ tags, selectedTag }: TagFilterProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  if (!tags.length) return null;

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) params.set("tag", tag);
    else params.delete("tag");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div role="group" aria-label="Filtrer par tag">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary mb-2.5">
        Tags
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTag(null)}
          className={pill(!selectedTag)}
          aria-pressed={!selectedTag}
        >
          Tous
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setTag(tag === selectedTag ? null : tag)}
            className={cn(
              pill(selectedTag === tag),
              "text-xs"
            )}
            aria-pressed={selectedTag === tag}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── NiveauFilter ─────────────────────────────────────────────────────────────

interface NiveauFilterProps {
  selectedNiveau?: NiveauType;
}

const NIVEAUX: NiveauType[] = ["debutant", "intermediaire", "avance"];

const NIVEAU_DOT: Record<string, string> = {
  debutant:      "bg-green-400",
  intermediaire: "bg-amber-400",
  avance:        "bg-red-400",
};

export function NiveauFilter({ selectedNiveau }: NiveauFilterProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  function setNiveau(niveau: NiveauType | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (niveau) params.set("niveau", niveau);
    else params.delete("niveau");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div role="group" aria-label="Filtrer par niveau">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary mb-2.5">
        Niveau
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setNiveau(null)}
          className={pill(!selectedNiveau)}
          aria-pressed={!selectedNiveau}
        >
          Tous niveaux
        </button>
        {NIVEAUX.map((niveau) => (
          <button
            key={niveau}
            type="button"
            onClick={() => setNiveau(niveau === selectedNiveau ? null : niveau)}
            className={pill(selectedNiveau === niveau)}
            aria-pressed={selectedNiveau === niveau}
          >
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full shrink-0",
                NIVEAU_DOT[niveau]
              )}
              aria-hidden
            />
            {NIVEAU_LABELS[niveau]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ActiveFilters ────────────────────────────────────────────────────────────

interface ActiveFiltersProps {
  selectedStyle?:  string;
  selectedNiveau?: string;
  selectedTag?:    string;
  totalCount:      number;
  filteredCount:   number;
}

export function ActiveFilters({
  selectedStyle,
  selectedNiveau,
  selectedTag,
  totalCount,
  filteredCount,
}: ActiveFiltersProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const hasFilters = !!(selectedStyle || selectedNiveau || selectedTag);

  function remove(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Result count */}
      <p className="text-sm text-text-secondary">
        <span className="font-semibold text-text">{filteredCount}</span>
        {" résultat"}
        {filteredCount !== 1 ? "s" : ""}
        {hasFilters && (
          <span className="text-text-secondary/70">
            {" "}sur {totalCount}
          </span>
        )}
      </p>

      {/* Active chips + clear */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedStyle && (
            <ActiveChip
              label={STYLE_LABELS[selectedStyle] ?? selectedStyle}
              onRemove={() => remove("style")}
            />
          )}
          {selectedNiveau && (
            <ActiveChip
              label={NIVEAU_LABELS[selectedNiveau] ?? selectedNiveau}
              onRemove={() => remove("niveau")}
            />
          )}
          {selectedTag && (
            <ActiveChip
              label={`#${selectedTag}`}
              onRemove={() => remove("tag")}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-text-secondary hover:text-primary transition-colors underline underline-offset-2"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}

function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/8 border border-primary/20 text-primary rounded-full text-xs font-medium px-3 py-1">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-primary/60 transition-colors"
        aria-label={`Retirer le filtre ${label}`}
      >
        <CloseIcon />
      </button>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
