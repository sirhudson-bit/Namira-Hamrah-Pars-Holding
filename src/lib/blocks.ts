/**
 * Widget catalogue for the page builder (`/admin/layout`).
 *
 * A block is one row in `PageBlock`; its settings live in `data` as a flat
 * string map (everything comes from an HTML form). This module is imported by
 * both the admin form and the public renderer, so the field names, defaults and
 * help text have exactly one home.
 */

import { IMAGE_POSITION_OPTIONS } from "./media";

export type BlockFieldType = "text" | "textarea" | "image" | "select" | "number";

export type BlockField = {
  name: string;
  label: string;
  type: BlockFieldType;
  hint?: string;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
};

export type BlockDef = {
  type: string;
  label: string;
  description: string;
  /** One line in the add-widget palette. */
  glyph: string;
  fields: BlockField[];
  defaults: Record<string, string>;
};

export type BlockRecord = {
  id: string;
  pageSlug: string;
  type: string;
  data: string;
  sortOrder: number;
  visible: boolean;
};

const IMAGE_POSITION_OPTIONS_FOR_BLOCK = IMAGE_POSITION_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const ALIGN_OPTIONS = [
  { value: "right", label: "راست‌چین" },
  { value: "center", label: "وسط‌چین" },
];

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "heading",
    label: "تیتر و توضیح",
    description: "یک تیتر بزرگ با برچسب و توضیح کوتاه؛ شروع یک بخش.",
    glyph: "H",
    fields: [
      { name: "eyebrow", label: "برچسب بالای تیتر", type: "text" },
      { name: "title", label: "تیتر", type: "text", placeholder: "عنوان بخش" },
      {
        name: "description",
        label: "توضیح",
        type: "textarea",
        rows: 3,
        hint: "یک یا دو جمله زیر تیتر.",
      },
      { name: "align", label: "چیدمان", type: "select", options: ALIGN_OPTIONS },
    ],
    defaults: { align: "right" },
  },
  {
    type: "text",
    label: "متن",
    description: "متن آزاد با قالب‌بندی Markdown و امکان درج تصویر.",
    glyph: "¶",
    fields: [
      { name: "title", label: "تیتر (اختیاری)", type: "text" },
      {
        name: "body",
        label: "متن",
        type: "textarea",
        rows: 8,
        hint: "Markdown: ## تیتر، **درشت**، - فهرست و ![alt](/uploads/…) برای تصویر.",
      },
      { name: "align", label: "چیدمان", type: "select", options: ALIGN_OPTIONS },
    ],
    defaults: { align: "right" },
  },
  {
    type: "image",
    label: "تصویر",
    description: "یک تصویر بزرگ با شرح اختیاری و پیوند.",
    glyph: "▣",
    fields: [
      { name: "image", label: "تصویر", type: "image" },
      {
        name: "imagePosition",
        label: "موقعیت نمایش تصویر",
        type: "select",
        options: IMAGE_POSITION_OPTIONS_FOR_BLOCK,
        hint: "نقطه‌ای از تصویر که در کادر دیده می‌شود.",
      },
      { name: "caption", label: "شرح تصویر", type: "text" },
      { name: "href", label: "پیوند (اختیاری)", type: "text", placeholder: "/contact" },
      {
        name: "ratio",
        label: "نسبت تصویر",
        type: "select",
        options: [
          { value: "wide", label: "عریض (۱۶:۹)" },
          { value: "square", label: "مربع" },
          { value: "auto", label: "اندازه طبیعی" },
        ],
      },
    ],
    defaults: { ratio: "wide", imagePosition: "center" },
  },
  {
    type: "split",
    label: "تصویر و متن",
    description: "تصویر در یک ستون و متن در ستون دیگر.",
    glyph: "◧",
    fields: [
      { name: "image", label: "تصویر", type: "image" },
      {
        name: "imagePosition",
        label: "موقعیت نمایش تصویر",
        type: "select",
        options: IMAGE_POSITION_OPTIONS_FOR_BLOCK,
      },
      { name: "eyebrow", label: "برچسب", type: "text" },
      { name: "title", label: "تیتر", type: "text" },
      { name: "body", label: "متن", type: "textarea", rows: 6 },
      { name: "ctaLabel", label: "متن دکمه", type: "text" },
      { name: "ctaHref", label: "نشانی دکمه", type: "text", placeholder: "/about" },
      {
        name: "imageSide",
        label: "جای تصویر",
        type: "select",
        options: [
          { value: "right", label: "سمت راست" },
          { value: "left", label: "سمت چپ" },
        ],
      },
    ],
    defaults: { imageSide: "right" },
  },
  {
    type: "cards",
    label: "کارت‌های ویژگی",
    description: "شبکه‌ای از کارت‌ها؛ هر خط یک کارت «عنوان|توضیح».",
    glyph: "▤",
    fields: [
      { name: "eyebrow", label: "برچسب", type: "text" },
      { name: "title", label: "تیتر بخش", type: "text" },
      {
        name: "items",
        label: "کارت‌ها",
        type: "textarea",
        rows: 6,
        hint: "هر خط یک کارت: عنوان|توضیح",
        placeholder: "تأمین مطمئن|تأمین مستقیم از برندهای معتبر",
      },
      {
        name: "columns",
        label: "تعداد ستون",
        type: "select",
        options: [
          { value: "2", label: "۲ ستون" },
          { value: "3", label: "۳ ستون" },
          { value: "4", label: "۴ ستون" },
        ],
      },
    ],
    defaults: { columns: "3" },
  },
  {
    type: "stats",
    label: "آمار",
    description: "ردیف اعداد کلیدی؛ هر خط «مقدار|برچسب».",
    glyph: "٪",
    fields: [
      { name: "title", label: "تیتر (اختیاری)", type: "text" },
      {
        name: "items",
        label: "آمار",
        type: "textarea",
        rows: 4,
        hint: "هر خط: مقدار|برچسب — مثلاً ۱۴|سال تجربه",
        placeholder: "۱۴|سال تجربه",
      },
    ],
    defaults: {},
  },
  {
    type: "cta",
    label: "فراخوان اقدام",
    description: "نوار تأکید با دکمه؛ مناسب انتهای صفحه.",
    glyph: "→",
    fields: [
      { name: "title", label: "تیتر", type: "text" },
      { name: "body", label: "توضیح", type: "textarea", rows: 3 },
      { name: "ctaLabel", label: "متن دکمه", type: "text" },
      { name: "ctaHref", label: "نشانی دکمه", type: "text", placeholder: "/contact" },
      { name: "image", label: "تصویر پس‌زمینه (اختیاری)", type: "image" },
    ],
    defaults: {},
  },
  {
    type: "gallery",
    label: "گالری تصاویر",
    description: "شبکه تصاویر؛ هر خط یک نشانی تصویر یا «نشانی|شرح».",
    glyph: "▦",
    fields: [
      { name: "eyebrow", label: "برچسب", type: "text" },
      { name: "title", label: "تیتر بخش", type: "text" },
      {
        name: "images",
        label: "تصاویر",
        type: "textarea",
        rows: 6,
        hint: "از دکمه «تصویر» یک نشانی بردارید و در خط جدید بگذارید.",
      },
      {
        name: "columns",
        label: "تعداد ستون",
        type: "select",
        options: [
          { value: "2", label: "۲ ستون" },
          { value: "3", label: "۳ ستون" },
          { value: "4", label: "۴ ستون" },
        ],
      },
    ],
    defaults: { columns: "3" },
  },
  {
    type: "video",
    label: "ویدئو",
    description: "ویدئوی امبدشده از آپارات، یوتیوب یا هر سرویس امبد.",
    glyph: "▶",
    fields: [
      { name: "title", label: "تیتر بخش", type: "text" },
      { name: "url", label: "نشانی ویدئو", type: "text", hint: "کد iframe یا نشانی کامل." },
      { name: "caption", label: "توضیح زیر ویدئو", type: "text" },
    ],
    defaults: {},
  },
  {
    type: "spacer",
    label: "فاصله",
    description: "فاصله عمودی بین بخش‌ها.",
    glyph: "↕",
    fields: [
      {
        name: "height",
        label: "ارتفاع (پیکسل)",
        type: "number",
        hint: "بین ۸ تا ۲۰۰ پیکسل.",
      },
    ],
    defaults: { height: "48" },
  },
];

