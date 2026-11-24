"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  FileText,
  Files,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Palette,
  Settings,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  posts: FileText,
  media: ImageIcon,
  pages: Files,
  appearance: Palette,
  content: Boxes,
  forms: Inbox,
  settings: Settings,
  tools: Wrench,
};

/** `href` minus its query string, so `?new=1` still matches the parent screen. */
function pathOnly(href: string) {
  return href.split("?")[0];
}

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Open the section that owns the current screen; moving to another screen
  // opens that section instead of leaving the previous one expanded.
  useEffect(() => {
    const owner = ADMIN_NAV.flatMap((group) => group.items).find((item) =>
      [item.href, ...(item.children ?? []).map((child) => child.href)]
        .map(pathOnly)
        .includes(pathname),
    );
    setExpanded(owner?.label ?? null);
    setDrawer(false);
  }, [pathname]);

  /**
   * Submenu links carry their state in the query (`?tab=seo`, `?type=team`).
   * A link is active only when its params match the current URL; the bare
   * `/admin/settings` URL counts as the first tab, which is what WordPress does
   * with `options-general.php` before a tab has been chosen.
   */
  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (path !== pathname) return false;
    if (!query) return true;

    const target = new URLSearchParams(query);
    for (const [key, value] of target.entries()) {
      const current = searchParams.get(key);
      if (current !== value) {
        if (!(key === "tab" && current === null && value === "general")) return false;
      }
    }
    return true;
  };

  const nav = (
    <nav aria-label="منوی مدیریت" className="flex-1 overflow-y-auto px-2 py-3">
      {ADMIN_NAV.map((group, groupIndex) => (
        <ul key={groupIndex} className={cn("space-y-0.5", groupIndex > 0 && "mt-3 border-t border-white/10 pt-3")}>
          {group.items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const open = expanded === item.label;
            return (
              <li key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    data-active={active ? "true" : undefined}
                    className="wp-menu-link flex-1"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                  {item.children?.length ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : item.label)}
                      aria-expanded={open}
                      aria-label={`زیرمنوی ${item.label}`}
                      className="ms-1 inline-flex h-7 w-7 items-center justify-center rounded text-white/45 transition-colors hover:text-white"
                    >
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
                        aria-hidden
                      />
                    </button>
                  ) : null}
                </div>

                {item.children?.length && open ? (
                  <ul className="mt-0.5 space-y-0.5 pb-1">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            data-active={childActive ? "true" : undefined}
                            className="wp-submenu-link"
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <p className="truncate text-[12px] font-semibold text-white">{user.name}</p>
      <p className="truncate text-[10.5px] text-white/45" dir="ltr">
        {user.email}
      </p>
    </div>
  );

  return (
    <>
      {/* Mobile bar — the drawer itself is not rendered until it is opened. */}
      <div className="flex items-center justify-between bg-dark-900 px-4 py-3 lg:hidden">
        <Link href="/admin/dashboard" className="text-[13px] font-bold text-white">
          پیشخوان نامیرا
        </Link>
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="inline-flex h-9 items-center gap-2 rounded border border-white/20 px-3 text-[12px] text-white"
        >
          منو
          <span aria-hidden className="grid h-3.5 w-3.5 grid-cols-2 grid-rows-2 gap-[2px]">
            {[0, 1, 2, 3].map((cell) => (
              <span key={cell} className="rounded-[1px] bg-current" />
            ))}
          </span>
        </button>
      </div>

      <aside className="hidden w-[236px] shrink-0 bg-dark-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-[52px] items-center gap-2 border-b border-white/10 px-4">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-700 text-[11px] font-black text-white">
              ن
            </span>
            <span className="text-[13px] font-bold text-white">پیشخوان نامیرا</span>
          </div>
          {nav}
          {footer}
        </div>
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 end-0 flex w-[280px] flex-col bg-dark-900 shadow-xl">
            <div className="flex h-[52px] items-center justify-between border-b border-white/10 px-4">
              <span className="text-[13px] font-bold text-white">پیشخوان نامیرا</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="text-[12px] text-white/70 hover:text-white"
              >
                بستن ✕
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      ) : null}
    </>
  );
}
