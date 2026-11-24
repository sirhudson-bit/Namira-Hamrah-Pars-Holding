import Link from "next/link";
import { Wrench } from "lucide-react";
import { getPublicSettings } from "@/server/settings";
import { getFooterMenus, getHeaderNav } from "@/server/menus";
import { getChrome } from "@/server/chrome";
import { getCurrentUser } from "@/server/auth";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MaintenanceScreen } from "@/components/site/maintenance";
import { NewsletterBand } from "@/components/site/newsletter";
import { CookieConsent } from "@/components/site/cookie-consent";
import { ConsentGatedAnalytics } from "@/components/site/analytics";
import { BackToTop } from "@/components/site/back-to-top";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { AiChat } from "@/components/site/ai-chat";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, nav, footerMenus, chrome] = await Promise.all([
    getPublicSettings(),
    getHeaderNav(),
    getFooterMenus(),
    getChrome(),
  ]);
  const maintenance = settings.maintenance_mode === "true";
  const user = await getCurrentUser();

  /**
   * Maintenance mode is enforced here rather than in middleware: the flag lives
   * in SQLite, which the edge runtime cannot reach. Returning the screen
   * instead of `children` means no page component (and none of its queries)
   * runs for a visitor.
   *
   * A signed-in operator still gets the real site, with a warning bar — that is
   * the only way to preview content before taking the site live again.
   */
  if (maintenance && !user) {
    return (
      <MaintenanceScreen
        siteName={settings.site_name}
        message={settings.maintenance_message}
        logoPath={settings.logo_path}
        logoLightPath={settings.logo_light_path}
        phone={settings.phone}
        email={settings.email}
        isAdmin={false}
      />
    );
  }

  const gaId = settings.ga_id || process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <div className="site-copy flex min-h-screen flex-col">
      {maintenance && user ? (
        <div className="bg-brand-700 px-4 py-2 text-center text-[13px] font-medium text-white">
          <Wrench className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
          حالت تعمیر فعال است؛ بازدیدکنندگان صفحه‌ی «در حال به‌روزرسانی» را می‌بینند.{" "}
          <Link href="/admin/settings" className="underline underline-offset-4">
            غیرفعال کردن
          </Link>
        </div>
      ) : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {chrome.labels.skipToContent}
      </a>
      <ScrollProgress />
      <Header
        nav={nav}
        labels={chrome.labels}
        locale={chrome.locale}
        settings={{
          site_name: settings.site_name,
          logo_path: settings.logo_path,
          logo_light_path: settings.logo_light_path,
          logo_height: settings.logo_height,
          hours: settings.hours,
          phone: settings.phone,
          email: settings.email,
        }}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <NewsletterBand />
      <Footer settings={settings} menus={footerMenus} />
      <BackToTop />
      <AiChat
        enabled={settings.chat_enabled !== "false"}
        title={settings.chat_title}
        welcome={settings.chat_welcome}
        labels={chrome.labels}
      />
      <CookieConsent labels={chrome.labels} />
      <ConsentGatedAnalytics gaId={gaId} />
    </div>
  );
}
