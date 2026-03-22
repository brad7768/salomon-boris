/**
 * Central tracking module — GA4 + Facebook Pixel.
 *
 * All exported functions are SSR-safe (no-op on the server) and fire
 * both platforms simultaneously to guarantee event parity.
 *
 * Event map:
 * ┌──────────────────┬─────────────────────────┬──────────────────────────┐
 * │ Our event        │ GA4                     │ Facebook Pixel           │
 * ├──────────────────┼─────────────────────────┼──────────────────────────┤
 * │ ClickCTA         │ click_cta (custom)      │ ClickCTA (custom)        │
 * │ ViewMethod       │ view_item (ecommerce)   │ ViewContent (standard)   │
 * │ StartCourse      │ begin_checkout          │ InitiateCheckout / custom│
 * │ DownloadBonus    │ file_download           │ Lead (standard)          │
 * │ ViewTab          │ select_content          │ ViewContent (standard)   │
 * └──────────────────┴─────────────────────────┴──────────────────────────┘
 */

// ─── Window type extensions ──────────────────────────────────────────────────
// Extending instead of redeclaring — GoogleAnalytics.tsx already declares gtag.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Debug ────────────────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === "development";

function log(platform: string, event: string, data?: unknown): void {
  if (IS_DEV) {
    console.debug(
      `%c[tracking] %c${platform} %c→ ${event}`,
      "color:#6C6C6C;font-weight:bold",
      "color:#03045E;font-weight:bold",
      "color:#22223B",
      data ?? ""
    );
  }
}

// ─── Platform primitives ─────────────────────────────────────────────────────

function ga(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
  log("GA4", event, params);
}

function fb(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, data);
  log("Pixel", event, data);
}

function fbCustom(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("trackCustom", event, data);
  log("Pixel (custom)", event, data);
}

// ─── Payload types ────────────────────────────────────────────────────────────

/** CTA button click. */
export interface CTAPayload {
  /** Visible text on the button, e.g. "Démarrer la méthode". */
  label: string;
  /** Section/zone identifier, e.g. "hero" | "pricing" | "sidebar" | "footer". */
  location: string;
  /** Target URL or named route, e.g. "/methodes/blues-guitare-12-semaines". */
  destination?: string;
}

/** Method detail page view. */
export interface MethodPayload {
  slug: string;
  title: string;
  niveau?: string;
  style?: string;
  /** Set to a numeric value if the method is paid. */
  price?: number;
  currency?: string;
}

/** "Start course" button click. */
export interface CoursePayload {
  slug: string;
  title: string;
  niveau?: string;
  /** true → free course, false/undefined → paid course. */
  isFree?: boolean;
  price?: number;
  currency?: string;
}

/** Free resource download (PDF, MP3, ZIP…). */
export interface BonusPayload {
  /** Human-readable resource name, e.g. "Grille de blues en Do". */
  name: string;
  slug?: string;
  category?: string;
  format?: "pdf" | "mp3" | "zip" | "video" | string;
}

