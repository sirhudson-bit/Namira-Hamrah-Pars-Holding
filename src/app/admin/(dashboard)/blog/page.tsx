import type { Metadata } from "next";
import Link from "next/link";
import type { BlogPost } from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { saveBlogPost, deleteBlogPost } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { formatJalaliLong } from "@/lib/format";
import { ScreenHeader, ListTable, SearchBox, CountLinks } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مقالات" };

function blogFields(post?: BlogPost): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان مقاله", required: true, defaultValue: post?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: post?.slug,
    },
    { type: "textarea", name: "excerpt", label: "خلاصه", required: true, rows: 2, defaultValue: post?.excerpt },
    {
      type: "image",
      name: "image",
      label: "تصویر شاخص",
      hint: "کارت مقاله در فهرست رسانه و بالای متن مقاله.",
      defaultValue: post?.image,
    },
    imagePositionField(post?.imagePosition),
    {
      type: "markdown",
      name: "body",
      label: "متن مقاله",
      rows: 14,
      hint: "با نوار ابزار قالب‌بندی کنید و از دکمه «تصویر» نگاره‌ها را درج کنید.",
      defaultValue: post?.body,
    },
    { type: "text", name: "category", label: "دسته‌بندی", defaultValue: post?.category ?? "مقاله" },
    { type: "text", name: "author", label: "نویسنده", defaultValue: post?.author ?? "تیم نامیرا" },
    {
      type: "date",
      name: "publishedAt",
      label: "تاریخ انتشار",
      defaultValue: (post?.publishedAt ?? new Date()).toISOString().slice(0, 10),
    },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: post?.published ?? true,
    },
  ];
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string; status?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();
  const status = params.status === "draft" || params.status === "publish" ? params.status : "";

  const [posts, editing, counts] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}),
        ...(status === "draft" ? { published: false } : {}),
        ...(status === "publish" ? { published: true } : {}),
      },
      orderBy: { publishedAt: "desc" },
    }),
    editId ? prisma.blogPost.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    prisma.blogPost.groupBy({ by: ["published"], _count: true }),
  ]);

  const published = counts.find((row) => row.published)?._count ?? 0;
  const drafts = counts.find((row) => !row.published)?._count ?? 0;
  const showEditor = Boolean(editing) || isNew;
  const listHref = "/admin/blog";

  return (
    <div>
      <ScreenHeader
        title={showEditor ? (editing ? "ویرایش مقاله" : "مقاله جدید") : "مقالات"}
        description={
          showEditor
            ? "عنوان، متن و وضعیت انتشار مقاله را ویرایش کنید."
            : "محتوای تحلیلی و راهنمای خرید که در بخش رسانه منتشر می‌شود."
        }
        breadcrumb={
          showEditor
            ? [{ label: "نوشته‌ها", href: "/admin/news" }, { label: "مقالات", href: listHref }, { label: editing?.title ?? "مقاله جدید" }]
            : [{ label: "نوشته‌ها", href: "/admin/news" }, { label: "مقالات" }]
        }
        action={
          showEditor ? (
            <Link href={listHref} className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت به فهرست
            </Link>
          ) : (
            <>
              <Link href="/admin/news" className="btn-secondary">
                اخبار
              </Link>
              <Link href={`${listHref}?new=1`} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                افزودن مقاله
              </Link>
            </>
          )
        }
      />

      {showEditor ? (
        <RecordForm
          action={saveBlogPost}
          fields={blogFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          sideFields={["published", "publishedAt", "category", "author"]}
          submitLabel={editing ? "به‌روزرسانی مقاله" : "انتشار مقاله"}
          sideExtra={
            editing ? (
              <div className="space-y-2 border-t border-line-200 pt-3 text-[11.5px]">
                <p className="text-ink-500">آخرین تغییر: {formatJalaliLong(editing.updatedAt)}</p>
                {editing.published ? (
                  <Link href={`/media/blog/${editing.slug}`} target="_blank" className="inline-block text-accent hover:underline">
                    مشاهده در سایت ↗
                  </Link>
                ) : (
                  <p className="text-red-400">این مقاله پیش‌نویس است.</p>
                )}
              </div>
            ) : null
          }
        />
      ) : (
        <ListTable
          columns={[
            { label: "عنوان" },
            { label: "دسته", hideOnMobile: true, width: "130px" },
            { label: "نویسنده", hideOnMobile: true, width: "150px" },
            { label: "وضعیت", width: "110px" },
            { label: "تاریخ", hideOnMobile: true, width: "150px" },
          ]}
          toolbar={
            <>
              <CountLinks
                items={[
                  { label: "همه", href: listHref, count: published + drafts, active: !status && !search },
                  { label: "منتشرشده", href: `${listHref}?status=publish`, count: published, active: status === "publish" },
                  { label: "پیش‌نویس", href: `${listHref}?status=draft`, count: drafts, active: status === "draft" },
                ]}
              />
              <SearchBox action={listHref} value={search} hidden={status ? { status } : {}} />
            </>
          }
          rows={posts.map((post) => ({
            id: post.id,
            title: post.title,
            href: `/admin/blog?edit=${post.id}`,
            externalHref: `/media/blog/${post.slug}`,
            badge: post.published ? null : (
              <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">پیش‌نویس</span>
            ),
            cells: [null, post.category, post.author, post.published ? "منتشر شده" : "پیش‌نویس", formatJalaliLong(post.publishedAt)],
            actions: <InlineDelete action={deleteBlogPost} id={post.id} />,
          }))}
          empty="هنوز مقاله‌ای ثبت نشده است."
        />
      )}
    </div>
  );
}
