import type { Metadata } from "next";
import Link from "next/link";
import type { NewsPost } from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { saveNews, deleteNews } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { formatJalaliLong } from "@/lib/format";
import { ScreenHeader, ListTable, SearchBox, CountLinks } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "نوشته‌ها" };

function newsFields(post?: NewsPost): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان خبر", required: true, defaultValue: post?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: post?.slug,
    },
    {
      type: "textarea",
      name: "excerpt",
      label: "خلاصه",
      required: true,
      rows: 2,
      defaultValue: post?.excerpt,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر شاخص",
      hint: "کارت خبر، فهرست رسانه و بالای متن خبر.",
      defaultValue: post?.image,
    },
    imagePositionField(post?.imagePosition),
    {
      type: "markdown",
      name: "body",
      label: "متن خبر",
      rows: 14,
      hint: "با نوار ابزار قالب‌بندی کنید و از دکمه «تصویر» نگاره‌ها را درج کنید.",
      defaultValue: post?.body,
    },
    { type: "text", name: "category", label: "دسته‌بندی", defaultValue: post?.category ?? "خبر" },
    { type: "date", name: "publishedAt", label: "تاریخ انتشار", defaultValue: (post?.publishedAt ?? new Date()).toISOString().slice(0, 10) },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: post?.published ?? true,
      hint: "پیش‌نویس در سایت دیده نمی‌شود.",
    },
  ];
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = (params.s ?? "").trim();
  const status = params.status === "draft" || params.status === "publish" ? params.status : "";
  const editId = params.edit;
  const isNew = params.new === "1";

  const [all, editing, counts] = await Promise.all([
    prisma.newsPost.findMany({
      where: {
        ...(search
          ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] }
          : {}),
        ...(status === "draft" ? { published: false } : {}),
        ...(status === "publish" ? { published: true } : {}),
      },
      orderBy: { publishedAt: "desc" },
    }),
    editId ? prisma.newsPost.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    prisma.newsPost.groupBy({ by: ["published"], _count: true }),
  ]);

  const published = counts.find((row) => row.published)?._count ?? 0;
  const drafts = counts.find((row) => !row.published)?._count ?? 0;
  const showEditor = Boolean(editing) || isNew;
  const listHref = "/admin/news";

  const statusLinks = (
    <CountLinks
      items={[
        { label: "همه", href: listHref, count: published + drafts, active: !status && !search },
        { label: "منتشرشده", href: `${listHref}?status=publish`, count: published, active: status === "publish" },
        { label: "پیش‌نویس", href: `${listHref}?status=draft`, count: drafts, active: status === "draft" },
      ]}
    />
  );

  return (
    <div>
      <ScreenHeader
        title={showEditor ? (editing ? "ویرایش خبر" : "خبر جدید") : "نوشته‌ها"}
        description={
          showEditor
            ? "عنوان، متن، تصویر شاخص و وضعیت انتشار را ویرایش کنید."
            : "خبرهای هلدینگ؛ برای ویرایش روی عنوان کلیک کنید."
        }
        breadcrumb={
          showEditor
            ? [{ label: "نوشته‌ها", href: listHref }, { label: editing ? editing.title : "خبر جدید" }]
            : [{ label: "نوشته‌ها" }]
        }
        action={
          showEditor ? (
            <Link href={listHref} className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت به فهرست
            </Link>
          ) : (
            <>
              <Link href="/admin/blog" className="btn-secondary">
                مقالات
              </Link>
              <Link href={`${listHref}?new=1`} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                افزودن خبر
              </Link>
            </>
          )
        }
      />

      {showEditor ? (
        <RecordForm
          action={saveNews}
          fields={newsFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          columns={2}
          sideFields={["published", "publishedAt", "category"]}
          submitLabel={editing ? "به‌روزرسانی خبر" : "انتشار خبر"}
          sideExtra={
            editing ? (
              <div className="space-y-2 border-t border-line-200 pt-3 text-[11.5px]">
                <p className="text-ink-500">شناسه: {editing.id}</p>
                <p className="text-ink-500">آخرین تغییر: {formatJalaliLong(editing.updatedAt)}</p>
                {editing.published ? (
                  <Link
                    href={`/media/news/${editing.slug}`}
                    target="_blank"
                    className="inline-block text-accent hover:underline"
                  >
                    مشاهده در سایت ↗
                  </Link>
                ) : (
                  <p className="text-red-400">این خبر پیش‌نویس است و در سایت دیده نمی‌شود.</p>
                )}
              </div>
            ) : null
          }
        />
      ) : (
        <ListTable
          columns={[
            { label: "عنوان" },
            { label: "دسته‌بندی", hideOnMobile: true, width: "140px" },
            { label: "وضعیت", width: "110px" },
            { label: "تاریخ", hideOnMobile: true, width: "150px" },
          ]}
          toolbar={
            <>
              {statusLinks}
              <SearchBox action={listHref} value={search} hidden={status ? { status } : {}} />
            </>
          }
          rows={all.map((post) => ({
            id: post.id,
            title: post.title,
            href: `/admin/news?edit=${post.id}`,
            externalHref: `/media/news/${post.slug}`,
            badge: post.published ? null : (
              <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-700">
                پیش‌نویس
              </span>
            ),
            cells: [
              null,
              post.category,
              post.published ? "منتشر شده" : "پیش‌نویس",
              formatJalaliLong(post.publishedAt),
            ],
            actions: <InlineDelete action={deleteNews} id={post.id} />,
          }))}
          empty={search ? "نتیجه‌ای برای این جستجو پیدا نشد." : "هنوز خبری ثبت نشده است."}
        />
      )}
    </div>
  );
}
