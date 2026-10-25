import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, BadgeCheck, Eye, Heart, Target } from "lucide-react";
import { getMilestones, getTeam } from "@/server/content";
import { renderMarkdown } from "@/lib/markdown";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { Logo } from "@/components/site/logo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { TimelineItem, TimelineProgress } from "@/components/motion/timeline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "درباره نامیرا",
  description:
    "هویت، تاریخچه، مأموریت، چشم‌انداز، ارزش‌ها و ساختار سازمانی هلدینگ نامیرا همراه پارس.",
};

const STATS = [
  { value: 14, suffix: "", label: "سال تجربه" },
  { value: 5, suffix: "", label: "گروه کسب‌وکار" },
  { value: 31, suffix: "", label: "استان تحت پوشش" },
  { value: 300, suffix: "+", label: "همکار سازمانی" },
];

const PILLARS = [
  {
    title: "مأموریت",
    body: "ارائه کالا و خدمات باکیفیت با تأمین مطمئن، قیمت منصفانه و پشتیبانی مؤثر.",
    Icon: Target,
  },
  {
    title: "چشم‌انداز",
    body: "پیشرو بودن در خرده‌فروشی و توزیع چند‌گروهی، با تکیه بر داده و فناوری.",
    Icon: Eye,
  },
  {
    title: "ارزش‌ها",
    body: "اصالت، شفافیت، پاسخ‌گویی، یادگیری و مسئولیت‌پذیری تیمی.",
    Icon: Heart,
  },
];

const VALUES = [
  {
    title: "اصالت و شفافیت",
    description: "عرضه کالای اصل با اطلاعات روشن و قیمت شفاف.",
    Icon: BadgeCheck,
  },
  { title: "پاسخ‌گویی", description: "پشتیبانی سریع و مسئولانه در تمام کانال‌ها.", Icon: Heart },
  { title: "نوآوری", description: "بهبود مستمر فرآیندها با تکیه بر داده.", Icon: Target },
  {
    title: "چشم‌انداز بلندمدت",
    description: "سرمایه‌گذاری برای رشد پایدار، نه سود کوتاه‌مدت.",
    Icon: Eye,
  },
];

const FACTS = [
  { k: "نام قانونی", v: "گروه بازرگانی نامیرا همراه پارس" },
  { k: "حوزه فعالیت", v: "بازرگانی، خرده‌فروشی و توزیع" },
  { k: "گروه‌های کسب‌وکار", v: "۵ گروه تخصصی" },
  { k: "کانال‌های فروش", v: "آنلاین، حضوری، سازمانی" },
];

export default async function AboutPage() {
  const [milestones, team] = await Promise.all([getMilestones(), getTeam()]);

  return (
    <>
      <PageHero
        slug="about"
        eyebrow="درباره نامیرا"
        title="درباره نامیرا همراه پارس"
        description="هویت، تاریخچه و مسیر رشد هلدینگ."
        breadcrumb={[{ label: "درباره نامیرا" }]}
      />

      {/* Animated number rail */}
      <section className="panel py-12">
        <div className="container">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07}>
                {/* ink-900 keeps the number readable on the themed `panel`
                    surface, which is white in light mode. */}
                <dd className="text-4xl font-extrabold text-ink-900 sm:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-2 text-[13px] text-ink-500">{s.label}</dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="داستان ما" title="از یک فروشگاه تا یک هلدینگ" />
            <div
              className="prose-page max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(
                  "نامیرا همراه پارس کار خود را با تمرکز بر عرضه کالای اصل و خدمات پس از فروش شفاف آغاز کرد. امروز این مجموعه با پنج گروه تخصصی، زنجیره‌ای کامل از **تأمین، انبارش، فروش و پشتیبانی** را در اختیار مشتریان حقیقی و حقوقی قرار می‌دهد.\n\nهر گروه با تیم و کانال فروش مستقل خود اداره می‌شود، اما همه از یک زیرساخت مشترک استفاده می‌کنند: انبار مرکزی، سامانه داده و استاندارد خدمات یکسان.",
                ),
              }}
            />
          </Reveal>

          <aside className="space-y-4">
            <Reveal delay={0.08}>
              <div className="card p-6">
                <Logo />
                <dl className="mt-5 space-y-3 text-sm">
                  {FACTS.map((row) => (
                    <div
                      key={row.k}
                      className="flex items-start justify-between gap-4 border-b border-line-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <dt className="text-ink-500">{row.k}</dt>
                      <dd className="text-left font-medium text-ink-900">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="card bg-brand-700/20 p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-accent-strong">
                  <Award className="h-4 w-4" aria-hidden />
                  مجوزها و اعتبار
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-accent-strong/90">
                  <li>دارای پروانه کسب معتبر</li>
                  <li>عضو اتحادیه مربوطه</li>
                  <li>ضمانت اصالت کالا</li>
                  <li>فاکتور رسمی برای خرید سازمانی</li>
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Mission / vision / values */}
      <section className="panel section">
        <div className="container">
          <SectionHeading
            eyebrow="جهت‌گیری"
            title="چرا نامیرا"
            description="سه اصلی که تصمیم‌های ما را جهت می‌دهد."
          />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((c) => (
              <StaggerItem key={c.title} className="h-full">
                <div className="card h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700/20 text-accent">
                    <c.Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 heading-3">{c.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-500">{c.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Timeline with scroll-linked progress */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="تاریخچه"
              title="مسیر رشد نامیرا"
              description="هر گام، یک بازار تازه و یک خط تازه از خدمات."
            />
          </div>
          <TimelineProgress>
            {milestones.map((m) => (
              <TimelineItem
                key={m.id}
                year={m.year}
                title={m.title}
                description={m.description}
              />
            ))}
          </TimelineProgress>
        </div>
      </section>

      {/* Values */}
      <section className="panel section">
        <div className="container">
          <SectionHeading eyebrow="ارزش‌ها" title="آنچه به آن پایبندیم" align="center" />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <StaggerItem key={v.title} className="h-full">
                <div className="card h-full p-6 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700/20 text-accent">
                    <v.Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 heading-3">{v.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-500">{v.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="ساختار سازمانی"
            title="مدیران و تیم راهبری"
            description="تیم راهبری هلدینگ با تجربه در بازرگانی، عملیات و فناوری."
          />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <StaggerItem key={m.id} className="h-full">
                <div className="card h-full p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">
                    {m.role.charAt(0)}
                  </span>
                  <h3 className="mt-4 heading-3">{m.role}</h3>
                  <p className="mt-1 text-xs font-medium text-accent">{m.name}</p>
                  <p className="mt-2 text-sm leading-7 text-ink-500">{m.bio}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="panel section">
        <div className="container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="display-2 text-ink-900">با نامیرا همراه شوید</h2>
            <p className="mt-4 leading-8 text-ink-500">
              برای همکاری تجاری، تأمین کالا یا پیوستن به تیم راهبری، با ما در تماس باشید.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              تماس با ما
            </Link>
            <Link href="/careers" className="btn-secondary">
              فرصت‌های شغلی
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
