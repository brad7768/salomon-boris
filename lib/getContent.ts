/**
 * lib/getContent.ts
 *
 * Moteur de contenu dynamique multi-sources :
 *
 *   • JSON     → /content/methodes, /content/cours, /content/tablatures
 *               Le champ `body` contient du Markdown brut converti en HTML à la volée.
 *
 *   • Markdown → /content/blog
 *               Fichiers .md/.mdx avec frontmatter YAML (gray-matter).
 *
 * Toutes les fonctions retournent des objets normalisés en `ContentMeta` ou
 * `ContentItem` (= ContentMeta + `content: string` HTML).
 *
 * Le module maintient un cache en mémoire des index par catégorie pour éviter
 * de relire le disque à chaque appel. Le cache est invalidé automatiquement en
 * mode développement si la variable DISABLE_CONTENT_CACHE=true est définie.
 */

import fs   from "fs";
import path from "path";
import matter from "gray-matter";
import { remark }     from "remark";
import remarkHtml     from "remark-html";
import remarkGfm      from "remark-gfm";
import type {
  ContentCategory,
  ContentItem,
  ContentMeta,
  NiveauType,
  SortOption,
  SortOrder,
} from "./types";
import { estimateReadingTime } from "./utils";
import { sortContent }         from "./sort";
export { sortContent };
import { paginateContent }     from "./pagination";
export { paginateContent };

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Catégories qui utilisent des fichiers JSON */
const JSON_CATEGORIES = new Set<ContentCategory>(["methodes", "cours", "tablatures"]);

/** Catégories qui utilisent des fichiers Markdown */
const MD_CATEGORIES = new Set<ContentCategory>(["blog"]);

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structure attendue d'un fichier JSON de contenu.
 * Le champ `body` est du Markdown brut stocké inline.
 */
interface JsonContentFile {
  slug:        string;
  title:       string;
  description: string;
  excerpt?:    string;
  category:    ContentCategory;
  tags?:       string[];
  niveau?:     NiveauType;
  /** Genre musical optionnel. Si absent, inféré depuis les tags. */
  style?:      string;
  date:        string;
  updatedAt?:  string;
  author?:     string;
  coverImage?: string | null;
  featured?:   boolean;
  views?:      number;
  gratuit?:    boolean;
  price?:      number | null;
  youtube?:    string | null;
  body:        string;
}

/**
 * Tags reconnus comme genres musicaux.
 * Utilisé pour inférer `style` sur les fichiers qui ne le déclarent pas.
 */
const STYLE_TAGS = new Set([
  "blues", "rock", "pop", "pop-rock", "acoustique", "classique",
  "jazz", "folk", "metal", "flamenco", "theorie", "conseils",
  "fingerstyle", "country", "reggae", "soul", "funk",
]);

/** Valeurs acceptables après parsing d'un frontmatter Markdown */
type FrontmatterValue = string | number | boolean | string[] | null | undefined;
type Frontmatter = Record<string, FrontmatterValue>;

// ─────────────────────────────────────────────────────────────────────────────
// Remark pipeline (singleton — évite de recréer le processor à chaque appel)
// ─────────────────────────────────────────────────────────────────────────────

let _remarkProcessor: ReturnType<typeof remark> | null = null;

