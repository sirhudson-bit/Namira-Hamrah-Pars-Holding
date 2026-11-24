/**
 * Locale plumbing shared by server and client.
 *
 * Persian is the source language: every DB row and every label is written in
 * Persian, and the other locales are produced by the live translator. That
 * keeps one authoritative version of the content instead of three copies that
 * drift apart.
 */

export const LOCALE_COOKIE = "namira_locale";

export const LOCALES = [
  { code: "fa", label: "فارسی", short: "FA", dir: "rtl", htmlLang: "fa" },
  { code: "en", label: "English", short: "EN", dir: "ltr", htmlLang: "en" },
  { code: "ar", label: "العربية", short: "AR", dir: "rtl", htmlLang: "ar" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "fa";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.some((entry) => entry.code === value);
}

export function localeInfo(locale: Locale) {
  return LOCALES.find((entry) => entry.code === locale) ?? LOCALES[0];
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return localeInfo(locale).dir;
}

/** True when the string contains Persian/Arabic letters worth translating. */
export function hasPersian(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}
