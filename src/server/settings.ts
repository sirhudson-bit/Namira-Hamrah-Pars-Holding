import { cache } from "react";
import { prisma } from "@/server/db";
import { toPersianDigits } from "@/lib/format";
import { extractEmbedUrl } from "@/lib/embed";
import { DEFAULT_FONT_FAMILY, sanitizeFamily } from "@/server/fonts";
import { getLocale } from "@/server/locale";
import { translateMany } from "@/server/translate";

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
  /** Cover photograph of the home page (media library). */
  hero_image: string;
  hero_image_alt: string;
  /* Typography family, managed from /admin/settings → «فونت». */
  /** Family used for body copy; must exist in the font library. */
  font_family: string;
  /** Family used for headings; empty = same as body. */
  heading_font_family: string;
  /* Support chat, managed from /admin/settings → «چت‌بات». */
  chat_enabled: string;
  chat_title: string;
  chat_welcome: string;
  /** Extra Q&A or facts the assistant may use, one item per line. */
  chat_extra_knowledge: string;
  /* Reading experience, managed from /admin/settings → «نمایش و خوانایی». */
  /** Root font size of the public site, in CSS pixels. */
  font_size: string;
  /** Body line-height multiplier for paragraphs and list items. */
  line_height: string;
  /* Maintenance mode, managed from /admin/settings. */
  /** "true" hides the public site behind the maintenance screen. */
  maintenance_mode: string;
  maintenance_message: string;
  /* Page-hero backdrop, managed from /admin/settings → «لوگو و فاوآیکون». */
  /** Image painted behind every inner-page hero (empty = plain canvas). */
  page_hero_bg: string;
  /* Home hero orb placement, managed from /admin/home. */
  /** "left" | "right" | "center" — which edge the orb is pinned to. */
  hero_orb_align: string;
  /** Horizontal distance from that edge, in vw. */
  hero_orb_x: string;
  /** Vertical centre of the orb, in vh from the top. */
  hero_orb_y: string;
  /** Orb diameter, in vw (clamped 20–80). */
  hero_orb_size: string;
};

/**
 * The subset the header needs. It is a client component, so everything in this
 * object is serialized into the RSC payload on every request — pass only what
 * it renders.
 */
export type HeaderSettings = Pick<
  SiteSettings,
  "site_name" | "logo_path" | "logo_light_path" | "logo_height" | "hours" | "phone" | "email"
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
  hero_image: "/images/topics/hq.webp",
  hero_image_alt: "مقر هلدینگ نامیرا همراه پارس",
  font_family: "Vazirmatn",
  heading_font_family: "",
  chat_enabled: "true",
  chat_title: "دستیار نامیرا",
  chat_welcome:
    "سلام! من دستیار هوشمند هلدینگ نامیرا هستم. درباره گروه‌های کسب‌وکار، فروشگاه‌ها، خدمات یا راه‌های تماس بپرسید.",
  chat_extra_knowledge: "",
  font_size: "16",
  line_height: "1.75",
  maintenance_mode: "false",
  maintenance_message:
    "سایت در حال به‌روزرسانی است. لطفاً چند دقیقه بعد دوباره سر بزنید.",
  page_hero_bg: "",
  hero_orb_align: "left",
  hero_orb_x: "2",
  hero_orb_y: "50",
  hero_orb_size: "44",
};

/** Allowed placements for the hero orb, in the order the admin sees them. */
export const ORB_ALIGNMENTS = ["left", "right", "center"] as const;

/** Ranges for the orb controls; anything outside is clamped on the way out. */
export const ORB_RANGE = {
  x: { min: 0, max: 80, fallback: 2 },
  y: { min: 0, max: 100, fallback: 50 },
  size: { min: 20, max: 80, fallback: 44 },
} as const;

/**
 * Settings grouped into the tabs of /admin/settings.
 *
 * The map is the single source of truth: the tab bar renders from it, the form
 * renders the keys of the active tab, and `saveSettings` writes exactly those
 * keys. Without the last part, submitting one tab would blank every field that
 * belongs to the others (a missing `FormData` key reads as an empty string).
 */
