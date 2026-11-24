import Link from "next/link";
import { ExternalLink, Home, LogOut, Plus } from "lucide-react";
import { logoutAction } from "@/server/auth-actions";
import type { SessionUser } from "@/server/auth";

/**
 * WordPress-style admin bar.
 *
 * The "+ افزودن" menu is a native `<details>` element: it opens without
 * JavaScript, closes on Escape or a second click, and never traps the pointer
 * the way a hover-only menu does.
 */
export function AdminBar({ user }: { user: SessionUser }) {
  const quickLinks = [
    { label: "خبر جدید", href: "/admin/news?new=1" },
    { label: "مقاله جدید", href: "/admin/blog?new=1" },
    { label: "برگه جدید", href: "/admin/pages?new=1" },
    { label: "رسانه جدید", href: "/admin/media?new=1" },
    { label: "گروه کسب‌وکار", href: "/admin/business-groups?new=1" },
    { label: "فروشگاه جدید", href: "/admin/stores?new=1" },
  ];

  return (
    <div className="wp-adminbar sticky top-0 z-40">
      <div className="flex h-8 items-center justify-between gap-3 px-3">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">پیشخوان</span>
          </Link>

          <details className="group relative">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded px-2 py-1 transition-colors [&::-webkit-details-marker]:hidden">
              <Plus className="h-3.5 w-3.5" aria-hidden />
              افزودن
            </summary>
            <div className="absolute start-0 top-full z-50 mt-1 w-44 overflow-hidden rounded border border-white/10 bg-dark-900 py-1 shadow-xl">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-brand-700 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">مشاهده سایت</span>
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-1">
          <span className="hidden truncate pe-2 text-[11.5px] text-white/70 sm:inline">
            سلام، {user.name}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11.5px] transition-colors hover:text-[#72aee6]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              خروج
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
