import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "white"
  | "outline-white"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Affiche un spinner et désactive l'interaction */
  loading?: boolean;
  /** Prend 100% de la largeur du conteneur */
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
}

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: never;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export type ButtonProps = ButtonAsLink | ButtonAsButton;

// ─── Style maps ──────────────────────────────────────────────────────────────

const VARIANT: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary text-white border border-primary",
    "shadow-[0_1px_3px_rgba(3,4,94,.25),0_1px_2px_-1px_rgba(3,4,94,.2)]",
    "hover:bg-primary/90 hover:shadow-[0_4px_14px_rgba(3,4,94,.22)]",
    "active:shadow-sm",
  ].join(" "),

  secondary: [
    "bg-background-neutral text-text border border-background-neutral",
    "hover:bg-[#E4E4E0] hover:border-[#E4E4E0]",
    "active:bg-[#D9D9D5]",
  ].join(" "),

  outline: [
    "bg-transparent text-primary border border-primary/40",
    "hover:border-primary hover:bg-primary/5",
    "active:bg-primary/10",
  ].join(" "),

  ghost: [
    "bg-transparent text-primary border border-transparent",
    "hover:bg-primary/8 hover:border-primary/10",
    "active:bg-primary/15",
  ].join(" "),

  white: [
    "bg-white text-primary border border-white",
    "shadow-sm hover:bg-white/90 hover:shadow",
    "active:bg-white/80",
  ].join(" "),

  "outline-white": [
    "bg-transparent text-white border border-white/50",
    "hover:border-white hover:bg-white/10",
    "active:bg-white/20",
  ].join(" "),

  danger: [
    "bg-red-600 text-white border border-red-600",
    "shadow-[0_1px_3px_rgba(220,38,38,.3)]",
    "hover:bg-red-500 hover:shadow-[0_4px_14px_rgba(220,38,38,.25)]",
    "active:shadow-sm",
  ].join(" "),
};

const SIZE: Record<ButtonSize, string> = {
  xs: "text-xs px-2.5 py-1 rounded-md gap-1",
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2 rounded-lg gap-2",
  lg: "text-base px-5 py-2.5 rounded-xl gap-2",
  xl: "text-base px-7 py-3.5 rounded-xl gap-2.5",
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
  } = props;

  const isDisabled = disabled || loading;

  const classes = cn(
    // Base
    "inline-flex items-center justify-center font-semibold select-none",
    "transition-all duration-150 ease-out",
    // Focus ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    // Active scale
    "active:scale-[0.97]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    // Variant + size
    VARIANT[variant],
    SIZE[size],
    // Modifiers
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {loading ? (
        <Spinner />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      {children && (
        <span className={cn(loading && "opacity-0 absolute")}>{children}</span>
      )}

      {!loading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </>
  );

  // ── Render as <a> (external) ──────────────────────────────────────────────
  if ("href" in props && props.href) {
    const { href, external } = props;

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          aria-disabled={isDisabled}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} aria-disabled={isDisabled}>
        {content}
      </Link>
    );
  }

  // ── Render as <button> ────────────────────────────────────────────────────
  const { onClick, type = "button" } = props as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
    >
      {content}
    </button>
  );
}

// ─── Button Group ─────────────────────────────────────────────────────────────

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "col";
}

export function ButtonGroup({
  children,
  className,
  direction = "row",
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        direction === "col" && "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
