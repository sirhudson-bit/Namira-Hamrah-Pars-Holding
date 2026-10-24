"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Vertical timeline whose accent line fills as the reader scrolls through it.
 * The list itself is a plain <ol>; only the progress line is animated, and it
 * snaps to full height when the visitor prefers reduced motion.
 */
export function TimelineProgress({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <ol ref={ref} className={cn("relative space-y-8 pr-8", className)}>
      <span
        className="absolute right-[7px] top-2 bottom-2 w-px bg-line-200"
        aria-hidden
      />
      <motion.span
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute right-[7px] top-2 bottom-2 w-px origin-top bg-brand-500"
        aria-hidden
      />
      {children}
    </ol>
  );
}

export function TimelineItem({
  year,
  title,
  description,
}: {
  year: string;
  title: string;
  description: string;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -right-8 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-brand-500/50 bg-surface"
        aria-hidden
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      </span>
      <span className="text-xs font-bold tracking-wide text-accent">{year}</span>
      <h3 className="mt-1 text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1 text-[13px] leading-7 text-ink-500">{description}</p>
    </li>
  );
}
