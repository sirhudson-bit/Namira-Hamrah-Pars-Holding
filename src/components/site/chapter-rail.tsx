"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Chapter = { id: string; label: string };

/**
 * Fixed chapter index on the outer edge of the page.
 *
 * This is the navigation layer of the experimental home page: the visitor
 * always knows which chapter they are in and can jump to any other one without
 * scrolling back. It appears once the cover scrolls away and hides again over
 * the footer, so it never sits on top of the cover or the closing panel.
 *
 * Scroll-spy is an IntersectionObserver with a band in the middle of the
 * viewport; the progress bar is written through a ref inside a rAF callback so
 * a long Persian page does not re-render the rail on every scroll event.
 */
export function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inBand = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (inBand?.target.id) setActive(inBand.target.id);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.15, 0.4, 0.75] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const cover = document.getElementById("cover");
      const progress = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = progress > 0 ? Math.min(1, Math.max(0, window.scrollY / progress)) : 0;

      if (barRef.current) barRef.current.style.transform = `scaleY(${ratio})`;

      const pastCover = cover ? window.scrollY > cover.offsetHeight * 0.55 : window.scrollY > 500;
      const nearBottom = progress - window.scrollY < 260;
      setVisible(pastCover && !nearBottom);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav
      aria-label="فهرست فصل‌های صفحه"
      className={cn(
        "fixed end-4 top-1/2 z-30 hidden -translate-y-1/2 transition-all duration-500 ease-smooth xl:block",
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0",
      )}
    >
      <div className="relative flex flex-col items-end gap-1 rounded-full border border-line-200 bg-surface-50/75 py-4 pe-4 ps-3 shadow-soft backdrop-blur-md">
        {/* Progress track: the filled part scales with page progress. */}
        <span aria-hidden className="absolute bottom-4 end-2 top-4 w-px bg-line-200" />
        <span
          ref={barRef}
          aria-hidden
          className="absolute bottom-4 end-2 top-4 w-px origin-bottom bg-brand-400"
          style={{ transform: "scaleY(0)" }}
        />
        {chapters.map((chapter, index) => {
          const isActive = active === chapter.id;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => go(chapter.id)}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center gap-2.5 py-1.5 pe-4 text-end"
            >
              <span
                className={cn(
                  "text-[10.5px] font-semibold tabular-nums transition-colors duration-300",
                  isActive ? "text-accent" : "text-ink-500 group-hover:text-ink-900",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium transition-all duration-300",
                  isActive
                    ? "text-ink-900"
                    : "text-ink-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                )}
              >
                {chapter.label}
              </span>
              <span
                aria-hidden
                className={cn(
                  "h-px transition-all duration-300",
                  isActive ? "w-5 bg-accent" : "w-2 bg-line-200 group-hover:w-4 group-hover:bg-accent/60",
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
