import { cache } from "react";
import { getLocale } from "@/server/locale";
import { translateMany } from "@/server/translate";
import type { Locale } from "@/lib/i18n";

/**
 * Interface strings that live in client components and therefore cannot call
 * the translator themselves. They are translated on the server once per
 * request and handed down as props, so the whole chrome switches language with
 * the content instead of half-translating the page.
 */
const SOURCE = {
  contact: "تماس با ما",
  index: "فهرست",
  indexAria: "فهرست سایت",
  close: "بستن",
  fullIndex: "فهرست کامل",
  sections: "بخش",
  scrollHint: "برای دیدن ادامه، اسکرول کنید",
  phone: "تلفن",
  email: "ایمیل",
  hours: "ساعات کاری",
  escHint: "برای بستن، کلید Esc را بزنید.",
  chatStatus: "پاسخ‌گوی آنلاین سایت",
  chatPlaceholder: "سؤالتان را بنویسید…",
  chatTyping: "در حال نوشتن…",
  chatNote: "پاسخ‌ها از محتوای همین سایت ساخته می‌شوند و ممکن است کامل نباشند.",
  chatSend: "ارسال",
  chatClose: "بستن دستیار",
  chatOpen: "گفتگو با دستیار نامیرا",
  chatRetry: "تعداد پیام‌ها زیاد شد؛ لطفاً چند دقیقه بعد دوباره تلاش کنید.",
  chatUnavailable: "پاسخ‌گویی در دسترس نیست. لطفاً تماس بگیرید.",
  chatNetwork: "ارتباط برقرار نشد. اتصال خود را بررسی کنید.",
  chatPromptGroups: "گروه‌های کسب‌وکار نامیرا کدام‌اند؟",
  chatPromptContact: "شماره تماس و نشانی",
  chatPromptServices: "خدمات پس از فروش چیست؟",
  chatPromptJobs: "فرصت‌های شغلی",
  allRights: "تمام حقوق محفوظ است.",
  newsletterTitle: "از اخبار و مقالات نامیرا باخبر شوید",
  newsletterLead: "ایمیل خود را وارد کنید تا اخبار هلدینگ، رویدادها و مقالات تازه برایتان ارسال شود.",
  newsletterTag: "خبرنامه",
  newsletterJoin: "عضویت در خبرنامه",
  newsletterConsentPrefix: "موافقم ایمیل‌های خبرنامه را دریافت کنم و با",
  newsletterConsentSuffix: "موافقم.",
  privacy: "حریم خصوصی",
  footerBlurb:
    "مجموعه‌ای چند‌گروهی با تمرکز بر خرده‌فروشی دیجیتال، توزیع و نوآوری فناورانه.",
  cookieSettings: "تنظیمات کوکی",
  language: "زبان",
  skipToContent: "پرش به محتوای اصلی",
} as const;

export type ChromeLabels = Record<keyof typeof SOURCE, string>;

export const getChrome = cache(async (): Promise<{ locale: Locale; labels: ChromeLabels }> => {
  const locale = await getLocale();
  const keys = Object.keys(SOURCE) as (keyof typeof SOURCE)[];
  const values = keys.map((key) => SOURCE[key]);
  const translated = locale === "fa" ? values : await translateMany(values, locale);
  const labels = Object.fromEntries(
    keys.map((key, index) => [key, translated[index]]),
  ) as ChromeLabels;
  return { locale, labels };
});
