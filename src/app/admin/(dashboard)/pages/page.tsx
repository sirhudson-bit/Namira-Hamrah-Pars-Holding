import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FilePlus2, Pencil, Copy } from "lucide-react";
import { prisma } from "@/server/db";
import { savePage, deletePage, duplicatePage } from "@/server/admin-actions";
import { RecordForm } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalaliLong } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صفحات سایت" };

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



export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: [{ updatedAt: "desc" }] });
  const systemPages = pages.filter((page) => SYSTEM_SLUGS.has(page.slug));
  const customPages = pages.filter((page) => !SYSTEM_SLUGS.has(page.slug));

  return (
    <div>
      <AdminPageHeader
        title="صفحات سایت"
        description="صفحات را مانند وردپرس بسازید، ویرایش کنید و منتشر کنید. هر صفحه متن، تصویر شاخص، تنظیمات سئو و سازنده ابزارک دارد."
      />

      <details className="card mb-8 p-6" open={customPages.length === 0}>
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-accent">
          <FilePlus2 className="h-4 w-4" aria-hidden /> افزودن صفحه جدید
        </summary>
        <div className="mt-5 border-t border-line-200 pt-5">
          <RecordForm
            action={savePage}
            submitLabel="ساخت صفحه و ادامه ویرایش"
            fields={[
              { type: "text", name: "title", label: "عنوان صفحه", required: true },
              {
                type: "text",
                name: "slug",
                label: "نشانی صفحه (slug)",
                dir: "ltr",
                required: true,
                placeholder: "مثلاً investor-relations",
                hint: "فقط حروف کوچک انگلیسی، رقم و خط تیره. آدرس صفحه می‌شود /investor-relations",
              },
              { type: "checkbox", name: "published", label: "انتشار فوری", defaultChecked: false },
            ]}
          />
        </div>
      </details>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-bold text-ink-900">صفحات اصلی و حقوقی</h2>
        <div className="overflow-hidden rounded-card border border-line-200">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 text-xs text-ink-500">
              <tr>
                <th className="px-4 py-3 text-right font-medium">عنوان</th>
                <th className="px-4 py-3 text-right font-medium">نشانی</th>
                <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium">آخرین ویرایش</th>
                <th className="px-4 py-3 text-right font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {systemPages.map((page) => (
                <tr key={page.id} className="border-t border-line-200">
                  <td className="px-4 py-3 font-medium text-ink-900">{page.title}</td>
                  <td className="px-4 py-3 text-xs text-ink-500" dir="ltr">/{page.slug}</td>
                  <td className="px-4 py-3 text-xs">{page.published ? "منتشر شده" : "پیش‌نویس"}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">{formatJalaliLong(page.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/pages/${page.id}`} className="btn-ghost px-2 py-1 text-xs">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> ویرایش
                      </Link>
                      <Link href={`/${page.slug}`} target="_blank" className="btn-ghost px-2 py-1 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden /> نمایش
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold text-ink-900">صفحات سفارشی</h2>
        {customPages.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">
            هنوز صفحه سفارشی ساخته نشده است. با «افزودن صفحه جدید» شروع کنید.
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-line-200">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-xs text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">عنوان</th>
                  <th className="px-4 py-3 text-right font-medium">نشانی</th>
                  <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {customPages.map((page) => (
                  <tr key={page.id} className="border-t border-line-200">
                    <td className="px-4 py-3 font-medium text-ink-900">{page.title}</td>
                    <td className="px-4 py-3 text-xs text-ink-500" dir="ltr">/{page.slug}</td>
                    <td className="px-4 py-3 text-xs">{page.published ? "منتشر شده" : "پیش‌نویس"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/pages/${page.id}`} className="btn-ghost px-2 py-1 text-xs">
                          <Pencil className="h-3.5 w-3.5" aria-hidden /> ویرایش
                        </Link>
                        <Link href={`/${page.slug}`} target="_blank" className="btn-ghost px-2 py-1 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> نمایش
                        </Link>
                        <form action={duplicatePage}>
                          <input type="hidden" name="id" value={page.id} />
                          <button type="submit" className="btn-ghost px-2 py-1 text-xs">
                            <Copy className="h-3.5 w-3.5" aria-hidden /> کپی
                          </button>
                        </form>
                        <DeleteButton action={deletePage} id={page.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
