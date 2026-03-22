"use client";

/**
 * Content tracking hooks — fire view events exactly once on mount.
 *
 * ViewMethod and ViewTab are page-level events (not button clicks), so
 * they belong in a useEffect that runs when the detail page renders, not
 * inside an onClick handler.
 *
 * All hooks use a ref guard (`fired`) so React StrictMode's double-invoke
 * doesn't send duplicate events to GA4 / Facebook Pixel.
 *
 * Usage — method page:
 * ─────────────────────
 * // app/methodes/[slug]/page.tsx  →  server component
 * // Create a thin client boundary just for tracking:
 *
 * // components/content/MethodTracker.tsx
 * "use client";
 * import { useTrackViewMethod } from "@/hooks/useContentTracking";
 * export function MethodTracker({ slug, title, niveau, style, price }) {
 *   useTrackViewMethod({ slug, title, niveau, style, price });
 *   return null;
 * }
 *
 * // Then inside the server page JSX:
 * <MethodTracker slug={methode.slug} title={methode.title} niveau={methode.niveau} />
 *
 * Usage — tablature page:
 * ─────────────────────────
 * // components/content/TabTracker.tsx
 * "use client";
 * import { useTrackViewTab } from "@/hooks/useContentTracking";
 * export function TabTracker({ slug, title, artist, style }) {
 *   useTrackViewTab({ slug, title, artist, style });
 *   return null;
 * }
 */

import { useEffect, useRef } from "react";
import {
  trackViewMethod,
  trackViewTab,
  trackStartCourse,
  type MethodPayload,
  type TabPayload,
  type CoursePayload,
} from "@/lib/tracking";

// ─── Generic base hook ────────────────────────────────────────────────────────

/**
 * useTrackOnce — fires a tracking callback exactly once when `payload`
 * is available (non-null).  Re-fires if the slug changes (e.g. client-side
 * navigation between detail pages).
 */
function useTrackOnce<T extends { slug: string }>(
  payload: T | null | undefined,
  tracker: (p: T) => void
): void {
  const lastSlug = useRef<string | null>(null);

  useEffect(() => {
    if (!payload) return;
    // Only fire when we see a new slug — guards StrictMode double-invoke
    // and prevents re-firing when unrelated state updates cause re-renders.
    if (payload.slug === lastSlug.current) return;
    lastSlug.current = payload.slug;
    tracker(payload);
    // `tracker` is a stable function reference from lib/tracking — no dep churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.slug]);
}

// ─── Exported hooks ───────────────────────────────────────────────────────────

/**
 * useTrackViewMethod — fires `trackViewMethod` once when the component mounts
 * on a method detail page.
 *
 * @param payload - Method data.  Pass `null` while the data is loading.
 *
 * @example
 * "use client";
 * import { useTrackViewMethod } from "@/hooks/useContentTracking";
 *
 * export function MethodTracker(props: MethodPayload) {
 *   useTrackViewMethod(props);
 *   return null;   // renders nothing — tracking side-effect only
 * }
 */
export function useTrackViewMethod(
  payload: MethodPayload | null | undefined
): void {
  useTrackOnce(payload, trackViewMethod);
}

/**
 * useTrackViewTab — fires `trackViewTab` once when the component mounts
 * on a tablature detail page.
 *
 * @param payload - Tablature data.  Pass `null` while the data is loading.
 *
 * @example
 * "use client";
 * import { useTrackViewTab } from "@/hooks/useContentTracking";
 *
 * export function TabTracker(props: TabPayload) {
 *   useTrackViewTab(props);
 *   return null;
 * }
 */
export function useTrackViewTab(
  payload: TabPayload | null | undefined
): void {
  useTrackOnce(payload, trackViewTab);
}

/**
 * useTrackStartCourse — fires `trackStartCourse` once on mount.
 *
 * Use this on the course detail page to register that a user has *seen*
 * the course (not that they clicked "start").  For the click itself,
 * use `TrackedCTAButton` with `event: "startCourse"`.
 *
 * @param payload - Course data.  Pass `null` while the data is loading.
 */
export function useTrackStartCourse(
  payload: CoursePayload | null | undefined
): void {
  useTrackOnce(payload, trackStartCourse);
}
