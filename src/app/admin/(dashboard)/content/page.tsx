import type { Metadata } from "next";
import { prisma } from "@/server/db";
import {
  deleteInnovation,
  deleteMilestone,
  deleteOrgUnit,
  deleteService,
  deleteTeamMember,
  saveInnovation,
  saveMilestone,
  saveOrgUnit,
  saveService,
  saveTeamMember,
} from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ICON_OPTIONS } from "@/lib/icon-options";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "همه عناصر صفحات" };

/**
 * Editors for the entities rendered by the marketing pages. They used to be
 * seed-only; now every element that appears on /about, /services, /units and
 * /innovation can be created, edited, reordered and unpublished here.
 */
export default async function AdminContentPage() {
  const [services, units, projects, team, milestones] = await Promise.all([
    prisma.serviceItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.orgUnit.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.innovationProject.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const serviceFields = (item?: (typeof services)[number]): FieldSpec[] => [
    { type: "text", name: "title", label: "عنوان خدمت", required: true, defaultValue: item?.title },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    {
      type: "select",
      name: "icon",
      label: "آیکون",
      options: ICON_OPTIONS,
      defaultValue: item?.icon ?? "Sparkles",
    },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];

  const unitFields = (item?: (typeof units)[number]): FieldSpec[] => [
    { type: "text", name: "name", label: "نام واحد", required: true, defaultValue: item?.name },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    {
      type: "select",
      name: "kind",
      label: "نوع واحد",
      defaultValue: item?.kind ?? "offline",
      options: [
        { value: "offline", label: "فروش حضوری" },
        { value: "online", label: "فروش آنلاین" },
        { value: "commercial", label: "بازرگانی" },
        { value: "finance", label: "مالی" },
        { value: "hr", label: "منابع انسانی" },
        { value: "marketing", label: "بازاریابی" },
        { value: "support", label: "پشتیبانی" },
      ],
    },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];

  const projectFields = (item?: (typeof projects)[number]): FieldSpec[] => [
    { type: "text", name: "title", label: "عنوان پروژه", required: true, defaultValue: item?.title },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "text", name: "status", label: "وضعیت", defaultValue: item?.status ?? "در حال توسعه" },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];

  const teamFields = (item?: (typeof team)[number]): FieldSpec[] => [
    { type: "text", name: "name", label: "نام", required: true, defaultValue: item?.name },
    { type: "text", name: "role", label: "سمت", required: true, defaultValue: item?.role },
    { type: "textarea", name: "bio", label: "معرفی کوتاه", rows: 3, defaultValue: item?.bio },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];

  const milestoneFields = (item?: (typeof milestones)[number]): FieldSpec[] => [
    { type: "text", name: "year", label: "سال", dir: "ltr", required: true, defaultValue: item?.year },
    { type: "text", name: "title", label: "عنوان", required: true, defaultValue: item?.title },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
  ];

  return (
    <div>
      <AdminPageHeader
        title="همه عناصر صفحات"
        description="تیم، نقاط عطف، خدمات، واحدهای سازمانی و پروژه‌های نوآوری؛ عناصری که در صفحات درباره ما، خدمات، واحدها و نوآوری نمایش داده می‌شوند."
      />

      <section className="card mb-6 p-6">
        <h2 className="mb-1 text-sm font-bold text-ink-900">خدمات پس از فروش</h2>
        <p className="mb-5 text-xs text-ink-500">مورد استفاده در صفحه /services و بخش خدمات صفحه اصلی.</p>
        <details className="mb-4 rounded-card border border-line-200 p-4">
          <summary className="cursor-pointer text-xs font-bold text-accent">+ افزودن خدمت</summary>
          <div className="mt-4 border-t border-line-200 pt-4">
            <RecordForm action={saveService} fields={serviceFields()} submitLabel="افزودن خدمت" />
          </div>
        </details>
        <div className="space-y-3">
          {services.map((item) => (
            <details key={item.id} className="rounded-card border border-line-200 p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-900">{item.title}</span>
                <span className="text-[11px] text-ink-500" dir="ltr">/{item.slug} · {item.published ? "منتشر" : "پیش‌نویس"}</span>
              </summary>
              <div className="mt-4 border-t border-line-200 pt-4">
                <RecordForm action={saveService} hidden={{ id: item.id }} fields={serviceFields(item)} />
                <div className="mt-4 border-t border-line-200 pt-4"><DeleteButton action={deleteService} id={item.id} /></div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="card mb-6 p-6">
        <h2 className="mb-1 text-sm font-bold text-ink-900">واحدهای سازمانی</h2>
        <p className="mb-5 text-xs text-ink-500">مورد استفاده در صفحه /units.</p>
        <details className="mb-4 rounded-card border border-line-200 p-4">
          <summary className="cursor-pointer text-xs font-bold text-accent">+ افزودن واحد</summary>
          <div className="mt-4 border-t border-line-200 pt-4"><RecordForm action={saveOrgUnit} fields={unitFields()} submitLabel="افزودن واحد" /></div>
        </details>
        <div className="space-y-3">
          {units.map((item) => (
            <details key={item.id} className="rounded-card border border-line-200 p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-900">{item.name}</span>
                <span className="text-[11px] text-ink-500" dir="ltr">/{item.slug} · {item.published ? "منتشر" : "پیش‌نویس"}</span>
              </summary>
              <div className="mt-4 border-t border-line-200 pt-4">
                <RecordForm action={saveOrgUnit} hidden={{ id: item.id }} fields={unitFields(item)} />
                <div className="mt-4 border-t border-line-200 pt-4"><DeleteButton action={deleteOrgUnit} id={item.id} /></div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="card mb-6 p-6">
        <h2 className="mb-1 text-sm font-bold text-ink-900">پروژه‌های نوآوری</h2>
        <p className="mb-5 text-xs text-ink-500">مورد استفاده در صفحه /innovation.</p>
        <details className="mb-4 rounded-card border border-line-200 p-4">
          <summary className="cursor-pointer text-xs font-bold text-accent">+ افزودن پروژه</summary>
          <div className="mt-4 border-t border-line-200 pt-4"><RecordForm action={saveInnovation} fields={projectFields()} submitLabel="افزودن پروژه" /></div>
        </details>
        <div className="space-y-3">
          {projects.map((item) => (
            <details key={item.id} className="rounded-card border border-line-200 p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-900">{item.title}</span>
                <span className="text-[11px] text-ink-500">{item.status} · {item.published ? "منتشر" : "پیش‌نویس"}</span>
              </summary>
              <div className="mt-4 border-t border-line-200 pt-4">
                <RecordForm action={saveInnovation} hidden={{ id: item.id }} fields={projectFields(item)} />
                <div className="mt-4 border-t border-line-200 pt-4"><DeleteButton action={deleteInnovation} id={item.id} /></div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="card mb-6 p-6">
        <h2 className="mb-1 text-sm font-bold text-ink-900">تیم و نقاط عطف (درباره ما)</h2>
        <p className="mb-5 text-xs text-ink-500">اعضای تیم و تاریخچه‌ای که در /about نمایش داده می‌شود.</p>
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-bold text-ink-700">اعضای تیم ({team.length})</h3>
            <details className="mb-3 rounded-card border border-line-200 p-4">
              <summary className="cursor-pointer text-xs font-bold text-accent">+ افزودن عضو</summary>
              <div className="mt-4 border-t border-line-200 pt-4"><RecordForm action={saveTeamMember} fields={teamFields()} submitLabel="افزودن عضو" columns={1} /></div>
            </details>
            <div className="space-y-3">
              {team.map((item) => (
                <details key={item.id} className="rounded-card border border-line-200 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink-900">{item.name} <span className="text-xs text-ink-500">— {item.role}</span></summary>
                  <div className="mt-4 border-t border-line-200 pt-4">
                    <RecordForm action={saveTeamMember} hidden={{ id: item.id }} fields={teamFields(item)} columns={1} />
                    <div className="mt-4 border-t border-line-200 pt-4"><DeleteButton action={deleteTeamMember} id={item.id} /></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-bold text-ink-700">نقاط عطف ({milestones.length})</h3>
            <details className="mb-3 rounded-card border border-line-200 p-4">
              <summary className="cursor-pointer text-xs font-bold text-accent">+ افزودن نقطه عطف</summary>
              <div className="mt-4 border-t border-line-200 pt-4"><RecordForm action={saveMilestone} fields={milestoneFields()} submitLabel="افزودن" columns={1} /></div>
            </details>
            <div className="space-y-3">
              {milestones.map((item) => (
                <details key={item.id} className="rounded-card border border-line-200 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink-900">{item.year} — {item.title}</summary>
                  <div className="mt-4 border-t border-line-200 pt-4">
                    <RecordForm action={saveMilestone} hidden={{ id: item.id }} fields={milestoneFields(item)} columns={1} />
                    <div className="mt-4 border-t border-line-200 pt-4"><DeleteButton action={deleteMilestone} id={item.id} /></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
