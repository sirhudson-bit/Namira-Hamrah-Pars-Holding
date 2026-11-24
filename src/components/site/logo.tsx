import { cn } from "@/lib/utils";

/**
 * The holding wordmark.
 *
 * Two uploaded files can back it: the version drawn for a light background
 * (dark artwork) and the version drawn for a dark background (light artwork).
 * Both are rendered and CSS decides which one is visible, keyed on
 * `[data-theme="dark"]` and on the always-dark containers (`.band`, `.on-dark`).
 * So the mark swaps the moment the visitor hits the theme toggle — no
 * JavaScript, no flash of the wrong logo, and no client state to desync.
 *
 * With only one file uploaded it is used for both themes; with none, the
 * built-in geometric mark is drawn inline.
 */
export function Logo({
  className,
  variant = "dark",
  src,
  srcLight,
  alt = "نامیرا همراه پارس",
  size = 36,
}: {
  className?: string;
  /** `light` = artwork for a dark background, used by the built-in mark. */
  variant?: "dark" | "light";
  /** Logo for light backgrounds (dark artwork). */
  src?: string | null;
  /** Logo for dark backgrounds (light artwork). */
  srcLight?: string | null;
  alt?: string;
  /** Rendered height in CSS pixels (admin-adjustable). */
  size?: number;
}) {
  const onLight = src || srcLight;
  const onDark = srcLight || src;

  if (onLight && onDark) {
    return (
      <span className={cn("logo-swap", className)} style={{ height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={onLight}
          alt={alt}
          style={{ height: size }}
          className="logo-on-light w-auto object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={onDark}
          alt=""
          aria-hidden
          style={{ height: size }}
          className="logo-on-dark w-auto object-contain"
        />
      </span>
    );
  }

  const textColor = variant === "light" ? "text-white" : "text-ink-900";
  const subColor = variant === "light" ? "text-brand-300" : "text-ink-500";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        style={{ width: size, height: size }}
        className="shrink-0"
      >
        <rect width="40" height="40" rx="12" fill="#0F7C71" />
        <path
          d="M11 27V14.5c0-.3.36-.45.57-.24L20 22l8.43-7.74c.21-.2.57-.06.57.24V27"
          stroke="#DCF2EF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="12" r="2.4" fill="#6FD8CB" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn("font-extrabold", textColor)}
          style={{ fontSize: Math.round(size * 0.44) }}
        >
          نامیرا همراه پارس
        </span>
        <span
          className={cn("font-medium tracking-wide", subColor)}
          style={{ fontSize: Math.max(9, Math.round(size * 0.26)), marginTop: Math.round(size * 0.1) }}
        >
          NAMIRA HOLDING
        </span>
      </span>
    </span>
  );
}
