import type { Metadata } from "next";
import type { BlogPost } from "@prisma/client";
import { prisma } from "@/server/db";
import { saveBlogPost, deleteBlogPost } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatJalaliLong } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مقالات" };

function blogFields(p?: BlogPost): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان مقاله", required: true, defaultValue: p?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: p?.slug,
    },
    { type: "text", name: "category", label: "دسته‌بندی", defaultValue: p?.category ?? "مقاله" },
    { type: "text", name: "author", label: "نویسنده", defaultValue: p?.author ?? "تیم نامیرا" },
    {
      type: "date",
      name: "publishedAt",
      label: "تاریخ انتشار",
      defaultValue: (p?.publishedAt ?? new Date()).toISOString().slice(0, 10),
    },
    {
      type: "textarea",
      name: "excerpt",
      label: "خلاصه",
      required: true,
      rows: 2,
      defaultValue: p?.excerpt,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر شاخص",
      hint: "روی کارت مقاله و بالای متن مقاله نمایش داده می‌شود.",
      defaultValue: p?.image,
    },
    {
      type: "markdown",
      name: "body",
      label: "متن مقاله",
      rows: 12,
      hint: "با نوار ابزار قالب‌بندی کنید و از دکمه «تصویر» نگاره‌ها را درج کنید.",
      defaultValue: p?.body,
    },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: p?.published ?? true,
    },
  ];
}

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="مقالات" description="مدیریت مقالات و راهنماهای سایت." />

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">+ افزودن مقاله جدید</summary>
        <div className="mt-5">
          <RecordForm action={saveBlogPost} fields={blogFields()} submitLabel="افزودن مقاله" />
        </div>
      </details>

      <div className="space-y-4">
        {posts.map((p) => (
          <details key={p.id} className="card p-6">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink-900">{p.title}</span>
              <span className="text-xs text-ink-500">
                {p.author} · {formatJalaliLong(p.publishedAt)} · {p.published ? "منتشر شده" : "پیش‌نویس"}
              </span>
            </summary>
            <div className="mt-5 border-t border-line-200 pt-5">
              <RecordForm action={saveBlogPost} hidden={{ id: p.id }} fields={blogFields(p)} />
              <div className="mt-4 border-t border-line-200 pt-4">
                <DeleteButton action={deleteBlogPost} id={p.id} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
