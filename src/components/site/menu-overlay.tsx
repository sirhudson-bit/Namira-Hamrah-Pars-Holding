"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import type { NavItem } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { toLatinDigits } from "@/lib/format";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { EASE } from "@/components/motion/reveal";
import type { ChromeLabels } from "@/server/chrome";

/**
 * Topic photography used as the hover preview of the full-screen index.
 * Keys are routes; unknown entries fall back to the cover image.
 */
const PREVIEWS: Record<string, { src: string; caption: string }> = {
  "/": { src: "/images/topics/hq.webp", caption: "مقر هلدینگ" },
  "/about": { src: "/images/topics/team.webp", caption: "تیم و ساختار" },
  "/business-groups": { src: "/images/topics/logistics.webp", caption: "پنج گروه تخصصی" },
  "/stores": { src: "/images/topics/retail.webp", caption: "کانال‌های فروش" },
  "/innovation": { src: "/images/topics/ai.webp", caption: "نامیرا لبز" },
  "/services": { src: "/images/topics/support.webp", caption: "خدمات پس از فروش" },
  "/media": { src: "/images/topics/corporate.webp", caption: "رسانه و رویدادها" },
  "/contact": { src: "/images/topics/hq.webp", caption: "تماس با ما" },
  "/careers": { src: "/images/topics/team.webp", caption: "فرصت‌های شغلی" },
  "/units": { src: "/images/topics/industrial.webp", caption: "واحدهای سازمانی" },
};

/**
 * Full-screen index — the experimental navigation layer.
 *
 * The whole site index (sections and their children) is on one screen, in
 * reading order, numbered like a table of contents. Hovering a row swaps the
 * preview photograph on the opposite column, which turns navigation into an
 * overview of the holding rather than a list of links.
 */
