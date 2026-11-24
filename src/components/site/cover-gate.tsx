"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ParticleOrb } from "@/components/three/particle-orb";

/**
 * The cover's image "gate": a tall photograph that drifts slightly slower than
 * the page (parallax), with the animated sphere set into it as a lens.
 *
 * The sphere used to be a fixed, full-viewport canvas behind the hero. In this
 * composition it is contained — it reads as a window in the photograph instead
 * of a backdrop competing with the headline, and it can no longer paint over
 * the chapters below.
 */
export function CoverGate({
  image,
  alt,
  caption,
  href = "/business-groups",
  showOrb = true,
  orbSize = 44,
}: {
  image: string;
  alt: string;
  caption: string;
  href?: string;
  showOrb?: boolean;
  orbSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  // The admin slider is 20–80 (vw on the old full-bleed canvas); map it onto a
  // contained lens so the control still means "bigger / smaller".
  const lens = Math.round(120 + (Math.min(80, Math.max(20, orbSize)) - 20) * 1.1);

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
            <p className="mt-1.5 text-[13px] font-medium text-white/90">
              پنج گروه، یک ساختار
            </p>
          </div>
          <Link
            href={href}
            aria-label="مشاهده گروه‌های کسب‌وکار"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {showOrb ? (
          <div
            className="pointer-events-none absolute bottom-6 end-6 overflow-hidden rounded-full border border-white/20 bg-dark-900/70 shadow-glow backdrop-blur-sm"
            style={{ width: lens, height: lens }}
            aria-hidden
          >
            <ParticleOrb className="h-full w-full" />
            <span className="absolute inset-2 rounded-full border border-brand-300/20" />
          </div>
        ) : null}
      </div>

      {/* Plate number, set outside the frame like a catalogue entry. */}
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-ink-400">
        <span>Namira / 1404</span>
        <span>Tehran — Iran</span>
      </div>
    </div>
  );
}
