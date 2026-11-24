import type { Metadata } from "next";
import { getSettings, SETTINGS_TABS, SETTINGS_TAB_ORDER, type SettingsTabKey } from "@/server/settings";
import { requireAdmin } from "@/server/auth";
import { SettingsForm } from "@/components/admin/settings-form";
import { FontManager } from "@/components/admin/font-manager";
import { getFontAssets, getFontFamilies } from "@/server/fonts";
import { BrandingUploader } from "@/components/admin/branding-form";
import { LogoSizeForm } from "@/components/admin/logo-size-form";
import { PasswordForm } from "@/components/admin/password-form";
import { ScreenHeader, ScreenTabs } from "@/components/admin/wp/screen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تنظیمات" };

const DESCRIPTIONS: Record<SettingsTabKey, string> = {
  general: "نام سایت و اطلاعات ثبتی هلدینگ.",
  contact: "تلفن، ایمیل، نشانی، نقشه و شبکه‌های اجتماعی.",
  seo: "عنوان و توضیح پیش‌فرض موتور جستجو و آنالیتیکس.",
  reading: "اندازه متن و فاصله خطوط در تمام سایت.",
  fonts: "بارگذاری فونت و انتخاب خانواده برای متن و تیترها.",
  chat: "دستیار گفتگوی گوشه صفحه: روشن/خاموش، عنوان، خوش‌آمد و دانش تکمیلی.",
  branding: "لوگو، فاوآیکون، تصویر هیرو و ویدئوی معرفی.",
  maintenance: "پنهان کردن سایت از بازدیدکنندگان هنگام به‌روزرسانی.",
  account: "گذرواژه حساب کاربری جاری و نشست‌های فعال.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [params, settings, user, fonts, families] = await Promise.all([
    searchParams,
    getSettings(),
    requireAdmin(),
    getFontAssets(),
    getFontFamilies(),
  ]);

  const requested = params.tab as SettingsTabKey | undefined;
  const tab: SettingsTabKey =
    requested && SETTINGS_TAB_ORDER.includes(requested) ? requested : "general";

  return (
    <div>
      <ScreenHeader
        title="تنظیمات"
        description={DESCRIPTIONS[tab]}
        breadcrumb={[{ label: "تنظیمات", href: "/admin/settings" }, { label: SETTINGS_TABS[tab].label }]}
      />

      <ScreenTabs
        active={tab}
        tabs={SETTINGS_TAB_ORDER.map((key) => ({
          key,
          label: SETTINGS_TABS[key].label,
          href: `/admin/settings?tab=${key}`,
        }))}
      />

      <div className="mx-auto max-w-3xl">
        {tab === "fonts" ? (
          <div className="space-y-5">
            <SettingsForm settings={settings} tab="fonts" fontOptions={families} />
            <FontManager assets={fonts} families={families} />
          </div>
        ) : null}

        {tab === "branding" ? (
          <div className="space-y-5">
            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">لوگو و فاوآیکون</h2>
              <p className="mb-4 text-[12px] leading-6 text-ink-500">
                تصاویر PNG، SVG، WEBP یا JPG؛ حداکثر ۲ مگابایت. تصاویر رستری به‌طور خودکار به
                WebP تبدیل می‌شوند؛ SVG و ICO بدون تغییر می‌مانند. اگر لوگویی بارگذاری نشود، نشان
                پیش‌فرض سایت نمایش داده می‌شود.
              </p>
              <div className="space-y-3">
                <BrandingUploader
                  kind="logo"
                  label="لوگوی اصلی"
                  hint="در سربرگ و پای‌صفحه روی پس‌زمینه روشن استفاده می‌شود."
                  current={settings.logo_path}
                />
                <BrandingUploader
                  kind="logo_light"
                  label="لوگوی روشن (برای پس‌زمینه تیره)"
                  hint="در بخش‌های تیره مانند نامیرا لبز به کار می‌رود. اختیاری است."
                  current={settings.logo_light_path}
                  tone="dark"
                />
                <BrandingUploader
                  kind="favicon"
                  label="فاوآیکون"
                  hint="آیکون نوار مرورگر و نشانک‌ها. مربعی و کوچک (مثلاً ۳۲×۳۲)."
                  current={settings.favicon_path}
                  square
                />
              </div>
              <LogoSizeForm value={settings.logo_height} />
            </section>

            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">تصویر هیروی صفحات داخلی</h2>
              <p className="mb-4 text-[12px] leading-6 text-ink-500">
                پشت عنوان همه‌ی صفحات داخلی (درباره ما، تماس، فروشگاه‌ها و …) نمایش داده می‌شود.
                یک لایه هم‌رنگ تم روی تصویر می‌نشیند تا متن در هر دو حالت روشن و تیره خوانا
                بماند. هر برگه می‌تواند تصویر اختصاصی خود را داشته باشد.
              </p>
              <BrandingUploader
                kind="page_hero_bg"
                label="تصویر پس‌زمینه هیرو"
                hint="نسبت پیشنهادی ۱۶:۹ و عرض دست‌کم ۱۹۲۰ پیکسل. خالی بماند، هیرو ساده است."
                current={settings.page_hero_bg}
                tone="dark"
              />
            </section>

            <SettingsForm settings={settings} tab="branding" />
          </div>
        ) : tab === "account" ? (
          <div className="space-y-5">
            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">حساب کاربری</h2>
              <dl className="grid gap-3 text-[12.5px] sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">نام</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">ایمیل</dt>
                  <dd className="mt-0.5 font-medium text-ink-900" dir="ltr">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">نقش</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">
                    {user.role === "admin" ? "مدیر کل" : "ویرایشگر"}
                  </dd>
                </div>
              </dl>
            </section>
            <PasswordForm email={user.email} />
          </div>
        ) : (
          tab === "fonts" ? null : <SettingsForm settings={settings} tab={tab} />
        )}
      </div>
    </div>
  );
}
