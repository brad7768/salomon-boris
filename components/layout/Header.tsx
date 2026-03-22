"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { navItems, siteConfig } from "@/lib/config";
import type { NavItem } from "@/lib/types";
import { GlobalSearch } from "@/components/features/GlobalSearch";

// ─── Announcement bar ───────────────────────────────────────────────────────

const ANNOUNCEMENT = {
  text: "Nouveau cours disponible — Fingerpicking avancé",
  href: "/cours",
  cta: "Découvrir →",
  storageKey: "announcement-dismissed-v1",
};

function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="banner"
      aria-label="Annonce"
      className="relative bg-primary text-white text-sm py-2.5 px-4 flex items-center justify-center gap-3"
    >
      <p className="text-center leading-snug">
        <span className="text-white/80">{ANNOUNCEMENT.text} — </span>
        <Link
          href={ANNOUNCEMENT.href}
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          {ANNOUNCEMENT.cta}
        </Link>
      </p>
      <button
        onClick={onDismiss}
        aria-label="Fermer l'annonce"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}

// ─── Desktop dropdown ───────────────────────────────────────────────────────

function DesktopDropdown({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.children?.some((c) => pathname.startsWith(c.href));

  return (
    <div className="relative group">
      <button
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "text-primary"
            : "text-text hover:text-primary hover:bg-background-neutral"
        )}
      >
        {item.label}
        <ChevronIcon
          className="opacity-50 transition-transform duration-200 group-hover:rotate-180"
          size={14}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52",
          "bg-white border border-background-neutral rounded-2xl shadow-xl shadow-text/5",
          "opacity-0 invisible translate-y-1 scale-[0.98]",
          "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100",
          "transition-all duration-200 ease-out z-50 origin-top"
        )}
      >
        {/* Arrow */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-background-neutral rotate-45 rounded-sm" />

        <div className="p-1.5 relative">
          {item.children?.map((child) => (
            <DropdownLink key={child.href} item={child} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DropdownLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  const icons: Record<string, string> = {
    "/methodes": "🎸",
    "/cours": "🎵",
    "/tablatures": "📄",
    "/blog": "✍️",
  };

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
        isActive
          ? "bg-primary text-white font-semibold"
          : "text-text hover:bg-background-neutral hover:text-primary"
      )}
    >
      <span className="text-base w-5 text-center">{icons[item.href] ?? "•"}</span>
      <span>{item.label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
      )}
    </Link>
  );
}

// ─── Desktop nav item ────────────────────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

  if (item.children) return <DesktopDropdown item={item} />;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "text-primary"
          : "text-text hover:text-primary hover:bg-background-neutral"
      )}
    >
      {item.label}
      {/* Active dot indicator */}
      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );
}

// ─── Mobile nav ──────────────────────────────────────────────────────────────

function MobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-text/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={cn(
          "md:hidden fixed top-0 right-0 z-50 h-full w-[min(320px,90vw)]",
          "bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header du panel */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-background-neutral">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 font-display font-bold text-primary text-lg"
          >
            <GuitarIcon />
            <span>{siteConfig.name}</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-2 rounded-lg text-text-secondary hover:bg-background-neutral transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isGroupOpen = openGroup === item.label;
            const hasChildren = !!item.children;

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenGroup(isGroupOpen ? null : item.label)}
                    className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-text font-medium hover:bg-background-neutral transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronIcon
                      size={16}
                      className={cn(
                        "text-text-secondary transition-transform duration-200",
                        isGroupOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isGroupOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="mt-1 ml-3 pl-3 border-l-2 border-background-neutral space-y-0.5 pb-1">
                      {item.children?.map((child) => {
                        const isActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-primary text-white font-semibold"
                                : "text-text-secondary hover:text-primary hover:bg-background-neutral"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2.5 rounded-xl font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-text hover:bg-background-neutral hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="p-4 border-t border-background-neutral">
          <Link
            href="/cours"
            onClick={onClose}
            className="block w-full text-center bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Commencer maintenant
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header() {
  const [scrolled,      setScrolled]     = useState(false);
  const [mobileOpen,    setMobileOpen]   = useState(false);
  const [announcement,  setAnnouncement] = useState(false);
  const [searchOpen,    setSearchOpen]   = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(ANNOUNCEMENT.storageKey);
    if (!dismissed) setAnnouncement(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const dismissAnnouncement = useCallback(() => {
    sessionStorage.setItem(ANNOUNCEMENT.storageKey, "1");
    setAnnouncement(false);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openSearch  = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      {/* ── Announcement bar ── */}
      {announcement && <AnnouncementBar onDismiss={dismissAnnouncement} />}

      {/* ── Main header ── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm shadow-text/5 border-b border-background-neutral"
            : "bg-white border-b border-white"
        )}
      >
        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold z-50"
        >
          Aller au contenu
        </a>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[64px] items-center justify-between gap-6">

            {/* ── Logo ── */}
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Accueil`}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-lg transition-transform group-hover:scale-105">
                <GuitarIcon />
              </span>
              <span className="font-display font-bold text-primary text-[1.1rem] hidden sm:block tracking-tight">
                {siteConfig.name}
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav
              aria-label="Navigation principale"
              className="hidden md:flex items-center gap-0.5 flex-1 px-4"
            >
              {navItems.map((item) => (
                <NavLink key={item.href ?? item.label} item={item} />
              ))}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Ouvrir la recherche (Ctrl+K)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-background-neutral transition-colors text-sm group"
              >
                <SearchIcon size={17} />
                <kbd className="hidden lg:inline-flex items-center h-5 px-1.5 text-[10px] font-mono bg-background-neutral text-text-secondary rounded border border-background-neutral group-hover:border-primary/30 transition-colors">
                  ⌘K
                </kbd>
              </button>

              <div className="w-px h-5 bg-background-neutral" />

              <Link
                href="/cours"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-[0.97]"
              >
                Commencer
                <ArrowRightIcon size={14} />
              </Link>
            </div>

            {/* ── Mobile burger ── */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Ouvrir la recherche"
                className="p-2 rounded-lg text-text-secondary hover:bg-background-neutral transition-colors"
              >
                <SearchIcon size={20} />
              </button>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="p-2 rounded-lg text-text hover:bg-background-neutral transition-colors"
              >
                {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile nav drawer ── */}
      <MobileNav isOpen={mobileOpen} onClose={closeMobile} />

      {/* ── Global search modal ── */}
      <GlobalSearch open={searchOpen} onClose={closeSearch} />
    </>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function GuitarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.5 2.5c0 1.5-1.5 4-1.5 4h-2S9.5 4 9.5 2.5a2.5 2.5 0 0 1 5 0zM12 8c-2.76 0-5 2.24-5 5 0 1.64.79 3.09 2 4v2.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V17c1.21-.91 2-2.36 2-4 0-2.76-2.24-5-5-5z" />
    </svg>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChevronIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
