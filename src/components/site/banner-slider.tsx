"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
};

/**
 * Home-page banner slider.
 *
 * Accessible carousel: one slide is visible at a time, arrows and dots are real
 * buttons with labels, arrow keys move between slides, and autoplay pauses on
 * hover/focus and when the tab is hidden. With one banner it renders as a
 * still banner (no arrows or dots).
 */
export function BannerSlider({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (document.visibilityState === "hidden") return;
    const timer = window.setInterval(() => go(index + 1), 7000);
    return () => window.clearInterval(timer);
  }, [count, index, paused, go]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(index + 1);
      if (event.key === "ArrowRight") go(index - 1);
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [go, index]);

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="بنرهای صفحه اصلی"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden border-b border-line-200 bg-dark-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-500"
    >
      <div className="relative h-[320px] sm:h-[400px] lg:h-[460px]">
        {slides.map((slide, i) => {
          const active = i === index;
          const content = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.imageAlt || slide.title}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-[9000ms] ease-out",
                  active ? "scale-105" : "scale-100",
                )}
              />
              <span className="absolute inset-0 bg-gradient-to-l from-dark-900/95 via-dark-900/60 to-dark-900/15" />
              <div className="container relative z-10 flex h-full items-end pb-10 sm:items-center sm:pb-0">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                    <span className="h-px w-8 bg-brand-500" aria-hidden />
                    نامیرا همراه پارس
                  </p>
                  <h2 className="display-2 mt-4 !leading-[1.25] text-white">{slide.title}</h2>
                  {slide.subtitle ? (
                    <p className="mt-3 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  {slide.href ? (
                    <span className="btn-primary mt-6 w-fit">
                      {slide.ctaLabel || "بیشتر بدانید"}
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          );

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} از ${count}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
            >
              {slide.href ? (
                /^https?:\/\//.test(slide.href) ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={active ? undefined : -1}
                    className="absolute inset-0"
                  >
                    {content}
                  </a>
                ) : (
                  <Link href={slide.href} tabIndex={active ? undefined : -1} className="absolute inset-0">
                    {content}
                  </Link>
                )
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <>
          <div className="container pointer-events-none relative z-20 -mt-8 flex items-center justify-between pb-4">
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="بنر بعدی"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-dark-900/40 text-white backdrop-blur transition-colors hover:bg-brand-700"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="بنر قبلی"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-dark-900/40 text-white backdrop-blur transition-colors hover:bg-brand-700"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "پخش خودکار بنرها" : "توقف چرخش بنرها"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-dark-900/40 text-white backdrop-blur transition-colors hover:bg-brand-700"
              >
                {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            <div className="pointer-events-auto flex items-center gap-1.5" role="group" aria-label="انتخاب بنر">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`نمایش بنر ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-7 bg-accent" : "w-3 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
