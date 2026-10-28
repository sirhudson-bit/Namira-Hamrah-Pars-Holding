import type { Metadata } from "next";
import { Briefcase, MapPin } from "lucide-react";
import { getJobOpenings } from "@/server/content";
import { PageBuilder } from "@/components/site/page-builder";
import { PageHero, SectionHeading, EmptyState } from "@/components/site/ui";
import { ApplicationForm } from "@/components/site/forms";
import { SiteImage } from "@/components/site/site-image";
import { imagePositionCss } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فرصت‌های شغلی",
  description:
    "موقعیت‌های شغلی باز در هلدینگ نامیرا همراه پارس و فرم ارسال رزومه.",
};

const CULTURE = [
  { title: "یادگیری مستمر", body: "آموزش و رشد مهارت به‌عنوان بخشی از کار روزمره." },
  { title: "مسئولیت‌پذیری", body: "اختیار و پاسخ‌گویی همزمان، در سطح هر نقش." },
  { title: "کار تیمی", body: "همکاری نزدیک میان واحدها و گروه‌های کسب‌وکار." },
  { title: "شفافیت", body: "اطلاعات روشن و بازخورد مستقیم." },
];

export default async function CareersPage() {
  const jobs = await getJobOpenings();
  const positions = jobs.map((j) => j.title);

  return (
    <>
      <PageHero
        slug="careers"
        eyebrow="فرصت‌های شغلی"
        title="به تیم نامیرا بپیوندید"
        description="ما به دنبال افرادی هستیم که به کیفیت، یادگیری و کار تیمی اهمیت می‌دهند."
        breadcrumb={[{ label: "فرصت‌های شغلی" }]}
      />
      <PageBuilder slug="careers" />


      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="heading-3 mb-6">موقعیت‌های باز</h2>
            {jobs.length === 0 ? (
              <EmptyState message="در حال حاضر موقعیت شغلی بازی ثبت نشده است. می‌توانید رزومه خود را ارسال کنید." />
            ) : (
              <ul className="space-y-4">
                {jobs.map((j) => (
                  <li key={j.id} className="card p-6">
                    <div className="flex flex-wrap items-start gap-5">
                      {j.image ? (
                        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-btn border border-line-200 bg-surface-50">
                          <SiteImage src={j.image} alt={j.title} style={{ objectPosition: imagePositionCss(j.imagePosition) }} className="h-full w-full object-cover" />
                        </div>
                      ) : null}
                      <div className="min-w-[12rem] flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="heading-3">{j.title}</h3>
                      <span className="badge">{j.type}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" aria-hidden />
                        {j.department}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {j.location}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-ink-500">{j.description}</p>
                    {j.requirements ? (
                      <ul className="mt-3 space-y-1.5">
                        {j.requirements
                          .split("\n")
                          .filter(Boolean)
                          .map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm text-ink-700">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                              {r}
                            </li>
                          ))}
                      </ul>
                    ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card h-fit p-7 lg:sticky lg:top-24">
            <h2 className="heading-3 mb-2">ارسال رزومه</h2>
            <p className="mb-6 text-sm leading-7 text-ink-500">
              رزومه خود را از این فرم ارسال کنید؛ در صورت تناسب با موقعیت‌های موجود با شما تماس می‌گیریم.
            </p>
            <ApplicationForm positions={positions} />
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <SectionHeading eyebrow="فرهنگ سازمانی" title="چگونه کار می‌کنیم" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CULTURE.map((c) => (
              <div key={c.title} className="card p-6">
                <h3 className="heading-3">{c.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-500">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
