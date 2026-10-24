import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { getServices, getStores } from "@/server/content";
import { getSettings } from "@/server/settings";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { IconByName } from "@/components/site/icon";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خدمات",
  description:
    "خدمات پس از فروش، گارانتی، پیگیری سفارش و پشتیبانی مشتریان هلدینگ نامیرا همراه پارس.",
};

export default async function ServicesPage() {
  const [services, settings, stores] = await Promise.all([
    getServices(),
    getSettings(),
    getStores(),
  ]);

  return (
    <>
      <PageHero
        slug="services"
        eyebrow="خدمات"
        title="پشتیبانی در تمام مسیر خرید"
        description="از ضمانت اصالت کالا تا پیگیری سفارش و پاسخ‌گویی پس از فروش؛ خدمات نامیرا پس از پرداخت تمام نمی‌شود."
        breadcrumb={[{ label: "خدمات" }]}
      />

      <section className="section">
        <Stagger className="container grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <StaggerItem key={s.id} className="h-full">
              <article id={s.slug} className="card scroll-mt-24 p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                  <IconByName name={s.icon} className="h-6 w-6" />
                </span>
                <h2 className="mt-5 heading-3">{s.title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink-500">{s.description}</p>
                {s.slug === "order-tracking" ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {stores
                      .filter((st) => st.url)
                      .map((st) => (
                        <a
                          key={st.id}
                          href={st.url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          پیگیری در {st.name}
                        </a>
                      ))}
                  </div>
                ) : null}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <SectionHeading
            eyebrow="پشتیبانی"
            title="راه‌های ارتباط با پشتیبانی"
            description="کارشناسان ما در ساعات کاری پاسخگوی شما هستند."
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="card p-6">
              <h3 className="heading-3">تلفن</h3>
              <a href={`tel:${settings.phone}`} dir="ltr" className="mt-2 block text-accent">
                {settings.phone}
              </a>
              <p className="mt-2 text-xs text-ink-500">{settings.hours}</p>
            </div>
            <div className="card p-6">
              <h3 className="heading-3">ایمیل</h3>
              <a href={`mailto:${settings.email}`} dir="ltr" className="mt-2 block text-accent">
                {settings.email}
              </a>
              <p className="mt-2 text-xs text-ink-500">پاسخ حداکثر تا یک روز کاری</p>
            </div>
            <div className="card p-6">
              <h3 className="heading-3">فرم تماس</h3>
              <p className="mt-2 text-xs text-ink-500">پیام خود را ثبت کنید؛ با شما تماس می‌گیریم.</p>
              <Link href="/contact" className="btn-secondary mt-4">
                <Phone className="h-4 w-4" aria-hidden />
                ارسال پیام
              </Link>
            </div>
          </div>
          <Link href="/contact" className="btn-ghost mt-8 px-0">
            صفحه تماس با ما
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
