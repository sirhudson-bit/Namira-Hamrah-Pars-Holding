import type { Metadata } from "next";
import Link from "next/link";
import {
  getSettings,
  SETTINGS_TABS,
  SETTINGS_TAB_ORDER,
  SETTINGS_TAB_ALIASES,
  type SettingsTabKey,
} from "@/server/settings";
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
  general: "نام سایت، اطلاعات ثبتی و حالت نگهداری.",
  contact: "تلفن، ایمیل، نشانی، نقشه و شبکه‌های اجتماعی.",
  branding: "لوگو در دو حالت، فاوآیکون، تصویر هیرو و ویدئوی معرفی.",
  typography: "فونت متن و تیترها، اندازه پایه و فاصله خطوط.",
  seo: "عنوان و توضیح پیش‌فرض موتور جستجو و آنالیتیکس.",
  chat: "دستیار گفتگوی گوشه صفحه: روشن/خاموش، عنوان، خوش‌آمد و دانش تکمیلی.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const [params, settings, user, fonts, families] = await Promise.all([
    searchParams,
    getSettings(),
    requireAdmin(),
    getFontAssets(),
    getFontFamilies(),
  ]);

  // A merged tab (?tab=fonts, ?tab=reading, ?tab=maintenance) redirects to the
  // screen that absorbed it, so old links keep their place.
  const requested = params.tab;
  const resolved = (requested && SETTINGS_TAB_ALIASES[requested]) || requested;
  const tab: SettingsTabKey =
    resolved && SETTINGS_TAB_ORDER.includes(resolved as SettingsTabKey)
      ? (resolved as SettingsTabKey)
      : "general";

  return (
    <div>
      <ScreenHeader
        title="تنظیمات"
        description={DESCRIPTIONS[tab]}
        breadcrumb={[{ label: "تنظیمات", href: "/admin/settings" }, { label: SETTINGS_TABS[tab].label }]}
        action={
          <Link href={`/admin/settings?tab=${tab}&view=profile`} className="btn-secondary">
            پروفایل و گذرواژه
          </Link>
        }
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
        {tab === "branding" ? (
          <div className="space-y-5">
            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">لوگو در دو حالت</h2>
              <p className="mb-4 text-[12px] leading-6 text-ink-500">
                تصاویر PNG، SVG، WEBP یا JPG؛ حداکثر ۲ مگابایت. تصاویر رستری به‌طور خودکار به
                WebP تبدیل می‌شوند. سایت دو حالت رنگ دارد و لوگو با حالت فعال جابه‌جا می‌شود:
                فایل «پس‌زمینه روشن» در حالت روشن، و فایل «پس‌زمینه تیره» در حالت تیره و در
                نوارهای تیره‌ی همیشگی. اگر فقط یکی را بارگذاری کنید، همان در هر دو حالت
                استفاده می‌شود.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <BrandingUploader
                  kind="logo"
                  label="لوگوی پس‌زمینه روشن"
                  hint="هنر تیره، برای پس‌زمینه‌ی روشن."
                  current={settings.logo_path}
                />
                <BrandingUploader
                  kind="logo_light"
                  label="لوگوی پس‌زمینه تیره"
                  hint="هنر روشن، برای پس‌زمینه‌ی تیره."
                  current={settings.logo_light_path}
                  tone="dark"
                />
              </div>
              <LogoSizeForm value={settings.logo_height} bare />
            </section>

            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">فاوآیکون</h2>
              <p className="mb-4 text-[12px] leading-6 text-ink-500">
                آیکون نوار مرورگر و نشانک‌ها. مربعی و کوچک (مثلاً ۳۲×۳۲) بگذارید؛ اگر
                بارگذاری نشود، آیکون پیش‌فرض سایت استفاده می‌شود.
              </p>
              <BrandingUploader
                kind="favicon"
                label="فاوآیکون"
                hint="PNG، SVG، WEBP یا ICO؛ حداکثر ۲ مگابایت."
                current={settings.favicon_path}
                square
                compact
              />
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
        ) : tab === "typography" ? (
          <div className="space-y-5">
            <SettingsForm settings={settings} tab="typography" fontOptions={families} />
            <FontManager assets={fonts} families={families} />
          </div>
        ) : (
          <SettingsForm settings={settings} tab={tab} />
        )}

        {params.view === "profile" ? (
          <div className="mt-5 space-y-5">
            <section className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">حساب کاربری</h2>
              <dl className="mt-3 grid gap-3 text-[12.5px] sm:grid-cols-3">
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
        ) : null}
      </div>
    </div>
  );
}
