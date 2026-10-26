import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ImageIcon } from "lucide-react";
import { prisma } from "@/server/db";
import { deleteMedia, saveMediaAsset } from "@/server/admin-actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "رسانه" };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toPersianDigits(Math.round(bytes / 1024))} کیلوبایت`;
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

function assetFields(asset: {
  alt: string;
  title: string;
  inGallery: boolean;
}): FieldSpec[] {
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

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader
        title="رسانه"
        description="بارگذاری، ویرایش و مدیریت تصاویر سایت. تصاویر دارای «نمایش در گالری» در صفحه عمومی رسانه دیده می‌شوند."
      />

      <section className="card mb-6 p-6">
        <h2 className="heading-3 mb-5">بارگذاری تصویر جدید</h2>
        <MediaUploadForm />
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          {toPersianDigits(assets.length)} فایل در کتابخانه
        </p>
        <Link href="/media#gallery" target="_blank" className="btn-ghost px-2 py-1 text-xs">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          مشاهده گالری عمومی
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="card p-12 text-center text-sm text-ink-500">
          هنوز فایلی بارگذاری نشده است. پس از بارگذاری، تصویر بلافاصله در گالری صفحه «رسانه» و در
          انتخاب‌گر تصویر همه فرم‌ها قابل استفاده است.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((a) => (
            <article key={a.id} className="card overflow-hidden">
              <a
                href={a.path}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-44 bg-surface-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.path}
                  alt={a.alt || a.title || a.filename}
                  className="h-full w-full object-contain p-2"
                />
                {a.inGallery ? (
                  <span className="absolute right-3 top-3 badge bg-brand-700/80 text-white">
                    در گالری
                  </span>
                ) : null}
              </a>

              <div className="p-4">
                <p className="truncate text-sm font-medium text-ink-900">
                  {a.title || a.filename}
                </p>
                <p className="mt-1 truncate text-[11px] text-ink-500" dir="ltr">
                  {a.filename}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-ink-500">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                  {formatSize(a.size)} · {a.mime.replace("image/", "").toUpperCase()}
                </p>

                <details className="mt-3 border-t border-line-200 pt-3">
                  <summary className="cursor-pointer text-xs font-bold text-accent">
                    ویرایش تصویر و جایگزینی فایل
                  </summary>
                  <div className="mt-4">
                    <RecordForm
                      action={saveMediaAsset}
                      hidden={{ id: a.id }}
                      fields={assetFields(a)}
                      columns={1}
                      submitLabel="ذخیره تغییرات"
                    />
                  </div>
                </details>

                <div className="mt-3 border-t border-line-200 pt-3">
                  <DeleteButton action={deleteMedia} id={a.id} label="حذف فایل" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
