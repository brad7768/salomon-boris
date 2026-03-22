"use client";

/**
 * TrackedCTAButton — drop-in Button wrapper that fires tracking events.
 *
 * Why a separate component instead of modifying Button?
 * ─────────────────────────────────────────────────────
 * The base Button component is a shared UI primitive — it must stay
 * free of business logic.  This wrapper is a feature component that
 * composes the primitive with tracking concerns.
 *
 * Why not use Button's href prop directly?
 * ────────────────────────────────────────
 * Button's `ButtonAsLink` type sets `onClick?: never` (Link renders an
 * <a> with no JS handler).  To intercept the click we navigate
 * imperatively via `router.push` after the tracking call fires.
 *
 * Usage:
 * ──────
 * // Hero CTA → start a method
 * <TrackedCTAButton
 *   href="/methodes/blues-guitare-12-semaines"
 *   tracking={{ event: "cta", payload: { label: "Démarrer la méthode", location: "hero" } }}
 *   variant="white"
 *   size="lg"
 * >
 *   Démarrer la méthode
 * </TrackedCTAButton>
 *
 * // Course page → begin course
 * <TrackedCTAButton
 *   href="/cours/pentatonique-blues"
 *   tracking={{ event: "startCourse", payload: { slug: "pentatonique-blues", title: "Pentatonique Blues", isFree: true } }}
 *   variant="primary"
 * >
 *   Commencer le cours
 * </TrackedCTAButton>
 *
 * // Download bonus PDF
 * <TrackedCTAButton
 *   href="/bonus/grille-blues-do.pdf"
 *   external
 *   tracking={{ event: "download", payload: { name: "Grille de blues en Do", format: "pdf" } }}
 *   variant="outline"
 * >
 *   Télécharger le PDF
 * </TrackedCTAButton>
 */

import { useCallback }  from "react";
import { useRouter }    from "next/navigation";
import { Button }       from "@/components/ui/Button";
import type { ButtonVariant, ButtonSize } from "@/components/ui/Button";
import type { ReactNode } from "react";
import {
  trackClickCTA,
  trackStartCourse,
  trackDownloadBonus,
  type CTAPayload,
  type CoursePayload,
  type BonusPayload,
} from "@/lib/tracking";

// ─── Tracking config ──────────────────────────────────────────────────────────

/**
 * Discriminated union — pick the event that matches the CTA's intent.
 *
 * "cta"         → generic CTA (hero buttons, nav links, etc.)
 * "startCourse" → starts a free or paid course
 * "download"    → downloads a bonus resource (PDF, MP3, ZIP…)
 */
export type CTATrackingConfig =
  | { event: "cta";         payload: CTAPayload }
  | { event: "startCourse"; payload: CoursePayload }
  | { event: "download";    payload: BonusPayload };

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TrackedCTAButtonProps {
  /** Tracking event config — required. */
  tracking: CTATrackingConfig;

  /** Internal or external URL to navigate to after the tracking call. */
  href?: string;

  /** When true, opens href in a new tab (rel="noopener noreferrer"). */
  external?: boolean;

  // ── Forwarded Button props ──────────────────────────────────────────────
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  fullWidth?: boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  disabled?:  boolean;
  children?:  ReactNode;

  /**
   * Optional side-effect to run *after* tracking fires and *before*
   * navigation, e.g. closing a modal or flushing a form.
   */
  onAfterTrack?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrackedCTAButton({
  tracking,
  href,
  external      = false,
  onAfterTrack,
  variant       = "primary",
  size          = "md",
  loading,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
}: TrackedCTAButtonProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    // ── 1. Fire the tracking event ─────────────────────────────────────────
    switch (tracking.event) {
      case "cta":
        trackClickCTA({
          ...tracking.payload,
          // Merge destination: explicit payload value wins, href is fallback
          destination: tracking.payload.destination ?? href,
        });
        break;

      case "startCourse":
        trackStartCourse(tracking.payload);
        break;

      case "download":
        trackDownloadBonus(tracking.payload);
        break;
    }

    // ── 2. Optional side-effect ────────────────────────────────────────────
    onAfterTrack?.();

    // ── 3. Navigate ────────────────────────────────────────────────────────
    if (!href) return;

    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  }, [tracking, href, external, onAfterTrack, router]);

  return (
    <Button
      variant={variant}
      size={size}
      loading={loading}
      fullWidth={fullWidth}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
