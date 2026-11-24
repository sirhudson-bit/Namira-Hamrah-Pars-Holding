import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, Plus } from "lucide-react";
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
import { ScreenHeader } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";
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
      options: [
        { value: "", label: "بدون والد (سطح اول)" },
        ...parents.map((row) => ({ value: row.id, label: row.label })),
      ],
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
    {
      type: "checkbox",
      name: "openInNewTab",
      label: "باز شدن در تب جدید",
      defaultChecked: item?.openInNewTab ?? false,
    },
  ];
}

export default async function AdminMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string; item?: string; new?: string }>;
}) {
  const params = await searchParams;
  const menus = await getMenusForAdmin();
  const active = menus.find((menu) => menu.key === params.menu) ?? menus[0];
  const editing = params.item ? active?.items.find((item) => item.id === params.item) : undefined;
  const showNewItem = params.new === "1";

  const orderedItems = active
    ? active.items
        .filter((item) => !item.parentId)
        .flatMap((item) => [item, ...active.items.filter((child) => child.parentId === item.id)])
    : [];

  return (
    <div>
      <ScreenHeader
        title="منوها"
        description="منوی اصلی سایت و ستون‌های فوتر. تغییرات بلافاصله در سایت اعمال می‌شود."
        breadcrumb={[{ label: "نمایش" }, { label: "منوها" }]}
        action={
          <>
            <Link href="/" target="_blank" className="btn-secondary">
              <ExternalLink className="h-4 w-4" aria-hidden />
              مشاهده سایت
            </Link>
            {active ? (
              <Link href={`/admin/menus?menu=${active.key}&new=1`} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                افزودن آیتم
              </Link>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {menus.map((menu) => (
          <Link
            key={menu.id}
            href={`/admin/menus?menu=${menu.key}`}
            aria-current={menu.key === active?.key ? "page" : undefined}
            className={cn(
              "rounded-[3px] border px-3 py-1.5 text-[12px] transition-colors",
              menu.key === active?.key
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line-200 bg-surface text-ink-700 hover:border-accent hover:text-accent",
            )}
          >
            {menu.title}
            <span className="ms-1 text-[10px] opacity-70" dir="ltr">
              ({menu.key})
            </span>
          </Link>
        ))}
      </div>

      {menus.length === 0 ? (
        <div className="card px-4 py-10 text-center text-[13px] text-ink-500">منویی وجود ندارد.</div>
      ) : null}

      {active ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0 space-y-5">
            {(editing || showNewItem) && (
              <section className="card">
                <div className="flex items-center justify-between gap-3 border-b border-line-200 px-4 py-2.5">
                  <h2 className="text-[13px] font-bold text-ink-900">
                    {editing ? `ویرایش «${editing.label}»` : "آیتم جدید"}
                  </h2>
                  <Link href={`/admin/menus?menu=${active.key}`} className="text-[11.5px] text-accent">
                    بستن
                  </Link>
                </div>
                <div className="p-4">
                  <RecordForm
                    action={saveMenuItem}
                    hidden={{ id: editing?.id ?? "", menuId: active.id }}
                    columns={2}
                    submitLabel={editing ? "ذخیره آیتم" : "افزودن به منو"}
                    fields={itemFields(active, editing)}
                  />
                </div>
              </section>
            )}

            <section className="card overflow-hidden">
              <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
                ساختار منو ({active.items.length.toLocaleString("fa-IR")})
              </h2>
              {orderedItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12.5px] text-ink-500">
                  این منو هنوز آیتمی ندارد. با «افزودن آیتم» شروع کنید.
                </p>
              ) : (
                <ul className="divide-y divide-line-200">
                  {orderedItems.map((item, index) => (
                    <li
                      key={item.id}
                      className={cn(
                        "group flex flex-wrap items-center gap-3 px-4 py-2.5",
                        !item.visible && "opacity-60",
                      )}
                    >
                      <span className="w-5 text-[10px] tabular-nums text-ink-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={cn("min-w-0 flex-1", item.parentId && "ps-5")}>
                        <Link
                          href={`/admin/menus?menu=${active.key}&item=${item.id}`}
                          className="text-[12.5px] font-semibold text-accent hover:underline"
                        >
                          {item.parentId ? "↳ " : ""}
                          {item.label}
                        </Link>
                        <span className="ms-2 text-[10.5px] text-ink-500" dir="ltr">
                          {item.href}
                        </span>
                        <div className="wp-row-actions">
                          <Link href={`/admin/menus?menu=${active.key}&item=${item.id}`} className="wp-action">
                            ویرایش
                          </Link>
                          <form action={moveMenuItem} className="inline">
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button type="submit" className="wp-action" aria-label={`بالا بردن ${item.label}`}>
                              <ArrowUp className="inline h-3 w-3" aria-hidden /> بالا
                            </button>
                          </form>
                          <form action={moveMenuItem} className="inline">
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button type="submit" className="wp-action" aria-label={`پایین بردن ${item.label}`}>
                              <ArrowDown className="inline h-3 w-3" aria-hidden /> پایین
                            </button>
                          </form>
                          <InlineDelete action={deleteMenuItem} id={item.id} />
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px]",
                          item.visible ? "bg-surface-200 text-ink-700" : "bg-[#fcf0f1] text-red-400",
                        )}
                      >
                        {item.visible ? "نمایش" : "پنهان"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="border-t border-line-200 px-4 py-2.5 text-[10.5px] text-ink-500">
                زیرمنوها با ↳ نمایش داده می‌شوند؛ ترتیب در هر سطح با «بالا/پایین» عوض می‌شود.
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="card">
              <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
                تنظیمات منو
              </h2>
              <div className="p-4">
                <RecordForm
                  action={saveMenu}
                  hidden={{ id: active.id }}
                  columns={1}
                  submitLabel="ذخیره"
                  fields={[
                    { type: "text", name: "title", label: "عنوان منو", required: true, defaultValue: active.title },
                    { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: active.sortOrder },
                  ]}
                />
                {active.key !== "header" ? (
                  <form action={deleteMenu} className="mt-3 border-t border-line-200 pt-3">
                    <input type="hidden" name="id" value={active.id} />
                    <button type="submit" className="wp-action wp-action-danger text-[11.5px]">
                      حذف این منو
                    </button>
                  </form>
                ) : null}
              </div>
            </section>

            <section className="card">
              <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
                ساخت منوی جدید
              </h2>
              <div className="p-4">
                <RecordForm
                  action={createMenu}
                  columns={1}
                  submitLabel="ساخت منو"
                  fields={[
                    {
                      type: "text",
                      name: "title",
                      label: "عنوان منو",
                      required: true,
                      placeholder: "مثلاً لینک‌های مفید",
                    },
                    {
                      type: "text",
                      name: "key",
                      label: "شناسه (key)",
                      dir: "ltr",
                      required: true,
                      placeholder: "footer-helpful",
                      hint: "هر منویی به‌جز header در ستون‌های فوتر نمایش داده می‌شود.",
                    },
                    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: 0 },
                  ]}
                />
                {showNewItem || editing ? null : (
                  <Link
                    href={`/admin/menus?menu=${active.key}&new=1`}
                    className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-accent"
                  >
                    <ArrowRight className="h-3 w-3" aria-hidden />
                    افزودن آیتم به این منو
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
