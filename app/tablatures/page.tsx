import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CategoryPageContent } from "@/components/features/CategoryPageContent";
import {
  getPostsByCategory,
  sortContent,
  filterByTag,
  filterByNiveau,
  filterByStyle,
  paginateContent,
  getAllStyles,
  getStyleCounts,
} from "@/lib/getContent";
import { siteConfig, CATEGORY_META, CATEGORY_DESCRIPTIONS } from "@/lib/config";
import type { NiveauType, SortOption, SortOrder } from "@/lib/types";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Tablatures de guitare — ${siteConfig.name}`,
  description: CATEGORY_DESCRIPTIONS.tablatures,
  openGraph: {
    title:       `Tablatures de guitare — ${siteConfig.name}`,
    description: CATEGORY_DESCRIPTIONS.tablatures,
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function TablaturesPage({ searchParams }: PageProps) {
  const params  = await searchParams;
  const page    = Math.max(1, parseInt(params.page ?? "1", 10));
  const tag     = params.tag;
  const niveau  = params.niveau as NiveauType | undefined;
  const style   = params.style;
  const tri     = (params.tri   ?? "popularite") as SortOption;
  const ordre   = (params.ordre ?? "desc") as SortOrder;

  const all = getPostsByCategory("tablatures");

  let items = [...all];
  if (style)  items = filterByStyle(items, style);
  if (niveau) items = filterByNiveau(items, niveau);
  if (tag)    items = filterByTag(items, tag);
  items = sortContent(items, tri, ordre);

  const { items: pageItems, pagination } = paginateContent(items, page);

  const allStyles   = getAllStyles("tablatures");
  const styleCounts = getStyleCounts("tablatures");
  const allTags     = [...new Set(all.flatMap((i) => i.tags))].sort();
  const freeCount   = all.filter((i) => i.gratuit !== false).length;

  const sp  = buildSp({ tag, niveau, style, tri, ordre });
  const meta = CATEGORY_META.tablatures;

  return (
    <main>
      <PageHero
        eyebrow={meta.eyebrow}
        heading={meta.heading}
        description={meta.description}
        stats={[
          { value: all.length,  label: "tablatures" },
          { value: freeCount,   label: "gratuites" },
          { value: all.filter((i) => i.youtube).length, label: "avec vidéo démo" },
        ]}
      />

      <div className="bg-background-neutral min-h-[60vh]">
        <Container>
          <CategoryPageContent
            items={pageItems}
            pagination={pagination}
            totalCount={all.length}
            allStyles={allStyles}
            styleCounts={styleCounts}
            selectedStyle={style}
            showStyle
            allTags={allTags}
            selectedTag={tag}
            showTags={allTags.length > 0}
            selectedNiveau={niveau}
            showNiveau
            currentSort={tri}
            currentOrder={ordre}
            basePath="/tablatures"
            searchParams={sp}
          />
        </Container>
      </div>
    </main>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

interface HeroStat {
  value: string | number;
  label: string;
}

function PageHero({
  eyebrow,
  heading,
  description,
  stats,
}: {
  eyebrow:     string;
  heading:     string;
  description: string;
  stats:       HeroStat[];
}) {
  return (
    <section
      className="relative overflow-hidden bg-[#03045E] py-16 md:py-24"
      aria-label={heading}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-[#0077B6]/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
            {eyebrow}
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
            {heading}
          </h1>
          <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-xl">
            {description}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-4 pt-8 border-t border-white/10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display font-bold text-2xl text-white leading-none mb-0.5">
                  {s.value}
                </p>
                <p className="text-[11px] text-white/45 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function buildSp(raw: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => entry[1] !== undefined)
  );
}
