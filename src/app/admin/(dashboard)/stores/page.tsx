import type { Metadata } from "next";
import type { Store } from "@prisma/client";
import { prisma } from "@/server/db";
import { saveStore, deleteStore } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فروشگاه‌ها" };

const KIND_OPTIONS = [
  { value: "B2C", label: "فروش آنلاین به مصرف‌کننده (B2C)" },
  { value: "B2B", label: "فروش عمده به کسب‌وکار (B2B)" },
  { value: "PHYSICAL", label: "فروشگاه حضوری" },
  { value: "CORPORATE", label: "فروش سازمانی" },
];

function storeFields(s?: Store): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام فروشگاه", required: true, defaultValue: s?.name },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: s?.slug,
    },
    {
      type: "select",
      name: "kind",
      label: "نوع کانال",
      options: KIND_OPTIONS,
      defaultValue: s?.kind ?? "B2C",
    },
    { type: "text", name: "url", label: "نشانی سایت فروشگاه", dir: "ltr", defaultValue: s?.url },
    { type: "text", name: "phone", label: "تلفن", defaultValue: s?.phone },
    { type: "text", name: "email", label: "ایمیل", dir: "ltr", defaultValue: s?.email },
    { type: "text", name: "address", label: "نشانی", defaultValue: s?.address },
    {
      type: "number",
      name: "sortOrder",
      label: "ترتیب نمایش",
      defaultValue: s?.sortOrder ?? 0,
    },
    {
      type: "textarea",
      name: "description",
      label: "توضیحات",
      required: true,
      rows: 3,
      defaultValue: s?.description,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر فروشگاه",
      hint: "روی کارت کانال فروش و بالای صفحه اختصاصی نمایش داده می‌شود.",
      defaultValue: s?.image,
    },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: s?.published ?? true,
    },
  ];
}

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="فروشگاه‌ها" description="مدیریت کانال‌های فروش و اطلاعات تماس آن‌ها." />

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">
          + افزودن فروشگاه جدید
        </summary>
        <div className="mt-5">
          <RecordForm action={saveStore} fields={storeFields()} submitLabel="افزودن فروشگاه" />
        </div>
      </details>

      <div className="space-y-4">
        {stores.map((s) => (
          <details key={s.id} className="card p-6">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink-900">{s.name}</span>
              <span className="text-xs text-ink-500">{s.kind}</span>
            </summary>
            <div className="mt-5 border-t border-line-200 pt-5">
              <RecordForm action={saveStore} hidden={{ id: s.id }} fields={storeFields(s)} />
              <div className="mt-4 border-t border-line-200 pt-4">
                <DeleteButton action={deleteStore} id={s.id} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
