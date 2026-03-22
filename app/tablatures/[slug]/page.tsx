import type { Metadata } from "next";
import { notFound }       from "next/navigation";
import Link               from "next/link";

import {
  getTabBySlug,
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
  gratuitRow,
  dateRow,
} from "@/components/content/InfoSidebar";
import { RelatedSection } from "@/components/content/RelatedSection";

import type { NiveauType } from "@/lib/types";

// ─── Static params ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllSlugs("tablatures").map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item     = await getTabBySlug(slug);
  if (!item) return { title: "Tablature introuvable" };

  const ogImage = buildOgImageUrl(`Tablature : ${item.title}`, item.description);

  return {
    title:       `Tablature : ${item.title}`,
    description: item.description,
    keywords:    ["tablature guitare", item.title, ...(item.tags ?? [])],

    openGraph: {
      title:         `Tablature : ${item.title}`,
      description:   item.description,
      type:          "article",
      url:           absoluteUrl(`/tablatures/${slug}`),
      publishedTime: item.date,
      authors:       [item.author ?? "Salomon Boris"],
      tags:          item.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.title }],
    },

    twitter: {
      card:        "summary_large_image",
      title:       `Tablature : ${item.title}`,
      description: item.description,
      images:      [ogImage],
    },

    alternates: {
      canonical: absoluteUrl(`/tablatures/${slug}`),
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function TablatureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item     = await getTabBySlug(slug);
  if (!item) notFound();

  const related = getRelatedContent(item, 3);

  // ── JSON-LD : MusicComposition ──
  const jsonLd = {
    "@context":  "https://schema.org",
    "@type":     "MusicComposition",
    name:        item.title,
    description: item.description,
    url:         absoluteUrl(`/tablatures/${slug}`),
    datePublished: item.date,
    inLanguage:  "fr",
    isAccessibleForFree: item.gratuit,
    ...(item.tags?.length && {
      genre: item.tags[0],
      keywords: item.tags.join(", "),
    }),
    composer: {
      "@type": "Person",
      name:    item.author ?? "Salomon Boris",
    },
    ...(item.youtube && {
      associatedMedia: {
        "@type":     "VideoObject",
        name:        `Démonstration : ${item.title}`,
        embedUrl:    `https://www.youtube-nocookie.com/embed/${item.youtube}`,
        thumbnailUrl:`https://img.youtube.com/vi/${item.youtube}/maxresdefault.jpg`,
        uploadDate:  item.date,
      },
    }),
  };

  // ── Sidebar rows ──
  const sidebarRows = [
    niveauRow(item.niveau as NiveauType | undefined),
    { label: "Type", value: "Tablature guitare" },
    gratuitRow(item.gratuit, item.price ?? undefined),
    dateRow(item.date),
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  // ── Artiste extrait des tags si présent ──
  const artistTag = item.tags?.find(
    (t) => !["arpèges", "solo", "fingerpicking", "capodastre", "barré", "rock", "blues", "pop-rock"].includes(t)
  );

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
                { label: "Accueil",    href: "/" },
                { label: "Tablatures", href: "/tablatures" },
                { label: item.title },
              ]}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="light">Tablature</Badge>
              {item.niveau && <Badge niveau={item.niveau as NiveauType} />}
              {item.gratuit === false && item.price && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Premium · {item.price}€
                </span>
              )}
              {item.youtube && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Démo vidéo
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
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              {artistTag && (
                <>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{artistTag}</span>
                </>
              )}
            </div>

            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tablatures?tag=${encodeURIComponent(tag)}`}
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
        <div className="grid lg:grid-cols-[1fr_260px] gap-12 xl:gap-16 items-start">

          <article>
            {/* Démo vidéo */}
            {item.youtube && (
              <YoutubeEmbed
                videoId={item.youtube}
                title={`Démo : ${item.title}`}
                className="mb-10"
              />
            )}

            {/* Notice tablature */}
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl mb-8 text-sm">
              <span className="text-primary text-lg shrink-0">🎸</span>
              <p className="text-text-secondary leading-relaxed">
                Les blocs de code ci-dessous sont en notation ASCII standard.
                Chaque ligne représente une corde de guitare (e = mi aigu, E = mi grave).
                Les chiffres indiquent la case à fretter.
              </p>
            </div>

            {/* Contenu tablature — police mono activée */}
            <ProseBody html={item.content} mono />

            {/* CTA cours vidéo */}
            <div className="mt-12 p-6 bg-background-neutral rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-text mb-1">
                  Besoin d&apos;un cours pour ce morceau ?
                </p>
                <p className="text-sm text-text-secondary">
                  Retrouvez les tutoriels vidéo associés dans la section cours.
                </p>
              </div>
              <Button href="/cours" variant="primary" className="shrink-0">
                Voir les cours vidéo
              </Button>
            </div>
          </article>

          <InfoSidebar
            heading="Infos tablature"
            rows={sidebarRows}
            tags={item.tags}
            tagHref="/tablatures"
            cta={{ label: "Trouver le cours vidéo", href: "/cours" }}
            ctaSecondary={{ label: "← Toutes les tablatures", href: "/tablatures" }}
          />
        </div>
      </Container>

      <RelatedSection
        items={related}
        eyebrow="Tablatures"
        title="Tablatures similaires"
      />
    </>
  );
}
