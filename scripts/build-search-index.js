/**
 * scripts/build-search-index.js
 *
 * Génère /public/search-index.json — index statique pour la recherche client-side.
 *
 * Sources :
 *   - JSON  → /content/methodes, /content/cours, /content/tablatures
 *   - MD/MDX → /content/blog
 *
 * Usage : node scripts/build-search-index.js
 *         (ou via "build:search" dans package.json)
 */

const fs   = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "../content");
const OUTPUT      = path.join(__dirname, "../public/search-index.json");

const JSON_CATEGORIES = new Set(["methodes", "cours", "tablatures"]);
const MD_CATEGORIES   = new Set(["blog"]);
const ALL_CATEGORIES  = [...JSON_CATEGORIES, ...MD_CATEGORIES];

/** Tags reconnus comme genres musicaux (même liste que dans lib/getContent.ts) */
const STYLE_TAGS = new Set([
  "blues", "rock", "pop", "pop-rock", "acoustique", "classique",
  "jazz", "folk", "metal", "flamenco", "theorie", "conseils",
  "fingerstyle", "country", "reggae", "soul", "funk",
]);

function inferStyle(explicitStyle, tags) {
  if (explicitStyle) return explicitStyle;
  return (tags ?? []).find((t) => STYLE_TAGS.has(t.toLowerCase())) ?? null;
}

function estimateReadingTime(content) {
  const words = (content ?? "").trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function buildIndex() {
  const index = [];

  for (const cat of ALL_CATEGORIES) {
    const dir = path.join(CONTENT_DIR, cat);
    if (!fs.existsSync(dir)) {
      console.warn(`[skip] Dossier introuvable : ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir);

    if (JSON_CATEGORIES.has(cat)) {
      // ── JSON sources ──────────────────────────────────────────────────────
      for (const file of files.filter((f) => f.endsWith(".json"))) {
        if (file.startsWith("_")) continue; // ignore schema/readme files

        const slug = file.replace(/\.json$/, "");
        const filePath = path.join(dir, file);

        let data;
        try {
          data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (err) {
          console.error(`[error] Impossible de parser ${filePath}:`, err.message);
          continue;
        }

        if (!data.title || !data.body) {
          console.warn(`[skip] JSON invalide (title/body manquant) : ${filePath}`);
          continue;
        }

        const tags = data.tags ?? [];

        index.push({
          id:          `${cat}/${slug}`,
          slug:        data.slug ?? slug,
          title:       data.title,
          description: data.description ?? "",
          excerpt:     data.excerpt ?? data.body.slice(0, 200).replace(/\n/g, " "),
          category:    cat,
          tags,
          niveau:      data.niveau ?? null,
          style:       inferStyle(data.style, tags),
          date:        data.date ?? new Date().toISOString().split("T")[0],
          readingTime: estimateReadingTime(data.body),
        });
      }
    } else {
      // ── Markdown sources ──────────────────────────────────────────────────
      for (const file of files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))) {
        if (file.startsWith("_")) continue;

        const slug = file.replace(/\.(md|mdx)$/, "");
        const filePath = path.join(dir, file);

        let fm, content;
        try {
          const raw = fs.readFileSync(filePath, "utf8");
          ({ data: fm, content } = matter(raw));
        } catch (err) {
          console.error(`[error] Impossible de parser ${filePath}:`, err.message);
          continue;
        }

        const tags = fm.tags ?? [];

        index.push({
          id:          `${cat}/${slug}`,
          slug,
          title:       fm.title       ?? slug,
          description: fm.description ?? "",
          excerpt:     fm.excerpt     ?? content.slice(0, 200).replace(/\n/g, " "),
          category:    cat,
          tags,
          niveau:      fm.niveau ?? null,
          style:       inferStyle(fm.style, tags),
          date:        fm.date   ?? new Date().toISOString().split("T")[0],
          readingTime: estimateReadingTime(content),
        });
      }
    }
  }

  // Sort by date desc
  index.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2), "utf8");
  console.log(`\n✅ Index de recherche généré : ${index.length} items → ${OUTPUT}\n`);
  
  const byCategory = {};
  for (const item of index) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`   ${cat.padEnd(12)} ${count} items`);
  }
}

buildIndex();
