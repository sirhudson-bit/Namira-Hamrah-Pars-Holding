import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, LayoutTemplate } from "lucide-react";
import { prisma } from "@/server/db";
import {
  addBlock,
  deleteBlock,
  moveBlock,
  saveBlock,
  toggleBlock,
} from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { PreviewPane } from "@/components/admin/preview-pane";
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
export const metadata: Metadata = { title: "چیدمان صفحات" };

/** Maps a widget's own field definition to the shared admin form spec. */
function toFieldSpec(field: BlockField, data: Record<string, string>, defaults: Record<string, string>): FieldSpec {
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

export default async function AdminLayoutPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const customPages = await prisma.page.findMany({
    where: { slug: { notIn: LAYOUT_PAGES.map((item) => item.slug) } },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
  const layoutPages = [
    ...LAYOUT_PAGES,
    ...customPages.map((item) => ({ slug: item.slug, label: item.title })),
  ];
  const active = layoutPages.find((p) => p.slug === page) ?? layoutPages[0];
  const blocks = await prisma.pageBlock.findMany({
    where: { pageSlug: active.slug },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
  });
  const publicHref = active.slug === "home" ? "/" : `/${active.slug}`;

  return (
    <div>
      <AdminPageHeader
        title="چیدمان صفحات"
        description="ابزارک‌ها را اضافه، ویرایش و مرتب کنید. ابزارک‌ها زیر هیروی هر صفحه و پیش از محتوای پیش‌فرض آن نمایش داده می‌شوند."
      />

      <nav aria-label="انتخاب صفحه" className="mb-6 flex flex-wrap gap-2">
        {layoutPages.map((item) => (
          <Link
            key={item.slug}
            href={`/admin/layout?page=${item.slug}`}
            aria-current={item.slug === active.slug ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              item.slug === active.slug
                ? "border-brand-500 bg-brand-700 text-white"
                : "border-line-200 text-ink-700 hover:border-brand-500/60 hover:text-accent",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-200 bg-surface p-4">
        <p className="text-xs text-ink-500">
          صفحه: <span className="font-bold text-ink-900">{active.label}</span> ·{" "}
          {toPersianDigits(blocks.length)} ابزارک
        </p>
        <Link href={publicHref} target="_blank" className="btn-ghost px-2 py-1 text-xs">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          مشاهده صفحه
        </Link>
      </div>

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">پیش‌نمایش صفحه</summary>
        <div className="mt-4">
          <PreviewPane src={publicHref} />
        </div>
      </details>

      <section className="card mb-6 p-6">
        <h2 className="mb-1 flex items-center gap-2 heading-3">
          <LayoutTemplate className="h-5 w-5 text-accent" aria-hidden />
          افزودن ابزارک
        </h2>
        <p className="mb-5 text-xs text-ink-500">
          ابزارک مورد نظر را انتخاب کنید؛ سپس تنظیمات آن را در فهرست پایین ویرایش کنید.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {BLOCK_DEFS.map((def) => (
            <form key={def.type} action={addBlock}>
              <input type="hidden" name="pageSlug" value={active.slug} />
              <input type="hidden" name="type" value={def.type} />
              <button
                type="submit"
                className="flex h-full w-full items-start gap-3 rounded-btn border border-line-200 bg-surface-50 p-4 text-right transition-colors hover:border-brand-500/60 hover:bg-surface-100"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-sm font-bold text-accent">
                  {def.glyph}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink-900">{def.label}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-ink-500">
                    {def.description}
                  </span>
                </span>
              </button>
            </form>
          ))}
        </div>
      </section>

      {blocks.length === 0 ? (
        <div className="card p-12 text-center text-sm text-ink-500">
          این صفحه هنوز ابزارکی ندارد و فقط محتوای پیش‌فرض خود را نشان می‌دهد.
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => {
            const def = BLOCK_BY_TYPE[block.type];
            const data = parseBlockData(block.data);
            const fields: FieldSpec[] = def
              ? [
                  ...def.fields.map((field) => toFieldSpec(field, data, def.defaults)),
                  {
                    type: "checkbox",
                    name: "visible",
                    label: "نمایش این ابزارک در سایت",
                    defaultChecked: block.visible,
                  },
                ]
              : [];
            return (
              <details key={block.id} className={cn("card p-5", !block.visible && "opacity-70")}>
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700/20 text-sm font-bold text-accent">
                      {def?.glyph ?? "?"}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink-900">
                        {toPersianDigits(index + 1)}. {def?.label ?? block.type}
                      </span>
                      <span className="block max-w-[22rem] truncate text-[11px] text-ink-500">
                        {data.title || data.body || data.caption || def?.description}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {!block.visible ? (
                      <span className="text-[11px] text-amber-500">پنهان</span>
                    ) : null}
                    <span className="badge">{def?.label ?? block.type}</span>
                  </span>
                </summary>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-200 pt-4">
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
                      aria-label="انتقال به بالا"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      بالا
                    </button>
                  </form>
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === blocks.length - 1}
                      className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
                      aria-label="انتقال به پایین"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      پایین
                    </button>
                  </form>
                  <form action={toggleBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <button type="submit" className="btn-ghost px-2 py-1 text-xs">
                      {block.visible ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" aria-hidden />
                          پنهان کردن
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          نمایش دادن
                        </>
                      )}
                    </button>
                  </form>
                  <span className="mr-auto" />
                  <DeleteButton action={deleteBlock} id={block.id} label="حذف ابزارک" />
                </div>

                {def ? (
                  <div className="mt-5 border-t border-line-200 pt-5">
                    <RecordForm
                      action={saveBlock}
                      hidden={{ id: block.id, pageSlug: block.pageSlug, type: block.type }}
                      fields={fields}
                      submitLabel="ذخیره ابزارک"
                    />
                  </div>
                ) : null}
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
