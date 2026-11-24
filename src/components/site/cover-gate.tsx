"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * The cover's image "gate": a tall photograph that drifts slightly slower than
 * the page (parallax).
 *
 * The animated sphere used to sit in the lower corner of this plate. It has
 * moved to the site-wide assistant launcher (bottom-left) where it answers
 * questions instead of decorating a corner.
 */
export function CoverGate({
  image,
  alt,
  caption,
  subtitle = "پنج گروه، یک ساختار",
  linkLabel = "مشاهده گروه‌های کسب‌وکار",
  href = "/business-groups",
}: {
  image: string;
  alt: string;
  caption: string;
  subtitle?: string;
  linkLabel?: string;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className="group relative">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[26px] border border-line-200 bg-surface-100 shadow-lift">
        <motion.div
          className="absolute inset-[-9%]"
          style={reduce ? undefined : { y }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-[1.03]"
          />
        </motion.div>

        {/* Readability scrim + a thin inner frame, like a printed plate. */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/85 via-dark-900/10 to-dark-900/5" />
        <div className="pointer-events-none absolute inset-3 rounded-[18px] border border-white/15" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-200">
              {caption}
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-white/90">{subtitle}</p>
          </div>
          <Link
            href={href}
            aria-label={linkLabel}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Plate number, set outside the frame like a catalogue entry. */}
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-ink-400">
        <span>Namira / 1404</span>
        <span>Tehran — Iran</span>
      </div>
    </div>
  );
}
