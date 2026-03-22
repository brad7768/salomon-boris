import Link from "next/link";
import Image from "next/image";
import { cn, formatDate, truncate } from "@/lib/utils";
import { Badge } from "./Badge";
import type { ContentMeta, NiveauType } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/config";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Card — Shell générique
// ─────────────────────────────────────────────────────────────────────────────

type CardVariant = "default" | "elevated" | "outlined" | "ghost";

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: CardVariant;
  /** Désactive l'effet hover (utile dans les layouts fixes) */
  static?: boolean;
}

const CARD_VARIANT: Record<CardVariant, string> = {
  default:  "bg-white border border-background-neutral shadow-sm",
  elevated: "bg-white shadow-[0_4px_24px_rgba(34,34,59,.07)] border border-transparent",
  outlined: "bg-white border-2 border-background-neutral",
  ghost:    "bg-transparent border border-transparent",
};

const CARD_HOVER =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,34,59,.1)] hover:border-primary/15";

export function Card({
  children,
  className,
  href,
  variant = "default",
  static: isStatic = false,
}: CardProps) {
  const classes = cn(
    "rounded-2xl overflow-hidden",
    CARD_VARIANT[variant],
    !isStatic && CARD_HOVER,
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ContentCard — Carte de contenu (article, cours, tablature, méthode)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_HREFS: Record<string, string> = {
  methodes:   "/methodes",
  cours:      "/cours",
  tablatures: "/tablatures",
  blog:       "/blog",
};

// Placeholders SVG par catégorie (pas d'emoji — rendu net sur tous les OS)
const CATEGORY_PLACEHOLDER: Record<string, { bg: string; icon: ReactNode }> = {
  methodes: {
    bg: "from-[#03045E]/8 to-[#03045E]/18",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#03045E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" aria-hidden>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  cours: {
    bg: "from-[#03045E]/8 to-[#22223B]/18",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#03045E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" aria-hidden>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  tablatures: {
    bg: "from-[#22223B]/6 to-[#03045E]/14",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#03045E" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  blog: {
    bg: "from-[#6C6C6C]/6 to-[#22223B]/14",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22223B" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
};

interface ContentCardProps {
  item: ContentMeta;
  className?: string;
  showCategory?: boolean;
  /** Affiche une mise en page horizontale (image à gauche) */
  horizontal?: boolean;
}

export function ContentCard({
  item,
  className,
  showCategory = true,
  horizontal = false,
}: ContentCardProps) {
  const href = `${CATEGORY_HREFS[item.category]}/${item.slug}`;
  const placeholder = CATEGORY_PLACEHOLDER[item.category];
  const visibleTags = item.tags?.slice(0, 2) ?? [];
  const extraTags = (item.tags?.length ?? 0) - visibleTags.length;

  return (
    <article className={cn("group", className)}>
      <Link
        href={href}
        className={cn(
          "flex bg-white rounded-2xl border border-background-neutral overflow-hidden",
          "transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(3,4,94,.1)] hover:border-primary/20",
          horizontal ? "flex-row" : "flex-col"
        )}
      >
        {/* ── Thumbnail ── */}
        <div
          className={cn(
            "relative bg-background-neutral overflow-hidden shrink-0",
            horizontal
              ? "w-36 sm:w-44"
              : "aspect-[16/9]"
          )}
        >
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center",
                "bg-gradient-to-br",
                placeholder?.bg ?? "from-background-neutral to-background"
              )}
            >
              {placeholder?.icon}
            </div>
          )}

          {/* Featured ribbon */}
          {item.featured && (
            <span
              className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase"
              aria-label="À la une"
            >
              ★ Une
            </span>
          )}

          {/* Free / paid indicator */}
          {item.gratuit === false && (
            <span className="absolute top-2.5 right-2.5 bg-[#22223B]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-2.5 p-5 flex-1 min-w-0">

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            {showCategory && (
              <Badge variant="primary">
                {CATEGORY_LABELS[item.category]}
              </Badge>
            )}
            {item.niveau && <Badge niveau={item.niveau as NiveauType} />}
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-text text-[1.05rem] leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
            {item.title}
          </h3>

          {/* Excerpt */}
          {!horizontal && (
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 flex-1">
              {truncate(item.excerpt || item.description, 130)}
            </p>
          )}

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-background-neutral text-text-secondary px-2 py-0.5 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
              {extraTags > 0 && (
                <span className="text-[11px] text-text-secondary">
                  +{extraTags}
                </span>
              )}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-0.5 text-xs text-text-secondary">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            {item.readingTime && (
              <span className="flex items-center gap-1">
                <ClockIcon />
                {item.readingTime} min
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FeatureCard — Carte fonctionnalité / highlight
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
  /** Couleur d'accent du fond d'icône. @default "primary" */
  accent?: "primary" | "neutral";
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  className,
  accent = "primary",
}: FeatureCardProps) {
  const inner = (
    <div className="p-6 space-y-4">
      <div
        className={cn(
          "inline-flex w-11 h-11 items-center justify-center rounded-xl text-xl",
          accent === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-background-neutral text-text-secondary"
        )}
      >
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-text text-[0.95rem]">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
      {href && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-150">
          En savoir plus
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );

  const classes = cn(
    "group bg-white rounded-2xl border border-background-neutral overflow-hidden",
    "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(3,4,94,.08)] hover:border-primary/15",
    className
  );

  if (href) {
    return <Link href={href} className={classes}>{inner}</Link>;
  }
  return <div className={classes}>{inner}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. StatCard — Métrique / KPI
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-background-neutral p-5 sm:p-6",
        "flex items-start gap-4",
        className
      )}
    >
      {icon && (
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl md:text-3xl font-bold text-primary tracking-tight leading-none mb-1">
          {value}
        </p>
        <p className="text-sm text-text-secondary truncate">{label}</p>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-1.5",
              trend.positive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Micro icons ─────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
