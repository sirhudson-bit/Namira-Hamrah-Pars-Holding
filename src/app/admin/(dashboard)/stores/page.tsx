import type { Metadata } from "next";
import Link from "next/link";
import type { Store } from "@prisma/client";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { saveStore, deleteStore } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { ScreenHeader, ListTable, SearchBox } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فروشگاه‌ها" };

const KIND_OPTIONS = [
  { value: "B2C", label: "فروش آنلاین به مصرف‌کننده (B2C)" },
  { value: "B2B", label: "فروش عمده به کسب‌وکار (B2B)" },
  { value: "PHYSICAL", label: "فروشگاه حضوری" },
  { value: "CORPORATE", label: "فروش سازمانی" },
];

const KIND_LABEL: Record<string, string> = {
  B2C: "آنلاین (B2C)",
  B2B: "عمده (B2B)",
  PHYSICAL: "حضوری",
  CORPORATE: "سازمانی",
};

function storeFields(store?: Store): FieldSpec[] {
  return [
    { type: "text", name: "name", label: "نام فروشگاه", required: true, defaultValue: store?.name },
    {
      type: "text",
      name: "slug",
      label: "نشانی یکتا (slug)",
      required: true,
      dir: "ltr",
      defaultValue: store?.slug,
    },
    {
      type: "select",
      name: "kind",
      label: "نوع کانال",
      options: KIND_OPTIONS,
      defaultValue: store?.kind ?? "B2C",
    },
    { type: "textarea", name: "description", label: "توضیحات", required: true, rows: 3, defaultValue: store?.description },
    { type: "text", name: "url", label: "نشانی سایت فروشگاه", dir: "ltr", defaultValue: store?.url },
    { type: "text", name: "phone", label: "تلفن", defaultValue: store?.phone },
    { type: "text", name: "email", label: "ایمیل", dir: "ltr", defaultValue: store?.email },
    { type: "text", name: "address", label: "نشانی", defaultValue: store?.address },
    { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: store?.sortOrder ?? 0 },
    {
      type: "image",
      name: "image",
      label: "تصویر فروشگاه",
      hint: "کارت کانال فروش و هیروی صفحه اختصاصی.",
      defaultValue: store?.image,
    },
    imagePositionField(store?.imagePosition),
    {
      type: "checkbox",
      name: "published",
      label: "منتشر شده",
      defaultChecked: store?.published ?? true,
    },
  ];
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; s?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();

  const [stores, editing] = await Promise.all([
    prisma.store.findMany({
      where: search ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] } : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    editId ? prisma.store.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ]);

  const showEditor = Boolean(editing) || isNew;
  const listHref = "/admin/stores";

  return (
    <div>
      <ScreenHeader
        title={showEditor ? (editing ? "ویرایش فروشگاه" : "فروشگاه جدید") : "فروشگاه‌ها"}
        description={
          showEditor
            ? "اطلاعات کانال، تماس و تصویر آن را ویرایش کنید."
            : "کانال‌های فروش هلدینگ: آنلاین، عمده، حضوری و سازمانی."
        }
        breadcrumb={
          showEditor
            ? [{ label: "محتوای سایت" }, { label: "فروشگاه‌ها", href: listHref }, { label: editing?.name ?? "فروشگاه جدید" }]
            : [{ label: "محتوای سایت" }, { label: "فروشگاه‌ها" }]
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
              افزودن فروشگاه
            </Link>
          )
        }
      />

      {showEditor ? (
        <RecordForm
          action={saveStore}
          fields={storeFields(editing ?? undefined)}
          hidden={editing ? { id: editing.id } : {}}
          layout="wp"
          sideFields={["kind", "published", "sortOrder", "image", "imagePosition"]}
          submitLabel={editing ? "به‌روزرسانی فروشگاه" : "افزودن فروشگاه"}
        />
      ) : (
        <ListTable
          columns={[
            { label: "نام" },
            { label: "نوع", hideOnMobile: true, width: "130px" },
            { label: "تلفن", hideOnMobile: true, width: "150px" },
            { label: "وضعیت", width: "110px" },
          ]}
          toolbar={
            <>
              <span className="text-[12px] text-ink-500">{stores.length.toLocaleString("fa-IR")} کانال</span>
              <SearchBox action={listHref} value={search} />
            </>
          }
          rows={stores.map((store) => ({
            id: store.id,
            title: store.name,
            href: `/admin/stores?edit=${store.id}`,
            externalHref: `/stores/${store.slug}`,
            badge: store.published ? null : (
              <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">پیش‌نویس</span>
            ),
            cells: [
              null,
              KIND_LABEL[store.kind] ?? store.kind,
              <span key="phone" dir="ltr">
                {store.phone ?? "—"}
              </span>,
              store.published ? "منتشر شده" : "پیش‌نویس",
            ],
            actions: <InlineDelete action={deleteStore} id={store.id} />,
          }))}
          empty="هنوز فروشگاهی ثبت نشده است."
        />
      )}
    </div>
  );
}
