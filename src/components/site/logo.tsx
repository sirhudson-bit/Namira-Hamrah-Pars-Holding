import { cn } from "@/lib/utils";

/**
 * The holding wordmark. When an administrator has uploaded a logo it is used
 * instead; otherwise the built-in geometric "infinity" mark is drawn inline, so
 * the header is never empty and needs no asset pipeline.
 */
export function Logo({
  className,
  variant = "dark",
  src,
  alt = "نامیرا همراه پارس",
  size = 36,
}: {
  className?: string;
  variant?: "dark" | "light";
  src?: string | null;
  alt?: string;
  /** Rendered height in CSS pixels (admin-adjustable). */
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={{ height: size }}
        className={cn("w-auto object-contain", className)}
      />
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
