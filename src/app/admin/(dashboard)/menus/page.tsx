import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { getMenusForAdmin, type MenuWithItems } from "@/server/menus";
import {
  createMenu,
  deleteMenu,
  deleteMenuItem,
  moveMenuItem,
  saveMenu,
  saveMenuItem,
} from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "منوها" };

function itemFields(menu: MenuWithItems, item?: MenuWithItems["items"][number]): FieldSpec[] {
  const parents = menu.items.filter((row) => row.id !== item?.id && !row.parentId);
  return [
    { type: "text", name: "label", label: "عنوان آیتم", required: true, defaultValue: item?.label },
    {
      type: "text",
      name: "href",
      label: "نشانی",
      dir: "ltr",
      required: true,
      defaultValue: item?.href,
      placeholder: "/about",
      hint: "نشانی داخلی مثل /about، کامل https://…، یا mailto:/tel:",
    },
    {
      type: "select",
      name: "parentId",
      label: "زیرمنوی",
      defaultValue: item?.parentId ?? "",
      options: [{ value: "", label: "بدون والد (سطح اول)" }, ...parents.map((row) => ({ value: row.id, label: row.label }))],
    },
    {
      type: "text",
      name: "description",
      label: "توضیح کوتاه (زیرمنو)",
      defaultValue: item?.description,
      hint: "در منوی کشویی دسکتاپ زیر عنوان نمایش داده می‌شود.",
    },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "visible", label: "نمایش در سایت", defaultChecked: item?.visible ?? true },
    { type: "checkbox", name: "openInNewTab", label: "باز شدن در تب جدید", defaultChecked: item?.openInNewTab ?? false },
  ];
}

export default async function AdminMenusPage({ searchParams }: { searchParams: Promise<{ menu?: string }> }) {
  const { menu: menuKey } = await searchParams;
  const menus = await getMenusForAdmin();
  const active = menus.find((menu) => menu.key === menuKey) ?? menus[0];
  const orderedItems = active
    ? active.items
        .filter((item) => !item.parentId)
        .flatMap((item) => [item, ...active.items.filter((child) => child.parentId === item.id)])
    : [];

  return (
    <div>
      <AdminPageHeader
        title="منوها"
        description="منوی اصلی سایت و ستون‌های فوتر را مانند وردپرس بسازید و ویرایش کنید. تغییرات بلافاصله در سایت اعمال می‌شود."
      />

      <details className="card mb-6 p-6">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-accent">
          <Plus className="h-4 w-4" aria-hidden /> ساخت منوی جدید
        </summary>
        <div className="mt-5 border-t border-line-200 pt-5">
          <RecordForm
            action={createMenu}
            submitLabel="ساخت منو"
            fields={[
              { type: "text", name: "title", label: "عنوان منو", required: true, placeholder: "مثلاً لینک‌های مفید" },
              {
                type: "text",
                name: "key",
                label: "شناسه (key)",
                dir: "ltr",
                required: true,
                placeholder: "footer-helpful",
                hint: "هر منویی به‌جز header در ستون‌های فوتر نمایش داده می‌شود.",
              },
              { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: 0 },
            ]}
          />
        </div>
      </details>

      {menus.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink-500">منویی وجود ندارد.</div>
      ) : (
        <>
          <nav aria-label="انتخاب منو" className="mb-6 flex flex-wrap gap-2">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={`/admin/menus?menu=${menu.key}`}
                aria-current={menu.key === active?.key ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  menu.key === active?.key
                    ? "border-brand-500 bg-brand-700 text-white"
                    : "border-line-200 text-ink-700 hover:border-brand-500/60 hover:text-accent",
                )}
              >
                {menu.title}
                <span className="mr-1 text-[10px] opacity-70" dir="ltr">({menu.key})</span>
              </Link>
            ))}
          </nav>

          {active ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
              <div className="space-y-6">
                <section className="card p-6">
                  <h2 className="mb-4 text-sm font-bold text-ink-900">تنظیمات منو</h2>
                  <RecordForm
                    action={saveMenu}
                    hidden={{ id: active.id }}
                    columns={1}
                    submitLabel="ذخیره تنظیمات"
                    fields={[
                      { type: "text", name: "title", label: "عنوان منو", required: true, defaultValue: active.title },
                      { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: active.sortOrder },
                    ]}
                  />
                  {active.key !== "header" ? (
                    <form action={deleteMenu} className="mt-4 border-t border-line-200 pt-4">
                      <input type="hidden" name="id" value={active.id} />
                      <button type="submit" className="btn-ghost px-2 py-1 text-xs text-red-400">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden /> حذف این منو
                      </button>
                    </form>
                  ) : null}
                </section>

                <section className="card p-6">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <Plus className="h-4 w-4 text-accent" aria-hidden /> افزودن آیتم
                  </h2>
                  <p className="mb-4 text-xs text-ink-500">
                    برای ساخت زیرمنو، ابتدا آیتم سطح اول را بسازید و سپس در فیلد «زیرمنوی» آن را انتخاب کنید.
                  </p>
                  <RecordForm
                    action={saveMenuItem}
                    hidden={{ menuId: active.id }}
                    columns={1}
                    submitLabel="افزودن به منو"
                    fields={itemFields(active)}
                  />
                </section>
              </div>

              <section className="card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-ink-900">آیتم‌های منو ({active.items.length})</h2>
                  <Link href="/" target="_blank" className="btn-ghost px-2 py-1 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden /> مشاهده سایت
                  </Link>
                </div>
                {active.items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-500">این منو هنوز آیتمی ندارد.</p>
                ) : (
                  <div className="space-y-3">
                    {orderedItems.map((item) => (
                      <details key={item.id} className="rounded-card border border-line-200 bg-surface-50 p-4">
                        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                          <span className={cn("text-sm font-medium", !item.visible && "text-ink-500 line-through")}>
                            {item.parentId ? "↳ " : ""}
                            {item.label}
                          </span>
                          <span className="text-[11px] text-ink-500" dir="ltr">{item.href}</span>
                        </summary>
                        <div className="mt-4 border-t border-line-200 pt-4">
                          <RecordForm
                            action={saveMenuItem}
                            hidden={{ id: item.id, menuId: active.id }}
                            columns={1}
                            submitLabel="ذخیره آیتم"
                            fields={itemFields(active, item)}
                          />
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-200 pt-4">
                            <form action={moveMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="direction" value="up" />
                              <button type="submit" className="btn-ghost px-2 py-1 text-xs" aria-label={`بالا بردن ${item.label}`}>
                                <ArrowUp className="h-3.5 w-3.5" aria-hidden /> بالا
                              </button>
                            </form>
                            <form action={moveMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="direction" value="down" />
                              <button type="submit" className="btn-ghost px-2 py-1 text-xs" aria-label={`پایین بردن ${item.label}`}>
                                <ArrowDown className="h-3.5 w-3.5" aria-hidden /> پایین
                              </button>
                            </form>
                            <form action={deleteMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="btn-ghost px-2 py-1 text-xs text-red-400">
                                <Trash2 className="h-3.5 w-3.5" aria-hidden /> حذف
                              </button>
                            </form>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
                {active.items.some((item) => !item.parentId) ? (
                  <p className="mt-4 text-[11px] text-ink-500">
                    زیرمنوهای هر آیتم به‌صورت تورفته (↳) نمایش داده می‌شوند؛ ترتیب آن‌ها با دکمه‌های بالا/پایین در همان سطح عوض می‌شود.
                  </p>
                ) : null}
              </section>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
