import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/server/db";
import { savePage } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatJalaliLong } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صفحات سایت" };

/** Every top-level route that has an editable hero, in nav order. */
const ROUTE_ORDER = [
  "about",
  "business-groups",
  "stores",
  "innovation",
  "services",
  "units",
  "media",
  "contact",
  "careers",
];

const ROUTE_LABELS: Record<string, string> = {
  about: "درباره ما",
  "business-groups": "گروه‌های کسب‌وکار",
  stores: "فروشگاه‌ها",
  innovation: "نوآوری و هوش مصنوعی",
  services: "خدمات",
  units: "واحدهای سازمانی",
  media: "رسانه",
  contact: "تماس با ما",
  careers: "فرصت‌های شغلی",
};

const LEGAL_SLUGS = ["privacy", "terms", "cookie-policy", "refund-policy"];

function pageFields(p: {
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  body: string;
  image: string;
  seoTitle: string | null;
  seoDesc: string | null;
  published: boolean;
}): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان صفحه", required: true, defaultValue: p.title },
    {
      type: "text",
      name: "eyebrow",
      label: "برچسب بالای عنوان",
      hint: "متن کوچک بالای تیتر، مثلاً «خدمات».",
      defaultValue: p.eyebrow,
    },
    {
      type: "textarea",
      name: "subtitle",
      label: "توضیح کوتاه زیر عنوان",
      rows: 2,
      defaultValue: p.subtitle,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر هیروی صفحه",
      hint: "پس‌زمینه بخش عنوان این صفحه. خالی بماند، تصویر سراسری تنظیمات استفاده می‌شود.",
      defaultValue: p.image,
    },
    {
      type: "markdown",
      name: "body",
      label: "متن صفحه",
      rows: 16,
      hint: "با نوار ابزار قالب‌بندی کنید و از دکمه «تصویر» نگاره‌ها را از کتابخانه رسانه درج کنید.",
      defaultValue: p.body,
    },
    { type: "text", name: "seoTitle", label: "عنوان سئو", defaultValue: p.seoTitle },
    { type: "textarea", name: "seoDesc", label: "توضیح سئو", rows: 2, defaultValue: p.seoDesc },
    { type: "checkbox", name: "published", label: "منتشر شده", defaultChecked: p.published },
  ];
}

function PageRow({
  page,
}: {
  page: {
    id: string;
    slug: string;
    title: string;
    eyebrow: string | null;
    subtitle: string | null;
    body: string;
    image: string;
    seoTitle: string | null;
    seoDesc: string | null;
    published: boolean;
    updatedAt: Date;
  };
}) {
  const route = page.slug.startsWith("/") ? page.slug : `/${page.slug}`;
  return (
    <details className="card p-6">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink-900">
            {ROUTE_LABELS[page.slug] ?? page.title}
          </span>
          {!page.published ? (
            <span className="text-[11px] text-ink-500">— منتشر نشده</span>
          ) : null}
        </span>
        <span className="flex items-center gap-3 text-xs text-ink-500">
          <span dir="ltr">{route}</span>
          <span className="hidden sm:inline">{formatJalaliLong(page.updatedAt)}</span>
        </span>
      </summary>

      <div className="mt-5 border-t border-line-200 pt-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Link href={route} target="_blank" className="btn-ghost px-2 py-1 text-xs">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            مشاهده صفحه
          </Link>
          <span className="text-[11px] text-ink-500">
            {page.body.trim()
              ? `${page.body.trim().split(/\s+/).length.toLocaleString("fa-IR")} واژه متن`
              : "بدون متن بلند"}
          </span>
        </div>
        <RecordForm
          action={savePage}
          hidden={{ id: page.id, slug: page.slug }}
          fields={pageFields(page)}
          columns={1}
        />
      </div>
    </details>
  );
}

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany();

  const sitePages = ROUTE_ORDER.map((slug) => pages.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const legalPages = pages.filter((p) => LEGAL_SLUGS.includes(p.slug));
  const otherPages = pages.filter(
    (p) => !ROUTE_ORDER.includes(p.slug) && !LEGAL_SLUGS.includes(p.slug),
  );

  return (
    <div>
      <AdminPageHeader
        title="صفحات سایت"
        description="عنوان، توضیح و متن همه صفحات سایت از همین‌جا ویرایش می‌شود. خالی بماند، متن پیش‌فرض همان صفحه نمایش داده می‌شود."
      />

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-bold text-ink-900">صفحات اصلی</h2>
        <div className="space-y-4">
          {sitePages.map((p) => (
            <PageRow key={p.id} page={p} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-bold text-ink-900">صفحات حقوقی</h2>
        <div className="space-y-4">
          {legalPages.map((p) => (
            <PageRow key={p.id} page={p} />
          ))}
        </div>
      </section>

      {otherPages.length > 0 ? (
        <section>
          <h2 className="mb-4 text-sm font-bold text-ink-900">سایر صفحات</h2>
          <div className="space-y-4">
            {otherPages.map((p) => (
              <PageRow key={p.id} page={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
