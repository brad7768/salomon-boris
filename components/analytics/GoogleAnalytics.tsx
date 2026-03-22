import Script from "next/script";

// Composant Server — next/script fonctionne dans les Server Components
// strategy="afterInteractive" : injecté après hydratation, non-bloquant

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_location: window.location.href,
            page_title: document.title,
            anonymize_ip: true,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

// ─── Helpers client-side (importables dans les pages) ───────────────────────

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function trackGaEvent(
  action: string,
  params?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
  }
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}

export function trackPageView(url: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID ?? "", { page_path: url });
}
