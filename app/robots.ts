import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

const BASE = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Standard crawlers — full access to all public pages ──────────────
      {
        userAgent: "*",
        allow:    "/",
        disallow: [
          "/api/",        // API routes (OG generation, search, etc.)
          "/_next/",      // Next.js internals
          "/admin/",      // Admin area (if any in the future)
          "/*.json$",     // Prevent indexing of raw JSON files
        ],
      },

      // ── Google — allow image indexing, restrict private ───────────────────
      {
        userAgent: "Googlebot",
        allow:    ["/", "/api/og/"],
        disallow: ["/api/", "/_next/"],
      },

      // ── Bing ──────────────────────────────────────────────────────────────
      {
        userAgent: "Bingbot",
        allow:    "/",
        disallow: ["/api/", "/_next/"],
      },

      // ── AI training crawlers — blocked ─────────────────────────────────
      // These bots scrape content for AI model training without permission.
      { userAgent: "GPTBot",         disallow: "/" },
      { userAgent: "ChatGPT-User",   disallow: "/" },
      { userAgent: "CCBot",          disallow: "/" },
      { userAgent: "anthropic-ai",   disallow: "/" },
      { userAgent: "Claude-Web",     disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "Omgilibot",      disallow: "/" },
      { userAgent: "FacebookBot",    disallow: "/" },
      { userAgent: "Bytespider",     disallow: "/" },
      { userAgent: "PetalBot",       disallow: "/" },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  };
}
