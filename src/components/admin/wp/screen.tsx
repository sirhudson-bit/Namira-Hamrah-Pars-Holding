import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page title, breadcrumb and the screen's primary action. */
export function ScreenHeader({
  title,
  description,
  breadcrumb,
  action,
  meta,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-5">
      {breadcrumb?.length ? (
        <nav aria-label="مسیر" className="mb-1.5 flex flex-wrap items-center gap-1 text-[11.5px] text-ink-500">
          <Link href="/admin/dashboard" className="transition-colors hover:text-accent">
            پیشخوان
          </Link>
          {breadcrumb.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" aria-hidden />
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-accent">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink-700">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[23px] font-normal leading-tight text-ink-900">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-[12.5px] leading-6 text-ink-500">{description}</p>
          ) : null}
          {meta ? <div className="mt-2">{meta}</div> : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}

/** Settings-style tabs. Links, not buttons, so each tab is a real URL. */
export function ScreenTabs({
  tabs,
  active,
}: {
  tabs: { label: string; href: string; key: string }[];
  active: string;
}) {
  return (
    <nav className="wp-tabs" aria-label="بخش‌های این صفحه">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          data-active={tab.key === active ? "true" : undefined}
          className="wp-tab"
          aria-current={tab.key === active ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export type ListColumn = {
  label: string;
  /** Hidden on narrow screens; the first column always shows. */
  hideOnMobile?: boolean;
  width?: string;
};

export type ListRow = {
  id: string;
  /** Cell content, one entry per column. The first column gets the title style. */
  cells: ReactNode[];
  title: string;
  href: string;
  externalHref?: string;
  actions: ReactNode;
  badge?: ReactNode;
};

/**
 * WordPress list table.
 *
 * Row actions live under the title (as in WP), stay hidden until the row is
 * hovered and are always visible on touch. Columns marked `hideOnMobile` drop
 * out below `md`, so the table never needs a horizontal scrollbar on a phone.
 */
export function ListTable({
  columns,
  rows,
  toolbar,
  empty = "موردی ثبت نشده است.",
}: {
  columns: ListColumn[];
  rows: ListRow[];
  toolbar?: ReactNode;
  empty?: string;
}) {
  return (
    <div className="card overflow-hidden">
      {toolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-200 px-4 py-3">
          {toolbar}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-ink-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.label}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(index > 0 && column.hideOnMobile && "hidden md:table-cell")}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, index) => (
                    <td
                      key={index}
                      className={cn(
                        index === 0 && "min-w-[220px]",
                        index > 0 && columns[index]?.hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      {index === 0 ? (
                        <>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <Link
                              href={row.href}
                              className="font-semibold text-accent hover:text-accent-strong hover:underline"
                            >
                              {row.title}
                            </Link>
                            {row.badge}
                          </div>
                          <div className="wp-row-actions">
                            <Link href={row.href} className="wp-action">
                              ویرایش
                            </Link>
                            {row.externalHref ? (
                              <a
                                href={row.externalHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wp-action"
                              >
                                نمایش
                              </a>
                            ) : null}
                            {row.actions}
                          </div>
                        </>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line-200 px-4 py-2.5 text-[11.5px] text-ink-500">
        <span>{rows.length.toLocaleString("fa-IR")} مورد</span>
        <span>مرتب‌شده بر اساس آخرین تغییر</span>
      </div>
    </div>
  );
}

/** GET search box, the way WP list tables filter by keyword. */
export function SearchBox({
  action,
  name = "s",
  value = "",
  placeholder = "جستجو…",
  hidden = {},
}: {
  action: string;
  name?: string;
  value?: string;
  placeholder?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      {Object.entries(hidden).map(([key, val]) => (
        <input key={key} type="hidden" name={key} value={val} />
      ))}
      <label htmlFor={`search-${name}`} className="sr-only">
        {placeholder}
      </label>
      <input
        id={`search-${name}`}
        type="search"
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="input h-9 w-48 py-1.5 text-[12.5px]"
      />
      <button type="submit" className="btn-secondary h-9 px-3 py-1 text-[12px]">
        <Search className="h-3.5 w-3.5" aria-hidden />
        جستجو
      </button>
    </form>
  );
}

/** WordPress-style status/count filter links. */
export function CountLinks({
  items,
}: {
  items: { label: string; href: string; count?: number; active?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={cn(
            "transition-colors hover:text-accent",
            item.active ? "font-semibold text-ink-900" : "text-ink-500",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span className="ms-1 text-ink-400">({item.count.toLocaleString("fa-IR")})</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