function getRemarkProcessor() {
  if (!_remarkProcessor) {
    _remarkProcessor = remark().use(remarkGfm).use(remarkHtml, { sanitize: false });
  }
  return _remarkProcessor;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const file = await getRemarkProcessor().process(markdown);
  return file.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────────────────────

const _metaCache  = new Map<ContentCategory, ContentMeta[]>();
const _itemCache  = new Map<string, ContentItem>();

function cacheEnabled(): boolean {
  return process.env.DISABLE_CONTENT_CACHE !== "true";
}

function cacheItemKey(category: ContentCategory, slug: string): string {
  return `${category}:${slug}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Path helpers
// ─────────────────────────────────────────────────────────────────────────────

function categoryDir(category: ContentCategory): string {
  return path.join(CONTENT_ROOT, category);
}

/**
 * Retourne la liste des fichiers valides d'une catégorie.
 * JSON pour methodes/cours/tablatures, Markdown pour blog.
 */
function listFiles(category: ContentCategory): string[] {
  const dir = categoryDir(category);
  if (!fs.existsSync(dir)) return [];

  const ext = JSON_CATEGORIES.has(category) ? ".json" : undefined;
  return fs.readdirSync(dir).filter((f) =>
    ext ? f.endsWith(ext) : f.endsWith(".md") || f.endsWith(".mdx")
  );
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.(json|md|mdx)$/, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers — transforment les données brutes en ContentMeta / ContentItem
// ─────────────────────────────────────────────────────────────────────────────

function inferStyleFromTags(explicitStyle: string | undefined, tags: string[]): string | undefined {
  if (explicitStyle) return explicitStyle;
  return tags.find((t) => STYLE_TAGS.has(t.toLowerCase()));
}

function normalizeJsonToMeta(raw: JsonContentFile): ContentMeta {
  const tags = raw.tags ?? [];
  return {
    slug:        raw.slug,
    title:       raw.title,
    description: raw.description ?? "",
    excerpt:     raw.excerpt ?? raw.body.slice(0, 180).replace(/\n/g, " "),
    category:    raw.category,
    tags,
    niveau:      raw.niveau      ?? undefined,
    style:       inferStyleFromTags(raw.style, tags),
    date:        raw.date,
    updatedAt:   raw.updatedAt   ?? undefined,
    author:      raw.author      ?? "Salomon Boris",
    coverImage:  raw.coverImage  ?? undefined,
    featured:    raw.featured    ?? false,
    views:       raw.views       ?? 0,
    readingTime: estimateReadingTime(raw.body),
    youtube:     raw.youtube     ?? undefined,
    price:       raw.price       ?? null,
    gratuit:     raw.gratuit     ?? true,
  };
}

function normalizeFrontmatterToMeta(
  slug:       string,
  fm:         Frontmatter,
  rawContent: string
): ContentMeta {
  const tags = (fm.tags as string[]) ?? [];
  return {
    slug,
    title:       (fm.title       as string)        ?? slug,
    description: (fm.description as string)        ?? "",
    excerpt:     (fm.excerpt     as string)        ?? rawContent.slice(0, 180).replace(/\n/g, " "),
    category:    (fm.category    as ContentCategory),
    tags,
    niveau:      (fm.niveau      as NiveauType)    ?? undefined,
    style:       inferStyleFromTags(fm.style as string | undefined, tags),
    date:        (fm.date        as string)        ?? new Date().toISOString(),
    updatedAt:   (fm.updatedAt   as string)        ?? undefined,
    author:      (fm.author      as string)        ?? "Salomon Boris",
    coverImage:  (fm.coverImage  as string)        ?? undefined,
    featured:    (fm.featured    as boolean)       ?? false,
    views:       (fm.views       as number)        ?? 0,
    readingTime: estimateReadingTime(rawContent),
    youtube:     (fm.youtube     as string)        ?? undefined,
    price:       (fm.price       as number)        ?? null,
    gratuit:     (fm.gratuit     as boolean)       ?? true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Low-level readers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lit et valide un fichier JSON de contenu.
 * Retourne null si le fichier est absent ou malformé.
 */
function readJsonFile(
  category: ContentCategory,
  slug: string
): JsonContentFile | null {
  const filePath = path.join(categoryDir(category), `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as JsonContentFile;

    // Validation minimale
    if (!parsed.title || !parsed.body) {
      console.warn(`[getContent] JSON invalide — champ(s) manquant(s) : ${filePath}`);
      return null;
    }

    // S'assurer que le slug est toujours présent même s'il est omis dans le JSON
    parsed.slug = parsed.slug ?? slug;
    return parsed;
  } catch (err) {
    console.error(`[getContent] Erreur parsing JSON : ${filePath}`, err);
    return null;
  }
}

