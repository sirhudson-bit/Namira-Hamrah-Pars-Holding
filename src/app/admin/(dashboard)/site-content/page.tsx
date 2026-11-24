import type { Metadata } from "next";
import Link from "next/link";
import type {
  InnovationProject,
  Milestone,
  OrgUnit,
  ServiceItem,
  TeamMember,
} from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
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
import { ICON_OPTIONS } from "@/lib/icon-options";
import { ScreenHeader, ScreenTabs, ListTable } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "محتوای سایت" };

const TYPES = [
  { key: "services", label: "خدمات" },
  { key: "units", label: "واحدهای سازمانی" },
  { key: "projects", label: "پروژه‌های نوآوری" },
  { key: "team", label: "تیم" },
  { key: "milestones", label: "تاریخچه" },
] as const;

type TypeKey = (typeof TYPES)[number]["key"];

const UNIT_KINDS = [
  { value: "offline", label: "فروش حضوری" },
  { value: "online", label: "فروش آنلاین" },
  { value: "commercial", label: "بازرگانی" },
  { value: "finance", label: "مالی" },
  { value: "hr", label: "منابع انسانی" },
  { value: "marketing", label: "بازاریابی" },
  { value: "support", label: "پشتیبانی" },
];

function serviceFields(item?: ServiceItem): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان خدمت", required: true, defaultValue: item?.title },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "select", name: "icon", label: "آیکون", options: ICON_OPTIONS, defaultValue: item?.icon ?? "Sparkles" },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];
}

function unitFields(item?: OrgUnit): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام واحد", required: true, defaultValue: item?.name },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    { type: "select", name: "kind", label: "نوع واحد", options: UNIT_KINDS, defaultValue: item?.kind ?? "offline" },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];
}

function projectFields(item?: InnovationProject): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان پروژه", required: true, defaultValue: item?.title },
    { type: "text", name: "slug", label: "نشانی یکتا", dir: "ltr", required: true, defaultValue: item?.slug },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "text", name: "status", label: "وضعیت", defaultValue: item?.status ?? "در حال توسعه" },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];
}

function teamFields(item?: TeamMember): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام", required: true, defaultValue: item?.name },
    { type: "text", name: "role", label: "سمت", required: true, defaultValue: item?.role },
    { type: "textarea", name: "bio", label: "معرفی کوتاه", rows: 3, defaultValue: item?.bio },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: item?.published ?? true },
  ];
}

function milestoneFields(item?: Milestone): FieldSpec[] {
  return [
    { type: "text", name: "year", label: "سال", dir: "ltr", required: true, defaultValue: item?.year },
    { type: "text", name: "title", label: "عنوان", required: true, defaultValue: item?.title },
    { type: "textarea", name: "description", label: "توضیح", rows: 3, defaultValue: item?.description },
    { type: "number", name: "sortOrder", label: "ترتیب", defaultValue: item?.sortOrder ?? 0 },
  ];
}

