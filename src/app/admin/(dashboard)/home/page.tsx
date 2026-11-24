import type { Metadata } from "next";
import Link from "next/link";
import type { HomeBanner } from "@prisma/client";
import { ArrowRight, ExternalLink, Layers, Plus } from "lucide-react";
import { getSettings, type SiteSettings } from "@/server/settings";
import { deleteBanner, saveBanner, saveHero } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { imagePositionField } from "@/lib/image-fields";
import { prisma } from "@/server/db";
import { ParticleOrb } from "@/components/three/particle-orb";
import { toPersianDigits } from "@/lib/format";
import { ScreenHeader, ListTable } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صفحه اصلی" };

function heroFields(settings: SiteSettings): FieldSpec[] {
  return [
    { type: "text", name: "hero_eyebrow", label: "برچسب بالای عنوان", defaultValue: settings.hero_eyebrow },
    {
      type: "textarea",
      name: "hero_title",
      label: "عنوان اصلی",
      required: true,
      rows: 2,
      hint: "تیتر بزرگ صفحه اصلی. برای شکستن خط، Enter بزنید.",
      defaultValue: settings.hero_title,
    },
    {
      type: "textarea",
      name: "hero_lead",
      label: "توضیح زیر عنوان",
      rows: 3,
      defaultValue: settings.hero_lead,
    },
    { type: "text", name: "hero_cta_label", label: "متن دکمه اصلی", defaultValue: settings.hero_cta_label },
    {
      type: "text",
      name: "hero_cta_href",
      label: "نشانی دکمه اصلی",
      dir: "ltr",
      placeholder: "/business-groups",
      defaultValue: settings.hero_cta_href,
    },
    {
      type: "text",
      name: "hero_video_label",
      label: "متن دکمه ویدئو",
      hint: "دکمه ویدئو فقط وقتی نمایش داده می‌شود که نشانی ویدئو در تنظیمات وارد شده باشد.",
      defaultValue: settings.hero_video_label,
    },
    {
      type: "textarea",
      name: "hero_stats",
      label: "آمار زیر هیرو",
      rows: 5,
      hint: "هر خط یک آمار: مقدار|برچسب — مثلاً 300+|همکار سازمانی",
      defaultValue: settings.hero_stats,
    },
    {
      type: "image",
      name: "hero_image",
      label: "تصویر کاور",
      hint: "قاب عمودی سمت مقابل عنوان در بالای صفحه اصلی.",
      defaultValue: settings.hero_image,
    },
    {
      type: "text",
      name: "hero_image_alt",
      label: "متن جایگزین تصویر کاور",
      defaultValue: settings.hero_image_alt,
    },
    {
      type: "checkbox",
      name: "hero_enabled",
      label: "نمایش کره متحرک در قاب تصویر",
      defaultChecked: settings.hero_enabled !== "false",
      hint: "کره در گوشه‌ی قاب تصویر، به‌صورت لنز، نمایش داده می‌شود.",
    },
    {
      type: "number",
      name: "hero_orb_size",
      label: "قطر لنز کره",
      hint: "بین ۲۰ تا ۸۰. مقدار بزرگ‌تر، لنز بزرگ‌تری می‌سازد.",
      defaultValue: settings.hero_orb_size,
    },
  ];
}

function bannerFields(banner?: HomeBanner): FieldSpec[] {
  return [
    { type: "text", name: "title", label: "عنوان", required: true, defaultValue: banner?.title },
    {
      type: "textarea",
      name: "subtitle",
      label: "توضیح کوتاه",
      rows: 2,
      defaultValue: banner?.subtitle,
    },
    {
      type: "image",
      name: "image",
      label: "تصویر بنر",
      required: true,
      hint: "نسبت پیشنهادی ۱۶:۹ و عرض حداقل ۱۶۰۰ پیکسل.",
      defaultValue: banner?.image,
    },
    imagePositionField(banner?.imagePosition),
    { type: "text", name: "imageAlt", label: "متن جایگزین تصویر", defaultValue: banner?.imageAlt },
    {
      type: "text",
      name: "href",
      label: "نشانی مقصد",
      dir: "ltr",
      hint: "مثل /business-groups یا یک نشانی کامل. خالی بماند، بنر بدون پیوند می‌شود.",
      defaultValue: banner?.href,
    },
    { type: "text", name: "ctaLabel", label: "متن دکمه", defaultValue: banner?.ctaLabel },
    { type: "number", name: "sortOrder", label: "ترتیب نمایش", defaultValue: banner?.sortOrder ?? 0 },
    { type: "checkbox", name: "active", label: "فعال", defaultChecked: banner?.active ?? true },
  ];
}

/** Parses the `value|label` lines the hero renders. */
function parseStats(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value = "", label = ""] = line.split("|").map((part) => part.trim());
      return { value, label };
    });
}

