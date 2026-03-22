import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type {
  ContentCategory,
  ContentItem,
  ContentMeta,
  NiveauType,
  PaginatedContent,
  SortOption,
  SortOrder,
} from "./types";
import { estimateReadingTime } from "./utils";
import { ITEMS_PER_PAGE } from "./config";

const contentDir = path.join(process.cwd(), "content");

// ─── Low-level helpers ──────────────────────────────────────────────────────

function getCategoryDir(category: ContentCategory) {
  return path.join(contentDir, category);
}

function getFilePaths(category: ContentCategory): string[] {
  const dir = getCategoryDir(category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

async function parseMarkdown(raw: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(raw);
  return result.toString();
}

function buildMeta(slug: string, data: Record<string, unknown>, rawContent: string): ContentMeta {
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    excerpt: (data.excerpt as string) ?? rawContent.slice(0, 160),
    category: data.category as ContentCategory,
    tags: (data.tags as string[]) ?? [],
    niveau: (data.niveau as NiveauType) ?? undefined,
    date: (data.date as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? undefined,
    author: (data.author as string) ?? "Salomon Boris",
    coverImage: (data.coverImage as string) ?? undefined,
    featured: (data.featured as boolean) ?? false,
    views: (data.views as number) ?? 0,
    readingTime: estimateReadingTime(rawContent),
    youtube: (data.youtube as string) ?? undefined,
    price: (data.price as number) ?? null,
    gratuit: (data.gratuit as boolean) ?? true,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getContentItem(
  category: ContentCategory,
  slug: string
): Promise<ContentItem | null> {
  const extensions = [".md", ".mdx"];
  for (const ext of extensions) {
    const filePath = path.join(getCategoryDir(category), `${slug}${ext}`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const htmlContent = await parseMarkdown(content);
    return { ...buildMeta(slug, data, content), content: htmlContent };
  }
  return null;
}

export function getAllContentMeta(category: ContentCategory): ContentMeta[] {
  const files = getFilePaths(category);
  return files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const raw = fs.readFileSync(path.join(getCategoryDir(category), file), "utf8");
    const { data, content } = matter(raw);
    return buildMeta(slug, data, content);
  });
}

export function getAllSlugs(category: ContentCategory): string[] {
  return getFilePaths(category).map((f) => f.replace(/\.(md|mdx)$/, ""));
}

// ─── Sorting ────────────────────────────────────────────────────────────────

const NIVEAU_ORDER: Record<NiveauType, number> = {
  debutant: 0,
  intermediaire: 1,
  avance: 2,
  tous: 3,
};

export function sortContent(
  items: ContentMeta[],
  sortBy: SortOption = "date",
  order: SortOrder = "desc"
): ContentMeta[] {
  const sorted = [...items].sort((a, b) => {
    switch (sortBy) {
      case "popularite":
        return (b.views ?? 0) - (a.views ?? 0);
      case "niveau":
        return (
          (NIVEAU_ORDER[a.niveau ?? "tous"] ?? 3) -
          (NIVEAU_ORDER[b.niveau ?? "tous"] ?? 3)
        );
      case "titre":
        return a.title.localeCompare(b.title, "fr");
      case "date":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
  return order === "asc" ? sorted.reverse() : sorted;
}

// ─── Filtering ──────────────────────────────────────────────────────────────

export function filterByTag(items: ContentMeta[], tag: string): ContentMeta[] {
  return items.filter((i) => i.tags.includes(tag));
}

export function filterByNiveau(items: ContentMeta[], niveau: NiveauType): ContentMeta[] {
  if (niveau === "tous") return items;
  return items.filter((i) => i.niveau === niveau);
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export function paginateContent<T>(
  items: T[],
  page: number,
  perPage = ITEMS_PER_PAGE
): PaginatedContent<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

// ─── Featured & Related ─────────────────────────────────────────────────────

export function getFeaturedContent(category: ContentCategory, limit = 3): ContentMeta[] {
  const all = getAllContentMeta(category);
  const featured = all.filter((i) => i.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = all.filter((i) => !i.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getRelatedContent(
  item: ContentMeta,
  limit = 3
): ContentMeta[] {
  const all = getAllContentMeta(item.category);
  return all
    .filter((i) => i.slug !== item.slug)
    .map((i) => ({
      item: i,
      score: i.tags.filter((t) => item.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

// ─── Search index build ─────────────────────────────────────────────────────

export function buildSearchIndex(): Record<string, unknown>[] {
  const categories: ContentCategory[] = ["methodes", "cours", "tablatures", "blog"];
  return categories.flatMap((cat) =>
    getAllContentMeta(cat).map(({ slug, title, excerpt, description, category, tags, niveau, date }) => ({
      id: `${category}/${slug}`,
      slug,
      title,
      excerpt,
      description,
      category,
      tags,
      niveau,
      date,
    }))
  );
}
