import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header }          from "@/components/layout/Header";
import { Footer }          from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel }   from "@/components/analytics/FacebookPixel";
import { siteConfig }      from "@/lib/config";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-sans",
  display:  "swap",
  preload:  true,
});

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-display",
  display:  "swap",
  preload:  true,
  weight:   ["400", "600", "700", "800"],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a URL for the dynamic OG image generator. */
function ogImageUrl(title: string, description?: string): string {
  const params = new URLSearchParams({ title });
  if (description) params.set("description", description.slice(0, 110));
  return `/api/og?${params.toString()}`;
}

const DEFAULT_TITLE       = `${siteConfig.name} — Guitare & Musique`;
const DEFAULT_DESCRIPTION = siteConfig.description;

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#03045E" },
    { media: "(prefers-color-scheme: dark)",  color: "#03045E" },
  ],
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Global Metadata ──────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  // ── Title template ────────────────────────────────────────────────────────
  title: {
    default:  DEFAULT_TITLE,
    template: `%s | ${siteConfig.name}`,
  },

  // ── Core ──────────────────────────────────────────────────────────────────
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "guitare",
    "cours de guitare",
    "apprendre la guitare",
    "tablatures guitare",
    "méthodes guitare",
    "fingerpicking",
    "blues guitare",
    "guitare débutant",
    "guitare intermédiaire",
    "gamme pentatonique",
    "Salomon Boris",
    "guitare en ligne",
  ],
  authors:    [{ name: siteConfig.author, url: siteConfig.url }],
  creator:    siteConfig.author,
  publisher:  siteConfig.author,

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type:        "website",
    locale:      "fr_FR",
    url:         siteConfig.url,
    siteName:    siteConfig.name,
    title:       DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url:    ogImageUrl(DEFAULT_TITLE, DEFAULT_DESCRIPTION),
        width:  1200,
        height: 630,
        alt:    DEFAULT_TITLE,
        type:   "image/png",
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: ogImageUrl(DEFAULT_TITLE, DEFAULT_DESCRIPTION),
        alt: DEFAULT_TITLE,
      },
    ],
    // Add @username if available: creator: "@salomonboris",
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg",    type: "image/svg+xml" },
    ],
    apple:      "/apple-touch-icon.png",
    shortcut:   "/favicon.ico",
  },

  // ── Manifest ──────────────────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:                true,
      follow:               true,
      "max-video-preview":  -1,
      "max-image-preview":  "large",
      "max-snippet":        -1,
    },
  },

  // ── Canonical + hreflang ─────────────────────────────────────────────────
  alternates: {
    canonical:  siteConfig.url,
    languages:  { "fr-FR": siteConfig.url },
  },

  // ── Verification ─────────────────────────────────────────────────────────
  // Uncomment and fill in when accounts are verified:
  // verification: {
  //   google: "GOOGLE_VERIFICATION_TOKEN",
  //   yandex: "YANDEX_VERIFICATION_TOKEN",
  // },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

/**
 * WebSite schema — enables Google Sitelinks Search Box.
 * https://schema.org/WebSite
 */
const SCHEMA_WEBSITE = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  "@id":      `${siteConfig.url}/#website`,
  name:        siteConfig.name,
  url:         siteConfig.url,
  description: DEFAULT_DESCRIPTION,
  inLanguage:  "fr-FR",
  potentialAction: {
    "@type":      "SearchAction",
    target: {
      "@type":       "EntryPoint",
      urlTemplate:   `${siteConfig.url}/recherche?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * Person schema — rich result for the author / creator.
 * https://schema.org/Person
 */
const SCHEMA_PERSON = {
  "@context":   "https://schema.org",
  "@type":      "Person",
  "@id":        `${siteConfig.url}/#person`,
  name:          siteConfig.author,
  url:           siteConfig.url,
  description:  "Guitariste professionnel, enseignant et créateur de contenus pédagogiques sur la guitare.",
  image:         `${siteConfig.url}/images/authors/salomon-boris.jpg`,
  jobTitle:      "Guitariste & Professeur de guitare",
  knowsAbout:   ["Guitare acoustique", "Guitare électrique", "Blues", "Fingerpicking", "Pédagogie musicale"],
  sameAs: [
    siteConfig.social.youtube,
    siteConfig.social.instagram,
    siteConfig.social.facebook,
    siteConfig.social.tiktok,
  ].filter(Boolean),
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background text-text antialiased">

        {/* ── JSON-LD structured data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_WEBSITE) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_PERSON) }}
        />

        {/* ── Analytics (non-blocking, après hydratation) ── */}
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>

        {/* ── Shell ── */}
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />

      </body>
    </html>
  );
}
