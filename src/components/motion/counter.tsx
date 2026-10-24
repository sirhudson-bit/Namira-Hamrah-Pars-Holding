"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { toPersianDigits } from "@/lib/format";

/**
 * Counts up to `value` once it scrolls into view, rendered in Persian digits.
 *
 * The animation writes `textContent` directly instead of going through state:
 * a counter animating for 1.6s would otherwise re-render the component ~96
 * times, and the home page has several of them on screen at once.
 */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    const paint = (n: number) => {
      el.textContent = `${prefix}${toPersianDigits(n)}${suffix}`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      paint(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    paint(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {toPersianDigits(0)}
      {suffix}
    </span>
  );
}