function StatPreview({ value, label }: { value: string; label: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  return (
    <div className="text-center">
      <p className="text-[18px] font-extrabold text-ink-900">
        {match ? `${toPersianDigits(Number(match[1]))}${match[2]}` : value || "—"}
      </p>
      <p className="mt-0.5 text-[10px] text-ink-500">{label}</p>
    </div>
  );
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const params = await searchParams;
  const [settings, banners] = await Promise.all([
    getSettings(),
    prisma.homeBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
  ]);

  const editingBanner = params.edit ? banners.find((banner) => banner.id === params.edit) : undefined;
  const bannerMode = Boolean(editingBanner) || params.new === "1";
  const stats = parseStats(settings.hero_stats);

  return (
    <div>
      <ScreenHeader
        title={bannerMode ? (editingBanner ? "ویرایش بنر" : "بنر جدید") : "صفحه اصلی"}
        description={
          bannerMode
            ? "تصویر، عنوان و مقصد این بنر را ویرایش کنید."
            : "هیروی صفحه اصلی، تصویر کاور، آمار و بنرهای اسلایدر."
        }
        breadcrumb={
          bannerMode
            ? [{ label: "برگه‌ها", href: "/admin/pages" }, { label: "صفحه اصلی", href: "/admin/home" }, { label: "بنر" }]
            : [{ label: "برگه‌ها", href: "/admin/pages" }, { label: "صفحه اصلی" }]
        }
        action={
          bannerMode ? (
            <Link href="/admin/home" className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت
            </Link>
          ) : (
            <>
              <Link href="/" target="_blank" className="btn-secondary">
                <ExternalLink className="h-4 w-4" aria-hidden />
                مشاهده صفحه
              </Link>
              <Link href="/admin/home?new=1" className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                افزودن بنر
              </Link>
            </>
          )
        }
      />

      {bannerMode ? (
        <RecordForm
          action={saveBanner}
          fields={bannerFields(editingBanner)}
          hidden={editingBanner ? { id: editingBanner.id } : {}}
          layout="wp"
          sideFields={["active", "sortOrder", "image", "imagePosition", "imageAlt", "href", "ctaLabel"]}
          submitLabel={editingBanner ? "به‌روزرسانی بنر" : "افزودن بنر"}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <div className="min-w-0">
            <RecordForm
              action={saveHero}
              fields={heroFields(settings)}
              sideFields={["hero_enabled", "hero_orb_size", "hero_image", "hero_image_alt"]}
              layout="wp"
              submitLabel="ذخیره بخش صفحه اصلی"
              sideTitle="تصویر و کره"
            />

            <section className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-bold text-ink-900">بنرهای اسلایدر</h2>
                <span className="text-[11px] text-ink-500">
                  {toPersianDigits(banners.length)} بنر
                </span>
              </div>
              <ListTable
                columns={[
                  { label: "عنوان" },
                  { label: "ترتیب", hideOnMobile: true, width: "80px" },
                  { label: "وضعیت", width: "100px" },
                ]}
                toolbar={
                  <span className="text-[11.5px] text-ink-500">
                    بنرها زیر بخش گروه‌ها، به‌صورت اسلایدر نمایش داده می‌شوند.
                  </span>
                }
                rows={banners.map((banner) => ({
                  id: banner.id,
                  title: banner.title,
                  href: `/admin/home?edit=${banner.id}`,
                  externalHref: banner.href || undefined,
                  cells: [null, banner.sortOrder.toLocaleString("fa-IR"), banner.active ? "فعال" : "غیرفعال"],
                  actions: <InlineDelete action={deleteBanner} id={banner.id} />,
                }))}
                empty="هنوز بنری ثبت نشده است؛ صفحه اصلی بدون بنر نمایش داده می‌شود."
              />
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card p-4">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
                <Layers className="h-4 w-4 text-accent" aria-hidden />
                پیش‌نمایش کره
              </h2>
              <div className="relative mx-auto mt-3 h-36 w-36" aria-hidden>
                <ParticleOrb className="h-full w-full" />
              </div>
              <p className="mt-3 text-[11px] leading-6 text-ink-500">
                کره در گوشه‌ی قاب تصویر کاور قرار می‌گیرد و اندازه‌اش از همین فرم کنترل می‌شود.
                {settings.hero_enabled === "false" ? (
                  <span className="mt-1.5 block font-medium text-red-400">این ویجت خاموش است.</span>
                ) : null}
              </p>
            </div>

            <div className="card p-4">
              <h2 className="text-[13px] font-bold text-ink-900">پیش‌نمایش آمار</h2>
              {stats.length === 0 ? (
                <p className="mt-2 text-[11px] text-ink-500">آماری ثبت نشده است.</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <StatPreview key={stat.label + stat.value} value={stat.value} label={stat.label} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
