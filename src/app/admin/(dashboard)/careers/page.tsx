import type { Metadata } from "next";
import type { JobOpening } from "@prisma/client";
import { prisma } from "@/server/db";
import { saveJob, deleteJob } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "موقعیت‌های شغلی" };

function jobFields(j?: JobOpening): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان موقعیت", required: true, defaultValue: j?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: j?.slug,
    },
    { type: "text", name: "department", label: "واحد سازمانی", required: true, defaultValue: j?.department },
    { type: "text", name: "location", label: "محل", defaultValue: j?.location ?? "تهران" },
    { type: "text", name: "type", label: "نوع همکاری", defaultValue: j?.type ?? "تمام‌وقت" },
    {
      type: "number",
      name: "sortOrder",
      label: "ترتیب نمایش",
      defaultValue: j?.sortOrder ?? 0,
    },
    {
      type: "textarea",
      name: "description",
      label: "توضیحات",
      required: true,
      rows: 4,
      defaultValue: j?.description,
    },
    {
      type: "textarea",
      name: "requirements",
      label: "شرایط و مهارت‌ها",
      hint: "هر مورد در یک خط",
      rows: 4,
      defaultValue: j?.requirements,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر موقعیت",
      hint: "کنار عنوان موقعیت در صفحه فرصت‌های شغلی نمایش داده می‌شود.",
      defaultValue: j?.image,
    },
    {
      type: "checkbox",
      name: "active",
      label: "فعال (نمایش در سایت)",
      defaultChecked: j?.active ?? true,
    },
  ];
}

export default async function AdminCareersPage() {
  const jobs = await prisma.jobOpening.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="موقعیت‌های شغلی" description="مدیریت موقعیت‌های شغلی باز و فرم جذب." />

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">+ افزودن موقعیت جدید</summary>
        <div className="mt-5">
          <RecordForm action={saveJob} fields={jobFields()} submitLabel="افزودن موقعیت" />
        </div>
      </details>

      <div className="space-y-4">
        {jobs.map((j) => (
          <details key={j.id} className="card p-6">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink-900">{j.title}</span>
              <span className="text-xs text-ink-500">
                {j.department} · {j.active ? "فعال" : "غیرفعال"}
              </span>
            </summary>
            <div className="mt-5 border-t border-line-200 pt-5">
              <RecordForm action={saveJob} hidden={{ id: j.id }} fields={jobFields(j)} />
              <div className="mt-4 border-t border-line-200 pt-4">
                <DeleteButton action={deleteJob} id={j.id} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
