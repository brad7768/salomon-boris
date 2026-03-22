import type { MetadataRoute } from "next";
import { getPostsByCategory } from "@/lib/getContent";
import { siteConfig } from "@/lib/config";

const BASE = siteConfig.url;

// ─── Static pages ─────────────────────────────────────────────────────────────

const STATIC: MetadataRoute.Sitemap = [
  {
    url:             BASE,
    lastModified:    new Date(),
    changeFrequency: "daily",
    priority:        1.0,
  },
  {
    url:             `${BASE}/methodes`,
    lastModified:    new Date(),
    changeFrequency: "weekly",
    priority:        0.9,
  },
  {
    url:             `${BASE}/cours`,
    lastModified:    new Date(),
    changeFrequency: "weekly",
    priority:        0.9,
  },
  {
    url:             `${BASE}/tablatures`,
    lastModified:    new Date(),
    changeFrequency: "weekly",
    priority:        0.9,
  },
  {
    url:             `${BASE}/blog`,
    lastModified:    new Date(),
    changeFrequency: "daily",
    priority:        0.85,
  },
  {
    url:             `${BASE}/recherche`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.3,
  },
];

// ─── Per-category config ──────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  methodes: {
    basePriority:    0.85,
    changeFrequency: "monthly" as const,
  },
  cours: {
    basePriority:    0.80,
    changeFrequency: "monthly" as const,
  },
  tablatures: {
    basePriority:    0.75,
    changeFrequency: "monthly" as const,
  },
  blog: {
    basePriority:    0.70,
    changeFrequency: "weekly" as const,
  },
} as const;

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamic: MetadataRoute.Sitemap = (
    Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>
  ).flatMap((cat) => {
    const { basePriority, changeFrequency } = CATEGORY_CONFIG[cat];

    return getPostsByCategory(cat).map((item) => ({
      url:             `${BASE}/${cat}/${item.slug}`,
      lastModified:    new Date(item.updatedAt ?? item.date),
      changeFrequency,
      // Featured content gets a small priority boost (capped at 0.95)
      priority:        item.featured
                         ? Math.min(basePriority + 0.08, 0.95)
                         : basePriority,
    }));
  });

  return [...STATIC, ...dynamic];
}
