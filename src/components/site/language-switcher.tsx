"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { LOCALES, LOCALE_COOKIE, localeInfo, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Language switcher.
 *
 * The choice is a cookie, not a route prefix: every page already reads the
 * locale on the server, so switching only needs a refresh — no duplicated
 * routes, and the URL a visitor shares keeps working for everyone else.
 */
export function LanguageSwitcher({
  locale,
  label = "زبان",
  className,
}: {
  locale: Locale;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = localeInfo(locale);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function choose(code: Locale) {
    // One year; `lax` keeps it on normal navigations and the refresh re-renders
    // the current route in the new language.
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-200 bg-surface/70 px-2.5 text-[11.5px] font-semibold text-ink-700 backdrop-blur transition-colors hover:border-brand-500/50 hover:text-accent"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        <span>{current.short}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            aria-label={label}
            className="absolute end-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line-200 bg-surface shadow-lift"
          >
            {LOCALES.map((entry) => (
              <button
                key={entry.code}
                type="button"
                role="menuitemradio"
                aria-checked={entry.code === locale}
                onClick={() => choose(entry.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-[12px] transition-colors hover:bg-surface-100",
                  entry.code === locale ? "font-semibold text-accent" : "text-ink-700",
                )}
              >
                <span>{entry.label}</span>
                {entry.code === locale ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
