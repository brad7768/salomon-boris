export type ContentCategory = "methodes" | "cours" | "tablatures" | "blog";

export type NiveauType = "debutant" | "intermediaire" | "avance" | "tous";

export interface ContentMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: ContentCategory;
  tags: string[];
  niveau?: NiveauType;
  /** Genre musical : "blues" | "rock" | "acoustique" | "classique" | "jazz" | "folk" | "theorie" | "conseils" … */
  style?: string;
  date: string;
  updatedAt?: string;
  author?: string;
  coverImage?: string;
  featured?: boolean;
  views?: number;
  readingTime?: number;
  youtube?: string;
  price?: number | null;
  gratuit?: boolean;
}

export interface ContentItem extends ContentMeta {
  content: string;
}

export interface SearchResult {
  /** Identifiant unique : "{category}/{slug}" */
  id?: string;
  slug: string;
  title: string;
  description?: string;
  excerpt: string;
  category: ContentCategory;
  tags: string[];
  niveau?: NiveauType;
  style?: string;
  date: string;
  readingTime?: number;
  /** Calculé côté client au moment de la recherche — absent dans l'index stocké */
  score?: number;
}

export interface SearchIndex {
  [key: string]: SearchResult;
}

export type SortOption = "date" | "popularite" | "niveau" | "titre";
export type SortOrder = "asc" | "desc";

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedContent<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  social: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}