export default async function AdminSiteContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; edit?: string; new?: string }>;
}) {
  const params = await searchParams;
  const type: TypeKey = (TYPES.find((entry) => entry.key === params.type)?.key ?? "services") as TypeKey;
  const editId = params.edit;
  const isNew = params.new === "1";
  const showEditor = Boolean(editId) || isNew;
  const listHref = `/admin/site-content?type=${type}`;
  const typeLabel = TYPES.find((entry) => entry.key === type)?.label ?? "خدمات";
  const singular =
    type === "services" ? "خدمت" : type === "units" ? "واحد" : type === "projects" ? "پروژه" : type === "team" ? "عضو" : "نقطه عطف";

  const tabs = (
    <ScreenTabs
      active={type}
      tabs={TYPES.map((entry) => ({
        key: entry.key,
        label: entry.label,
        href: `/admin/site-content?type=${entry.key}`,
      }))}
    />
  );

  const header = (title: string, description: string, editingLabel?: string) => (
    <ScreenHeader
      title={title}
      description={description}
      breadcrumb={[
        { label: "محتوای سایت", href: "/admin/site-content" },
        { label: typeLabel, href: listHref },
        ...(editingLabel ? [{ label: editingLabel }] : []),
      ]}
      action={
        showEditor ? (
          <Link href={listHref} className="btn-secondary">
            <ArrowRight className="h-4 w-4" aria-hidden />
            بازگشت به فهرست
          </Link>
        ) : (
          <Link href={`${listHref}&new=1`} className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden />
            افزودن {singular}
          </Link>
        )
      }
    />
  );

  if (type === "services") {
    const [items, editing] = await Promise.all([
      prisma.serviceItem.findMany({ orderBy: { sortOrder: "asc" } }),
      editId ? prisma.serviceItem.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    ]);
    return (
      <div>
        {header(
          showEditor ? (editing ? `ویرایش ${editing.title}` : "خدمت جدید") : "خدمات",
          "خدمات پس از فروش؛ در صفحه /services نمایش داده می‌شوند.",
          editing?.title,
        )}
        {tabs}
        {showEditor ? (
          <RecordForm
            action={saveService}
            fields={serviceFields(editing ?? undefined)}
            hidden={editing ? { id: editing.id } : {}}
            layout="wp"
            sideFields={["icon", "sortOrder", "published"]}
            submitLabel={editing ? "به‌روزرسانی خدمت" : "افزودن خدمت"}
          />
        ) : (
          <ListTable
            columns={[
              { label: "عنوان" },
              { label: "نشانی", hideOnMobile: true, width: "160px" },
              { label: "وضعیت", width: "110px" },
              { label: "ترتیب", hideOnMobile: true, width: "70px" },
            ]}
            rows={items.map((item) => ({
              id: item.id,
              title: item.title,
              href: `${listHref}&edit=${item.id}`,
              externalHref: "/services",
              cells: [
                null,
                <span key="slug" dir="ltr" className="text-ink-500">/{item.slug}</span>,
                item.published ? "منتشر شده" : "پیش‌نویس",
                item.sortOrder.toLocaleString("fa-IR"),
              ],
              actions: <InlineDelete action={deleteService} id={item.id} />,
            }))}
            empty="هنوز خدمتی ثبت نشده است."
          />
        )}
      </div>
    );
  }

  if (type === "units") {
    const [items, editing] = await Promise.all([
      prisma.orgUnit.findMany({ orderBy: { sortOrder: "asc" } }),
      editId ? prisma.orgUnit.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    ]);
    return (
      <div>
        {header(
          showEditor ? (editing ? `ویرایش ${editing.name}` : "واحد جدید") : "واحدهای سازمانی",
          "ساختار داخلی هلدینگ؛ در صفحه /units و بخش نوآوری صفحه اصلی دیده می‌شود.",
          editing?.name,
        )}
        {tabs}
        {showEditor ? (
          <RecordForm
            action={saveOrgUnit}
            fields={unitFields(editing ?? undefined)}
            hidden={editing ? { id: editing.id } : {}}
            layout="wp"
            sideFields={["kind", "sortOrder", "published"]}
            submitLabel={editing ? "به‌روزرسانی واحد" : "افزودن واحد"}
          />
        ) : (
          <ListTable
            columns={[
              { label: "نام" },
              { label: "نوع", hideOnMobile: true },
              { label: "وضعیت", width: "110px" },
              { label: "ترتیب", hideOnMobile: true, width: "70px" },
            ]}
            rows={items.map((item) => ({
              id: item.id,
              title: item.name,
              href: `${listHref}&edit=${item.id}`,
              externalHref: "/units",
              cells: [
                null,
                UNIT_KINDS.find((kind) => kind.value === item.kind)?.label ?? item.kind,
                item.published ? "منتشر شده" : "پیش‌نویس",
                item.sortOrder.toLocaleString("fa-IR"),
              ],
              actions: <InlineDelete action={deleteOrgUnit} id={item.id} />,
            }))}
            empty="هنوز واحدی ثبت نشده است."
          />
        )}
      </div>
    );
  }

  if (type === "projects") {
    const [items, editing] = await Promise.all([
      prisma.innovationProject.findMany({ orderBy: { sortOrder: "asc" } }),
      editId ? prisma.innovationProject.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    ]);
    return (
      <div>
        {header(
          showEditor ? (editing ? `ویرایش ${editing.title}` : "پروژه جدید") : "پروژه‌های نوآوری",
          "پروژه‌های نامیرا لبز؛ در صفحه /innovation و صفحه اصلی.",
          editing?.title,
        )}
        {tabs}
        {showEditor ? (
          <RecordForm
            action={saveInnovation}
            fields={projectFields(editing ?? undefined)}
            hidden={editing ? { id: editing.id } : {}}
            layout="wp"
            sideFields={["status", "sortOrder", "published"]}
            submitLabel={editing ? "به‌روزرسانی پروژه" : "افزودن پروژه"}
          />
        ) : (
          <ListTable
            columns={[
              { label: "عنوان" },
              { label: "وضعیت", hideOnMobile: true },
              { label: "انتشار", width: "110px" },
              { label: "ترتیب", hideOnMobile: true, width: "70px" },
            ]}
            rows={items.map((item) => ({
              id: item.id,
              title: item.title,
              href: `${listHref}&edit=${item.id}`,
              externalHref: "/innovation",
              cells: [null, item.status, item.published ? "منتشر شده" : "پیش‌نویس", item.sortOrder.toLocaleString("fa-IR")],
              actions: <InlineDelete action={deleteInnovation} id={item.id} />,
            }))}
            empty="هنوز پروژه‌ای ثبت نشده است."
          />
        )}
      </div>
    );
  }

  if (type === "team") {
    const [items, editing] = await Promise.all([
      prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
      editId ? prisma.teamMember.findUnique({ where: { id: editId } }) : Promise.resolve(null),
    ]);
    return (
      <div>
        {header(
          showEditor ? (editing ? `ویرایش ${editing.name}` : "عضو جدید") : "تیم",
          "اعضای تیم که در صفحه درباره ما معرفی می‌شوند.",
          editing?.name,
        )}
        {tabs}
        {showEditor ? (
          <RecordForm
            action={saveTeamMember}
            fields={teamFields(editing ?? undefined)}
            hidden={editing ? { id: editing.id } : {}}
            layout="wp"
            columns={1}
            sideFields={["sortOrder", "published"]}
            submitLabel={editing ? "به‌روزرسانی عضو" : "افزودن عضو"}
          />
        ) : (
          <ListTable
            columns={[
              { label: "نام" },
              { label: "سمت", hideOnMobile: true },
              { label: "وضعیت", width: "110px" },
            ]}
            rows={items.map((item) => ({
              id: item.id,
              title: item.name,
              href: `${listHref}&edit=${item.id}`,
              externalHref: "/about",
              cells: [null, item.role, item.published ? "منتشر شده" : "پیش‌نویس"],
              actions: <InlineDelete action={deleteTeamMember} id={item.id} />,
            }))}
            empty="هنوز عضوی ثبت نشده است."
          />
        )}
      </div>
    );
  }

  const [items, editing] = await Promise.all([
    prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
    editId ? prisma.milestone.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ]);
  return (
    <div>
      {header(
        showEditor ? (editing ? `ویرایش ${editing.title}` : "نقطه عطف جدید") : "تاریخچه",
        "نقاط عطف تاریخچه هلدینگ؛ در صفحه درباره ما نمایش داده می‌شود.",
        editing?.title,
      )}
      {tabs}
      {showEditor ? (
        <RecordForm
          action={saveMilestone}
          fields={milestoneFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          sideFields={["sortOrder"]}
          submitLabel={editing ? "به‌روزرسانی نقطه عطف" : "افزودن نقطه عطف"}
        />
      ) : (
        <ListTable
          columns={[
            { label: "عنوان" },
            { label: "سال", hideOnMobile: true, width: "100px" },
            { label: "ترتیب", hideOnMobile: true, width: "70px" },
          ]}
          rows={items.map((item) => ({
            id: item.id,
            title: item.title,
            href: `${listHref}&edit=${item.id}`,
            externalHref: "/about",
            cells: [null, item.year, item.sortOrder.toLocaleString("fa-IR")],
            actions: <InlineDelete action={deleteMilestone} id={item.id} />,
          }))}
          empty="هنوز نقطه عطفی ثبت نشده است."
        />
      )}
    </div>
  );
}
