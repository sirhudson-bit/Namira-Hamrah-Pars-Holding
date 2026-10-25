"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { MAIN_NAV } from "@/lib/site";
import { toLatinDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { EASE } from "@/components/motion/reveal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { HeaderSettings } from "@/server/settings";

export function Header({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 14));

  useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Admin-adjustable; clamped so a typo cannot break the bar's height.
  const logoSize = Math.min(96, Math.max(24, Number(settings.logo_height) || 44));

  return (
    <header className="sticky top-0 z-50">
      {/* Utility strip */}
      <div
        className={cn(
          "hidden border-b transition-colors duration-300 lg:block",
          compact
            ? "border-transparent bg-surface-50/80 backdrop-blur-xl"
            : "border-line-200 bg-transparent",
        )}
      >
        <div className="container flex h-9 items-center justify-between text-[11px] text-ink-500">
          <span>{settings.hours}</span>
          <a
            href={`tel:${toLatinDigits(settings.phone)}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Phone className="h-3 w-3" aria-hidden />
            <span dir="ltr">{settings.phone}</span>
          </a>
        </div>
      </div>

      {/* Main bar — transparent over the hero, glass once scrolled */}
      <div
        className={cn(
          "border-b transition-all duration-300 ease-smooth",
          compact
            ? "border-line-200 bg-surface-50/80 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container flex h-20 items-center justify-between gap-4">
          <Link href="/" aria-label={settings.site_name} className="shrink-0">
            <Logo src={settings.logo_path || undefined} size={logoSize} />
          </Link>

          <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 xl:flex">
            {MAIN_NAV.map((item) => {
              const active = isActive(item.href);
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-200",
                      active ? "text-accent" : "text-ink-700 hover:text-accent",
                    )}
                  >
                    {item.shortLabel ?? item.label}
                    {active ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-400"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    ) : null}
                  </Link>
                );
              }
              return (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-200",
                      active ? "text-accent" : "text-ink-700 hover:text-accent",
                    )}
                  >
                    {item.shortLabel ?? item.label}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Link>
                  <div className="invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-smooth group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-line-200 bg-surface/95 p-2 shadow-lift backdrop-blur-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-surface-100"
                        >
                          <span className="block text-[13px] font-medium text-ink-900">
                            {child.label}
                          </span>
                          {child.description ? (
                            <span className="mt-0.5 block text-[11px] text-ink-500">
                              {child.description}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden lg:inline-flex" />
            <Link
              href="/contact"
              className="group hidden items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-brand-800 hover:shadow-glow lg:inline-flex"
            >
              تماس با ما
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="باز کردن منو"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-200 text-ink-900 transition-colors hover:bg-surface-100 xl:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Accent hairline that appears once scrolled */}
        <div
          className={cn(
            "h-px w-full bg-gradient-to-l from-transparent via-brand-500/50 to-transparent transition-opacity duration-300",
            compact ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-surface-50 xl:hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35]"
              aria-hidden
            />
            <div className="relative flex h-20 items-center justify-between px-4">
              <Logo src={settings.logo_path || undefined} size={logoSize} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="بستن منو"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-200"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav
              aria-label="ناوبری موبایل"
              className="relative h-[calc(100%-5rem)] overflow-y-auto px-4 pb-8"
            >
              {MAIN_NAV.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.35, ease: EASE }}
                  className="border-b border-line-200 last:border-b-0"
                >
                  {item.children ? (
                    <>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className="flex-1 py-4 text-[15px] font-semibold text-ink-900"
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSection(openSection === item.label ? null : item.label)
                          }
                          aria-expanded={openSection === item.label}
                          aria-label={`زیرمنوی ${item.label}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={cn(
                              "h-4 w-4 text-ink-500 transition-transform duration-300",
                              openSection === item.label && "rotate-180",
                            )}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {openSection === item.label ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3 pr-3">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block rounded-xl px-3 py-3 text-sm text-ink-700 hover:bg-surface-100"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between py-4 text-[15px] font-semibold text-ink-900"
                    >
                      {item.label}
                      <ArrowUpRight className="h-4 w-4 text-ink-500" aria-hidden />
                    </Link>
                  )}
                </motion.div>
              ))}
              <ThemeToggle withLabel className="mt-6" />
              <Link href="/contact" className="btn-primary mt-3 w-full">
                تماس با ما
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
