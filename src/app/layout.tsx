import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getPublicSettings, DEFAULT_SETTINGS } from "@/server/settings";
import { familyStack, fontFaceCss, getFontAssets } from "@/server/fonts";
import { getLocale } from "@/server/locale";
import { localeDir, localeInfo } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import {
  ThemeProvider,
  THEME_BOOT_SCRIPT,
} from "@/components/theme/theme-provider";
import "@mdxeditor/editor/style.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getPublicSettings(), getLocale()]);
  const ogLocale = locale === "fa" ? "fa_IR" : locale === "ar" ? "ar_SA" : "en_US";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.seo_title || DEFAULT_SETTINGS.seo_title,
      template: "%s | هلدینگ نامیرا همراه پارس",
    },
    description: settings.seo_description || DEFAULT_SETTINGS.seo_description,
    applicationName: settings.site_name,
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: settings.site_name,
      title: settings.seo_title || DEFAULT_SETTINGS.seo_title,
      description: settings.seo_description || DEFAULT_SETTINGS.seo_description,
      images: settings.logo_path ? [settings.logo_path] : undefined,
    },
    // When an administrator uploads a favicon it replaces the bundled app icon.
    icons: settings.favicon_path
      ? {
          icon: settings.favicon_path,
          shortcut: settings.favicon_path,
          apple: settings.favicon_path,
        }
      : undefined,
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, fonts, locale] = await Promise.all([
    getPublicSettings(),
    getFontAssets(),
    getLocale(),
  ]);

  /**
   * Reading settings, resolved once per request and handed to CSS as variables
   * (see `html { font-size: var(--site-font-size) }` in globals.css). Rendering
   * them inline keeps the first paint at the configured size — no flash and no
   * extra stylesheet.
   */
  const typography = {
    "--site-font-size": `${settings.font_size}px`,
    "--site-line-height": settings.line_height,
    "--site-font-family": familyStack(settings.font_family),
    "--site-heading-family": familyStack(settings.heading_font_family || settings.font_family),
  } as CSSProperties;

  /**
   * Uploaded fonts become `@font-face` rules here, in the same document, so the
   * family is available on first paint. `font-display: swap` means a slow file
   * never hides the copy.
   */
  const fontCss = fontFaceCss(fonts);

  return (
    <html
      lang={localeInfo(locale).htmlLang}
      dir={localeDir(locale)}
      data-theme="dark"
      suppressHydrationWarning
      style={typography}
    >
      <body>
        {/* Applies the stored theme before paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {fontCss ? <style dangerouslySetInnerHTML={{ __html: fontCss }} /> : null}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