export const BLOCK_BY_TYPE: Record<string, BlockDef> = Object.fromEntries(
  BLOCK_DEFS.map((d) => [d.type, d]),
);

/** Pages the layout editor offers, in the order they appear in the admin. */
export const LAYOUT_PAGES: { slug: string; label: string }[] = [
  { slug: "home", label: "صفحه اصلی" },
  { slug: "about", label: "درباره ما" },
  { slug: "business-groups", label: "گروه‌های کسب‌وکار" },
  { slug: "stores", label: "فروشگاه‌ها" },
  { slug: "innovation", label: "نوآوری" },
  { slug: "services", label: "خدمات" },
  { slug: "units", label: "واحدهای سازمانی" },
  { slug: "media", label: "رسانه" },
  { slug: "contact", label: "تماس با ما" },
  { slug: "careers", label: "فرصت‌های شغلی" },
  { slug: "privacy", label: "حریم خصوصی" },
  { slug: "terms", label: "قوانین و مقررات" },
  { slug: "cookie-policy", label: "سیاست کوکی" },
  { slug: "refund-policy", label: "شرایط بازگشت پول" },
];

/** Parses the stored JSON into a string map, tolerating bad/old rows. */
export function parseBlockData(raw: string): Record<string, string> {
  try {
    const value = JSON.parse(raw || "{}") as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const out: Record<string, string> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string") out[key] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/** `title|description` (or `value|label`) lines → objects. */
export function parsePairs(raw: string): { title: string; description: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", ...rest] = line.split("|");
      return { title: title.trim(), description: rest.join("|").trim() };
    })
    .filter((item) => item.title || item.description);
}

/** `path|alt` lines → images. */
export function parseImageLines(raw: string): { src: string; alt: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src = "", ...rest] = line.split("|");
      return { src: src.trim(), alt: rest.join("|").trim() };
    })
    .filter((item) => item.src);
}

/** Default data for a new block of `type`, as stored JSON. */
export function newBlockData(type: string): string {
  const def = BLOCK_BY_TYPE[type];
  return JSON.stringify(def ? def.defaults : {});
}
