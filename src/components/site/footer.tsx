import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_NAV } from "@/lib/site";
import { currentJalaliYear } from "@/lib/format";
import { Logo } from "@/components/site/logo";
import { CookieSettingsButton } from "@/components/site/cookie-consent";
import {
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
} from "@/components/site/social-icons";
import type { SiteSettings } from "@/server/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.instagram, label: "اینستاگرام", Icon: InstagramIcon },
    { href: settings.linkedin, label: "لینکدین", Icon: LinkedinIcon },
    { href: settings.telegram, label: "تلگرام", Icon: TelegramIcon },
  ].filter((s) => s.href);

  return (
    <footer className="band relative overflow-hidden border-t border-line-200">
      <div
        className="h-px w-full bg-gradient-to-l from-transparent via-brand-500/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 glow-accent opacity-50 blur-2xl"
        aria-hidden
      />

      <div className="container relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <Logo src={settings.logo_path || undefined} />
            <p className="mt-6 max-w-sm text-sm leading-8 text-ink-500">
              {settings.legal_name} — مجموعه‌ای چند‌گروهی با تمرکز بر خرده‌فروشی دیجیتال، توزیع و
              نوآوری فناورانه.
            </p>
            <ul className="mt-7 space-y-3.5 text-[13px] text-ink-700">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-accent">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a href={`mailto:${settings.email}`} dir="ltr" className="hover:text-accent">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {FOOTER_NAV.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                {col.title}
              </h2>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-ink-700 transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-line-200 pt-7 sm:flex-row">
          <p className="text-[11px] text-ink-500">
            © {currentJalaliYear()} {settings.legal_name}. همه حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-5">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink-500 transition-colors hover:text-accent"
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </a>
            ))}
            <CookieSettingsButton className="text-[11px] text-ink-500 underline underline-offset-4 hover:text-accent" />
          </div>
        </div>
      </div>
    </footer>
  );
}
