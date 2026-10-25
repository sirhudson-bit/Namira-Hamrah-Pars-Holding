import type { Metadata } from "next";
import { getSettings } from "@/server/settings";
import { requireAdmin } from "@/server/auth";
import { SettingsForm } from "@/components/admin/settings-form";
import { BrandingUploader } from "@/components/admin/branding-form";
import { LogoSizeForm } from "@/components/admin/logo-size-form";
import { PasswordForm } from "@/components/admin/password-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تنظیمات" };

export default async function AdminSettingsPage() {
  const [settings, user] = await Promise.all([getSettings(), requireAdmin()]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        title="تنظیمات"
        description="اطلاعات تماس، لوگو، شبکه‌های اجتماعی، سئو، نمایش و حالت تعمیر. این مقادیر در تمام سایت استفاده می‌شوند."
      />

      <section className="card p-6">
        <h2 className="heading-3 mb-1">لوگو و فاوآیکون</h2>
        <p className="mb-6 text-sm text-ink-500">
          تصاویر PNG، SVG، WEBP یا JPG؛ حداکثر ۲ مگابایت. فاوآیکون می‌تواند ICO هم باشد. تصاویر
          رستری به‌طور خودکار به WebP تبدیل و ذخیره می‌شوند؛ SVG و ICO بدون تغییر می‌مانند. اگر
          لوگویی بارگذاری نشود، نشان پیش‌فرض سایت نمایش داده می‌شود.
        </p>
        <div className="space-y-4">
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
            hint="آیکون نوار مرورگر و نشانک‌ها. مربعی و کوچک (مثلاً ۳۲×۳۲ یا ۶۴×۶۴)."
            current={settings.favicon_path}
            square
          />
        </div>

        <LogoSizeForm value={settings.logo_height} />
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-1">پس‌زمینه هیروی صفحات</h2>
        <p className="mb-6 text-sm text-ink-500">
          تصویری که پشت عنوان همه‌ی صفحات داخلی (درباره ما، تماس، فروشگاه‌ها و …) نمایش
          داده می‌شود. یک لایه‌ی هم‌رنگ تم روی تصویر می‌نشیند تا متن در حالت روشن و تیره
          خوانا بماند. تصاویر رستری خودکار به WebP تبدیل می‌شوند؛ حداکثر ۸ مگابایت.
        </p>
        <BrandingUploader
          kind="page_hero_bg"
          label="تصویر پس‌زمینه هیرو"
          hint="نسبت پیشنهادی ۱۶:۹ و عرض دست‌کم ۱۹۲۰ پیکسل. اگر خالی بماند، هیرو مثل قبل ساده است."
          current={settings.page_hero_bg}
          tone="dark"
        />
      </section>

      <SettingsForm settings={settings} />

      <PasswordForm email={user.email} />
    </div>
  );
}
