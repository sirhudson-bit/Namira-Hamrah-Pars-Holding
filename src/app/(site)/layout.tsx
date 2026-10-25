import Link from "next/link";
import { Wrench } from "lucide-react";
import { getSettings } from "@/server/settings";
import { getCurrentUser } from "@/server/auth";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MaintenanceScreen } from "@/components/site/maintenance";
import { NewsletterBand } from "@/components/site/newsletter";
import { CookieConsent } from "@/components/site/cookie-consent";
import { ConsentGatedAnalytics } from "@/components/site/analytics";
import { BackToTop } from "@/components/site/back-to-top";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const maintenance = settings.maintenance_mode === "true";
  const user = maintenance ? await getCurrentUser() : null;

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
        پرش به محتوای اصلی
      </a>
      <ScrollProgress />
      <Header
        settings={{
          site_name: settings.site_name,
          logo_path: settings.logo_path,
          logo_height: settings.logo_height,
          hours: settings.hours,
          phone: settings.phone,
        }}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <NewsletterBand />
      <Footer settings={settings} />
      <BackToTop />
      <CookieConsent />
      <ConsentGatedAnalytics gaId={gaId} />
    </div>
  );
}
