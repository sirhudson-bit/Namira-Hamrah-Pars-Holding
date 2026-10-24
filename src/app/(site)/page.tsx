import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Network,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import {
  getBusinessGroups,
  getStores,
  getNews,
  getInnovationProjects,
  getOrgUnits,
} from "@/server/content";
import { getSettings } from "@/server/settings";
import { formatJalaliLong } from "@/lib/format";
import { SectionHeading } from "@/components/site/ui";
import { IconByName } from "@/components/site/icon";
import { HeroOrb } from "@/components/motion/hero-orb";
import { Labs3D } from "@/components/three/labs-3d";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { Tilt } from "@/components/motion/tilt";
import { Marquee } from "@/components/motion/marquee";
import { VideoModalTrigger } from "@/components/site/video-modal";
import KineticGrid from "@/components/ui/kinetic-grid";

export const dynamic = "force-dynamic";

const PILLARS = [
  { title: "پنج گروه تخصصی", description: "تمرکز صنفی در هر گروه، با پشتیبانی یک هلدینگ.", Icon: Building2 },
  { title: "زنجیره یکپارچه", description: "از تأمین تا خدمات پس از فروش، در یک ساختار واحد.", Icon: Network },
  { title: "زیرساخت داده‌محور", description: "تصمیم بر پایه داده‌های فروش و رفتار مشتری.", Icon: BadgeCheck },
  { title: "نوآوری فناورانه", description: "واحد هوش مصنوعی برای بهینه‌سازی تجربه مشتری.", Icon: Sparkles },
];

const VALUE_CHAIN = [
  { title: "تأمین و بازرگانی", description: "تأمین مستقیم از برندها و تولیدکنندگان معتبر", Icon: Truck },
  { title: "انبارش و کنترل کیفیت", description: "انبار مرکزی و آزمون کیفیت پیش از عرضه", Icon: PackageCheck },
  { title: "فروش آنلاین و حضوری", description: "کانال‌های B2C، B2B و فروشگاه فیزیکی", Icon: Store },
  { title: "خدمات پس از فروش", description: "گارانتی، پشتیبانی و پیگیری سفارش", Icon: ShieldCheck },
  { title: "بازخورد و نوآوری", description: "تحلیل داده و توسعه محصول در نامیرا لبز", Icon: Sparkles },
];

const fa = (n: number, min = 2) =>
  new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: min }).format(n);

