import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Copy, ExternalLink, LayoutTemplate } from "lucide-react";
import { prisma } from "@/server/db";
import { savePage, deletePage, duplicatePage } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { PreviewPane } from "@/components/admin/preview-pane";
import { ScreenHeader } from "@/components/admin/wp/screen";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
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
      <ScreenHeader
        title={page.title}
        description={`/‎${page.slug} · آخرین ویرایش ${formatJalaliLong(page.updatedAt)}`}
        breadcrumb={[
          { label: "برگه‌ها", href: "/admin/pages" },
          { label: page.title },
        ]}
        action={
          <>
            <Link href="/admin/pages" className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت
            </Link>
            <Link href={publicHref} target="_blank" className="btn-secondary">
              <ExternalLink className="h-4 w-4" aria-hidden />
              مشاهده
            </Link>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href={`/admin/layout?page=${page.slug}`} className="btn-secondary">
          <LayoutTemplate className="h-4 w-4" aria-hidden />
          ابزارک‌های این صفحه ({blockCount.toLocaleString("fa-IR")})
        </Link>
        <form action={duplicatePage}>
          <input type="hidden" name="id" value={page.id} />
          <button type="submit" className="btn-ghost px-2 py-1 text-[12px]">
            <Copy className="h-3.5 w-3.5" aria-hidden />
            کپی صفحه
          </button>
        </form>
        {!isSystem ? <DeleteButton action={deletePage} id={page.id} label="حذف صفحه" /> : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0">
          <RecordForm
            action={savePage}
            hidden={{ id: page.id, ...(isSystem ? { slug: page.slug } : {}) }}
            fields={fields}
            sideFields={["published", "image", "imagePosition", "seoTitle", "seoDesc"]}
            layout="wp"
            submitLabel="ذخیره صفحه"
          />
        </div>

        <div className="card h-fit">
          <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
            پیش‌نمایش زنده
          </h2>
          <div className="p-4">
            <PreviewPane src={publicHref} />
            <p className="mt-3 text-[11px] leading-6 text-ink-500">
              پیش‌نمایش پس از هر ذخیره بازخوانی می‌شود. برای ویرایش مستقیم روی خود سایت، از نوار
              «ویرایش زنده» در پایین صفحات عمومی استفاده کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