export const SETTINGS_TABS = {
  /**
   * Site identity and the site-wide switch. Maintenance lives here because it
   * is a property of the site, not a separate feature — two fields do not earn
   * their own screen.
   */
  general: {
    label: "عمومی",
    keys: [
      "site_name",
      "legal_name",
      "registration_number",
      "national_id",
      "maintenance_mode",
      "maintenance_message",
    ],
  },
  contact: {
    label: "تماس و نشانی",
    keys: [
      "address",
      "phone",
      "mobile",
      "email",
      "hours",
      "map_embed",
      "instagram",
      "linkedin",
      "telegram",
    ],
  },
  /** Logo, favicon, page-hero backdrop and the intro video: everything visual. */
  branding: { label: "برند و ظاهر", keys: ["video_embed"] },
  /**
   * Typography is one decision, not two: the family, the size it is set at and
   * the uploads that provide it belong on one screen. This merges the old
   * «فونت» and «نمایش و خوانایی» tabs.
   */
  typography: {
    label: "تایپوگرافی",
    keys: ["font_family", "heading_font_family", "font_size", "line_height"],
  },
  seo: { label: "سئو و آمار", keys: ["seo_title", "seo_description", "ga_id", "analytics_enabled"] },
  chat: {
    label: "چت‌بات",
    keys: ["chat_enabled", "chat_title", "chat_welcome", "chat_extra_knowledge"],
  },
} as const satisfies Record<string, { label: string; keys: readonly string[] }>;

/**
 * Tabs that were merged away, mapped to the screen that absorbed them. Old
 * bookmarks and the sidebar's own links keep working instead of falling back to
 * «عمومی» and silently losing the reader's place.
 */
export const SETTINGS_TAB_ALIASES: Record<string, SettingsTabKey> = {
  fonts: "typography",
  reading: "typography",
  maintenance: "general",
};

export type SettingsTabKey = keyof typeof SETTINGS_TABS;

export const SETTINGS_TAB_ORDER = Object.keys(SETTINGS_TABS) as SettingsTabKey[];

/** Settings a given tab is allowed to write. */
export function settingsKeysForTab(tab: string | null | undefined): readonly string[] | null {
  if (!tab) return null;
  const entry = SETTINGS_TABS[tab as SettingsTabKey];
  return entry ? entry.keys : null;
}

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

/** Like `clampSetting`, but zero is a legitimate value (flush to the edge). */
function clampOrb(value: string, min: number, max: number, fallback: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(fallback);
  return String(Math.min(max, Math.max(min, n)));
}

/** Settings whose text is shown to visitors and therefore translated. */
const PUBLIC_TEXT_KEYS: (keyof SiteSettings)[] = [
  "hero_eyebrow",
  "hero_title",
  "hero_lead",
  "hero_cta_label",
  "hero_video_label",
  "hours",
  "address",
  "chat_title",
  "chat_welcome",
  "chat_extra_knowledge",
  "maintenance_message",
  "seo_title",
  "seo_description",
];

/**
 * The visitor-facing settings. Persian is the source language, so the raw rows
 * are translated on read (and cached) for every other locale. The admin panel
 * keeps using `getSettings()` and always sees the Persian source.
 */
export const getPublicSettings = cache(async (): Promise<SiteSettings> => {
  const locale = await getLocale();
  const base = await getSettings();
  if (locale === "fa") return base;

  const values = PUBLIC_TEXT_KEYS.map((key) => String(base[key] ?? ""));
  const translated = await translateMany(values, locale);
  const localized: SiteSettings = { ...base };
  PUBLIC_TEXT_KEYS.forEach((key, index) => {
    localized[key] = translated[index];
  });

  // `hero_stats` is `value|label` per line: only the label is prose.
  const stats = base.hero_stats
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[1]);
  if (stats.length > 0) {
    const labels = await translateMany(stats.map((parts) => parts[1]), locale);
    localized.hero_stats = stats
      .map((parts, index) => `${parts[0]}|${labels[index]}`)
      .join("\n");
  }

  return localized;
});

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
  // A family name is pasted into CSS; strip anything that could close a rule.
  settings.font_family = sanitizeFamily(settings.font_family) || DEFAULT_FONT_FAMILY;
  settings.heading_font_family = sanitizeFamily(settings.heading_font_family);

  settings.hero_orb_align = (ORB_ALIGNMENTS as readonly string[]).includes(
    settings.hero_orb_align,
  )
    ? settings.hero_orb_align
    : "left";
  settings.hero_orb_x = clampOrb(settings.hero_orb_x, ORB_RANGE.x.min, ORB_RANGE.x.max, ORB_RANGE.x.fallback);
  settings.hero_orb_y = clampOrb(settings.hero_orb_y, ORB_RANGE.y.min, ORB_RANGE.y.max, ORB_RANGE.y.fallback);
  settings.hero_orb_size = clampOrb(
    settings.hero_orb_size,
    ORB_RANGE.size.min,
    ORB_RANGE.size.max,
    ORB_RANGE.size.fallback,
  );

  return settings;
});
