import type { Metadata } from "next";
import { getSettings, DEFAULT_SETTINGS } from "@/server/settings";
import { SITE_URL } from "@/lib/site";
import {
  ThemeProvider,
  THEME_BOOT_SCRIPT,
} from "@/components/theme/theme-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

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
      locale: "fa_IR",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <body>
        {/* Applies the stored theme before paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