export function MenuOverlay({
  open,
  onClose,
  nav,
  labels,
  locale,
  siteName,
  phone,
  email,
  hours,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  labels: ChromeLabels;
  locale: Locale;
  siteName: string;
  phone: string;
  email: string;
  hours: string;
}) {
  const [activeHref, setActiveHref] = useState(nav[0]?.href ?? "/");
  const [hoverImage, setHoverImage] = useState<{ src: string; caption: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // The overlay is rendered in a portal on <body>: inside the sticky header it
  // would sit in the header's stacking context (z-50) and lose to the cookie
  // bar (z-80) no matter how high its own z-index was.
  useEffect(() => {
    setMounted(true);
  }, []);

  const active = useMemo(
    () => nav.find((item) => item.href === activeHref) ?? nav[0],
    [activeHref, nav],
  );
  // Menu images are managed in /admin/menus; the map below only covers routes
  // that have no image yet, so an untouched install still shows a photograph.
  const preview =
    hoverImage ??
    (active?.image
      ? { src: active.image, caption: active.imageAlt || active.label }
      : {
          src: (PREVIEWS[active?.href ?? "/"] ?? PREVIEWS["/"]).src,
          caption: active?.label ?? "",
        });

  // Escape closes; the page behind never scrolls while the index is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="site-index"
          role="dialog"
          aria-modal="true"
          aria-label={labels.indexAria}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[95] bg-surface-50"
          ref={panelRef}
        >
          {/* Ambient structure behind the index — the same grid language as the cover. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-[0.22]" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 end-[-10%] h-[520px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
          />

          <motion.div
            className="relative flex h-full flex-col"
            initial={{ y: 18 }}
            animate={{ y: 0 }}
            exit={{ y: 12 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="container flex h-20 shrink-0 items-center justify-between gap-4">
              <Link href="/" onClick={onClose} aria-label={siteName}>
                <Logo size={40} />
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher locale={locale} label={labels.language} />
                <ThemeToggle className="hidden sm:inline-flex" />
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full border border-line-200 bg-surface px-4 py-2.5 text-[12px] font-semibold text-ink-900 transition-colors hover:bg-surface-100"
                >
                  {labels.close}
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="container min-h-0 flex-1 overflow-y-auto pb-10">
              <div className="grid gap-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                <div>
                  <p className="kicker mb-6 flex flex-wrap items-center gap-3">
                    <span className="h-px w-8 bg-brand-500/60" aria-hidden />
                    {labels.fullIndex} · {String(nav.length).padStart(2, "0")} {labels.sections}
                    <span className="text-[10px] font-normal normal-case tracking-normal text-ink-400">
                      {labels.scrollHint}
                    </span>
                  </p>

                  <ol className="border-t border-line-200">
                    {nav.map((item, index) => {
                      const isActive = item.href === activeHref;
                      return (
                        <li key={`${item.href}-${item.label}`} className="border-b border-line-200">
                          <div
                            onMouseEnter={() => {
                              setActiveHref(item.href);
                              setHoverImage(
                                item.image
                                  ? { src: item.image, caption: item.imageAlt || item.label }
                                  : null,
                              );
                            }}
                            onFocus={() => setActiveHref(item.href)}
                            onMouseLeave={() => setHoverImage(null)}
                            className="group flex items-start gap-4 py-4 sm:gap-6 sm:py-5"
                          >
                            <span
                              className={`mt-1.5 text-[10px] font-bold tabular-nums transition-colors ${
                                isActive ? "text-accent" : "text-ink-400"
                              }`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <Link href={item.href} onClick={onClose} className="flex items-start gap-3">
                                <span
                                  className={`block flex-1 text-[clamp(1.45rem,3.1vw,2.6rem)] font-extrabold leading-[1.25] transition-all duration-300 ease-smooth ${
                                    isActive
                                      ? "text-accent-strong"
                                      : "text-ink-900 group-hover:text-accent-strong"
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <ArrowUpRight
                                  className={`mt-2 h-4 w-4 shrink-0 transition-all duration-300 ${
                                    isActive ? "text-accent opacity-100" : "text-ink-400 opacity-0 group-hover:opacity-100"
                                  }`}
                                  aria-hidden
                                />
                              </Link>
                              {item.children?.length ? (
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={onClose}
                                      onMouseEnter={() =>
                                        setHoverImage(
                                          child.image
                                            ? { src: child.image, caption: child.imageAlt || child.label }
                                            : null,
                                        )
                                      }
                                      className="text-[11.5px] text-ink-700 transition-colors hover:text-accent"
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Preview column: one photograph per section, cross-faded. */}
                <div className="hidden lg:block">
                  <div className="sticky top-4">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] border border-line-200 bg-surface-100">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={preview.src}
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.01 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={preview.src}
                            alt={preview.caption}
                            fill
                            sizes="380px"
                            className="object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-900/85 via-dark-900/25 to-transparent p-5 pt-16">
                        {preview.caption && preview.caption !== active?.label ? (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200">
                            {preview.caption}
                          </p>
                        ) : null}
                        <p className="mt-1 text-lg font-bold text-white">{active?.label}</p>
                      </div>
                    </div>

                    <dl className="mt-6 space-y-3 text-[12px]">
                      <div className="flex items-baseline justify-between gap-4 border-b border-line-200 pb-2">
                        <dt className="text-ink-500">{labels.phone}</dt>
                        <dd>
                          <a href={`tel:${toLatinDigits(phone)}`} dir="ltr" className="font-medium text-ink-900 hover:text-accent">
                            {phone}
                          </a>
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-4 border-b border-line-200 pb-2">
                        <dt className="text-ink-500">{labels.email}</dt>
                        <dd>
                          <a href={`mailto:${email}`} dir="ltr" className="font-medium text-ink-900 hover:text-accent">
                            {email}
                          </a>
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-ink-500">{labels.hours}</dt>
                        <dd className="text-ink-700">{hours}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="container flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line-200 py-4 text-[11px] text-ink-500">
              <span>{labels.escHint}</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
                {siteName}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
