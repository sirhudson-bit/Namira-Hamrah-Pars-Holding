import Image from "next/image";
import Link from "next/link";
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
import { imagePositionCss } from "@/lib/media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { Marquee } from "@/components/motion/marquee";
import { SplitHeading } from "@/components/motion/split-heading";
import { ChapterRail } from "@/components/site/chapter-rail";
import { CoverGate } from "@/components/site/cover-gate";
import { GroupScroller } from "@/components/site/group-scroller";
import { VideoModalTrigger } from "@/components/site/video-modal";
import { HomeBanners } from "@/components/site/home-banners";
import { PageBuilder } from "@/components/site/page-builder";
import { SiteImage } from "@/components/site/site-image";
import KineticGrid from "@/components/ui/kinetic-grid";

export const dynamic = "force-dynamic";

const CHAPTERS = [
  { id: "groups", label: "گروه‌ها" },
  { id: "about", label: "درباره" },
  { id: "chain", label: "زنجیره ارزش" },
  { id: "labs", label: "نوآوری" },
  { id: "channels", label: "کانال‌ها" },
  { id: "news", label: "رسانه" },
];

const PILLARS = [
  { title: "پنج گروه تخصصی", description: "تمرکز صنفی در هر گروه، با پشتیبانی یک هلدینگ.", Icon: Building2 },
  { title: "زنجیره یکپارچه", description: "از تأمین تا خدمات پس از فروش، در یک ساختار واحد.", Icon: Network },
  { title: "زیرساخت داده‌محور", description: "تصمیم بر پایه داده‌های فروش و رفتار مشتری.", Icon: BadgeCheck },
  { title: "نوآوری فناورانه", description: "واحد هوش مصنوعی برای بهینه‌سازی تجربه مشتری.", Icon: Sparkles },
];

const VALUE_CHAIN = [
  {
    title: "تأمین و بازرگانی",
    description: "تأمین مستقیم از برندها و تولیدکنندگان معتبر، با اعتبارسنجی تأمین‌کننده.",
    Icon: Truck,
    image: "/images/topics/logistics.webp",
  },
  {
    title: "انبارش و کنترل کیفیت",
    description: "انبار مرکزی، کنترل موجودی و آزمون کیفیت پیش از عرضه.",
    Icon: PackageCheck,
    image: "/images/topics/warehouse.webp",
  },
  {
    title: "فروش آنلاین و حضوری",
    description: "کانال‌های B2C، B2B، فروشگاه فیزیکی و فروش سازمانی.",
    Icon: Store,
    image: "/images/topics/retail.webp",
  },
  {
    title: "خدمات پس از فروش",
    description: "گارانتی، پشتیبانی، پیگیری سفارش و پاسخ‌گویی در همه کانال‌ها.",
    Icon: ShieldCheck,
    image: "/images/topics/support.webp",
  },
  {
    title: "بازخورد و نوآوری",
    description: "تحلیل داده و توسعه محصول در نامیرا لبز؛ حلقه بسته رشد.",
    Icon: Sparkles,
    image: "/images/topics/ai.webp",
  },
];

const fa = (n: number, min = 2) =>
  new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: min }).format(n);

