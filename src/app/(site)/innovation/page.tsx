import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cpu, Lightbulb, Rocket, Users } from "lucide-react";
import { getInnovationProjects } from "@/server/content";
import { PageBuilder } from "@/components/site/page-builder";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Labs3D } from "@/components/three/labs-3d";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نوآوری و هوش مصنوعی",
  description:
    "نامیرا لبز، بازوی نوآوری و هوش مصنوعی هلدینگ نامیرا همراه پارس؛ پروژه‌ها، کاربردها و همکاری با متخصصان.",
};

const CAPABILITIES = [
  { title: "تحلیل داده فروش", description: "استخراج الگوهای خرید و تقاضا از داده‌های چند‌کاناله.", Icon: Cpu },
  { title: "پیش‌بینی تقاضا", description: "برنامه‌ریزی تأمین و موجودی بر پایه پیش‌بینی.", Icon: Lightbulb },
  { title: "بهینه‌سازی عملیات", description: "کاهش هزینه‌های انبارش و بهبود زمان تأمین.", Icon: Rocket },
  { title: "تجربه مشتری", description: "ابزارهای کمکی برای پاسخ سریع‌تر و دقیق‌تر.", Icon: Users },
];

export default async function InnovationPage() {
  const projects = await getInnovationProjects();

  return (
    <>
      <PageHero
        slug="innovation"
        eyebrow="نامیرا لبز"
        title="نوآوری و هوش مصنوعی"
        description="بازوی فناورانه هلدینگ؛ جایی که داده‌های فروش به تصمیم، و ایده‌های محصول به سرویس تبدیل می‌شوند."
        breadcrumb={[{ label: "نوآوری و هوش مصنوعی" }]}
      />
      <PageBuilder slug="innovation" />


      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="معرفی"
              title="داده، موتور تصمیم‌گیری نامیرا"
              description="نامیرا لبز با تمرکز بر تحلیل داده و هوش مصنوعی، به گروه‌های کسب‌وکار کمک می‌کند سریع‌تر و دقیق‌تر تصمیم بگیرند."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <Reveal key={c.title}>
                  <div className="card h-full p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                      <c.Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-ink-900">{c.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-ink-500">{c.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-card bg-dark-900 p-8 text-white">
            <Labs3D className="pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative">
              <h2 className="text-lg font-bold">پروژه‌های در جریان</h2>
              <Stagger className="mt-5 space-y-4" stagger={0.07}>
                {projects.map((p) => (
                  <StaggerItem
                    key={p.id}
                    className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-white">{p.title}</h3>
                      <span className="rounded-full bg-brand-700/30 px-3 py-1 text-[11px] text-brand-300">
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-brand-100/70">{p.description}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <SectionHeading
            eyebrow="کاربردها"
            title="از داده خام تا تصمیم عملیاتی"
            description="خروجی نامیرا لبز مستقیماً در زنجیره تأمین، قیمت‌گذاری و پشتیبانی به کار می‌رود."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { t: "زنجیره تأمین", d: "تعیین نقطه سفارش و کاهش مازاد موجودی با پیش‌بینی تقاضا." },
              { t: "قیمت‌گذاری", d: "پایش قیمت بازار و پیشنهاد قیمت رقابتی بر پایه داده." },
              { t: "پشتیبانی", d: "پاسخ سریع‌تر به پرسش‌های پرتکرار و افزایش رضایت مشتری." },
            ].map((c) => (
              <div key={c.t} className="card p-6">
                <h3 className="heading-3">{c.t}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-500">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card flex flex-col items-start justify-between gap-6 bg-brand-800 p-8 text-white lg:flex-row lg:items-center lg:p-12">
            <div className="max-w-2xl">
              <h2 className="text-xl font-extrabold sm:text-2xl">همکاری با متخصصان</h2>
              <p className="mt-2 leading-8 text-brand-100/80">
                اگر در حوزه داده، یادگیری ماشین یا مهندسی نرم‌افزار تخصص دارید، نامیرا لبز از همکاری
                با شما استقبال می‌کند.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/careers" className="btn bg-white text-dark-900 hover:bg-brand-100">
                فرصت‌های شغلی
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
