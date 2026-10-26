import type { Metadata } from "next";
import type { BusinessGroup } from "@prisma/client";
import { prisma } from "@/server/db";
import { saveBusinessGroup, deleteBusinessGroup } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ICON_OPTIONS } from "@/lib/icon-options";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "گروه‌های کسب‌وکار" };

/**
 * Built from the record. Passing a static field list here was the bug that made
 * every edit form open blank — and saving then overwrote the row with empties.
 */
function groupFields(g?: BusinessGroup): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام گروه", required: true, defaultValue: g?.name },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      hint: "مثال: digital",
      defaultValue: g?.slug,
    },
    { type: "text", name: "tagline", label: "شعار کوتاه", required: true, defaultValue: g?.tagline },
    {
      type: "select",
      name: "icon",
      label: "آیکون",
      options: ICON_OPTIONS,
      defaultValue: g?.icon ?? "Boxes",
    },
    {
      type: "text",
      name: "color",
      label: "رنگ (کد HEX)",
      dir: "ltr",
      placeholder: "#0F7C71",
      defaultValue: g?.color ?? "#0F7C71",
    },
    {
      type: "number",
      name: "sortOrder",
      label: "ترتیب نمایش",
      defaultValue: g?.sortOrder ?? 0,
    },
    {
      type: "textarea",
      name: "description",
      label: "توضیحات",
      required: true,
      rows: 3,
      defaultValue: g?.description,
    },
    {
      type: "textarea",
      name: "highlights",
      label: "محورهای فعالیت",
      hint: "هر مورد در یک خط جداگانه",
      rows: 4,
      defaultValue: g?.highlights,
    },
    {
      type: "text",
      name: "ctaLabel",
      label: "متن دکمه کارت",
      hint: "مثلاً «مشاهده گروه». خالی بماند، متن پیش‌فرض استفاده می‌شود.",
      defaultValue: g?.ctaLabel,
    },
    {
      type: "text",
      name: "ctaUrl",
      label: "نشانی دکمه کارت",
      dir: "ltr",
      hint: "نشانی داخلی یا خارجی. خالی بماند، به صفحه همین گروه می‌رود.",
      defaultValue: g?.ctaUrl,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر گروه",
      hint: "روی کارت گروه در صفحه اصلی، صفحه گروه‌ها و بالای صفحه اختصاصی نمایش داده می‌شود.",
      defaultValue: g?.image,
    },
    {
      type: "text",
      name: "imageAlt",
      label: "متن جایگزین تصویر",
      defaultValue: g?.imageAlt,
    },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: g?.published ?? true,
    },
  ];
}

export default async function AdminBusinessGroupsPage() {
  const groups = await prisma.businessGroup.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="گروه‌های کسب‌وکار"
        description="افزودن، ویرایش و حذف گروه‌های کسب‌وکار هلدینگ."
      />

      <details className="card mb-6 p-6">
        <summary className="cursor-pointer text-sm font-bold text-accent">
          + افزودن گروه جدید
        </summary>
        <div className="mt-5">
          <RecordForm action={saveBusinessGroup} fields={groupFields()} submitLabel="افزودن گروه" />
        </div>
      </details>

      <div className="space-y-4">
        {groups.map((g) => (
          <details key={g.id} className="card p-6">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                {g.name}
              </span>
              <span className={g.published ? "badge" : "text-xs text-ink-500"}>
                {g.published ? "منتشر شده" : "پیش‌نویس"}
              </span>
            </summary>
            <div className="mt-5 border-t border-line-200 pt-5">
              <RecordForm
                action={saveBusinessGroup}
                hidden={{ id: g.id }}
                fields={groupFields(g)}
              />
              <div className="mt-4 border-t border-line-200 pt-4">
                <DeleteButton action={deleteBusinessGroup} id={g.id} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
