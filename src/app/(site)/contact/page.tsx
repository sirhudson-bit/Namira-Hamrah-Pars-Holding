import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/server/settings";
import { PageHero } from "@/components/site/ui";
import { ContactForm } from "@/components/site/forms";
import { MapEmbed } from "@/components/site/map-embed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "اطلاعات تماس، نقشه و فرم ارتباط با هلدینگ نامیرا همراه پارس.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  const rows = [
    { Icon: MapPin, label: "نشانی", value: settings.address },
    { Icon: Phone, label: "تلفن", value: settings.phone, ltr: true, href: `tel:${settings.phone}` },
    { Icon: Mail, label: "ایمیل", value: settings.email, ltr: true, href: `mailto:${settings.email}` },
    { Icon: Clock, label: "ساعات کاری", value: settings.hours },
  ];

  return (
    <>
      <PageHero
        slug="contact"
        eyebrow="تماس"
        title="با ما در تماس باشید"
        description="پرسش، پیشنهاد همکاری یا درخواست پشتیبانی خود را از این صفحه ارسال کنید."
        breadcrumb={[{ label: "تماس با ما" }]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="card p-7 sm:p-9">
            <h2 className="heading-3 mb-6">فرم تماس</h2>
            <ContactForm />
          </div>

          <aside className="space-y-6">
            <div className="card p-7">
              <h2 className="heading-3">اطلاعات تماس</h2>
              <ul className="mt-5 space-y-5">
                {rows.map((row) => (
                  <li key={row.label} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                      <row.Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs text-ink-500">{row.label}</p>
                      {row.href ? (
                        <a
                          href={row.href}
                          dir={row.ltr ? "ltr" : undefined}
                          className="text-sm font-medium text-ink-900 hover:text-accent"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-ink-900">{row.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <MapEmbed src={settings.map_embed} label={settings.address} />
          </aside>
        </div>
      </section>
    </>
  );
}
