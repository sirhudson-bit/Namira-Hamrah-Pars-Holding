import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, LayoutTemplate, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { addBlock, deleteBlock, moveBlock, saveBlock, toggleBlock } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { PreviewPane } from "@/components/admin/preview-pane";
import { ScreenHeader } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";
import {
  BLOCK_BY_TYPE,
  BLOCK_DEFS,
  LAYOUT_PAGES,
  parseBlockData,
  type BlockField,
} from "@/lib/blocks";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ابزارک‌ها" };

/** Maps a widget's own field definition to the shared admin form spec. */
function toFieldSpec(
  field: BlockField,
  data: Record<string, string>,
  defaults: Record<string, string>,
): FieldSpec {
  const value = data[field.name] ?? defaults[field.name] ?? "";
  if (field.type === "textarea") {
    return {
      type: "textarea",
      name: `data_${field.name}`,
      label: field.label,
      defaultValue: value,
      rows: field.rows ?? 4,
      hint: field.hint,
    };
  }
  if (field.type === "image") {
    return {
      type: "image",
      name: `data_${field.name}`,
      label: field.label,
      defaultValue: value,
      hint: field.hint,
    };
  }
  if (field.type === "select") {
    return {
      type: "select",
      name: `data_${field.name}`,
      label: field.label,
      options: field.options ?? [],
      defaultValue: value,
    };
  }
  return {
    type: field.type === "number" ? "number" : "text",
    name: `data_${field.name}`,
    label: field.label,
    defaultValue: value,
    placeholder: field.placeholder,
    hint: field.hint,
  };
}

