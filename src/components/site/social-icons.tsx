import type { SVGProps } from "react";

/**
 * Lucide v1 removed brand glyphs, so the three social marks the site uses are
 * inlined here. Each is decorative; the surrounding link carries the label.
 */
function base(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M15 8a4 4 0 0 1 4 4v6" />
      <path d="M11 18v-6" />
      <path d="M7 18v-9" />
      <path d="M15 11a4 4 0 0 0-8 0" />
      <circle cx="7" cy="5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M21.5 4.5 2.8 11.3c-.8.3-.8 1.4.1 1.6l4.6 1.2 1.7 4.9c.2.7 1.1.8 1.6.3l2.5-2.4 4.4 3.2c.6.4 1.4.1 1.5-.6l2.4-13.4c.2-.9-.7-1.6-1.6-1.2Z" />
      <path d="m7.5 14.1 9.4-6.6-6.9 7.5" />
    </svg>
  );
}
