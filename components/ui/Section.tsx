import { cn } from "@/lib/utils";
import { Container } from "./Container";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionBg = "white" | "neutral" | "primary" | "dark" | "gradient";
type SectionAlign = "left" | "center";
type SectionSize  = "sm" | "md" | "lg" | "xl";

interface SectionAction {
  label: string;
  href: string;
}

interface SectionProps {
  children: ReactNode;
  /**
   * Petite étiquette uppercase au-dessus du titre.
   * ex: "Nouveau", "Apprendre", "Méthodes"
   */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: SectionAction;
  /** Alignement du bloc header. @default "left" */
  align?: SectionAlign;
  /** Couleur de fond. @default "white" */
  bg?: SectionBg;
  /** Taille max du conteneur interne. @default "lg" */
  containerSize?: SectionSize;
  /** Classe CSS additionnelle sur le <section> */
  className?: string;
  /** id HTML pour les ancres */
  id?: string;
  /**
   * Élément sémantique. Utiliser "div" quand imbriqué dans <section>.
   * @default "section"
   */
  as?: ElementType;
  /** Supprime le padding vertical (pour composition avancée). */
  noPadding?: boolean;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const BG_CLASSES: Record<SectionBg, string> = {
  white:    "bg-white",
  neutral:  "bg-background-neutral",
  primary:  "bg-primary",
  dark:     "bg-[#02023F]",
  gradient: "bg-gradient-to-br from-primary to-[#020252]",
};

const CONTAINER_SIZES: Record<SectionSize, "xs" | "sm" | "md" | "lg"> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
};

// Couleur du texte selon le fond
function isOnDark(bg: SectionBg) {
  return bg === "primary" || bg === "dark" || bg === "gradient";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Section({
  children,
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  bg = "white",
  containerSize = "lg",
  className,
  id,
  as: Tag = "section",
  noPadding = false,
}: SectionProps) {
  const dark = isOnDark(bg);
  const centered = align === "center";
  const hasHeader = !!(eyebrow || title || subtitle || action);

  return (
    <Tag
      id={id}
      className={cn(
        !noPadding && "py-16 md:py-24",
        BG_CLASSES[bg],
        className
      )}
    >
      <Container size={CONTAINER_SIZES[containerSize]}>

        {/* ── Section header ── */}
        {hasHeader && (
          <div
            className={cn(
              "mb-10 md:mb-14",
              centered
                ? "text-center flex flex-col items-center"
                : "flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            )}
          >
            {/* Left / center text block */}
            <div className={cn("space-y-2", centered && "max-w-2xl")}>

              {/* Eyebrow */}
              {eyebrow && (
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-[0.15em]",
                    dark ? "text-white/50" : "text-primary/60"
                  )}
                >
                  {eyebrow}
                </p>
              )}

              {/* Title */}
              {title && (
                <h2
                  className={cn(
                    "font-display font-bold text-balance leading-tight",
                    "text-2xl sm:text-3xl md:text-[2rem]",
                    dark ? "text-white" : "text-primary"
                  )}
                >
                  {title}
                </h2>
              )}

              {/* Subtitle */}
              {subtitle && (
                <p
                  className={cn(
                    "text-base leading-relaxed max-w-2xl",
                    dark ? "text-white/65" : "text-text-secondary"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* "See all" action — pinned right in left-align mode */}
            {action && !centered && (
              <SectionActionLink action={action} dark={dark} />
            )}

            {/* Center-mode action — below text */}
            {action && centered && (
              <div className="mt-2">
                <SectionActionLink action={action} dark={dark} />
              </div>
            )}
          </div>
        )}

        {/* ── Content slot ── */}
        {children}

      </Container>
    </Tag>
  );
}

// ─── Section action link ──────────────────────────────────────────────────────

function SectionActionLink({
  action,
  dark,
}: {
  action: SectionAction;
  dark: boolean;
}) {
  return (
    <Link
      href={action.href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold shrink-0",
        "transition-colors duration-150",
        dark
          ? "text-white/70 hover:text-white"
          : "text-primary/70 hover:text-primary"
      )}
    >
      {action.label}
      <ArrowIcon className="transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
