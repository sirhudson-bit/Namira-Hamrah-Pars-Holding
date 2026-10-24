import type { Metadata } from "next";
import { Building2, Users } from "lucide-react";
import { getOrgUnits } from "@/server/content";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "واحدهای سازمانی",
  description:
    "ساختار سازمانی هلدینگ نامیرا همراه پارس: واحدهای فروش آفلاین و آنلاین، بازرگانی، مالی، منابع انسانی، بازاریابی و پشتیبانی.",
};

const KIND_LABELS: Record<string, string> = {
  offline: "فروش و عملیات",
  online: "فروش و عملیات",
  commercial: "بازرگانی و تأمین",
  finance: "مالی و پشتیبان",
  hr: "سرمایه انسانی",
  marketing: "رشد و بازار",
  support: "خدمات مشتری",
};

export default async function UnitsPage() {
  const units = await getOrgUnits();

  return (
    <>
      <PageHero
        slug="units"
        eyebrow="واحدهای سازمانی"
        title="ساختاری که پشت هر سفارش کار می‌کند"
        description="واحدهای عملیاتی، بازرگانی و پشتیبان هلدینگ به‌صورت یکپارچه با گروه‌های کسب‌وکار همکاری می‌کنند."
        breadcrumb={[{ label: "واحدهای سازمانی" }]}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="ساختار"
            title="واحدهای تخصصی هلدینگ"
            description="هر واحد مسئول زنجیره‌ای مشخص است و خروجی کارش به‌صورت مستقیم به تجربه مشتری می‌رسد."
          />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((u) => (
              <StaggerItem key={u.id} className="h-full">
                <div className="card h-full p-6 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                      <Users className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="badge">{KIND_LABELS[u.kind] ?? "واحد سازمانی"}</span>
                  </div>
                  <h3 className="mt-4 heading-3">{u.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-500">{u.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8">
            <div className="card flex flex-col items-start gap-6 bg-brand-700/20 p-8 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-btn bg-surface text-accent">
                <Building2 className="h-6 w-6" aria-hidden />
              </span>
              <div className="flex-1">
                <h3 className="heading-3">همکاری میان واحدها</h3>
                <p className="mt-1 text-sm leading-7 text-ink-500">
                  واحدهای سازمانی با گروه‌های کسب‌وکار در قالب فرآیندهای مشترک همکاری می‌کنند تا از
                  تأمین تا تحویل، یک استاندارد واحد رعایت شود.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
