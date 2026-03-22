import type { Metadata } from "next";
import { notFound }       from "next/navigation";
import Image              from "next/image";
import Link               from "next/link";

import {
  getMethodeBySlug,
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
  return getAllSlugs("methodes").map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMethodeBySlug(slug);
  if (!item) return { title: "Méthode introuvable" };

  const ogImage = item.coverImage
    ? absoluteUrl(item.coverImage)
    : buildOgImageUrl(item.title, item.description);

  return {
    title: item.title,
    description: item.description,
    keywords: item.tags,

    openGraph: {
      title:         item.title,
      description:   item.description,
      type:          "article",
      url:           absoluteUrl(`/methodes/${slug}`),
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
      canonical: absoluteUrl(`/methodes/${slug}`),
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function MethodeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item     = await getMethodeBySlug(slug);
  if (!item) notFound();

  const related = getRelatedContent(item, 3);

  // ── JSON-LD : Course ──
  const jsonLd = {
    "@context":      "https://schema.org",
    "@type":         "Course",
    name:            item.title,
    description:     item.description,
    url:             absoluteUrl(`/methodes/${slug}`),
    datePublished:   item.date,
    dateModified:    item.updatedAt ?? item.date,
    inLanguage:      "fr",
    isAccessibleForFree: item.gratuit,
    image:           item.coverImage ? absoluteUrl(item.coverImage) : undefined,
    provider: {
      "@type": "Person",
      name:    item.author ?? "Salomon Boris",
      url:     absoluteUrl("/"),
    },
    ...(item.niveau && {
      educationalLevel: item.niveau,
    }),
    ...(item.tags?.length && {
      keywords: item.tags.join(", "),
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

            {/* Breadcrumb */}
            <Breadcrumb
              theme="dark"
              crumbs={[
                { label: "Accueil", href: "/" },
                { label: "Méthodes", href: "/methodes" },
                { label: item.title },
              ]}
            />

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="light">Méthode</Badge>
              {item.niveau && <Badge niveau={item.niveau as NiveauType} />}
              {item.gratuit === false && item.price && (
                <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Premium · {item.price}€
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-[3.25rem] font-bold leading-tight text-balance">
              {item.title}
            </h1>

            {/* Description */}
            <p className="text-white/70 text-lg leading-relaxed">
              {item.description}
            </p>

            {/* Meta row */}
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

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/methodes?tag=${encodeURIComponent(tag)}`}
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

          {/* Article */}
          <article>
            {/* YouTube embed (prioritaire sur l'image) */}
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

            {/* Prose content */}
            <ProseBody html={item.content} />

            {/* CTA de fin d'article */}
            <div className="mt-12 p-6 bg-background-neutral rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-text">Prêt à passer à l&apos;étape suivante ?</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  Accédez aux cours vidéo associés à cette méthode.
                </p>
              </div>
              <Button href="/cours" variant="primary" className="shrink-0">
                Explorer les cours
              </Button>
            </div>
          </article>

          {/* Sidebar */}
          <InfoSidebar
            heading="Cette méthode en bref"
            rows={sidebarRows}
            tags={item.tags}
            tagHref="/methodes"
            cta={{ label: "Voir tous les cours", href: "/cours" }}
            ctaSecondary={{ label: "← Retour aux méthodes", href: "/methodes" }}
          />
        </div>
      </Container>

      {/* ── Related ──────────────────────────────────────────── */}
      <RelatedSection
        items={related}
        eyebrow="Méthodes"
        title="Méthodes similaires"
      />
    </>
  );
}
