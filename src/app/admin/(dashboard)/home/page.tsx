import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import { getSettings, type SiteSettings } from "@/server/settings";
import { saveHero } from "@/server/admin-actions";
import { RecordForm, type FieldSpec } from "@/components/admin/record-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ParticleOrb } from "@/components/three/particle-orb";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صفحه اصلی" };

function heroFields(s: SiteSettings): FieldSpec[] {
  return [
    { type: "text", name: "hero_eyebrow", label: "برچسب بالای عنوان", defaultValue: s.hero_eyebrow },
    {
      type: "textarea",
      name: "hero_title",
      label: "عنوان اصلی",
      required: true,
      rows: 2,
      hint: "تیتر بزرگ صفحه اصلی.",
      defaultValue: s.hero_title,
    },
    {
      type: "textarea",
      name: "hero_lead",
      label: "توضیح زیر عنوان",
      rows: 3,
      defaultValue: s.hero_lead,
    },
    {
      type: "text",
      name: "hero_cta_label",
      label: "متن دکمه اصلی",
      defaultValue: s.hero_cta_label,
    },
    {
      type: "text",
      name: "hero_cta_href",
      label: "نشانی دکمه اصلی",
      dir: "ltr",
      placeholder: "/business-groups",
      defaultValue: s.hero_cta_href,
    },
    {
      type: "text",
      name: "hero_video_label",
      label: "متن دکمه ویدئو",
      hint: "دکمه ویدئو فقط وقتی نمایش داده می‌شود که نشانی ویدئو در تنظیمات وارد شده باشد.",
      defaultValue: s.hero_video_label,
    },
    {
      type: "textarea",
      name: "hero_stats",
      label: "آمار زیر هیرو",
      rows: 5,
      hint: "هر خط یک آمار: مقدار|برچسب — مثلاً 300+|همکار سازمانی",
      defaultValue: s.hero_stats,
    },
    {
      type: "checkbox",
      name: "hero_enabled",
      label: "نمایش ویجت کره (Animated Sphere)",
      defaultChecked: s.hero_enabled !== "false",
      hint: "با خاموش کردن، کره متحرک از صفحه اصلی حذف می‌شود.",
    },
    {
      type: "select",
      name: "hero_orb_align",
      label: "محل قرارگیری کره",
      options: [
        { value: "left", label: "چپ صفحه" },
        { value: "right", label: "راست صفحه" },
        { value: "center", label: "وسط صفحه" },
      ],
      defaultValue: s.hero_orb_align,
    },
    {
      type: "number",
      name: "hero_orb_x",
      label: "فاصله افقی کره (vw)",
      hint: "فاصله از همان لبه‌ای که بالا انتخاب شد، به درصد عرض صفحه. ۰ یعنی چسبیده به لبه.",
      defaultValue: s.hero_orb_x,
    },
    {
      type: "number",
      name: "hero_orb_y",
      label: "موقعیت عمودی کره (vh)",
      hint: "۵۰ یعنی وسط ارتفاع صفحه؛ کمتر = بالاتر، بیشتر = پایین‌تر.",
      defaultValue: s.hero_orb_y,
    },
    {
      type: "number",
      name: "hero_orb_size",
      label: "قطر کره (vw)",
      hint: "بین ۲۰ تا ۸۰ درصد عرض صفحه. پیش‌فرض ۴۴.",
      defaultValue: s.hero_orb_size,
    },
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
  if (!match) {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-ink-900">{value || "—"}</p>
        <p className="mt-1 text-[11px] text-ink-500">{label}</p>
      </div>
    );
  }
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold text-ink-900">
        {toPersianDigits(Number(match[1]))}
        <span className="text-base">{match[2]}</span>
      </p>
      <p className="mt-1 text-[11px] text-ink-500">{label}</p>
    </div>
  );
}

export default async function AdminHomePage() {
  const settings = await getSettings();
  const stats = parseStats(settings.hero_stats);

  return (
    <div>
      <AdminPageHeader
        title="صفحه اصلی"
        description="محتوای هیرو و ویجت کره متحرک (Animated Sphere) صفحه اصلی. تغییرات بلافاصله روی سایت اعمال می‌شود."
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <section className="card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line-200 pb-4">
            <div>
              <h2 className="text-sm font-bold text-ink-900">محتوای هیرو</h2>
              <p className="mt-1 text-xs text-ink-500">
                عنوان، توضیح، دکمه‌ها و آمار زیر هیرو.
              </p>
            </div>
            <Link href="/" target="_blank" className="btn-ghost px-2 py-1 text-xs">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              مشاهده صفحه
            </Link>
          </div>
          <RecordForm
            action={saveHero}
            fields={heroFields(settings)}
            submitLabel="ذخیره بخش صفحه اصلی"
          />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Layers className="h-4 w-4 text-accent" aria-hidden />
              پیش‌نمایش ویجت
            </h2>
            <div className="relative mx-auto mt-4 h-44 w-44" aria-hidden>
              <ParticleOrb className="h-full w-full" />
            </div>
            <p className="mt-4 text-[11px] leading-6 text-ink-500">
              کره با تمام صفحه شروع می‌شود و با اسکرول، به سمت چپ هیرو جمع می‌شود.
              {settings.hero_enabled === "false" ? (
                <span className="mt-2 block font-medium text-amber-500">
                  این ویجت در حال حاضر خاموش است.
                </span>
              ) : null}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-bold text-ink-900">پیش‌نمایش آمار</h2>
            {stats.length === 0 ? (
              <p className="mt-3 text-xs text-ink-500">آماری ثبت نشده است.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <StatPreview key={stat.label + stat.value} value={stat.value} label={stat.label} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
