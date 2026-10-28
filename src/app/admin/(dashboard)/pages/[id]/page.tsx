import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink, LayoutTemplate } from "lucide-react";
import { prisma } from "@/server/db";
import { savePage, deletePage, duplicatePage } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewPane } from "@/components/admin/preview-pane";
import { DeleteButton } from "@/components/admin/delete-button";
import { imagePositionField } from "@/lib/image-fields";
import { formatJalaliLong } from "@/lib/format";

export const dynamic = "force-dynamic";

const SYSTEM_SLUGS = new Set([
  "about",
  "business-groups",
  "stores",
  "innovation",
  "services",
  "units",
  "media",
  "contact",
  "careers",
  "privacy",
  "terms",
  "cookie-policy",
  "refund-policy",
]);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id }, select: { title: true } });
  return { title: page ? `ویرایش ${page.title}` : "ویرایش صفحه" };
}

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();
  const isSystem = SYSTEM_SLUGS.has(page.slug);
  const publicHref = `/${page.slug}`;
  const blockCount = await prisma.pageBlock.count({ where: { pageSlug: page.slug } });

  const fields: FieldSpec[] = [
    { type: "text", name: "title", label: "عنوان صفحه", required: true, defaultValue: page.title },
    ...(isSystem
      ? []
      : [
          {
            type: "text" as const,
            name: "slug",
            label: "نشانی صفحه (slug)",
            dir: "ltr" as const,
            required: true,
            defaultValue: page.slug,
            hint: `آدرس عمومی: /${page.slug}`,
          },
        ]),
    {
      type: "text",
      name: "eyebrow",
      label: "برچسب بالای عنوان",
      hint: "متن کوچک بالای تیتر، مثلاً «درباره ما».",
      defaultValue: page.eyebrow,
    },
    {
      type: "textarea",
      name: "subtitle",
      label: "توضیح کوتاه",
      rows: 2,
      defaultValue: page.subtitle,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر شاخص / هیرو",
      hint: "پس‌زمینه بخش عنوان این صفحه. خالی بماند، تصویر سراسری تنظیمات استفاده می‌شود.",
      defaultValue: page.image,
    },
    imagePositionField(page.imagePosition),
    {
      type: "markdown",
      name: "body",
      label: "محتوای صفحه",
      rows: 20,
      hint: "متن اصلی زیر هیرو نمایش داده می‌شود. برای بخش‌های ویژه از ابزارک‌های صفحه استفاده کنید.",
      defaultValue: page.body,
    },
    { type: "text", name: "seoTitle", label: "عنوان سئو", defaultValue: page.seoTitle },
    { type: "textarea", name: "seoDesc", label: "توضیح سئو", rows: 2, defaultValue: page.seoDesc },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: page.published },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`ویرایش صفحه: ${page.title}`}
        description={`آدرس عمومی /${page.slug} · آخرین ویرایش ${formatJalaliLong(page.updatedAt)}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href={publicHref} target="_blank" className="btn-secondary px-3 py-2 text-xs">
          <ExternalLink className="h-4 w-4" aria-hidden /> مشاهده صفحه
        </Link>
        <Link href={`/admin/layout?page=${page.slug}`} className="btn-secondary px-3 py-2 text-xs">
          <LayoutTemplate className="h-4 w-4" aria-hidden /> ابزارک‌های این صفحه ({blockCount})
        </Link>
        <form action={duplicatePage}>
          <input type="hidden" name="id" value={page.id} />
          <button type="submit" className="btn-ghost px-2 py-1 text-xs">
            <Copy className="h-3.5 w-3.5" aria-hidden /> کپی صفحه
          </button>
        </form>
        {!isSystem ? <DeleteButton action={deletePage} id={page.id} label="حذف صفحه" /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <RecordForm
            action={savePage}
            hidden={{ id: page.id, ...(isSystem ? { slug: page.slug } : {}) }}
            fields={fields}
            columns={2}
            submitLabel="ذخیره صفحه"
          />
        </div>
        <details className="card h-fit p-6" open>
          <summary className="cursor-pointer text-sm font-bold text-accent">پیش‌نمایش زنده</summary>
          <div className="mt-4">
            <PreviewPane src={publicHref} />
          </div>
          <p className="mt-3 text-xs leading-6 text-ink-500">
            پیش‌نمایش پس از هر ذخیره بازخوانی می‌شود. برای ویرایش مستقیم روی خود سایت، از نوار «ویرایش زنده» در پایین صفحات عمومی استفاده کنید.
          </p>
        </details>
      </div>
    </div>
  );
}