export default async function AdminWidgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; block?: string }>;
}) {
  const params = await searchParams;
  const customPages = await prisma.page.findMany({
    where: { slug: { notIn: LAYOUT_PAGES.map((item) => item.slug) } },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
  const layoutPages = [...LAYOUT_PAGES, ...customPages.map((item) => ({ slug: item.slug, label: item.title }))];
  const active = layoutPages.find((entry) => entry.slug === params.page) ?? layoutPages[0];
  const blocks = await prisma.pageBlock.findMany({
    where: { pageSlug: active.slug },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
  });
  const editing = params.block ? blocks.find((block) => block.id === params.block) : undefined;
  const publicHref = active.slug === "home" ? "/" : `/${active.slug}`;
  const listHref = `/admin/layout?page=${active.slug}`;

  const editingDef = editing ? BLOCK_BY_TYPE[editing.type] : undefined;
  const editingFields: FieldSpec[] = editing && editingDef
    ? [
        ...editingDef.fields.map((field) => toFieldSpec(field, parseBlockData(editing.data), editingDef.defaults)),
        {
          type: "checkbox" as const,
          name: "visible",
          label: "نمایش این ابزارک در سایت",
          defaultChecked: editing.visible,
        },
      ]
    : [];

  return (
    <div>
      <ScreenHeader
        title="ابزارک‌ها"
        description="برای هر صفحه ابزارک اضافه کنید؛ ابزارک‌ها زیر هیرو و پیش از محتوای پیش‌فرض صفحه نمایش داده می‌شوند."
        breadcrumb={[{ label: "نمایش" }, { label: "ابزارک‌ها" }]}
        action={
          <Link href={publicHref} target="_blank" className="btn-secondary">
            <ExternalLink className="h-4 w-4" aria-hidden />
            مشاهده {active.label}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {layoutPages.map((entry) => (
          <Link
            key={entry.slug}
            href={`/admin/layout?page=${entry.slug}`}
            aria-current={entry.slug === active.slug ? "page" : undefined}
            className={cn(
              "rounded-[3px] border px-3 py-1.5 text-[12px] transition-colors",
              entry.slug === active.slug
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line-200 bg-surface text-ink-700 hover:border-accent hover:text-accent",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="min-w-0 space-y-5">
          {editing ? (
            <section className="card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-200 px-4 py-2.5">
                <h2 className="text-[13px] font-bold text-ink-900">
                  ویرایش ابزارک: {editingDef?.label ?? editing.type}
                </h2>
                <Link href={listHref} className="text-[11.5px] text-accent">
                  بستن
                </Link>
              </div>
              <div className="p-4">
                {editingDef ? (
                  <RecordForm
                    action={saveBlock}
                    hidden={{ id: editing.id, pageSlug: editing.pageSlug, type: editing.type }}
                    fields={editingFields}
                    submitLabel="ذخیره ابزارک"
                  />
                ) : (
                  <p className="text-[12.5px] text-ink-500">نوع این ابزارک شناخته نشد.</p>
                )}
              </div>
            </section>
          ) : null}

          <section className="card overflow-hidden">
            <h2 className="flex items-center justify-between border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
              ابزارک‌های «{active.label}»
              <span className="text-[11px] font-normal text-ink-500">
                {toPersianDigits(blocks.length)} ابزارک
              </span>
            </h2>
            {blocks.length === 0 ? (
              <p className="px-4 py-10 text-center text-[12.5px] text-ink-500">
                این صفحه هنوز ابزارکی ندارد و فقط محتوای پیش‌فرض خود را نشان می‌دهد.
              </p>
            ) : (
              <ul className="divide-y divide-line-200">
                {blocks.map((block, index) => {
                  const def = BLOCK_BY_TYPE[block.type];
                  const data = parseBlockData(block.data);
                  return (
                    <li
                      key={block.id}
                      className={cn("group flex flex-wrap items-center gap-3 px-4 py-2.5", !block.visible && "opacity-60")}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line-200 bg-surface-100 text-[12px] font-bold text-accent">
                        {def?.glyph ?? "?"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`${listHref}&block=${block.id}`}
                          className="text-[12.5px] font-semibold text-accent hover:underline"
                        >
                          {toPersianDigits(index + 1)}. {def?.label ?? block.type}
                        </Link>
                        <p className="truncate text-[10.5px] text-ink-500">
                          {data.title || data.body || data.caption || def?.description}
                        </p>
                        <div className="wp-row-actions">
                          <Link href={`${listHref}&block=${block.id}`} className="wp-action">
                            ویرایش
                          </Link>
                          <form action={moveBlock} className="inline">
                            <input type="hidden" name="id" value={block.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button type="submit" disabled={index === 0} className="wp-action disabled:opacity-40">
                              <ArrowUp className="inline h-3 w-3" aria-hidden /> بالا
                            </button>
                          </form>
                          <form action={moveBlock} className="inline">
                            <input type="hidden" name="id" value={block.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              disabled={index === blocks.length - 1}
                              className="wp-action disabled:opacity-40"
                            >
                              <ArrowDown className="inline h-3 w-3" aria-hidden /> پایین
                            </button>
                          </form>
                          <form action={toggleBlock} className="inline">
                            <input type="hidden" name="id" value={block.id} />
                            <button type="submit" className="wp-action">
                              {block.visible ? "پنهان کردن" : "نمایش دادن"}
                            </button>
                          </form>
                          <InlineDelete action={deleteBlock} id={block.id} />
                        </div>
                      </div>
                      <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">
                        {block.visible ? (def?.label ?? block.type) : "پنهان"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="flex items-center gap-2 border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
              <LayoutTemplate className="h-4 w-4 text-accent" aria-hidden />
              افزودن ابزارک
            </h2>
            <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {BLOCK_DEFS.map((def) => (
                <form key={def.type} action={addBlock}>
                  <input type="hidden" name="pageSlug" value={active.slug} />
                  <input type="hidden" name="type" value={def.type} />
                  <button
                    type="submit"
                    className="flex h-full w-full items-start gap-2.5 rounded border border-line-200 bg-surface p-3 text-start transition-colors hover:border-accent hover:bg-surface-100"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-surface-200 text-[11px] font-bold text-accent">
                      {def.glyph}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-900">
                        {def.label}
                        <Plus className="h-3 w-3 text-ink-400" aria-hidden />
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-5 text-ink-500">
                        {def.description}
                      </span>
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="card p-3">
            <h2 className="mb-2 text-[12.5px] font-bold text-ink-900">پیش‌نمایش صفحه</h2>
            <PreviewPane src={publicHref} />
          </div>
          <p className="px-1 text-[11px] leading-6 text-ink-500">
            ابزارک‌ها فقط روی همین صفحه اعمال می‌شوند. ترتیب نمایش با دکمه‌های بالا/پایین تغییر می‌کند.
          </p>
        </aside>
      </div>
    </div>
  );
}
