"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowLeft, Phone } from "lucide-react";
import type { NavItem } from "@/lib/site";
import { toLatinDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MenuOverlay } from "@/components/site/menu-overlay";
import { EASE } from "@/components/motion/reveal";
import type { HeaderSettings } from "@/server/settings";

/**
 * Site header.
 *
 * The bar stays deliberately quiet: wordmark, the five most-used sections and
 * one unmistakable entry into the full-screen index. Everything else — every
 * section and its children, plus contact details — lives in the index, which is
 * the navigation model of this design rather than a fallback menu.
 */
export function Header({ settings, nav }: { settings: HeaderSettings; nav: NavItem[] }) {
  const pathname = usePathname();
  const [indexOpen, setIndexOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => setCompact(value > 12));

  // A route change always ends with the index closed, including back/forward.
  useEffect(() => {
    setIndexOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Admin-adjustable; clamped so a typo cannot break the bar's height.
  const logoSize = Math.min(96, Math.max(24, Number(settings.logo_height) || 44));
  const primary = nav.slice(1, 6);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility strip — hours on one side, direct contact on the other. */}
      <div
        className={cn(
          "hidden overflow-hidden border-b transition-all duration-300 lg:block",
          compact ? "max-h-0 border-transparent opacity-0" : "max-h-9 border-line-200 opacity-100",
        )}
      >
        <div className="container flex h-9 items-center justify-between text-[10.5px] tracking-wide text-ink-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            {settings.hours}
          </span>
          <a
            href={`tel:${toLatinDigits(settings.phone)}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Phone className="h-3 w-3" aria-hidden />
            <span dir="ltr">{settings.phone}</span>
          </a>
        </div>
      </div>

      <div
        className={cn(
          "border-b transition-all duration-300 ease-smooth",
          compact
            ? "border-line-200 bg-surface-50/85 shadow-soft backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Link href="/" aria-label={settings.site_name} className="shrink-0">
            <Logo src={settings.logo_path || undefined} size={logoSize} />
          </Link>

          <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 xl:flex">
            {primary.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-3 py-2 text-[12.5px] font-medium transition-colors duration-200",
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
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:inline-flex" />
            <Link
              href="/contact"
              className="hidden items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2.5 text-[12.5px] font-medium text-white transition-all duration-200 hover:bg-brand-800 hover:shadow-glow sm:inline-flex"
            >
              تماس با ما
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            </Link>

            {/* The index trigger: a dot lattice that mirrors the site's grid. */}
            <button
              type="button"
              onClick={() => setIndexOpen(true)}
              aria-expanded={indexOpen}
              aria-haspopup="dialog"
              aria-label="فهرست سایت"
              className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-line-200 bg-surface/70 pe-3 ps-3 backdrop-blur transition-all duration-300 hover:border-brand-500/50 hover:bg-surface-100 sm:pe-4"
            >
              <span
                aria-hidden
                className="grid h-4 w-4 grid-cols-2 grid-rows-2 gap-[3px] text-ink-700 transition-transform duration-500 ease-smooth group-hover:rotate-90"
              >
                {[0, 1, 2, 3].map((cell) => (
                  <span key={cell} className="rounded-[1px] bg-current" />
                ))}
              </span>
              <span className="hidden text-[12px] font-semibold text-ink-900 sm:inline">فهرست</span>
            </button>
          </div>
        </div>
      </div>

      <MenuOverlay
        open={indexOpen}
        onClose={() => setIndexOpen(false)}
        nav={nav}
        siteName={settings.site_name}
        phone={settings.phone}
        email={settings.email}
        hours={settings.hours}
      />
    </header>
  );
}
