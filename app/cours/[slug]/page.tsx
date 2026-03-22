import type { Metadata } from "next";
import { notFound }       from "next/navigation";
import Image              from "next/image";
import Link               from "next/link";

import {
  getCoursBySlug,
  getAllSlugs,
  getRelatedContent,
} from "@/lib/getContent";
import { formatDate, absoluteUrl, buildOgImageUrl } from "@/lib/utils";

import { Badge }          from "@/components/ui/Badge";
import { Button }         from "@/components/ui/Button";
import { Container }      from "@/components/ui/Container";
import { Breadcrumb }     from "@/components/content/Breadcrumb";
import { YoutubeEmbed }   from "@/components/content/YoutubeEmbed";
import { ProseBody }      from "@/components/content/ProseBody";
import {
  InfoSidebar,
  niveauRow,
  readingTimeRow,
  gratuitRow,
  dateRow,
  updatedAtRow,
} from "@/components/content/InfoSidebar";
import { RelatedSection } from "@/components/content/RelatedSection";

import type { NiveauType } from "@/lib/types";

// ─── Static params ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllSlugs("cours").map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item     = await getCoursBySlug(slug);
  if (!item) return { title: "Cours introuvable" };

  const ogImage = item.coverImage
    ? absoluteUrl(item.coverImage)
    : buildOgImageUrl(item.title, item.description);

  return {
    title:       item.title,
    description: item.description,
    keywords:    item.tags,

    openGraph: {
      title:         item.title,
      description:   item.description,
      type:          "article",
      url:           absoluteUrl(`/cours/${slug}`),
      publishedTime: item.date,
      modifiedTime:  item.updatedAt ?? item.date,
      authors:       [item.author ?? "Salomon Boris"],
      tags:          item.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.title }],
    },

    twitter: {
      card:        "summary_large_image",
      title:       item.title,
      description: item.description,
      images:      [ogImage],
    },

    alternates: {
      canonical: absoluteUrl(`/cours/${slug}`),
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CoursDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item     = await getCoursBySlug(slug);
  if (!item) notFound();

  const related = getRelatedContent(item, 3);

  // ── JSON-LD : LearningResource ──
  const jsonLd = {
    "@context":    "https://schema.org",
    "@type":       "LearningResource",
    name:          item.title,
    description:   item.description,
    url:           absoluteUrl(`/cours/${slug}`),
    datePublished: item.date,
    dateModified:  item.updatedAt ?? item.date,
    inLanguage:    "fr",
    isAccessibleForFree: item.gratuit,
    image:         item.coverImage ? absoluteUrl(item.coverImage) : undefined,
    author: {
      "@type": "Person",
      name:    item.author ?? "Salomon Boris",
      url:     absoluteUrl("/"),
    },
    ...(item.niveau && { educationalLevel: item.niveau }),
    ...(item.tags?.length && { keywords: item.tags.join(", ") }),
    ...(item.youtube && {
      video: {
        "@type":        "VideoObject",
        name:           item.title,
        description:    item.description,
        embedUrl:       `https://www.youtube-nocookie.com/embed/${item.youtube}`,
        thumbnailUrl:   `https://img.youtube.com/vi/${item.youtube}/maxresdefault.jpg`,
        uploadDate:     item.date,
      },
    }),
  };

  // ── Sidebar rows ──
  const sidebarRows = [
    niveauRow(item.niveau as NiveauType | undefined),
    readingTimeRow(item.readingTime),
    gratuitRow(item.gratuit, item.price ?? undefined),
    dateRow(item.date),
    updatedAtRow(item.updatedAt),
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary to-[#020252] text-white">
        <Container size="lg" className="py-14 md:py-20">
          <div className="max-w-3xl space-y-5">

            <Breadcrumb
              theme="dark"
              crumbs={[
                { label: "Accueil", href: "/" },
                { label: "Cours", href: "/cours" },
                { label: item.title },
              ]}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="light">Cours</Badge>
              {item.niveau && <Badge niveau={item.niveau as NiveauType} />}
              {item.youtube && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Vidéo
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-[3.25rem] font-bold leading-tight text-balance">
              {item.title}
            </h1>

            <p className="text-white/70 text-lg leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/55">
              <span className="font-medium text-white/75">
                {item.author ?? "Salomon Boris"}
              </span>
              <span aria-hidden>·</span>
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              {item.readingTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{item.readingTime} min de lecture</span>
                </>
              )}
            </div>

            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/cours?tag=${encodeURIComponent(tag)}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-2.5 py-0.5 rounded-full border border-white/15 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <Container size="lg" className="py-14">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12 xl:gap-16 items-start">

          <article>
            {/* Vidéo YouTube en priorité */}
            {item.youtube && (
              <YoutubeEmbed
                videoId={item.youtube}
                title={item.title}
                className="mb-10"
              />
            )}

            {/* Cover image (si pas de vidéo) */}
            {!item.youtube && item.coverImage && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 780px"
                />
              </div>
            )}

            <ProseBody html={item.content} />

            {/* Footer du cours */}
            <div className="mt-12 border-t border-background-neutral pt-8 flex flex-col sm:flex-row items-start justify-between gap-6">
              <div>
                <p className="font-semibold text-text mb-1">Des tablatures pour ce morceau ?</p>
                <p className="text-sm text-text-secondary">
                  Retrouvez les partitions associées dans la section tablatures.
                </p>
              </div>
              <Button href="/tablatures" variant="outline" className="shrink-0">
                Voir les tablatures
              </Button>
            </div>
          </article>

          <InfoSidebar
            heading="Ce cours en bref"
            rows={sidebarRows}
            tags={item.tags}
            tagHref="/cours"
            cta={{ label: "Toutes les méthodes", href: "/methodes" }}
            ctaSecondary={{ label: "← Retour aux cours", href: "/cours" }}
          />
        </div>
      </Container>

      <RelatedSection
        items={related}
        eyebrow="Cours"
        title="Cours similaires"
      />
    </>
  );
}
