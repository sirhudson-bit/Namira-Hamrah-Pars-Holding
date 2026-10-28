"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Briefcase,
  FileText,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  Menu,
  Newspaper,
  PenLine,
  Settings,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  home: Home,
  pages: FileText,
  menu: Menu,
  content: Layers,
  layout: LayoutTemplate,
  groups: Boxes,
  stores: Store,
  news: Newspaper,
  blog: PenLine,
  careers: Briefcase,
  forms: Inbox,
  media: ImageIcon,
  settings: Settings,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav aria-label="ناوبری داشبورد" className="space-y-6">
      {ADMIN_NAV.map((group) => (
        <div key={group.section}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            {group.section}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-700 text-white"
                        : "text-ink-700 hover:bg-brand-700/20 hover:text-accent",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-line-200 bg-surface px-4 py-3 lg:hidden">
        <span className="text-sm font-bold text-ink-900">پنل مدیریت</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="باز کردن منو"
          className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-200"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-l border-line-200 bg-surface lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto p-4">{nav}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-dark-900/50"
          />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-surface p-4 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-900">پنل مدیریت</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-200"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  );
}
