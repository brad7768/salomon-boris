import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  /** Thème selon le fond de la section hero */
  theme?: "dark" | "light";
}

export function Breadcrumb({ crumbs, theme = "dark" }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors duration-150",
                    theme === "dark"
                      ? "text-white/50 hover:text-white"
                      : "text-text-secondary hover:text-primary"
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white/80" : "text-text"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span
                  aria-hidden
                  className={theme === "dark" ? "text-white/25" : "text-text-secondary/40"}
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
