"use client";

import { useActionState } from "react";
import { saveSettings } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, Textarea, Checkbox, Select, FormFeedback, SubmitBar } from "@/components/admin/fields";
import type { SiteSettings, SettingsTabKey } from "@/server/settings";

/**
 * One settings screen per tab, each posting only its own keys.
 *
 * The hidden `_tab` field is what makes that safe: `saveSettings` writes the
 * keys listed for the tab in `SETTINGS_TABS` and nothing else, so saving
 * «سئو» cannot blank the contact details that were not part of the form.
 */
export function SettingsForm({
  settings,
  tab,
  fontOptions = [],
}: {
  settings: SiteSettings;
  tab: SettingsTabKey;
  /** Families available in the font library, for the typography tab. */
  fontOptions?: string[];
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_tab" value={tab} />

      {tab === "general" ? (
        <>
        <div className="card p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">اطلاعات هلدینگ</h2>
          <p className="mb-4 text-[12px] text-ink-500">
            نام نمایشی سایت و اطلاعات ثبتی که در فوتر و صفحات حقوقی استفاده می‌شود.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام سایت" name="site_name" defaultValue={settings.site_name} />
            <Field label="نام قانونی" name="legal_name" defaultValue={settings.legal_name} />
            <Field label="شماره ثبت" name="registration_number" defaultValue={settings.registration_number} />
            <Field label="شناسه ملی" name="national_id" defaultValue={settings.national_id} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">دسترسی به سایت</h2>
          <p className="mb-4 text-[12px] leading-6 text-ink-500">
            با روشن کردن حالت نگهداری، بازدیدکنندگان به‌جای صفحات سایت یک صفحه «در حال
            به‌روزرسانی» می‌بینند. پیشخوان و ورود ادمین همیشه باز می‌مانند.
          </p>
          <div className="space-y-4">
            <Checkbox
              label="حالت نگهداری فعال باشد"
              name="maintenance_mode"
              defaultChecked={settings.maintenance_mode === "true"}
              hint="تا زمانی که تیک نخورده باشد، سایت برای همه باز است."
            />
            <Textarea
              label="پیام صفحه نگهداری"
              name="maintenance_message"
              defaultValue={settings.maintenance_message}
              rows={3}
              hint="اگر خالی بماند، پیام پیش‌فرض نمایش داده می‌شود."
            />
          </div>
        </div>
        </>
      ) : null}

      {tab === "contact" ? (
        <>
          <div className="card p-5">
            <h2 className="mb-1 text-[14px] font-bold text-ink-900">اطلاعات تماس</h2>
            <p className="mb-4 text-[12px] text-ink-500">
              این مقادیر در سربرگ، فوتر، صفحه تماس و صفحه تعمیر نمایش داده می‌شوند.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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
                  hint="کل تگ iframe گوگل‌مپ را بچسبانید؛ فقط نشانی داخل src ذخیره می‌شود. لینک کوتاه maps.app.goo.gl در صفحه قابل نمایش نیست."
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-1 text-[14px] font-bold text-ink-900">شبکه‌های اجتماعی</h2>
            <p className="mb-4 text-[12px] text-ink-500">در فوتر همه صفحات نمایش داده می‌شوند.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="اینستاگرام" name="instagram" dir="ltr" defaultValue={settings.instagram} />
              <Field label="لینکدین" name="linkedin" dir="ltr" defaultValue={settings.linkedin} />
              <Field label="تلگرام" name="telegram" dir="ltr" defaultValue={settings.telegram} />
            </div>
          </div>
        </>
      ) : null}

      {tab === "seo" ? (
        <div className="card p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">موتور جستجو</h2>
          <p className="mb-4 text-[12px] text-ink-500">
            عنوان و توضیح پیش‌فرض همه صفحات. هر برگه می‌تواند مقدار خودش را داشته باشد.
          </p>
          <div className="space-y-4">
            <Field label="عنوان پیش‌فرض سئو" name="seo_title" defaultValue={settings.seo_title} />
            <Textarea
              label="توضیح پیش‌فرض سئو"
              name="seo_description"
              defaultValue={settings.seo_description}
              rows={3}
              hint="حدود ۱۵۰ تا ۱۶۰ نویسه؛ در نتایج گوگل همین متن دیده می‌شود."
            />
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
              hint="بارگذاری واقعی به رضایت کاربر و شناسه بالا وابسته است."
            />
          </div>
        </div>
      ) : null}

      {tab === "branding" ? (
        <div className="card p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">ویدئوی معرفی</h2>
          <p className="mb-4 text-[12px] text-ink-500">
            دکمه «ویدئوی معرفی» در بالای صفحه اصلی این ویدئو را تمام‌صفحه باز می‌کند. اگر خالی
            بماند، دکمه نمایش داده نمی‌شود.
          </p>
          <Field
            label="نشانی embed ویدئو"
            name="video_embed"
            dir="ltr"
            defaultValue={settings.video_embed}
            hint="نشانی embed آپارات یا یوتیوب."
          />
        </div>
      ) : null}

      {tab === "chat" ? (
        <div className="card p-5">
          <h2 className="mb-1 text-[14px] font-bold text-ink-900">دستیار گفتگو</h2>
          <p className="mb-4 text-[12px] leading-6 text-ink-500">
            دکمه گفتگو در گوشه پایین-چپ همه صفحات سایت نمایش داده می‌شود. پاسخ‌ها از محتوای
            همین سایت (گروه‌ها، فروشگاه‌ها، خدمات، صفحات و اخبار) ساخته می‌شوند؛ اگر کلید مدل
            زبانی در سرور تنظیم شده باشد، همان مدل پاسخ می‌دهد.
          </p>
          <div className="space-y-4">
            <Checkbox
              label="دستیار فعال باشد"
              name="chat_enabled"
              defaultChecked={settings.chat_enabled !== "false"}
              hint="با برداشتن تیک، دکمه گفتگو از همه صفحات حذف می‌شود."
            />
            <Field label="عنوان پنجره" name="chat_title" defaultValue={settings.chat_title} />
            <Textarea
              label="پیام خوش‌آمد"
              name="chat_welcome"
              rows={3}
              defaultValue={settings.chat_welcome}
              hint="اولین پیامی که بازدیدکننده پیش از پرسیدن سؤال می‌بیند."
            />
            <Textarea
              label="دانش تکمیلی"
              name="chat_extra_knowledge"
              rows={5}
              defaultValue={settings.chat_extra_knowledge}
              hint="هر خط یک نکته: شرایط گارانتی، رویه مرجوعی، ساعت پاسخ‌گویی. این متن به دانش سایت اضافه می‌شود."
            />
          </div>
        </div>
      ) : null}

      {tab === "typography" ? (
        <>
            <div className="card p-5">
            <h2 className="mb-1 text-[14px] font-bold text-ink-900">خانواده فونت</h2>
            <p className="mb-4 text-[12px] leading-6 text-ink-500">
            فونت متن و تیترها را انتخاب کنید. هر خانواده‌ای که اینجا دیده می‌شود، از فایل‌های
            بارگذاری‌شده در همین صفحه ساخته شده است. Vazirmatn به‌صورت پیش‌فرض همراه سایت است.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="فونت متن"
                name="font_family"
                options={fontOptions.map((family) => ({ value: family, label: family }))}
                defaultValue={settings.font_family}
            />
              <Select
                label="فونت تیترها"
                name="heading_font_family"
                options={[
                  { value: "", label: "مانند فونت متن" },
                  ...fontOptions.map((family) => ({ value: family, label: family })),
                ]}
                defaultValue={settings.heading_font_family}
            />
            </div>
            <div className="mt-4 rounded border border-line-200 bg-surface-100 p-4">
              <p className="mb-1 text-[10.5px] uppercase tracking-wide text-ink-400">پیش‌نمایش</p>
              <p
                className="text-[17px] leading-8 text-ink-900"
                style={{ fontFamily: `"${settings.font_family}", Vazirmatn, sans-serif` }}
            >
                گروهی که در هر بازار، یک زنجیره کامل می‌سازد.
              </p>
              <p
                className="mt-1 text-[12px] text-ink-500"
                style={{
                  fontFamily: `"${settings.heading_font_family || settings.font_family}", Vazirmatn, sans-serif`,
                }}
            >
                نامیرا همراه پارس — متن نمونه ۱۲۳۴۵
              </p>
            </div>
          </div>

            <div className="card p-5">
              <h2 className="mb-1 text-[14px] font-bold text-ink-900">اندازه و خوانایی</h2>
              <p className="mb-4 text-[12px] text-ink-500">
                اندازه پایه متن و فاصله خطوط برای کل سایت. مقادیر خارج از بازه به نزدیک‌ترین حد
                مجاز اصلاح می‌شوند.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="اندازه فونت پایه (پیکسل)"
                  name="font_size"
                  type="number"
                  dir="ltr"
                  min={14}
                  max={18}
                  step={1}
                  defaultValue={settings.font_size}
                  hint="بازه ۱۴ تا ۱۸. پیش‌فرض ۱۶."
                />
                <Field
                  label="فاصله بین خطوط"
                  name="line_height"
                  type="number"
                  dir="ltr"
                  min={1.4}
                  max={2.2}
                  step={0.05}
                  defaultValue={settings.line_height}
                  hint="ضریب نسبت به اندازه فونت؛ مثلاً ۱٫۷۵."
                />
              </div>
            </div>
        </>
      ) : null}

      {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}

      <div className="flex items-center gap-3">
        <SubmitBar pending={pending} label="ذخیره تغییرات" />
        <p className="text-[11px] text-ink-500">فقط فیلدهای همین بخش ذخیره می‌شوند.</p>
      </div>
    </form>
  );
}
