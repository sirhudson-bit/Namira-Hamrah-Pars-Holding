"use client";

import { useActionState } from "react";
import { saveSettings } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, Textarea, Checkbox, FormFeedback, SubmitBar } from "@/components/admin/fields";
import type { SiteSettings } from "@/server/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={action} className="space-y-8">
      <section className="card p-6">
        <h2 className="heading-3 mb-5">اطلاعات هلدینگ</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="نام سایت" name="site_name" defaultValue={settings.site_name} />
          <Field label="نام قانونی" name="legal_name" defaultValue={settings.legal_name} />
          <Field label="شماره ثبت" name="registration_number" defaultValue={settings.registration_number} />
          <Field label="شناسه ملی" name="national_id" defaultValue={settings.national_id} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-5">اطلاعات تماس</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="تلفن" name="phone" defaultValue={settings.phone} />
          <Field label="همراه" name="mobile" defaultValue={settings.mobile} />
          <Field label="ایمیل" name="email" dir="ltr" defaultValue={settings.email} />
          <Field label="ساعات کاری" name="hours" defaultValue={settings.hours} />
          <div className="sm:col-span-2">
            <Field label="نشانی" name="address" defaultValue={settings.address} />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="آدرس embed نقشه"
              name="map_embed"
              dir="ltr"
              defaultValue={settings.map_embed}
              hint="نشانی iframe نقشه. خالی بماند، جایگزین ساده نمایش داده می‌شود."
            />
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-5">شبکه‌های اجتماعی</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="اینستاگرام" name="instagram" dir="ltr" defaultValue={settings.instagram} />
          <Field label="لینکدین" name="linkedin" dir="ltr" defaultValue={settings.linkedin} />
          <Field label="تلگرام" name="telegram" dir="ltr" defaultValue={settings.telegram} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-5">سئو</h2>
        <div className="space-y-5">
          <Field label="عنوان پیش‌فرض سئو" name="seo_title" defaultValue={settings.seo_title} />
          <Textarea
            label="توضیح پیش‌فرض سئو"
            name="seo_description"
            defaultValue={settings.seo_description}
            rows={2}
          />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-1">ویدئوی معرفی</h2>
        <p className="mb-5 text-sm text-ink-500">
          دکمه «ویدئوی معرفی» در بالای صفحه اصلی، این ویدئو را در نمای تمام‌صفحه باز می‌کند. اگر
          نشانی خالی بماند، دکمه نمایش داده نمی‌شود.
        </p>
        <Field
          label="نشانی embed ویدئو"
          name="video_embed"
          dir="ltr"
          defaultValue={settings.video_embed}
          hint="مثال: نشانی embed آپارات یا یوتیوب"
        />
      </section>

      <section className="card p-6">
        <h2 className="heading-3 mb-5">حریم خصوصی و آنالیتیکس</h2>
        <div className="space-y-5">
          <Field
            label="شناسه Google Analytics"
            name="ga_id"
            dir="ltr"
            defaultValue={settings.ga_id}
            hint="فقط پس از رضایت کاربر بارگذاری می‌شود."
          />
          <Checkbox
            label="نمایش آنالیتیکس فعال است"
            name="analytics_enabled"
            defaultChecked={settings.analytics_enabled === "true"}
            hint="این گزینه فقط برای اطلاع‌رسانی است؛ بارگذاری واقعی به رضایت کاربر و شناسه بالا وابسته است."
          />
        </div>
      </section>

      {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}
      <SubmitBar pending={pending} label="ذخیره تنظیمات" />
    </form>
  );
}
