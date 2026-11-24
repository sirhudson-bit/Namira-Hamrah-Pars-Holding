import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, localeDir, type Locale } from "@/lib/i18n";

/** The visitor's chosen locale, read from the cookie set by the switcher. */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

export const getLocaleDir = cache(async () => localeDir(await getLocale()));
