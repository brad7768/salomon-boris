import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/features/SearchBar";
import { SearchResults } from "@/components/features/SearchResults";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title:       `Recherche — ${siteConfig.name}`,
  description: "Recherchez parmi tous les cours, méthodes, tablatures et articles de Salomon Boris.",
  robots:      { index: false },
};

// ─── Category filter tabs ─────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Tout",        value: "" },
  { label: "Méthodes",    value: "methodes" },
  { label: "Cours",       value: "cours" },
  { label: "Tablatures",  value: "tablatures" },
  { label: "Blog",        value: "blog" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const params   = await searchParams;
  const query    = params.q        ?? "";
  const category = params.categorie ?? "";
  const niveau   = params.niveau;

  return (
    <main>
      {/* ── Hero ── */}
      <section
        aria-label="Recherche"
        className="relative overflow-hidden bg-[#03045E] py-14 md:py-20"
      >
        {/* Decorative glow */}
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

        <Container size="md" className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
            Recherche
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
            Trouvez ce que vous cherchez
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-lg">
            Méthodes, cours vidéo, tablatures et articles — tout le contenu du site en un seul endroit.
          </p>

          {/* Search bar */}
          <SearchBar
            defaultValue={query}
            autoFocus={!query}
            className="max-w-xl"
          />
        </Container>
      </section>

      {/* ── Results area ── */}
      <div className="bg-background-neutral min-h-[60vh]">
        <Container size="md" className="py-10 md:py-14">

          {/* Category filter tabs */}
          <div
            role="group"
            aria-label="Filtrer par catégorie"
            className="flex flex-wrap gap-2 mb-8"
          >
            {CATEGORIES.map((opt) => {
              const isActive = category === opt.value;
              const sp = new URLSearchParams();
              if (query)     sp.set("q",         query);
              if (opt.value) sp.set("categorie",  opt.value);
              const href = `/recherche?${sp.toString()}`;

              return (
                <a
                  key={opt.value}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "inline-flex items-center text-sm px-4 py-1.5 rounded-full border font-medium transition-all",
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-text-secondary border-background-neutral hover:border-primary/40 hover:text-primary",
                  ].join(" ")}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>

          {/* Results */}
          <Suspense fallback={<ResultsSkeleton />}>
            <SearchResults query={query} category={category || undefined} niveau={niveau} />
          </Suspense>
        </Container>
      </div>
    </main>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-background-neutral">
          <div className="h-3 w-20 bg-background-neutral rounded mb-3" />
          <div className="h-4 w-2/3 bg-background-neutral rounded mb-2" />
          <div className="h-3 w-full bg-background-neutral rounded mb-1" />
          <div className="h-3 w-4/5 bg-background-neutral rounded" />
        </div>
      ))}
    </div>
  );
}
