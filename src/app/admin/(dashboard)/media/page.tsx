import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { deleteMedia } from "@/server/admin-actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "رسانه" };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toPersianDigits(Math.round(bytes / 1024))} کیلوبایت`;
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="رسانه" description="بارگذاری و مدیریت تصاویر سایت." />

      <section className="card mb-6 p-6">
        <h2 className="heading-3 mb-5">بارگذاری تصویر جدید</h2>
        <MediaUploadForm />
      </section>

      {assets.length === 0 ? (
        <div className="card p-12 text-center text-sm text-ink-500">
          هنوز فایلی بارگذاری نشده است.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <div key={a.id} className="card overflow-hidden">
              <div className="relative h-40 bg-surface-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.path}
                  alt={a.alt || a.filename}
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-medium text-ink-900" dir="ltr">
                  {a.filename}
                </p>
                <p className="mt-1 text-xs text-ink-500">{formatSize(a.size)}</p>
                <div className="mt-3">
                  <DeleteButton action={deleteMedia} id={a.id} label="حذف فایل" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