/**
 * Lit un fichier Markdown avec frontmatter.
 * Retourne null si absent.
 */
function readMarkdownFile(
  category: ContentCategory,
  slug: string
): { frontmatter: Frontmatter; rawContent: string } | null {
  const extensions = [".md", ".mdx"];

  for (const ext of extensions) {
    const filePath = path.join(categoryDir(category), `${slug}${ext}`);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    return { frontmatter: data as Frontmatter, rawContent: content };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Index builders (avec cache)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construit la liste des ContentMeta pour une catégorie entière.
 * Résultat mis en cache après le premier appel.
 */
function buildCategoryIndex(category: ContentCategory): ContentMeta[] {
  if (cacheEnabled() && _metaCache.has(category)) {
    return _metaCache.get(category)!;
  }

  const files = listFiles(category);
  const index: ContentMeta[] = [];

  for (const filename of files) {
    const slug = slugFromFilename(filename);

    if (JSON_CATEGORIES.has(category)) {
      const raw = readJsonFile(category, slug);
      if (raw) index.push(normalizeJsonToMeta(raw));
    } else {
      const md = readMarkdownFile(category, slug);
      if (md) {
        index.push(normalizeFrontmatterToMeta(slug, md.frontmatter, md.rawContent));
      }
    }
  }

  if (cacheEnabled()) _metaCache.set(category, index);
  return index;
}

// ─────────────────────────────────────────────────────────────────────────────
// Item fetcher — retourne un ContentItem complet (meta + HTML)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchItem(
  category: ContentCategory,
  slug: string
): Promise<ContentItem | null> {
  const cacheKey = cacheItemKey(category, slug);
  if (cacheEnabled() && _itemCache.has(cacheKey)) {
    return _itemCache.get(cacheKey)!;
  }

  let item: ContentItem | null = null;

  if (JSON_CATEGORIES.has(category)) {
    const raw = readJsonFile(category, slug);
    if (raw) {
      const htmlContent = await markdownToHtml(raw.body);
      item = { ...normalizeJsonToMeta(raw), content: htmlContent };
    }
  } else {
    const md = readMarkdownFile(category, slug);
    if (md) {
      const htmlContent = await markdownToHtml(md.rawContent);
      item = {
        ...normalizeFrontmatterToMeta(slug, md.frontmatter, md.rawContent),
        content: htmlContent,
      };
    }
  }

  if (item && cacheEnabled()) _itemCache.set(cacheKey, item);
  return item;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sorting & Filtering
// sortContent is imported from lib/sort.ts and re-exported at the top.
// ─────────────────────────────────────────────────────────────────────────────

export function filterByTag(items: ContentMeta[], tag: string): ContentMeta[] {
  return items.filter((i) => i.tags.includes(tag));
}

export function filterByNiveau(
  items:  ContentMeta[],
  niveau: NiveauType
): ContentMeta[] {
  if (niveau === "tous") return items;
  return items.filter((i) => i.niveau === niveau);
}

/** Filtre les contenus par genre musical (`style` field). */
export function filterByStyle(items: ContentMeta[], style: string): ContentMeta[] {
  return items.filter((i) => i.style === style);
}

/**
 * Retourne les genres musicaux uniques présents dans une catégorie,
 * triés par nombre d'occurrences décroissant.
 */
export function getAllStyles(category: ContentCategory): string[] {
  const counts = getStyleCounts(category);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([style]) => style);
}

/**
 * Retourne un objet `{ [style]: count }` pour une catégorie.
 * Utile pour afficher "Blues (3)" dans les filtres.
 */
export function getStyleCounts(category: ContentCategory): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of buildCategoryIndex(category)) {
    if (item.style) counts[item.style] = (counts[item.style] ?? 0) + 1;
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// paginateContent is imported from lib/pagination.ts and re-exported at top.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ── PUBLIC API ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// ── By slug ──────────────────────────────────────────────────────────────────

/**
 * Retourne une méthode complète (meta + HTML) par son slug.
 * Source : /content/methodes/{slug}.json
 */
export async function getMethodeBySlug(slug: string): Promise<ContentItem | null> {
  return fetchItem("methodes", slug);
}

/**
 * Retourne un cours complet (meta + HTML) par son slug.
 * Source : /content/cours/{slug}.json
 */
export async function getCoursBySlug(slug: string): Promise<ContentItem | null> {
  return fetchItem("cours", slug);
}

/**
 * Retourne une tablature complète (meta + HTML) par son slug.
 * Source : /content/tablatures/{slug}.json
 */
export async function getTabBySlug(slug: string): Promise<ContentItem | null> {
  return fetchItem("tablatures", slug);
}

/**
 * Retourne un article de blog complet (meta + HTML) par son slug.
 * Source : /content/blog/{slug}.md
 */
export async function getPostBySlug(slug: string): Promise<ContentItem | null> {
  return fetchItem("blog", slug);
}

// ── Listings ─────────────────────────────────────────────────────────────────

/**
 * Retourne tous les articles de blog, triés par date décroissante par défaut.
 *
 * @param sortBy  Critère de tri. @default "date"
 * @param order   Ordre. @default "desc"
 */
export function getAllPosts(
  sortBy: SortOption = "date",
  order:  SortOrder  = "desc"
): ContentMeta[] {
  return sortContent(buildCategoryIndex("blog"), sortBy, order);
}

/**
 * Retourne le contenu d'une catégorie spécifique, avec tri optionnel.
 *
 * @example
 * // 3 méthodes les plus populaires
 * getPostsByCategory("methodes", { sortBy: "popularite", limit: 3 })
 */
export function getPostsByCategory(
  category: ContentCategory,
  options?: {
    sortBy?: SortOption;
    order?:  SortOrder;
    tag?:    string;
    niveau?: NiveauType;
    limit?:  number;
  }
): ContentMeta[] {
  let items = buildCategoryIndex(category);

  if (options?.tag)    items = filterByTag(items, options.tag);
  if (options?.niveau) items = filterByNiveau(items, options.niveau);

  items = sortContent(
    items,
    options?.sortBy ?? "date",
    options?.order  ?? "desc"
  );

  if (options?.limit && options.limit > 0) {
    items = items.slice(0, options.limit);
  }

  return items;
}

// ── Shortcut listing helpers ──────────────────────────────────────────────────

/** Tous les articles du blog (alias lisible) */
export const getAllBlogPosts = (
  sortBy?: SortOption,
  order?:  SortOrder
) => getAllPosts(sortBy, order);

/** Toutes les méthodes */
export const getAllMethodes = (opts?: Parameters<typeof getPostsByCategory>[1]) =>
  getPostsByCategory("methodes", opts);

/** Tous les cours */
export const getAllCours = (opts?: Parameters<typeof getPostsByCategory>[1]) =>
  getPostsByCategory("cours", opts);

/** Toutes les tablatures */
export const getAllTabs = (opts?: Parameters<typeof getPostsByCategory>[1]) =>
  getPostsByCategory("tablatures", opts);

// ── Slugs (pour generateStaticParams) ────────────────────────────────────────

/**
 * Retourne la liste des slugs valides d'une catégorie.
 * Usage : `generateStaticParams` dans les pages dynamiques Next.js.
 */
export function getAllSlugs(category: ContentCategory): string[] {
  return listFiles(category).map(slugFromFilename);
}

// ── Featured ─────────────────────────────────────────────────────────────────

/**
 * Retourne les contenus mis en avant d'une catégorie.
 * Si le nombre d'items `featured` est insuffisant, complète avec les plus récents.
 */
export function getFeaturedContent(
  category: ContentCategory,
  limit = 3
): ContentMeta[] {
  const all      = buildCategoryIndex(category);
  const featured = all.filter((i) => i.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = all.filter((i) => !i.featured);
  return sortContent([...featured, ...rest], "date", "desc").slice(0, limit);
}

// ── Related ───────────────────────────────────────────────────────────────────

/**
 * Retourne des contenus similaires à `item` dans la même catégorie.
 * Similarity score = nombre de tags en commun.
 */
export function getRelatedContent(item: ContentMeta, limit = 3): ContentMeta[] {
  const all = buildCategoryIndex(item.category);
  return all
    .filter((i) => i.slug !== item.slug)
    .map((i) => ({
      candidate: i,
      score: i.tags.filter((t) => item.tags.includes(t)).length,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime()
    )
    .slice(0, limit)
    .map((r) => r.candidate);
}

// ── All content (toutes catégories) ──────────────────────────────────────────

/**
 * Agrège le contenu de toutes les catégories en une seule liste triée.
 * Utile pour la page d'accueil ou un feed "tout le site".
 */
export function getAllContent(
  sortBy: SortOption = "date",
  order:  SortOrder  = "desc",
  limit?: number
): ContentMeta[] {
  const all: ContentMeta[] = (
    ["methodes", "cours", "tablatures", "blog"] as ContentCategory[]
  ).flatMap((cat) => buildCategoryIndex(cat));

  const sorted = sortContent(all, sortBy, order);
  return limit ? sorted.slice(0, limit) : sorted;
}

// ── Tags ─────────────────────────────────────────────────────────────────────

/**
 * Retourne tous les tags uniques d'une catégorie, triés alphabétiquement.
 */
export function getAllTags(category: ContentCategory): string[] {
  const items = buildCategoryIndex(category);
  return [...new Set(items.flatMap((i) => i.tags))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );
}

/**
 * Retourne un objet `{ tag → count }` pour une catégorie.
 * Utile pour afficher les tags les plus populaires.
 */
export function getTagCounts(
  category: ContentCategory
): Record<string, number> {
  const items = buildCategoryIndex(category);
  return items.reduce<Record<string, number>>((acc, item) => {
    for (const tag of item.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }
    return acc;
  }, {});
}

// ── Search index ─────────────────────────────────────────────────────────────

/**
 * Construit l'index de recherche plat pour le moteur client-side.
 * Utilisé par /app/api/search/route.ts et scripts/build-search-index.js.
 */
export function buildSearchIndex(): Array<{
  id:          string;
  slug:        string;
  title:       string;
  excerpt:     string;
  description: string;
  category:    ContentCategory;
  tags:        string[];
  niveau:      NiveauType | undefined;
  style:       string | undefined;
  date:        string;
  readingTime: number | undefined;
}> {
  return (["methodes", "cours", "tablatures", "blog"] as ContentCategory[]).flatMap(
    (cat) =>
      buildCategoryIndex(cat).map(
        ({ slug, title, excerpt, description, category, tags, niveau, style, date, readingTime }) => ({
          id: `${category}/${slug}`,
          slug,
          title,
          excerpt,
          description,
          category,
          tags,
          niveau,
          style,
          date,
          readingTime,
        })
      )
  );
}

// ── Cache management ──────────────────────────────────────────────────────────

/**
 * Invalide manuellement le cache (utile pour ISR ou preview mode).
 * Appeler sans argument pour invalider tout le cache.
 */
export function invalidateCache(category?: ContentCategory): void {
  if (category) {
    _metaCache.delete(category);
    // Invalide aussi les items de cette catégorie
    for (const key of _itemCache.keys()) {
      if (key.startsWith(`${category}:`)) _itemCache.delete(key);
    }
  } else {
    _metaCache.clear();
    _itemCache.clear();
  }
}
