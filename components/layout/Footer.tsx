import Link from "next/link";
import { siteConfig } from "@/lib/config";

// ─── Data ────────────────────────────────────────────────────────────────────

const FOOTER_NAV: { group: string; links: { label: string; href: string }[] }[] = [
  {
    group: "Apprendre",
    links: [
      { label: "Méthodes", href: "/methodes" },
      { label: "Cours", href: "/cours" },
      { label: "Tablatures", href: "/tablatures" },
    ],
  },
  {
    group: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Recherche", href: "/recherche" },
    ],
  },
  {
    group: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

// ─── Social icons (inline SVG — zéro dépendance) ─────────────────────────────

type SocialPlatform = "youtube" | "instagram" | "facebook" | "tiktok";

const SOCIAL_META: Record<SocialPlatform, { label: string; icon: React.ReactNode }> = {
  youtube: {
    label: "YouTube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.8 15.5V8.5l6.2 3.5-6.2 3.5Z" />
      </svg>
    ),
  },
  instagram: {
    label: "Instagram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.2.1 4.7 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.2 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.3 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2ZM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.3 2.6 6.7 7 6.9C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0Zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9Z" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3H15.8c-1.5 0-1.9.9-1.9 1.9v2.2h3.3l-.5 3.5h-2.8V24C19.6 23 24 18.1 24 12.1Z" />
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.5 0c1.3 0 2.6 0 3.9-.1.1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4 0-2.9-.3-4.2-1-.6-.3-1.1-.6-1.6-.9 0 2.9 0 5.8 0 8.7-.1 1.4-.5 2.8-1.4 3.9-1.3 1.9-3.6 3.2-5.9 3.2-1.4.1-2.9-.3-4.1-1C3 21.7 1.6 19.5 1.4 17.2c0-.5 0-1 0-1.5.2-1.9 1.1-3.7 2.6-5 1.7-1.4 4-2.1 6.2-1.7 0 1.5 0 3 0 4.4-1-.3-2.1-.2-3 .4-.6.4-1.1 1-1.4 1.7-.2.5-.1 1.1-.1 1.6.2 1.6 1.8 3 3.5 2.9 1.1 0 2.2-.7 2.8-1.6.2-.3.4-.7.4-1.1.1-1.8.1-3.6.1-5.4V0Z" />
      </svg>
    ),
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#02023F] text-white" aria-label="Pied de page">

      {/* ── Top divider band ── */}
      <div className="h-1 bg-gradient-to-r from-primary via-white/20 to-primary opacity-30" />

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 md:gap-8">

          {/* ── Brand column ── */}
          <div className="space-y-5">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Salomon Boris — Accueil"
              className="inline-flex items-center gap-2.5 group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-white text-lg transition-colors group-hover:bg-white/20">
                🎸
              </span>
              <span className="font-display font-bold text-xl tracking-tight">
                {siteConfig.name}
              </span>
            </Link>

            {/* Description */}
            <p className="text-white/55 text-sm leading-relaxed max-w-[260px]">
              {siteConfig.description}
            </p>

            {/* Socials */}
            <div>
              <p className="text-white/35 text-xs uppercase tracking-widest mb-3 font-medium">
                Suivre
              </p>
              <div className="flex items-center gap-2">
                {(Object.entries(siteConfig.social) as [SocialPlatform, string][]).map(
                  ([platform, url]) => {
                    const meta = SOCIAL_META[platform];
                    if (!url || !meta) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={meta.label}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 text-white/60 hover:bg-white/15 hover:text-white transition-all duration-200"
                      >
                        {meta.icon}
                      </a>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* ── Link columns ── */}
          {FOOTER_NAV.map(({ group, links }) => (
            <div key={group}>
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/35 text-xs">
              © {year} {siteConfig.name}. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-white/35 text-xs">
              <span className="flex items-center gap-1.5">
                <NoteIcon />
                Fait avec passion pour les guitaristes
              </span>
              <span aria-hidden>·</span>
              <a
                href={siteConfig.social.youtube ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                YouTube
              </a>
              <span aria-hidden>·</span>
              <span>
                Site par{" "}
                <a
                  href="https://edgewebz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/55 hover:text-white transition-colors"
                >
                  Edgewebz.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Micro icons ─────────────────────────────────────────────────────────────

function NoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9Z" />
    </svg>
  );
}
