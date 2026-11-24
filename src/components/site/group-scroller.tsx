"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type GroupCard = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  external: boolean;
  highlights: string[];
  color: string;
};

/**
 * Horizontal chapter of the five business groups.
 *
 * A snap track rather than a grid: five cards in a three-column grid leave an
 * orphan in the last row, and the bright photography reads better at a large
 * size. The arrows are optional — the track is a plain scroll container, so
 * trackpads, touch, keyboard and the scrollbar all work without JavaScript.
 */
export function GroupScroller({ groups }: { groups: GroupCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(true);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const scrolled = Math.abs(el.scrollLeft);
    setProgress(max > 0 ? Math.min(1, scrolled / max) : 0);
    // In RTL, scrollLeft runs from 0 (start) to -max (end).
    setCanBack(scrolled > 8);
    setCanForward(max - scrolled > 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const amount = Math.min(el.clientWidth * 0.82, 460);
    el.scrollBy({ left: (rtl ? -1 : 1) * amount * direction, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[11px] text-ink-500">
          {groups.length.toLocaleString("fa-IR")} گروه · برای دیدن همه، بکشید
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canBack}
            aria-label="گروه قبلی"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-200 text-ink-700 transition-all hover:border-brand-500/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canForward}
            aria-label="گروه بعدی"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-200 text-ink-700 transition-all hover:border-brand-500/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="xp-track -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
      >
        {groups.map((group, index) => (
          <article
            key={group.id}
            className="group relative w-[80vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-line-200 bg-surface shadow-soft transition-all duration-500 hover:border-brand-500/40 hover:shadow-lift sm:w-[58vw] lg:w-[30vw]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-100">
              {group.image ? (
                <Image
                  src={group.image}
                  alt={group.imageAlt || group.name}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 58vw, 80vw"
                  className="object-cover transition-transform duration-[1400ms] ease-smooth group-hover:scale-[1.06]"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(160deg, ${group.color}, #0B0F0E)` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/15 to-transparent" />

              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                <span className="text-[11px] font-bold tabular-nums text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full ring-4 ring-white/10"
                  style={{ backgroundColor: group.color }}
                  aria-hidden
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="text-2xl font-extrabold leading-tight text-white">{group.name}</h3>
                <p className="mt-1 text-[12.5px] font-medium text-brand-200">{group.tagline}</p>

                <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-smooth group-hover:max-h-40 group-hover:opacity-100 group-focus-within:max-h-40 group-focus-within:opacity-100">
                  <p className="text-[12px] leading-6 text-white/75">{group.description}</p>
                  {group.highlights.length ? (
                    <ul className="mt-3 space-y-1">
                      {group.highlights.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[11.5px] text-white/70">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-300" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {group.external ? (
                  <a
                    href={group.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    {group.ctaLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={group.href}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    {group.ctaLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Progress reads as a track position, not a slider. */}
      <div className="mt-1 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line-200">
          <span
            className="block h-px bg-accent transition-[width] duration-200"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </span>
        <span className={cn("text-[10px] tabular-nums", progress >= 0.999 ? "text-accent" : "text-ink-400")}>
          {String(Math.round(progress * 100)).padStart(2, "0")}%
        </span>
      </div>
    </div>
  );
}
