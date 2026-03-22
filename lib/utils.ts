import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, pattern = "d MMMM yyyy"): string {
  try {
    return format(parseISO(dateString), pattern, { locale: fr });
  } catch {
    return dateString;
  }
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function buildOgImageUrl(title: string, description?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const params = new URLSearchParams({ title });
  if (description) params.set("description", description);
  return `${base}/api/og?${params.toString()}`;
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `${base}${path}`;
}
