import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Largeur max du conteneur.
   * xs  → 640px  (prose courte, modales)
   * sm  → 768px  (articles)
   * md  → 1024px (contenu médium)
   * lg  → 1280px (pages larges)
   * xl  → 1440px (layout maximum — défaut)
   * full→ sans limite
   */
  size?: ContainerSize;
  /**
   * Élément HTML sémantique à rendre.
   * @default "div"
   */
  as?: ElementType;
}

// ─── Size map ────────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<ContainerSize, string> = {
  xs:   "max-w-screen-sm",   // 640px
  sm:   "max-w-screen-md",   // 768px
  md:   "max-w-screen-lg",   // 1024px
  lg:   "max-w-screen-xl",   // 1280px
  xl:   "max-w-[1440px]",    // 1440px
  full: "max-w-none",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Container({
  children,
  className,
  size = "lg",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full",
        "px-4 sm:px-6 lg:px-8",
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}
