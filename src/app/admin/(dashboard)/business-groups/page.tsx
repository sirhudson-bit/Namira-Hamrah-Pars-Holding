import type { Metadata } from "next";
import Link from "next/link";
import type { BusinessGroup } from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { saveBusinessGroup, deleteBusinessGroup } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { ICON_OPTIONS } from "@/lib/icon-options";
import { ScreenHeader, ListTable, SearchBox } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "گروه‌های کسب‌وکار" };

/**
 * Built from the record. Passing a static field list here was the bug that made
 * every edit form open blank — and saving then overwrote the row with empties.
 */
function groupFields(group?: BusinessGroup): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام گروه", required: true, defaultValue: group?.name },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      hint: "مثال: digital",
      defaultValue: group?.slug,
    },
    { type: "text", name: "tagline", label: "شعار کوتاه", required: true, defaultValue: group?.tagline },
    {
      type: "select",
      name: "icon",
      label: "آیکون",
      options: ICON_OPTIONS,
      defaultValue: group?.icon ?? "Boxes",
    },
    {
      type: "text",
      name: "color",
      label: "رنگ (کد HEX)",
      dir: "ltr",
      placeholder: "#0F7C71",
      defaultValue: group?.color ?? "#0F7C71",
    },
    {
      type: "textarea",
      name: "description",
      label: "توضیحات",
      required: true,
      rows: 3,
      defaultValue: group?.description,
    },
    {
      type: "textarea",
      name: "highlights",
      label: "محورهای فعالیت",
      hint: "هر مورد در یک خط جداگانه",
      rows: 4,
      defaultValue: group?.highlights,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر گروه",
      hint: "کارت گروه در صفحه اصلی، صفحه گروه‌ها و هیروی صفحه اختصاصی.",
      defaultValue: group?.image,
    },
    imagePositionField(group?.imagePosition),
    {
      type: "text",
      name: "imageAlt",
      label: "متن جایگزین تصویر",
      defaultValue: group?.imageAlt,
    },
    {
      type: "text",
      name: "ctaLabel",
      label: "متن دکمه کارت",
      hint: "مثلاً «مشاهده گروه». خالی بماند، متن پیش‌فرض استفاده می‌شود.",
      defaultValue: group?.ctaLabel,
    },
    {
      type: "text",
      name: "ctaUrl",
      label: "نشانی دکمه کارت",
      dir: "ltr",
      hint: "نشانی داخلی یا خارجی. خالی بماند، به صفحه همین گروه می‌رود.",
      defaultValue: group?.ctaUrl,
    },
    { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: group?.sortOrder ?? 0 },
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: group?.published ?? true,
      hint: "گروه پیش‌نویس در سایت دیده نمی‌شود.",
    },
  ];
}

export default async function AdminBusinessGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();

  const [groups, editing] = await Promise.all([
    prisma.businessGroup.findMany({
      where: search
        ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] }
        : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    editId ? prisma.businessGroup.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ]);

  const showEditor = Boolean(editing) || isNew;
  const listHref = "/admin/business-groups";

  return (
    <div>
      <ScreenHeader
        title={showEditor ? (editing ? "ویرایش گروه" : "گروه جدید") : "گروه‌های کسب‌وکار"}
        description={
          showEditor
            ? "مشخصات، تصویر و متن دکمه کارت این گروه را ویرایش کنید."
            : "پنج گروه تخصصی هلدینگ؛ برای ویرایش روی نام گروه کلیک کنید."
        }
        breadcrumb={
          showEditor
            ? [{ label: "محتوای سایت" }, { label: "گروه‌ها", href: listHref }, { label: editing?.name ?? "گروه جدید" }]
            : [{ label: "محتوای سایت" }, { label: "گروه‌ها" }]
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
              افزودن گروه
            </Link>
          )
        }
      />

      {showEditor ? (
        <RecordForm
          action={saveBusinessGroup}
          fields={groupFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          columns={2}
          sideFields={["published", "sortOrder", "icon", "color", "image", "imagePosition", "imageAlt", "ctaLabel", "ctaUrl"]}
          submitLabel={editing ? "به‌روزرسانی گروه" : "افزودن گروه"}
        />
      ) : (
        <ListTable
          columns={[
            { label: "نام گروه" },
            { label: "شعار", hideOnMobile: true },
            { label: "نشانی", hideOnMobile: true, width: "140px" },
            { label: "وضعیت", width: "110px" },
            { label: "ترتیب", hideOnMobile: true, width: "70px" },
          ]}
          toolbar={
            <>
              <span className="text-[12px] text-ink-500">
                {groups.length.toLocaleString("fa-IR")} گروه
              </span>
              <SearchBox action={listHref} value={search} />
            </>
          }
          rows={groups.map((group) => ({
            id: group.id,
            title: group.name,
            href: `/admin/business-groups?edit=${group.id}`,
            externalHref: `/business-groups/${group.slug}`,
            badge: group.published ? null : (
              <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">پیش‌نویس</span>
            ),
            cells: [
              null,
              group.tagline,
              <span key="slug" dir="ltr" className="text-ink-500">
                /{group.slug}
              </span>,
              group.published ? "منتشر شده" : "پیش‌نویس",
              group.sortOrder.toLocaleString("fa-IR"),
            ],
            actions: <InlineDelete action={deleteBusinessGroup} id={group.id} />,
          }))}
          empty={search ? "گروهی با این عنوان پیدا نشد." : "هنوز گروهی ثبت نشده است."}
        />
      )}
    </div>
  );
}
