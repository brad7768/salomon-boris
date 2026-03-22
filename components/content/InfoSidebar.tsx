import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { NiveauType } from "@/lib/types";

interface InfoRow {
  label: string;
  value: React.ReactNode;
}

interface InfoSidebarProps {
  heading: string;
  rows: InfoRow[];
  tags?: string[];
  tagHref?: string;
  cta?: {
    label: string;
    href: string;
    variant?: "primary" | "outline";
  };
  ctaSecondary?: {
    label: string;
    href: string;
  };
}

export function InfoSidebar({
  heading,
  rows,
  tags,
  tagHref = "#",
  cta,
  ctaSecondary,
}: InfoSidebarProps) {
  return (
    <aside>
      <div className="sticky top-24 space-y-4">
        {/* Main info card */}
        <div className="bg-background-neutral rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-text text-sm uppercase tracking-wider">
            {heading}
          </h2>

          <dl className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <dt className="text-text-secondary">{row.label}</dt>
                <dd className="font-medium text-text text-right">{row.value}</dd>
              </div>
            ))}
          </dl>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="pt-1 border-t border-background">
              <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">
                Thèmes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`${tagHref}?tag=${tag}`}
                    className="text-xs bg-white text-text-secondary px-2.5 py-1 rounded-full border border-background-neutral hover:border-primary hover:text-primary transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {cta && (
            <Button
              href={cta.href}
              variant={cta.variant ?? "primary"}
              fullWidth
              className="justify-center"
            >
              {cta.label}
            </Button>
          )}

          {ctaSecondary && (
            <Button
              href={ctaSecondary.href}
              variant="ghost"
              fullWidth
              className="justify-center text-sm"
            >
              {ctaSecondary.label}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Shared row builders ─────────────────────────────────────────────────────

export function niveauRow(niveau?: NiveauType): InfoRow | null {
  if (!niveau) return null;
  return { label: "Niveau", value: <Badge niveau={niveau} /> };
}

export function readingTimeRow(minutes?: number): InfoRow | null {
  if (!minutes) return null;
  return { label: "Durée estimée", value: `${minutes} min` };
}

export function gratuitRow(gratuit?: boolean, price?: number | null): InfoRow {
  if (gratuit === false && price) {
    return {
      label: "Accès",
      value: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
          Premium — {price}€
        </span>
      ),
    };
  }
  return {
    label: "Accès",
    value: (
      <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        Gratuit
      </span>
    ),
  };
}

export function dateRow(date: string, label = "Publié le"): InfoRow {
  return { label, value: formatDate(date) };
}

export function updatedAtRow(updatedAt?: string): InfoRow | null {
  if (!updatedAt) return null;
  return { label: "Mis à jour", value: formatDate(updatedAt) };
}
