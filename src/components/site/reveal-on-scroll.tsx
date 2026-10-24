"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll reveal.
 *
 * Rather than wrapping every section by hand, this registers every top-level
 * `section` on the page and fades it in as it scrolls into view. The hidden
 * state is applied by JS only (never in the server HTML), so content is always
 * present without JavaScript; sections already in view on arrival are shown
 * immediately so the first screen is never blank.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const main = document.getElementById("main");
    if (!main) return;

    // Top-level sections only — a section nested inside another (e.g. the pinned
    // gallery) reveals with its parent.
    const candidates = Array.from(
      main.querySelectorAll<HTMLElement>("section, [data-reveal]"),
    ).filter((el) => !el.parentElement?.closest("section"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.04 },
    );

    const viewportHeight = window.innerHeight;

    for (const el of candidates) {
      if (el.dataset.revealReady) continue;
      el.dataset.revealReady = "1";
      el.classList.add("section-reveal");

      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < viewportHeight * 0.85 && rect.bottom > 0;

      el.setAttribute("data-visible", alreadyVisible ? "true" : "false");
      if (!alreadyVisible) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