export default async function HomePage() {
  const [settings, groups, stores, news, projects, units] = await Promise.all([
    getSettings(),
    getBusinessGroups(),
    getStores(),
    getNews(3),
    getInnovationProjects(),
    getOrgUnits(),
  ]);

  // Hero copy and stats are editable from /admin/home.
  const heroStats = settings.hero_stats
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value = "", label = ""] = line.split("|").map((part) => part.trim());
      const numeric = /^(\d+)(.*)$/.exec(value);
      return {
        value: numeric ? Number(numeric[1]) : 0,
        suffix: numeric ? numeric[2] : "",
        raw: value,
        label,
      };
    });
  const showSphere = settings.hero_enabled !== "false";

  return (
    <KineticGrid globalColor="brand" className="overflow-visible">
      {/* ---------------------------------------------------------------- Hero */}
      {/*
        Transparent, so the ambient grid shows through. The AI sphere opens
        filling this section and — as the visitor scrolls — shrinks and docks
        into the `data-sphere-slot` placeholder on the left of the grid (see
        components/motion/hero-orb.tsx).
      */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        {showSphere ? <HeroOrb /> : null}

        <div className="container relative z-10 flex flex-1 items-center py-16 sm:py-20">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <span className="kicker inline-flex items-center gap-3">
                <span className="h-px w-8 bg-brand-500/60" aria-hidden />
                {settings.hero_eyebrow}
              </span>
              <h1 className="display-1 mt-5">{settings.hero_title}</h1>
              {/* ink-700 rather than ink-500: this copy sits over the orb, where
                  the muted tone drops below 4.5:1 in both themes. */}
              <p className="mt-5 max-w-xl text-base leading-8 text-ink-700">
                {settings.hero_lead}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={settings.hero_cta_href || "/business-groups"} className="btn-primary">
                  {settings.hero_cta_label || "گروه‌های کسب‌وکار"}
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
                <VideoModalTrigger
                  embedUrl={settings.video_embed}
                  label={settings.hero_video_label || "ویدئوی معرفی"}
                />
              </div>
            </div>

            {/* The orb is pinned to the left of the viewport, so this column
                only reserves the space it occupies over the hero copy. */}
            <div aria-hidden className="relative mx-auto h-[220px] w-full max-w-[420px] sm:h-[280px] lg:h-[340px]" />
          </div>
        </div>

        {/* Stats — its own centred band so it reads as a distinct section. */}
        <div className="container relative z-10 pb-12">
          <dl className="grid grid-cols-2 gap-6 rounded-card border border-line-200 bg-surface-100/70 px-6 py-8 sm:grid-cols-4">
            {heroStats.map((s, i) => (
              <Reveal key={`${s.label}-${i}`} delay={i * 0.06} className="flex flex-col-reverse text-center">
                <dt className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {s.label}
                </dt>
                <dd className="text-3xl font-extrabold sm:text-4xl">
                  {s.suffix || s.value ? (
                    <>
                      <Counter value={s.value} />
                      {s.suffix}
                    </>
                  ) : (
                    s.raw
                  )}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ Marquee */}
      <div className="panel overflow-hidden py-5">
        <Marquee
          items={groups.map((g) => (
            <span key={g.id} className="flex items-center gap-4 text-sm font-medium text-ink-500">
              {g.name}
              <span className="h-1 w-1 rounded-full bg-brand-500" aria-hidden />
            </span>
          ))}
        />
      </div>

      {/* -------------------------------------------------------------- Intro */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="درباره نامیرا"
              title="یک هلدینگ، چند بازار، یک استاندارد"
              description="تأمین مطمئن، انبارش دقیق، فروش چند‌کاناله و خدماتی که اعتماد مشتری را نگه می‌دارد — همه زیر یک ساختار واحد."
            />
            <Reveal>
              <Link href="/about" className="btn-secondary">
                بیشتر درباره نامیرا
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <StaggerItem key={p.title} className="h-full">
                <div className="card h-full p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-200 bg-surface-100 text-accent">
                    <p.Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-7 text-ink-500">{p.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------- Groups */}
      <section className="panel section">
        <div className="container">
          <SectionHeading
            eyebrow="گروه‌های کسب‌وکار"
            title="پنج گروه تخصصی زیر یک هلدینگ"
            description="هر گروه با تیم، زنجیره تأمین و کانال فروش مستقل خود اداره می‌شود. نشانگر را روی هر کارت نگه دارید تا جزئیات را ببینید."
          />

          {/*
            Flex-wrap with centred rows rather than a grid: five cards in three
            columns would otherwise leave an empty cell in the last row.
          */}
          <div className="flex flex-wrap justify-center gap-6">
            {groups.map((g, i) => {
              const ctaHref = g.ctaUrl || `/business-groups/${g.slug}`;
              const ctaLabel = g.ctaLabel || "مشاهده گروه";
              const isExternal = /^https?:\/\//.test(ctaHref);
              return (
                <Reveal
                  key={g.id}
                  delay={i * 0.05}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <Tilt className="group h-full" intensity={5}>
                    <article className="card relative flex h-full flex-col overflow-hidden p-6 shadow-lift transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-500/40">
                      <div className="flex items-center justify-between">
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: g.color }}
                        >
                          <IconByName name={g.icon} className="h-6 w-6" />
                        </span>
                        <span className="text-[11px] font-bold text-ink-500">{fa(i + 1)}</span>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-ink-900">{g.name}</h3>
                      <p className="mt-1 text-[13px] font-medium text-accent">{g.tagline}</p>
                      <p className="mt-3 text-[13px] leading-7 text-ink-500">{g.description}</p>

                      {g.highlights ? (
                        <ul className="mt-4 space-y-1.5">
                          {g.highlights
                            .split("\n")
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((h) => (
                              <li key={h} className="flex items-start gap-2 text-[12px] text-ink-700">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                                {h}
                              </li>
                            ))}
                        </ul>
                      ) : null}

                      <a
                        href={ctaHref}
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="mt-5 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-accent-strong"
                      >
                        {ctaLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </article>
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Channels */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="کانال‌های فروش"
            title="همان کالا، در مسیری که شما انتخاب می‌کنید"
            description="از خرید تک‌عددی آنلاین تا تأمین عمده سازمانی و تجربه حضوری؛ هر کانال خدمات اختصاصی خود را دارد."
          />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((s) => (
              <StaggerItem key={s.id} className="h-full">
                <Link
                  href={`/stores/${s.slug}`}
                  className="card group flex h-full flex-col p-6 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-500/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-200 bg-surface-100 text-accent">
                    <Store className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink-900">{s.name}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-7 text-ink-500">{s.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
                    جزئیات کانال
                    <ArrowLeft
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ Metrics */}
      <section className="band border-y border-line-200 py-14 sm:py-16">
        <div className="container">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 14, suffix: "", label: "سال فعالیت مستمر" },
              { value: 12, suffix: "", label: "دسته‌بندی کالا" },
              { value: 31, suffix: "", label: "استان تحت پوشش" },
              { value: 98, suffix: "٪", label: "رضایت مشتریان" },
            ].map((m, i) => (
              <Reveal
                key={m.label}
                delay={i * 0.06}
                className="flex flex-col-reverse items-center text-center"
              >
                <dt className="mt-2 text-[13px] text-ink-500">{m.label}</dt>
                <dd className="text-4xl font-extrabold text-white sm:text-5xl">
                  <Counter value={m.value} suffix={m.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- Value chain */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="زنجیره ارزش"
            title="از تأمین‌کننده تا مشتری، همه در یک مسیر"
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {VALUE_CHAIN.map((step, i) => (
              <StaggerItem key={step.title} className="h-full">
                <div className="card h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-200 bg-surface-100 text-accent">
                      <step.Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold text-ink-500">{fa(i + 1)}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-ink-500">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------- Labs */}
      <section className="band border-y border-line-200 section">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="kicker">نامیرا لبز</p>
            <h2 className="display-2 mt-4 text-white">
              نوآوری و هوش مصنوعی، موتور رشد بعدی نامیرا
            </h2>
            <p className="mt-5 leading-8 text-ink-500">
              نامیرا لبز بازوی فناورانه هلدینگ است؛ جایی که داده‌های فروش به تصمیم، و ایده‌های
              محصول به سرویس تبدیل می‌شوند.
            </p>
            <Reveal className="mt-8">
              <Link href="/innovation" className="btn-primary">
                ورود به بخش نوآوری
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          {/* Contained visual — a panel beside the copy, not a full-bleed backdrop. */}
          <div className="relative h-[260px] overflow-hidden rounded-card border border-line-200 bg-dark-800 sm:h-[320px]">
            <Labs3D className="h-full w-full" />
          </div>
        </div>

        <div className="container mt-14">
          <Stagger className="grid gap-3">
            {projects.map((p) => (
              <StaggerItem
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-200 bg-surface-100 px-5 py-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-ink-900">{p.title}</h3>
                  <p className="mt-1 text-[12px] text-ink-500">{p.description}</p>
                </div>
                <span className="badge">{p.status}</span>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 border-t border-line-200 pt-8">
            <p className="kicker">واحدهای سازمانی</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {units.map((u) => (
                <span
                  key={u.id}
                  className="rounded-full border border-line-200 px-3.5 py-1.5 text-[12px] text-ink-700"
                >
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- News */}
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="رسانه"
              title="آخرین اخبار نامیرا"
              description="رویدادها، همکاری‌ها و دستاوردهای هلدینگ."
            />
            <Reveal className="mb-12">
              <Link href="/media/news" className="btn-ghost px-0">
                همه اخبار
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          {news.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              خبری برای نمایش منتشر نشده است.
            </div>
          ) : (
            <Stagger className="grid gap-6 md:grid-cols-3">
              {news.map((n) => (
                <StaggerItem key={n.id} className="h-full">
                  <Link
                    href={`/media/news/${n.slug}`}
                    className="card group flex h-full flex-col overflow-hidden transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-500/40"
                  >
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-700 to-dark-900">
                      <Image
                        src="/images/news-placeholder.svg"
                        alt=""
                        fill
                        className="object-cover opacity-60"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="badge w-fit">{n.category}</span>
                      <h3 className="mt-3 text-base font-bold leading-7 text-ink-900 transition-colors group-hover:text-accent">
                        {n.title}
                      </h3>
                      <p className="mt-2 flex-1 text-[13px] leading-7 text-ink-500">{n.excerpt}</p>
                      <time
                        dateTime={n.publishedAt.toISOString()}
                        className="mt-4 border-t border-line-200 pt-3 text-[11px] text-ink-500"
                      >
                        {formatJalaliLong(n.publishedAt)}
                      </time>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="band border-y border-line-200 section">
        <div className="container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="display-2 text-white">همکاری با نامیرا همراه پارس</h2>
            <p className="mt-4 leading-8 text-ink-500">
              برای همکاری تجاری، تأمین کالا، فروش سازمانی یا پیوستن به تیم، با ما در تماس باشید.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              تماس با ما
            </Link>
            <Link href="/careers" className="btn-secondary">
              فرصت‌های شغلی
            </Link>
          </div>
        </div>
      </section>
    </KineticGrid>
  );
}
