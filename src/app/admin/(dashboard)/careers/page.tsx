import type { Metadata } from "next";
import Link from "next/link";
import type { JobOpening } from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { saveJob, deleteJob } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { ScreenHeader, ListTable, SearchBox } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فرصت‌های شغلی" };

function jobFields(job?: JobOpening): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان موقعیت", required: true, defaultValue: job?.title },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: job?.slug,
    },
    { type: "text", name: "department", label: "واحد سازمانی", required: true, defaultValue: job?.department },
    { type: "text", name: "location", label: "محل", defaultValue: job?.location ?? "تهران" },
    { type: "text", name: "type", label: "نوع همکاری", defaultValue: job?.type ?? "تمام‌وقت" },
    { type: "textarea", name: "description", label: "توضیحات", required: true, rows: 4, defaultValue: job?.description },
    {
      type: "textarea",
      name: "requirements",
      label: "شرایط و مهارت‌ها",
      hint: "هر مورد در یک خط",
      rows: 4,
      defaultValue: job?.requirements,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر موقعیت",
      hint: "کنار عنوان موقعیت در صفحه فرصت‌های شغلی.",
      defaultValue: job?.image,
    },
    imagePositionField(job?.imagePosition),
    { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: job?.sortOrder ?? 0 },
    {
      type: "checkbox",
      name: "active",
      label: "فعال (نمایش در سایت)",
      defaultChecked: job?.active ?? true,
    },
  ];
}

export default async function AdminCareersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();

  const [jobs, editing] = await Promise.all([
    prisma.jobOpening.findMany({
      where: search ? { OR: [{ title: { contains: search } }, { department: { contains: search } }] } : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    editId ? prisma.jobOpening.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ]);

  const showEditor = Boolean(editing) || isNew;
  const listHref = "/admin/careers";

  return (
    <div>
      <ScreenHeader
        title={showEditor ? (editing ? "ویرایش موقعیت شغلی" : "موقعیت شغلی جدید") : "فرصت‌های شغلی"}
        description={
          showEditor
            ? "عنوان، شرایط و وضعیت نمایش این موقعیت را ویرایش کنید."
            : "موقعیت‌های شغلی باز و فرم جذب در صفحه فرصت‌های شغلی."
        }
        breadcrumb={
          showEditor
            ? [{ label: "محتوای سایت" }, { label: "فرصت‌های شغلی", href: listHref }, { label: editing?.title ?? "موقعیت جدید" }]
            : [{ label: "محتوای سایت" }, { label: "فرصت‌های شغلی" }]
        }
        action={
          showEditor ? (
            <Link href={listHref} className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت به فهرست
            </Link>
          ) : (
            <Link href={`${listHref}?new=1`} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden />
              افزودن موقعیت
            </Link>
          )
        }
      />

      {showEditor ? (
        <RecordForm
          action={saveJob}
          fields={jobFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          sideFields={["active", "location", "type", "sortOrder", "image", "imagePosition"]}
          submitLabel={editing ? "به‌روزرسانی موقعیت" : "افزودن موقعیت"}
        />
      ) : (
        <ListTable
          columns={[
            { label: "عنوان" },
            { label: "واحد", hideOnMobile: true },
            { label: "نوع", hideOnMobile: true, width: "120px" },
            { label: "وضعیت", width: "110px" },
          ]}
          toolbar={
            <>
              <span className="text-[12px] text-ink-500">{jobs.length.toLocaleString("fa-IR")} موقعیت</span>
              <SearchBox action={listHref} value={search} />
            </>
          }
          rows={jobs.map((job) => ({
            id: job.id,
            title: job.title,
            href: `/admin/careers?edit=${job.id}`,
            externalHref: "/careers",
            badge: job.active ? null : (
              <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">غیرفعال</span>
            ),
            cells: [null, job.department, job.type, job.active ? "فعال" : "غیرفعال"],
            actions: <InlineDelete action={deleteJob} id={job.id} />,
          }))}
          empty="هنوز موقعیت شغلی ثبت نشده است."
        />
      )}
    </div>
  );
}