/** Section header shared by every chapter: index, rule, title, lead. */
function ChapterHead({
  index,
  kicker,
  title,
  description,
  action,
}: {
  index: number;
  kicker: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 grid gap-6 lg:mb-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
      <div>
        <p className="xp-index flex items-center gap-3">
          <span className="tabular-nums text-accent">{String(index).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-line-200" aria-hidden />
          {kicker}
        </p>
        <h2 className="mt-4 text-[clamp(1.9rem,4.2vw,3.4rem)] font-extrabold leading-[1.15] text-ink-900">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {description ? (
          <p className="max-w-xl text-[14.5px] leading-8 text-ink-500">{description}</p>
        ) : null}
        {action}
      </div>
    </div>
  );
}

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

  const coverImage = settings.hero_image || "/images/topics/hq.webp";
  const coverAlt = settings.hero_image_alt || "مقر هلدینگ نامیرا همراه پارس";
  const [featuredNews, ...restNews] = news;

  return (
    <KineticGrid globalColor="brand" className="overflow-visible">
      <ChapterRail chapters={CHAPTERS} />

      {/* ================================================================ Cover */}
      <section
        id="cover"
        className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-6"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 grid-lines opacity-[0.18]" />
          <div
            className="absolute -top-52 start-[-12%] h-[560px] w-[560px] rounded-full blur-[2px]"
            style={{ background: "radial-gradient(circle, var(--glow), transparent 68%)" }}
          />
        </div>

        <div className="container-wide relative z-10 grid flex-1 items-center gap-12 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="min-w-0">
            <Reveal y={14}>
              <p className="xp-index flex flex-wrap items-center gap-3">
                <span className="tabular-nums text-accent">01</span>
                <span className="h-px w-10 bg-line-200" aria-hidden />
                <span className="text-ink-500">{settings.hero_eyebrow}</span>
              </p>
            </Reveal>

            <h1 className="mt-6 text-[clamp(2.3rem,5.7vw,5rem)] font-black leading-[1.08] tracking-[-0.02em] text-ink-900">
              <SplitHeading text={settings.hero_title} />
            </h1>

            <Reveal delay={0.25} y={18}>
              {/* ink-700, not ink-500: this copy sits over the ambient grid. */}
              <p className="mt-6 max-w-xl text-[15px] leading-8 text-ink-700">{settings.hero_lead}</p>
            </Reveal>

            <Reveal delay={0.35} y={18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={settings.hero_cta_href || "/business-groups"} className="btn-primary">
                  {settings.hero_cta_label || "گروه‌های کسب‌وکار"}
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
                <VideoModalTrigger
                  embedUrl={settings.video_embed}
                  label={settings.hero_video_label || "ویدئوی معرفی"}
                />
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:text-accent"
                >
                  معرفی هلدینگ
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.45} y={18}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-200 pt-5 text-[11.5px] text-ink-500">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {settings.hours}
                </span>
                <span className="hidden h-3 w-px bg-line-200 sm:block" aria-hidden />
                <span>تهران · ایران</span>
                <span className="hidden h-3 w-px bg-line-200 sm:block" aria-hidden />
                <span>{groups.length.toLocaleString("fa-IR")} گروه کسب‌وکار</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={30} className="min-w-0">
            <CoverGate
              image={coverImage}
              alt={coverAlt}
              caption="هلدینگ نامیرا همراه پارس"
              href={settings.hero_cta_href || "/business-groups"}
              showOrb={settings.hero_enabled !== "false"}
              orbSize={Number(settings.hero_orb_size)}
            />
          </Reveal>
        </div>

        {heroStats.length ? (
          <div className="container-wide relative z-10">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line-200 bg-line-200 sm:grid-cols-4">
              {heroStats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="flex flex-col-reverse bg-surface px-5 py-5">
                  <dt className="mt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                    {stat.label}
                  </dt>
                  <dd className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-extrabold leading-none text-ink-900">
                    {stat.suffix || stat.value ? (
                      <>
                        <Counter value={stat.value} />
                        {stat.suffix}
                      </>
                    ) : (
                      stat.raw
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="container-wide relative z-10 flex items-center justify-between gap-4 py-5 text-[10.5px] uppercase tracking-[0.2em] text-ink-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-8 w-px animate-soft-pulse bg-accent/60" aria-hidden />
            Scroll to explore
          </span>
          <span>Namira Holding — 1404</span>
        </div>
      </section>

      {/* Group names as a running index, straight under the cover. */}
      <div className="border-y border-line-200 bg-surface/60 py-3 backdrop-blur">
        <div className="container-wide">
          <Marquee
            speed={46}
            items={groups.map((group) => (
              <span key={group.id} className="flex items-center gap-4 text-[11px] font-medium tracking-wide text-ink-500">
                {group.name}
                <span className="h-1 w-1 rounded-full bg-brand-500" aria-hidden />
              </span>
            ))}
          />
        </div>
      </div>

      {/* =============================================================== Groups */}
      <section id="groups" className="relative py-20 lg:py-28">
        <div className="container-wide">
          <ChapterHead
            index={1}
            kicker="گروه‌های کسب‌وکار"
            title="پنج بازار، یک استاندارد"
            description="هر گروه با تیم، زنجیره تأمین و کانال فروش مستقل خود اداره می‌شود. روی هر کارت توقف کنید تا جزئیات و مزیت‌های آن گروه باز شود."
            action={
              <Link href="/business-groups" className="btn-secondary shrink-0">
                نمای کامل گروه‌ها
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          <GroupScroller
            groups={groups.map((group) => {
              const href = group.ctaUrl || `/business-groups/${group.slug}`;
              return {
                id: group.id,
                name: group.name,
                tagline: group.tagline,
                description: group.description,
                image: group.image,
                imageAlt: group.imageAlt || group.name,
                href,
                ctaLabel: group.ctaLabel || "مشاهده گروه",
                external: /^https?:\/\//.test(href),
                highlights: group.highlights.split("\n").filter(Boolean),
                color: group.color,
              };
            })}
          />
        </div>

        <div className="container-wide mt-16">
          <HomeBanners />
        </div>
      </section>

      {/* ================================================================ About */}
      <section id="about" className="relative border-y border-line-200 bg-surface/50 py-20 lg:py-28">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="xp-index flex items-center gap-3">
              <span className="tabular-nums text-accent">02</span>
              <span className="h-px w-10 bg-line-200" aria-hidden />
              درباره نامیرا
            </p>
            <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold leading-[1.16] text-ink-900">
              یک هلدینگ،
              <br />
              چند بازار، یک استاندارد
            </h2>
            <p className="mt-5 max-w-md text-[14px] leading-8 text-ink-500">
              تأمین مطمئن، انبارش دقیق، فروش چندکاناله و خدماتی که اعتماد مشتری را نگه می‌دارد —
              همه زیر یک ساختار واحد و با یک استاندارد عملیاتی.
            </p>
            <Reveal className="mt-7">
              <Link href="/about" className="btn-secondary">
                بیشتر درباره نامیرا
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <div className="relative overflow-hidden rounded-[22px] border border-line-200 bg-surface-100">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/topics/team.webp"
                    alt="تیم هلدینگ نامیرا در جلسه کاری"
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6">
                  <p className="max-w-md text-[13px] leading-7 text-white/85">
                    «تصمیم درست، تصمیمی است که بر داده واقعی و تجربه انسانی استوار باشد.»
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Namira Holding</span>
                </div>
              </div>
            </Reveal>

            <Stagger className="mt-8 grid gap-px overflow-hidden rounded-[18px] border border-line-200 bg-line-200 sm:grid-cols-2">
              {PILLARS.map((pillar) => (
                <StaggerItem key={pillar.title} className="bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-200 bg-surface-100 text-accent">
                    <pillar.Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold text-ink-900">{pillar.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-7 text-ink-500">{pillar.description}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ================================================================= Chain */}
      <section id="chain" className="relative py-20 lg:py-28">
        <div className="container-wide">
          <ChapterHead
            index={3}
            kicker="زنجیره ارزش"
            title="از تأمین‌کننده تا مشتری"
            description="پنج حلقه‌ای که هر سفارش را از مبدأ تا پشتیبانی پس از فروش همراهی می‌کند."
          />

          <ol className="border-t border-line-200">
            {VALUE_CHAIN.map((step, index) => (
              <li key={step.title}>
                <div className="group grid grid-cols-[2rem_1fr] items-center gap-4 border-b border-line-200 py-6 transition-colors duration-300 hover:bg-surface-100/60 sm:grid-cols-[3rem_1fr_7rem] sm:gap-6 sm:px-2 lg:grid-cols-[4rem_1fr_10rem]">
                  <span className="text-[11px] font-bold tabular-nums text-ink-400 transition-colors group-hover:text-accent">
                    {fa(index + 1)}
                  </span>
                  <div className="flex items-start gap-4">
                    <step.Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <h3 className="text-[15px] font-bold text-ink-900 sm:text-base">{step.title}</h3>
                      <p className="mt-1 max-w-xl text-[12.5px] leading-7 text-ink-500">{step.description}</p>
                    </div>
                  </div>
                  <div className="relative hidden h-16 overflow-hidden rounded-lg border border-line-200 sm:block">
                    <Image
                      src={step.image}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover opacity-60 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================== Labs */}
      <section id="labs" className="relative overflow-hidden border-y border-line-200">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/images/topics/ai.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-dark-900 via-dark-900/92 to-dark-900/70" />
        </div>

        <div className="on-dark relative py-20 lg:py-28">
          <div className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <div>
              <p className="xp-index flex items-center gap-3">
                <span className="tabular-nums text-brand-300">04</span>
                <span className="h-px w-10 bg-white/20" aria-hidden />
                نامیرا لبز
              </p>
              <h2 className="mt-4 text-[clamp(1.9rem,4.2vw,3.3rem)] font-extrabold leading-[1.16] text-white">
                نوآوری و هوش مصنوعی،
                <br />
                موتور رشد بعدی نامیرا
              </h2>
              <p className="mt-5 max-w-lg text-[14px] leading-8 text-white/70">
                نامیرا لبز بازوی فناورانه هلدینگ است؛ جایی که داده‌های فروش به تصمیم، و ایده‌های
                محصول به سرویس تبدیل می‌شوند.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {units.map((unit) => (
                  <span
                    key={unit.id}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/75"
                  >
                    {unit.name}
                  </span>
                ))}
              </div>

              <Reveal className="mt-8">
                <Link href="/innovation" className="btn-primary">
                  ورود به بخش نوآوری
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              </Reveal>
            </div>

            <Stagger className="space-y-2.5">
              {projects.map((project, index) => (
                <StaggerItem
                  key={project.id}
                  className="group flex items-center justify-between gap-4 rounded-[14px] border border-white/12 bg-white/[0.04] px-5 py-4 transition-colors hover:border-brand-400/40 hover:bg-white/[0.07]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="text-[10px] font-bold tabular-nums text-white/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-bold text-white">{project.title}</h3>
                      <p className="mt-0.5 truncate text-[11.5px] text-white/55">{project.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/70">
                    {project.status}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============================================================== Channels */}
      <section id="channels" className="relative py-20 lg:py-28">
        <div className="container-wide">
          <ChapterHead
            index={5}
            kicker="کانال‌های فروش"
            title="همان کالا، در مسیری که شما انتخاب می‌کنید"
            description="از خرید تک‌عددی آنلاین تا تأمین عمده سازمانی و تجربه حضوری؛ هر کانال خدمات اختصاصی خود را دارد."
            action={
              <Link href="/stores" className="btn-secondary shrink-0">
                همه کانال‌ها
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            }
          />

          <Stagger className="grid gap-4 sm:grid-cols-2">
            {stores.map((store, index) => (
              <StaggerItem key={store.id}>
                <Link
                  href={`/stores/${store.slug}`}
                  className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-[20px] border border-line-200 bg-surface-100 p-6"
                >
                  {store.image ? (
                    <Image
                      src={store.image}
                      alt={store.name}
                      fill
                      sizes="(min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-[1.05]"
                      style={{ objectPosition: imagePositionCss(store.imagePosition) }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/35 to-transparent" />
                  <div className="relative flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold tabular-nums text-white/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-xl font-extrabold text-white">{store.name}</h3>
                      <p className="mt-1.5 max-w-sm text-[12px] leading-6 text-white/70">
                        {store.description}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-white/20">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Admin-placed widgets for the home page, below the chapters. */}
      <PageBuilder slug="home" />

      {/* ================================================================== News */}
      <section id="news" className="relative border-t border-line-200 py-20 lg:py-28">
        <div className="container-wide">
          <ChapterHead
            index={6}
            kicker="رسانه"
            title="آخرین رویدادهای نامیرا"
            description="رویدادها، همکاری‌ها و دستاوردهای هلدینگ."
            action={
              <Link href="/media/news" className="btn-ghost shrink-0 px-0">
                همه اخبار
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            }
          />

          {news.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              خبری برای نمایش منتشر نشده است.
            </div>
          ) : (
            <Stagger className="grid gap-4 md:grid-cols-3">
              {featuredNews ? (
                <StaggerItem className="md:col-span-2 md:row-span-2">
                  <Link
                    href={`/media/news/${featuredNews.slug}`}
                    className="group relative flex h-full min-h-[360px] flex-col justify-end overflow-hidden rounded-[22px] border border-line-200 p-7"
                  >
                    {featuredNews.image ? (
                      <SiteImage
                        src={featuredNews.image}
                        alt={featuredNews.title}
                        style={{ objectPosition: imagePositionCss(featuredNews.imagePosition) }}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-dark-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/55 to-dark-900/10" />
                    <div className="relative">
                      <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-medium text-white backdrop-blur">
                        {featuredNews.category}
                      </span>
                      <h3 className="mt-3 max-w-xl text-2xl font-extrabold leading-[1.35] text-white sm:text-3xl">
                        {featuredNews.title}
                      </h3>
                      <p className="mt-2 max-w-lg text-[12.5px] leading-7 text-white/70">
                        {featuredNews.excerpt}
                      </p>
                      <time
                        dateTime={featuredNews.publishedAt.toISOString()}
                        className="mt-4 inline-block text-[10.5px] text-white/55"
                      >
                        {formatJalaliLong(featuredNews.publishedAt)}
                      </time>
                    </div>
                  </Link>
                </StaggerItem>
              ) : null}

              {restNews.map((item) => (
                <StaggerItem key={item.id}>
                  <Link
                    href={`/media/news/${item.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line-200 bg-surface transition-colors hover:border-brand-500/40"
                  >
                    <div className="relative h-36 overflow-hidden bg-surface-100">
                      {item.image ? (
                        <SiteImage
                          src={item.image}
                          alt={item.title}
                          style={{ objectPosition: imagePositionCss(item.imagePosition) }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-dark-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                        {item.category}
                      </span>
                      <h3 className="mt-2 text-[14px] font-bold leading-7 text-ink-900 transition-colors group-hover:text-accent">
                        {item.title}
                      </h3>
                      <time
                        dateTime={item.publishedAt.toISOString()}
                        className="mt-auto pt-4 text-[10.5px] text-ink-500"
                      >
                        {formatJalaliLong(item.publishedAt)}
                      </time>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* =================================================================== CTA */}
      <section className="relative overflow-hidden border-t border-line-200">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/images/topics/corporate.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/85 to-dark-900/60" />
        </div>
        <div className="on-dark relative py-20 lg:py-28">
          <div className="container-wide">
            <p className="xp-index text-brand-300">۰۷ — همکاری</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,4rem)] font-black leading-[1.12] text-white">
              برای ساختن زنجیره بعدی،
              <br />
              با نامیرا همراه شوید.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-8 text-white/65">
              همکاری تجاری، تأمین کالا، فروش سازمانی یا پیوستن به تیم؛ هر مسیر همکاری از یک
              گفتگو شروع می‌شود.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                تماس با ما
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/careers"
                className="btn inline-flex border border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                فرصت‌های شغلی
              </Link>
            </div>
          </div>
        </div>
      </section>
    </KineticGrid>
  );
}
