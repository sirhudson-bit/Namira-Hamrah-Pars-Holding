import { cache } from "react";
import { prisma } from "@/server/db";

export type SiteSettings = {
  site_name: string;
  legal_name: string;
  registration_number: string;
  national_id: string;
  address: string;
  phone: string;
  mobile: string;
  email: string;
  hours: string;
  map_embed: string;
  instagram: string;
  linkedin: string;
  telegram: string;
  seo_title: string;
  seo_description: string;
  analytics_enabled: string;
  ga_id: string;
  logo_path: string;
  logo_light_path: string;
  favicon_path: string;
  /** Rendered height of the header logo, in CSS pixels. */
  logo_height: string;
  video_embed: string;
  /* Home hero widget, managed from /admin/home. */
  hero_enabled: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_lead: string;
  hero_cta_label: string;
  hero_cta_href: string;
  hero_video_label: string;
  /** One stat per line, written as `value|label`. */
  hero_stats: string;
};

/**
 * The subset the header needs. It is a client component, so everything in this
 * object is serialized into the RSC payload on every request — pass only what
 * it renders.
 */
export type HeaderSettings = Pick<
  SiteSettings,
  "site_name" | "logo_path" | "logo_height" | "hours" | "phone"
>;

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "هلدینگ نامیرا همراه پارس",
  legal_name: "گروه بازرگانی نامیرا همراه پارس",
  registration_number: "۱۲۳۴۵۶",
  national_id: "۱۴۰۰۱۲۳۴۵۶۷",
  address: "تهران، خیابان ولیعصر، برج نامیرا، طبقه ۱۰",
  phone: "۰۲۱-۹۱۰۰۸۸۰۰",
  mobile: "۰۹۱۲-۰۰۰۰۰۰۰",
  email: "info@namiragroup.ir",
  hours: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر",
  map_embed: "",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/",
  telegram: "https://t.me/",
  seo_title: "هلدینگ نامیرا همراه پارس | گروه‌های کسب‌وکار، فروشگاه‌ها و نوآوری",
  seo_description:
    "نامیرا همراه پارس یک هلدینگ چند‌گروهی در حوزه‌های دیجیتال، خودرو، غذا و صنعت است؛ با فروشگاه‌های آنلاین و حضوری و واحد نوآوری نامیرا لبز.",
  analytics_enabled: "false",
  ga_id: "",
  logo_path: "",
  logo_light_path: "",
  favicon_path: "",
  logo_height: "44",
  video_embed: "",
  hero_enabled: "true",
  hero_eyebrow: "هلدینگ چند‌گروهی",
  hero_title: "گروهی که در هر بازار، یک زنجیره کامل می‌سازد",
  hero_lead:
    "نامیرا همراه پارس با پنج گروه کسب‌وکار و کانال‌های فروش آنلاین و حضوری، از تأمین کالا تا خدمات پس از فروش را یکپارچه مدیریت می‌کند.",
  hero_cta_label: "گروه‌های کسب‌وکار",
  hero_cta_href: "/business-groups",
  hero_video_label: "ویدئوی معرفی",
  hero_stats: "14|سال تجربه\n5|گروه کسب‌وکار\n4|کانال فروش\n300+|همکار سازمانی",
};

/**
 * Reads every setting row into one typed object, filling gaps with defaults.
 *
 * Cached per request: the root layout's `generateMetadata`, the site layout and
 * several pages all need settings, and each call would otherwise be another
 * identical query.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SiteSettings>;
  return { ...DEFAULT_SETTINGS, ...map };
});
