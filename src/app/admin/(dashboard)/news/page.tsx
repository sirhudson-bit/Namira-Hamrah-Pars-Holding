import type { Metadata } from "next";
import type { NewsPost } from "@prisma/client";
import { prisma } from "@/server/db";
import { saveNews, deleteNews } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatJalaliLong } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "اخبار" };

function newsFields(n?: NewsPost): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان خبر", required: true, defaultValue: n?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: n?.slug,
    },
    { type: "text", name: "category", label: "دسته‌بندی", defaultValue: n?.category ?? "خبر" },
    {
      type: "date",
      name: "publishedAt",
      label: "تاریخ انتشار",
      defaultValue: (n?.publishedAt ?? new Date()).toISOString().slice(0, 10),
    },
    {
      type: "textarea",
      name: "excerpt",
      label: "خلاصه",
      required: true,
      rows: 2,
      defaultValue: n?.excerpt,
    },
    {
      type: "markdown",
      name: "body",
      label: "متن خبر",
      rows: 12,
      hint: "با نوار ابزار قالب‌بندی کنید و از دکمه «تصویر» نگاره‌ها را درج کنید.",
      defaultValue: n?.body,
    },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: n?.published ?? true,
    },
  ];
}

export default async function AdminNewsPage() {
  const news = await prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="اخبار" description="افزودن و ویرایش اخبار هلدینگ." />

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">+ افزودن خبر جدید</summary>
        <div className="mt-5">
          <RecordForm action={saveNews} fields={newsFields()} submitLabel="افزودن خبر" />
        </div>
      </details>

      <div className="space-y-4">
        {news.map((n) => (
          <details key={n.id} className="card p-6">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink-900">{n.title}</span>
              <span className="text-xs text-ink-500">
                {formatJalaliLong(n.publishedAt)} · {n.published ? "منتشر شده" : "پیش‌نویس"}
              </span>
            </summary>
            <div className="mt-5 border-t border-line-200 pt-5">
              <RecordForm action={saveNews} hidden={{ id: n.id }} fields={newsFields(n)} />
              <div className="mt-4 border-t border-line-200 pt-4">
                <DeleteButton action={deleteNews} id={n.id} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
