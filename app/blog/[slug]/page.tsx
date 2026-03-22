import type { Metadata } from "next";
import { notFound }       from "next/navigation";
import Image              from "next/image";
import Link               from "next/link";

import {
  getPostBySlug,
  getAllSlugs,
  getRelatedContent,
  getPostsByCategory,
} from "@/lib/getContent";
import { formatDate, absoluteUrl, buildOgImageUrl } from "@/lib/utils";

import { Badge }          from "@/components/ui/Badge";
import { Button }         from "@/components/ui/Button";
import { Container }      from "@/components/ui/Container";
import { Breadcrumb }     from "@/components/content/Breadcrumb";
import { ProseBody }      from "@/components/content/ProseBody";
import { RelatedSection } from "@/components/content/RelatedSection";

// ─── Static params ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllSlugs("blog").map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item     = await getPostBySlug(slug);
  if (!item) return { title: "Article introuvable" };

  const ogImage = item.coverImage
    ? absoluteUrl(item.coverImage)
    : buildOgImageUrl(item.title, item.description);

  return {
    title:       item.title,
    description: item.description,
    keywords:    item.tags,

    // ── Open Graph (article) ──
    openGraph: {
      title:         item.title,
      description:   item.description,
      type:          "article",
      url:           absoluteUrl(`/blog/${slug}`),
      siteName:      "Salomon Boris",
      locale:        "fr_FR",
      publishedTime: item.date,
      modifiedTime:  item.updatedAt ?? item.date,
      authors:       [item.author ?? "Salomon Boris"],
      tags:          item.tags,
      images: [
        {
          url:    ogImage,
          width:  1200,
          height: 630,
          alt:    item.title,
          type:   "image/jpeg",
        },
      ],
    },

    // ── Twitter card ──
    twitter: {
      card:        "summary_large_image",
      title:       item.title,
      description: item.description,
      images:      [{ url: ogImage, alt: item.title }],
    },

    // ── Canonical ──
    alternates: {
      canonical: absoluteUrl(`/blog/${slug}`),
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item     = await getPostBySlug(slug);
  if (!item) notFound();

  const related   = getRelatedContent(item, 3);
  const latestAll = getPostsByCategory("blog", { sortBy: "date", limit: 5 });
  const latest    = latestAll.filter((p) => p.slug !== slug).slice(0, 4);

  // ── JSON-LD : BlogPosting ──
  const jsonLd = {
    "@context":    "https://schema.org",
    "@type":       "BlogPosting",
    headline:      item.title,
    description:   item.description,
    url:           absoluteUrl(`/blog/${slug}`),
    datePublished: item.date,
    dateModified:  item.updatedAt ?? item.date,
    inLanguage:    "fr",
    image:         item.coverImage ? absoluteUrl(item.coverImage) : undefined,
    author: {
      "@type": "Person",
      name:    item.author ?? "Salomon Boris",
      url:     absoluteUrl("/"),
    },
    publisher: {
      "@type": "Person",
      name:    "Salomon Boris",
      url:     absoluteUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":   absoluteUrl(`/blog/${slug}`),
    },
    ...(item.tags?.length && {
      keywords: item.tags.join(", "),
      articleSection: item.tags[0],
    }),
    ...(item.readingTime && {
      timeRequired: `PT${item.readingTime}M`,
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero (fond clair, différent des autres pages) ──── */}
      <div className="bg-white border-b border-background-neutral">
        <Container size="md" className="py-12 md:py-16">
          <div className="space-y-5">

            <Breadcrumb
              theme="light"
              crumbs={[
                { label: "Accueil", href: "/" },
                { label: "Blog",    href: "/blog" },
                { label: item.title },
              ]}
            />

            {/* Category + lecture */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Article</Badge>
              {item.readingTime && (
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                  <ClockIcon />
                  {item.readingTime} min de lecture
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {item.title}
            </h1>

            {/* Description */}
            <p className="text-text-secondary text-xl leading-relaxed">
              {item.description}
            </p>

            {/* Author + date */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Avatar placeholder */}
              <div
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0"
                aria-hidden
              >
                {(item.author ?? "S").charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-text">{item.author ?? "Salomon Boris"}</p>
                <p className="text-text-secondary">
                  <time dateTime={item.date}>{formatDate(item.date, "d MMMM yyyy")}</time>
                  {item.updatedAt && item.updatedAt !== item.date && (
                    <span className="ml-2 text-text-secondary/60">
                      · Mis à jour le {formatDate(item.updatedAt, "d MMMM yyyy")}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs bg-background-neutral text-text-secondary px-2.5 py-0.5 rounded-full border border-background-neutral hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* ── Cover image ──────────────────────────────────────── */}
      {item.coverImage && (
        <div className="bg-background-neutral">
          <Container size="md" className="py-0">
            <div className="relative aspect-[21/9] overflow-hidden">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </Container>
        </div>
      )}

      {/* ── Contenu principal + sidebar récents ──────────────── */}
      <Container size="lg" className="py-14">
        <div className="grid lg:grid-cols-[1fr_260px] gap-12 xl:gap-16 items-start">

          {/* Prose article */}
          <article>
            <ProseBody html={item.content} />

            {/* ── Article footer ── */}
            <footer className="mt-12 pt-8 border-t border-background-neutral space-y-8">

              {/* Tags de bas de page */}
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-text-secondary font-medium">Tags :</span>
                  {item.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-sm bg-background-neutral text-text-secondary px-3 py-1 rounded-full border border-background-neutral hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author box */}
              <div className="flex items-start gap-4 p-6 bg-background-neutral rounded-2xl">
                <div
                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0"
                  aria-hidden
                >
                  {(item.author ?? "S").charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-text">
                    {item.author ?? "Salomon Boris"}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Guitariste professionnel et pédagogue passionné. Je partage
                    méthodes, cours et conseils pour aider les guitaristes de
                    tous niveaux à progresser.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button href="/methodes" variant="ghost" size="sm">
                      Voir les méthodes
                    </Button>
                    <Button href="/cours" variant="ghost" size="sm">
                      Voir les cours
                    </Button>
                  </div>
                </div>
              </div>

              {/* Navigation entre articles */}
              <div className="flex justify-between gap-4">
                <Button href="/blog" variant="outline" size="sm">
                  ← Retour au blog
                </Button>
                <Button href="/recherche" variant="secondary" size="sm">
                  Rechercher un article
                </Button>
              </div>
            </footer>
          </article>

          {/* ── Sidebar — Articles récents ── */}
          {latest.length > 0 && (
            <aside className="sticky top-24 space-y-4">
              <div className="bg-background-neutral rounded-2xl p-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                  Articles récents
                </h2>
                <ul className="space-y-3" role="list">
                  {latest.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block"
                      >
                        <p className="text-sm font-medium text-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatDate(post.date, "d MMM yyyy")}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button href="/blog" variant="outline" size="sm" fullWidth className="justify-center">
                  Tous les articles
                </Button>
              </div>

              {/* CTA cours */}
              <div className="bg-primary rounded-2xl p-5 text-white space-y-3">
                <p className="font-semibold text-sm leading-snug">
                  Prêt à apprendre la guitare ?
                </p>
                <p className="text-white/65 text-xs leading-relaxed">
                  Découvrez les méthodes et cours de Salomon Boris.
                </p>
                <Button href="/methodes" variant="white" size="sm" fullWidth className="justify-center">
                  Voir les méthodes
                </Button>
              </div>
            </aside>
          )}
        </div>
      </Container>

      {/* ── Articles similaires ───────────────────────────────── */}
      <RelatedSection
        items={related}
        eyebrow="Blog"
        title="Articles similaires"
      />
    </>
  );
}

// ─── Micro icon ───────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