/** Tablature detail page view. */
export interface TabPayload {
  slug: string;
  title: string;
  artist?: string;
  style?: string;
  niveau?: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/**
 * ClickCTA — user clicks any call-to-action button or prominent link.
 *
 * Fire this on every CTA that drives a conversion or content discovery:
 * hero buttons, pricing CTAs, course "start" links, etc.
 */
export function trackClickCTA(payload: CTAPayload): void {
  ga("click_cta", {
    cta_label:       payload.label,
    cta_location:    payload.location,
    cta_destination: payload.destination ?? "",
  });
  fbCustom("ClickCTA", {
    label:       payload.label,
    location:    payload.location,
    destination: payload.destination ?? "",
  });
}

/**
 * ViewMethod — user lands on a method detail page.
 *
 * Maps to the GA4 standard ecommerce `view_item` event so it integrates
 * with Google Analytics reports and Google Ads remarketing.
 */
export function trackViewMethod(payload: MethodPayload): void {
  const currency = payload.currency ?? "EUR";
  const price    = payload.price    ?? 0;

  ga("view_item", {
    currency,
    value: price,
    items: [
      {
        item_id:       `methodes/${payload.slug}`,
        item_name:     payload.title,
        item_category: "methodes",
        item_variant:  payload.niveau ?? "",
        item_brand:    "Salomon Boris",
        price,
        quantity:      1,
      },
    ],
  });

  fb("ViewContent", {
    content_ids:      [`methodes/${payload.slug}`],
    content_name:     payload.title,
    content_type:     "product",
    content_category: "methodes",
    value:            price,
    currency,
  });
}

/**
 * StartCourse — user clicks "Commencer" / "Accéder" on a course page.
 *
 * Paid courses fire `InitiateCheckout` on Pixel (high-value funnel event).
 * Free courses fire a custom `StartCourse` event to distinguish intent.
 */
export function trackStartCourse(payload: CoursePayload): void {
  const currency = payload.currency ?? "EUR";
  const price    = payload.price    ?? 0;

  const gaItem = {
    item_id:       `cours/${payload.slug}`,
    item_name:     payload.title,
    item_category: "cours",
    item_variant:  payload.niveau ?? "",
    item_brand:    "Salomon Boris",
    price,
    quantity:      1,
  };

  ga("begin_checkout", {
    currency,
    value: price,
    items: [gaItem],
  });

  if (payload.isFree) {
    fbCustom("StartCourse", {
      content_ids:  [`cours/${payload.slug}`],
      content_name: payload.title,
      is_free:      true,
      value:        0,
      currency:     "EUR",
    });
  } else {
    fb("InitiateCheckout", {
      content_ids:  [`cours/${payload.slug}`],
      content_name: payload.title,
      num_items:    1,
      value:        price,
      currency,
    });
  }
}

/**
 * DownloadBonus — user downloads a free resource.
 *
 * Fires GA4's standard `file_download` (appears in the Engagement report)
 * and Pixel's `Lead` event (maps to Meta's lead generation objective).
 */
export function trackDownloadBonus(payload: BonusPayload): void {
  ga("file_download", {
    file_name:      payload.name,
    file_extension: payload.format ?? "pdf",
    link_id:        payload.slug   ?? payload.name,
    link_text:      payload.name,
  });

  fb("Lead", {
    content_name:     payload.name,
    content_category: payload.category ?? "bonus",
    currency:         "EUR",
    value:            0,
  });
}

/**
 * ViewTab — user lands on a tablature detail page.
 *
 * Uses `select_content` (GA4) to track content engagement and
 * `ViewContent` (Pixel) for remarketing audiences.
 */
export function trackViewTab(payload: TabPayload): void {
  ga("select_content", {
    content_type: "tablature",
    item_id:      `tablatures/${payload.slug}`,
    content_name: payload.title,
    artist:       payload.artist ?? "",
    style:        payload.style  ?? "",
    niveau:       payload.niveau ?? "",
  });

  fb("ViewContent", {
    content_ids:      [`tablatures/${payload.slug}`],
    content_name:     payload.title,
    content_type:     "product",
    content_category: "tablatures",
    value:            0,
    currency:         "EUR",
  });
}

// ─── Generic dispatcher ───────────────────────────────────────────────────────

/**
 * trackCustom — fire a one-off named event on both platforms.
 *
 * Use this for events that don't fit any of the typed functions above.
 * Prefer the typed helpers whenever possible for consistent data quality.
 *
 * @example
 * trackCustom("PlayPreview", { slug: "blues-12-semaines", duration: 45 });
 */
export function trackCustom(
  eventName: string,
  gaParams?: Record<string, unknown>,
  fbData?:   Record<string, unknown>
): void {
  ga(eventName, gaParams);
  fbCustom(eventName, fbData ?? gaParams);
}
