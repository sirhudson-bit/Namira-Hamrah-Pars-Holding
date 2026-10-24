"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Appears once the reader has scrolled, and returns to the top smoothly.
 * Honours `prefers-reduced-motion` by jumping instead of animating.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="بازگشت به بالای صفحه"
      className={cn(
        "fixed bottom-5 right-5 z-[45] inline-flex h-12 w-12 items-center justify-center rounded-full border border-line-200 bg-surface text-ink-900 shadow-lift transition-all duration-300 ease-smooth hover:border-brand-500/60 hover:text-accent sm:bottom-6 sm:right-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
