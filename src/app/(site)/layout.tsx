import { getSettings } from "@/server/settings";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
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
  const gaId = settings.ga_id || process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <div className="flex min-h-screen flex-col">
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
