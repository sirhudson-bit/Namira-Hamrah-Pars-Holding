import { cache } from "react";
import { prisma } from "@/server/db";
import { toPersianDigits } from "@/lib/format";
import { extractEmbedUrl } from "@/lib/embed";

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
  /* Reading experience, managed from /admin/settings → «نمایش و خوانایی». */
  /** Root font size of the public site, in CSS pixels. */
  font_size: string;
  /** Body line-height multiplier for paragraphs and list items. */
  line_height: string;
  /* Maintenance mode, managed from /admin/settings. */
  /** "true" hides the public site behind the maintenance screen. */
  maintenance_mode: string;
  maintenance_message: string;
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
  font_size: "16",
  line_height: "1.75",
  maintenance_mode: "false",
  maintenance_message:
    "سایت در حال به‌روزرسانی است. لطفاً چند دقیقه بعد دوباره سر بزنید.",
};

/** Reading range for the typography controls; anything outside is clamped. */
export const FONT_SIZE_RANGE = { min: 14, max: 18, fallback: 16 } as const;
export const LINE_HEIGHT_RANGE = { min: 1.4, max: 2.2, fallback: 1.75 } as const;

/**
 * Settings whose value is a human-readable number: an administrator may type
 * Latin digits, but the whole site is Persian, so they are stored (and shown)
 * as Persian numerals.
 */
const PERSIAN_NUMBER_KEYS = new Set<keyof SiteSettings>([
  "phone",
  "mobile",
  "registration_number",
  "national_id",
]);

/**
 * Settings that end up in an `iframe[src]`. They are stored as a bare URL so a
 * pasted `<iframe …>` snippet can never reach the renderer as markup.
 */
const EMBED_KEYS = new Set<keyof SiteSettings>(["map_embed", "video_embed"]);

function clampSetting(value: string, min: number, max: number, fallback: number): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return String(fallback);
  return String(Math.min(max, Math.max(min, n)));
}

/**
 * Reads every setting row into one typed object, filling gaps with defaults.
 *
 * Normalisation happens here, not at the call sites: rows written before a
 * field gained rules (a phone typed with Latin digits, a paste of the whole
 * Google Maps `<iframe>` snippet) are corrected for every consumer at once.
 *
 * Cached per request: the root layout's `generateMetadata`, the site layout and
 * several pages all need settings, and each call would otherwise be another
 * identical query.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SiteSettings>;
  const settings: SiteSettings = { ...DEFAULT_SETTINGS, ...map };

  for (const key of PERSIAN_NUMBER_KEYS) {
    settings[key] = toPersianDigits(settings[key]);
  }
  for (const key of EMBED_KEYS) {
    settings[key] = extractEmbedUrl(settings[key]);
  }
  settings.font_size = clampSetting(
    settings.font_size,
    FONT_SIZE_RANGE.min,
    FONT_SIZE_RANGE.max,
    FONT_SIZE_RANGE.fallback,
  );
  settings.line_height = clampSetting(
    settings.line_height,
    LINE_HEIGHT_RANGE.min,
    LINE_HEIGHT_RANGE.max,
    LINE_HEIGHT_RANGE.fallback,
  );
  settings.maintenance_mode = settings.maintenance_mode === "true" ? "true" : "false";

  return settings;
});
