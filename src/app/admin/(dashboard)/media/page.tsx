import type { Metadata } from "next";
import Link from "next/link";
import type { MediaAsset } from "@prisma/client";
import { ArrowRight, ExternalLink, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { deleteMedia, saveMediaAsset } from "@/server/admin-actions";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { ScreenHeader, SearchBox } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "رسانه" };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toPersianDigits(Math.round(bytes / 1024))} کیلوبایت`;
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

function assetFields(asset: MediaAsset): FieldSpec[] {
  return [
    {
      type: "text",
      name: "title",
      label: "عنوان تصویر",
      hint: "برای جست‌وجو در کتابخانه و شرح گالری.",
      defaultValue: asset.title,
    },
    {
      type: "text",
      name: "alt",
      label: "متن جایگزین (alt)",
      hint: "توضیح کوتاه تصویر برای دسترس‌پذیری و سئو.",
      defaultValue: asset.alt,
    },
    {
      type: "checkbox",
      name: "inGallery",
      label: "نمایش در گالری صفحه «رسانه»",
      defaultChecked: asset.inGallery,
    },
    {
      type: "file",
      name: "file",
      label: "جایگزینی فایل",
      accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/gif",
      hint: "خالی بماند، فایل فعلی حفظ می‌شود. حداکثر ۵ مگابایت.",
    },
  ];
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();

  const assets = await prisma.mediaAsset.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search } },
            { filename: { contains: search } },
            { alt: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const editing = editId ? assets.find((asset) => asset.id === editId) : undefined;
  const listHref = "/admin/media";

  return (
    <div>
      <ScreenHeader
        title="کتابخانه رسانه"
        description="بارگذاری، ویرایش و مدیریت تصاویر سایت. تصاویر دارای «نمایش در گالری» در صفحه عمومی رسانه دیده می‌شوند."
        breadcrumb={[{ label: "رسانه" }]}
        action={
          isNew || editing ? (
            <Link href={listHref} className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت به کتابخانه
            </Link>
          ) : (
            <Link href={`${listHref}?new=1`} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden />
              افزودن رسانه
            </Link>
          )
        }
      />

      {isNew ? (
        <section className="card mb-5 p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">بارگذاری تصویر جدید</h2>
          <p className="mb-4 text-[12px] text-ink-500">
            تصاویر رستری خودکار به WebP تبدیل می‌شوند. پس از بارگذاری، تصویر بلافاصله در
            انتخاب‌گر تصویر همه فرم‌ها قابل استفاده است.
          </p>
          <MediaUploadForm />
        </section>
      ) : null}

      {editing ? (
        <section className="mb-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="card p-4">
            <div className="flex h-44 items-center justify-center overflow-hidden rounded border border-line-200 bg-surface-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editing.path}
                alt={editing.alt || editing.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <dl className="mt-3 space-y-1 text-[11.5px]">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-500">فایل</dt>
                <dd className="truncate text-ink-900" dir="ltr">
                  {editing.filename}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-500">حجم</dt>
                <dd className="text-ink-900">{formatSize(editing.size)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-500">نوع</dt>
                <dd className="text-ink-900">{editing.mime.replace("image/", "").toUpperCase()}</dd>
              </div>
            </dl>
            <div className="mt-3 space-y-1.5 border-t border-line-200 pt-3 text-[11.5px]">
              <Link href={editing.path} target="_blank" className="block text-accent hover:underline">
                مشاهده فایل کامل ↗
              </Link>
              <InlineDelete
                action={deleteMedia}
                id={editing.id}
                label="حذف این فایل"
                confirmText="این فایل حذف شود؟ اگر در محتوایی استفاده شده باشد، آن تصویر دیگر نمایش داده نمی‌شود."
              />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-[14px] font-bold text-ink-900">جزئیات تصویر</h2>
            <RecordForm
              action={saveMediaAsset}
              hidden={{ id: editing.id }}
              fields={assetFields(editing)}
              columns={1}
              submitLabel="ذخیره تغییرات"
            />
          </div>
        </section>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-ink-500">
          {toPersianDigits(assets.length)} فایل
          {search ? " (نتیجه جستجو)" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox action={listHref} value={search} placeholder="عنوان یا نام فایل…" />
          <Link href="/media#gallery" target="_blank" className="text-[11.5px] text-accent hover:underline">
            <ExternalLink className="me-1 inline h-3 w-3" aria-hidden />
            گالری عمومی
          </Link>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="card px-4 py-12 text-center text-[13px] text-ink-500">
          هنوز فایلی بارگذاری نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => (
            <article key={asset.id} className="card group overflow-hidden">
              <Link
                href={`${listHref}?edit=${asset.id}`}
                className="relative block aspect-square bg-surface-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.path}
                  alt={asset.alt || asset.title || asset.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {asset.inGallery ? (
                  <span className="absolute start-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9.5px] text-white">
                    گالری
                  </span>
                ) : null}
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
              </Link>
              <div className="p-2">
                <Link
                  href={`${listHref}?edit=${asset.id}`}
                  className="block truncate text-[11.5px] font-medium text-ink-900 hover:text-accent"
                >
                  {asset.title || asset.filename}
                </Link>
                <p className="mt-0.5 truncate text-[10px] text-ink-400" dir="ltr">
                  {formatSize(asset.size)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
