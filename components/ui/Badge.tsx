import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "default"
  | "primary"
  | "light"
  | "outline"
  | "success"
  | "warning"
  | "danger";

type NiveauValue = "debutant" | "intermediaire" | "avance" | "tous";

interface BadgeProps {
  variant?: BadgeVariant;
  /** Raccourci : affiche automatiquement la couleur + le label du niveau */
  niveau?: NiveauValue;
  /** Affiche un point coloré avant le texte */
  dot?: boolean;
  children?: ReactNode;
  className?: string;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const VARIANT: Record<BadgeVariant, string> = {
  default:  "bg-background-neutral text-text-secondary",
  primary:  "bg-primary/10 text-primary",
  light:    "bg-white/20 text-white border border-white/25 backdrop-blur-sm",
  outline:  "bg-transparent border border-primary/30 text-primary",
  success:  "bg-green-50 text-green-700 border border-green-100",
  warning:  "bg-amber-50 text-amber-700 border border-amber-100",
  danger:   "bg-red-50 text-red-700 border border-red-100",
};

const NIVEAU_STYLE: Record<NiveauValue, { classes: string; dot: string; label: string }> = {
  debutant:      { classes: "bg-green-50 text-green-700 border border-green-100",  dot: "bg-green-500", label: "Débutant" },
  intermediaire: { classes: "bg-amber-50 text-amber-700 border border-amber-100",  dot: "bg-amber-500", label: "Intermédiaire" },
  avance:        { classes: "bg-red-50 text-red-700 border border-red-100",         dot: "bg-red-500",   label: "Avancé" },
  tous:          { classes: "bg-blue-50 text-blue-700 border border-blue-100",      dot: "bg-blue-500",  label: "Tous niveaux" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Badge({
  variant = "default",
  niveau,
  dot,
  children,
  className,
}: BadgeProps) {
  const niveauMeta = niveau ? NIVEAU_STYLE[niveau] : null;

  const classes = cn(
    "inline-flex items-center gap-1.5",
    "text-[11px] font-semibold tracking-wide",
    "px-2.5 py-0.5 rounded-full",
    niveauMeta ? niveauMeta.classes : VARIANT[variant],
    className
  );

  return (
    <span className={classes}>
      {/* Dot indicator */}
      {(dot || niveauMeta) && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full shrink-0",
            niveauMeta ? niveauMeta.dot : "bg-current opacity-70"
          )}
          aria-hidden
        />
      )}
      {niveauMeta ? niveauMeta.label : children}
    </span>
  );
}
