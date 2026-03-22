import type { SiteConfig, NavItem } from "./types";

export const siteConfig: SiteConfig = {
  name: "Salomon Boris",
  description:
    "Apprenez la guitare avec Salomon Boris — méthodes, cours, tablatures et tutoriels pour tous niveaux.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://salomonboris.com",
  ogImage: "/og-default.jpg",
  author: "Salomon Boris",
  social: {
    youtube: "https://youtube.com/@salomonboris",
    instagram: "https://instagram.com/salomonboris",
    facebook: "https://facebook.com/salomonboris",
    tiktok: "https://tiktok.com/@salomonboris",
  },
};

export const navItems: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Apprendre",
    href: "#",
    children: [
      { label: "Méthodes", href: "/methodes" },
      { label: "Cours", href: "/cours" },
      { label: "Tablatures", href: "/tablatures" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Recherche", href: "/recherche" },
];

export const ITEMS_PER_PAGE = 9;

export const NIVEAU_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
  tous: "Tous niveaux",
};

export const CATEGORY_LABELS: Record<string, string> = {
  methodes: "Méthodes",
  cours: "Cours",
  tablatures: "Tablatures",
  blog: "Blog",
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  methodes: "Programmes pédagogiques complets pour progresser efficacement.",
  cours: "Leçons individuelles sur des techniques et styles de guitare.",
  tablatures: "Partitions et tablatures de morceaux à travailler.",
  blog: "Articles, conseils et actualités du monde de la guitare.",
};

/** Labels affichés pour chaque genre musical (style). */
export const STYLE_LABELS: Record<string, string> = {
  blues:       "Blues",
  rock:        "Rock",
  "pop-rock":  "Pop Rock",
  pop:         "Pop",
  acoustique:  "Acoustique",
  classique:   "Classique",
  jazz:        "Jazz",
  folk:        "Folk",
  metal:       "Metal",
  flamenco:    "Flamenco",
  fingerstyle: "Fingerstyle",
  country:     "Country",
  reggae:      "Reggae",
  soul:        "Soul",
  funk:        "Funk",
  theorie:     "Théorie",
  conseils:    "Conseils",
};

/** Métadonnées visuelles des pages de catégories. */
export const CATEGORY_META: Record<
  string,
  { eyebrow: string; heading: string; description: string }
> = {
  methodes: {
    eyebrow:     "Programmes complets",
    heading:     "Méthodes de guitare",
    description: "Des parcours pédagogiques structurés semaine par semaine pour progresser du débutant à l'avancé.",
  },
  cours: {
    eyebrow:     "Leçons ciblées",
    heading:     "Cours de guitare",
    description: "Des cours vidéo sur des techniques, styles et morceaux précis — apprenez exactement ce dont vous avez besoin.",
  },
  tablatures: {
    eyebrow:     "Partitions & tablatures",
    heading:     "Tablatures de guitare",
    description: "Des centaines de morceaux transcrits et classés par style et niveau, prêts à être appris.",
  },
  blog: {
    eyebrow:     "Articles & conseils",
    heading:     "Blog guitare",
    description: "Conseils pratiques, guides et analyses pour progresser plus intelligemment et plus vite.",
  },
};
