import type { Metadata } from "next";
import Link from "next/link";

import { Section }                  from "@/components/ui/Section";
import { Container }                from "@/components/ui/Container";
import { Button, ButtonGroup }      from "@/components/ui/Button";
import { ContentCard, FeatureCard } from "@/components/ui/Card";
import {
  getFeaturedContent,
  getAllCours,
  getAllBlogPosts,
} from "@/lib/getContent";
import { siteConfig } from "@/lib/config";
import NewsletterForm from "@/components/features/NewsletterForm";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `${siteConfig.name} — Apprenez la guitare`,
  description: siteConfig.description,
  openGraph: {
    type:        "website",
    title:       `${siteConfig.name} — Apprenez la guitare`,
    description: siteConfig.description,
    url:         siteConfig.url,
    siteName:    siteConfig.name,
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${siteConfig.name} — Apprenez la guitare`,
    description: siteConfig.description,
  },
};

// ─── Static constants ─────────────────────────────────────────────────────────

const STATS = [
  { value: "1 000+",  label: "Élèves formés" },
  { value: "50+",     label: "Cours disponibles" },
  { value: "200+",    label: "Tablatures" },
  { value: "15 ans",  label: "D'expérience" },
] as const;

const QUICK_NAV = [
  {
    title:       "Méthodes",
    description: "Programmes structurés sur plusieurs semaines pour progresser méthodiquement, du débutant à l'avancé.",
    href:        "/methodes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    title:       "Cours vidéo",
    description: "Leçons ciblées sur des techniques précises : accords, gammes, styles et morceaux.",
    href:        "/cours",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    title:       "Tablatures",
    description: "Des centaines de partitions classées par style et niveau pour jouer vos morceaux préférés.",
    href:        "/tablatures",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    title:       "Blog & Conseils",
    description: "Articles, guides pratiques et actualités pour avancer plus intelligemment dans votre apprentissage.",
    href:        "/blog",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
] as const;

const COACHING_PERKS = [
  "Diagnostic de niveau offert",
  "Programme 100% personnalisé",
  "Feedback vidéo sous 48h",
  "Séances flexibles en ligne",
] as const;

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function HomePage() {
  const methodes   = getFeaturedContent("methodes", 3);
  const coursFree  = getAllCours().filter((c) => c.gratuit !== false).slice(0, 3);
  const articles   = getAllBlogPosts().slice(0, 3);

  return (
    <main>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. Navigation rapide ────────────────────────────────────────── */}
      <Section
        eyebrow="Explorer"
        title="Tout ce qu'il vous faut pour progresser"
        subtitle="Méthodes progressives, cours vidéo, tablatures et articles — au même endroit, à votre rythme."
        bg="neutral"
        align="center"
        id="explorer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_NAV.map((item) => (
            <FeatureCard
              key={item.href}
              icon={item.icon}
              title={item.title}
              description={item.description}
              href={item.href}
            />
          ))}
        </div>
      </Section>

      {/* ── 3. Méthodes populaires ──────────────────────────────────────── */}
      {methodes.length > 0 && (
        <Section
          eyebrow="Programmes complets"
          title="Méthodes les plus populaires"
          subtitle="Des parcours pédagogiques construits étape par étape — du premier accord au jeu avancé."
          action={{ label: "Toutes les méthodes", href: "/methodes" }}
          bg="white"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {methodes.map((item) => (
              <ContentCard key={item.slug} item={item} />
            ))}
          </div>
        </Section>
      )}

      {/* ── 4. Cours gratuits ───────────────────────────────────────────── */}
      {coursFree.length > 0 && (
        <Section
          eyebrow="Accès libre"
          title="Commencez gratuitement"
          subtitle="Aucun compte requis. Aucune carte bancaire. Apprenez dès maintenant."
          action={{ label: "Voir tous les cours", href: "/cours" }}
          bg="neutral"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursFree.map((item) => (
              <ContentCard key={item.slug} item={item} />
            ))}
          </div>
        </Section>
      )}

      {/* ── 5. Articles récents ─────────────────────────────────────────── */}
      {articles.length > 0 && (
        <Section
          eyebrow="Blog"
          title="Conseils & inspirations"
          subtitle="Des articles pratiques pour progresser plus vite et plus intelligemment."
          action={{ label: "Lire le blog", href: "/blog" }}
          bg="white"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <ContentCard key={item.slug} item={item} />
            ))}
          </div>
        </Section>
      )}

      {/* ── 6. Coaching ─────────────────────────────────────────────────── */}
      <CoachingSection />

      {/* ── 7. Newsletter ───────────────────────────────────────────────── */}
      <NewsletterSection />

    </main>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      aria-label="Introduction"
      className="relative overflow-hidden bg-[#03045E] min-h-[92vh] flex flex-col justify-center"
    >
      {/* ── Decorative background ── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        {/* Ambient glow — top right */}
        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-[#0077B6]/20 blur-[110px]" />
        {/* Ambient glow — bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[540px] h-[540px] rounded-full bg-[#02023F]/70 blur-[90px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        {/* Large faded guitar icon — decorative */}
        <svg
          className="absolute right-[4%] top-1/2 -translate-y-1/2 opacity-[0.04] hidden xl:block"
          width="560"
          height="560"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {/* ── Content ── */}
      <Container className="relative z-10 py-24 md:py-32">
        <div className="max-w-3xl">

          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-white/75 mb-9">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse" aria-hidden />
            Nouvelle méthode disponible — Blues 12 semaines
            <Link
              href="/methodes/blues-guitare-12-semaines"
              className="font-semibold text-white hover:underline underline-offset-2 ml-1 transition-opacity hover:opacity-90"
            >
              Découvrir →
            </Link>
          </div>

          {/* H1 */}
          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-[4.5rem] leading-[1.05] tracking-tight text-balance text-white mb-6">
            Apprenez la guitare{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8]">
                à votre rythme
              </span>
              {/* Underline accent */}
              <span
                aria-hidden
                className="absolute left-0 -bottom-0.5 w-full h-[3px] rounded-full bg-gradient-to-r from-[#90E0EF]/50 to-[#CAF0F8]/20"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/65 leading-relaxed text-balance mb-10 max-w-xl">
            Méthodes progressives, cours vidéo, tablatures et articles — tout le
            contenu pour passer du débutant au confirmé, au rythme qui vous convient.
          </p>

          {/* CTAs */}
          <ButtonGroup className="gap-3">
            <Button href="/methodes" variant="white" size="xl">
              Commencer gratuitement
            </Button>
            <Button href="#explorer" variant="outline-white" size="xl">
              Explorer le contenu
            </Button>
          </ButtonGroup>

          {/* Stats row */}
          <div className="mt-14 pt-10 border-t border-white/10 flex flex-wrap gap-x-10 gap-y-5">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display font-bold text-2xl md:text-3xl text-white leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-[11px] text-white/45 uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#03045E]/70 to-transparent pointer-events-none"
      />
    </section>
  );
}

// ─── Coaching ─────────────────────────────────────────────────────────────────

function CoachingSection() {
  return (
    <section
      aria-labelledby="coaching-heading"
      className="relative overflow-hidden py-24 md:py-32 bg-[#02023F]"
    >
      {/* Background glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#0077B6]/10 blur-[130px]" />
      </div>

      <Container size="md" className="relative z-10 text-center">

        {/* Eyebrow */}
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/35 mb-6">
          Coaching personnalisé
        </p>

        {/* Title */}
        <h2
          id="coaching-heading"
          className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight text-balance mb-6"
        >
          Vous progressez seul —{" "}
          <span className="text-[#90E0EF]">
            mais voulez aller plus loin ?
          </span>
        </h2>

        {/* Description */}
        <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-10">
          Séances individuelles, feedback sur vos vidéos, programme sur mesure.
          Avancez 3&times; plus vite avec un accompagnement entièrement dédié.
        </p>

        {/* Perks */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {COACHING_PERKS.map((perk) => (
            <span
              key={perk}
              className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-4 py-2 text-sm text-white/65"
            >
              <span aria-hidden className="text-[#90E0EF] font-bold text-xs">✓</span>
              {perk}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <ButtonGroup className="justify-center gap-4">
          <Button
            href={siteConfig.social.youtube ?? "#"}
            variant="white"
            size="xl"
            external
            leftIcon={<YoutubeIcon />}
          >
            Voir ma chaîne YouTube
          </Button>
          <Button href="/blog" variant="outline-white" size="xl">
            Lire les conseils
          </Button>
        </ButtonGroup>

        {/* Social proof */}
        <p className="mt-10 text-xs text-white/30 tracking-wide">
          Disponible sur YouTube · Instagram · TikTok · Facebook
        </p>
      </Container>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-gradient-to-br from-primary to-[#020252] py-20 md:py-28"
    >
      {/* Ambient glows */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-[#0077B6]/12 blur-[100px]" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-[#02023F]/50 blur-[80px]" />
      </div>

      <Container size="sm" className="relative z-10 text-center">

        {/* Eyebrow */}
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/35 mb-5">
          Newsletter gratuite
        </p>

        {/* Title */}
        <h2
          id="newsletter-heading"
          className="font-display font-bold text-3xl md:text-4xl text-white leading-tight text-balance mb-4"
        >
          Un conseil guitare par semaine,{" "}
          <span className="text-[#90E0EF]">
            directement dans votre boîte
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Rejoignez 2&nbsp;000+ guitaristes qui reçoivent chaque semaine une
          astuce, un lick ou un conseil à mettre en pratique.
        </p>

        {/* Form (client component) */}
        <div className="flex justify-center">
          <NewsletterForm />
        </div>

        {/* Trust line */}
        <p className="mt-5 text-[11px] text-white/30 tracking-wide">
          Aucun spam. Désabonnement en 1 clic. Données 100% privées.
        </p>
      </Container>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
