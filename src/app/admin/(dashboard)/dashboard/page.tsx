import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Briefcase,
  Image as ImageIcon,
  Inbox,
  Mail,
  Newspaper,
  PenLine,
  Plus,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { prisma } from "@/server/db";
import { getSettings } from "@/server/settings";
import { formatJalaliLong, toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";

/** A dashboard modelled on the WordPress "At a glance" / "Activity" layout. */
export default async function AdminDashboardPage() {
  const [
    groups,
    stores,
    news,
    posts,
    jobs,
    services,
    units,
    media,
    pages,
    unreadMessages,
    newApplications,
    subscribers,
    totalMessages,
  ] = await Promise.all([
    prisma.businessGroup.count(),
    prisma.store.count(),
    prisma.newsPost.count(),
    prisma.blogPost.count(),
    prisma.jobOpening.count({ where: { active: true } }),
    prisma.serviceItem.count(),
    prisma.orgUnit.count(),
    prisma.mediaAsset.count(),
    prisma.page.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.jobApplication.count({ where: { status: "new" } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.contactMessage.count(),
  ]);

  const [recentMessages, recentApplications, settings, recentNews, recentPosts, recentPages] =
    await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      getSettings(),
      prisma.newsPost.findMany({ orderBy: { updatedAt: "desc" }, take: 3 }),
      prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 3 }),
      prisma.page.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
    ]);

  const stats = [
    { label: "گروه‌های کسب‌وکار", value: groups, href: "/admin/business-groups", Icon: Boxes },
    { label: "فروشگاه‌ها", value: stores, href: "/admin/stores", Icon: Store },
    { label: "اخبار", value: news, href: "/admin/news", Icon: Newspaper },
    { label: "مقالات", value: posts, href: "/admin/blog", Icon: PenLine },
    { label: "موقعیت‌های شغلی باز", value: jobs, href: "/admin/careers", Icon: Briefcase },
    { label: "واحدهای سازمانی", value: units, href: "/admin/settings", Icon: Users },
    { label: "خدمات", value: services, href: "/admin/pages", Icon: Settings },
    { label: "نگاره‌های رسانه", value: media, href: "/admin/media", Icon: ImageIcon },
    { label: "صفحات قابل ویرایش", value: pages, href: "/admin/pages", Icon: FileIcon },
  ];

  const quickActions = [
    { label: "خبر جدید", href: "/admin/news" },
    { label: "مقاله جدید", href: "/admin/blog" },
    { label: "گروه جدید", href: "/admin/business-groups" },
    { label: "فروشگاه جدید", href: "/admin/stores" },
    { label: "موقعیت شغلی", href: "/admin/careers" },
    { label: "بارگذاری رسانه", href: "/admin/media" },
  ];

  const activity = [
    ...recentNews.map((n) => ({
      id: `n-${n.id}`,
      title: n.title,
      kind: "خبر",
      href: "/admin/news",
      updatedAt: n.updatedAt,
    })),
    ...recentPosts.map((p) => ({
      id: `b-${p.id}`,
      title: p.title,
      kind: "مقاله",
      href: "/admin/blog",
      updatedAt: p.updatedAt,
    })),
    ...recentPages.map((p) => ({
      id: `p-${p.id}`,
      title: p.title,
      kind: "صفحه",
      href: "/admin/pages",
      updatedAt: p.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8);

  const health = [
    {
      label: "لوگو و فاوآیکون",
      ok: Boolean(settings.logo_path && settings.favicon_path),
      href: "/admin/settings",
    },
    {
      label: "عنوان و توضیح سئو",
      ok: Boolean(settings.seo_title && settings.seo_description),
      href: "/admin/settings",
    },
    {
      label: "ویدئوی معرفی",
      ok: Boolean(settings.video_embed),
      href: "/admin/settings",
    },
    {
      label: "اطلاعات تماس",
      ok: Boolean(settings.phone && settings.email && settings.address),
      href: "/admin/settings",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-2">داشبورد</h1>
          <p className="mt-2 text-sm text-ink-500">
            نمای کلی محتوا، ورودی‌ها و وضعیت سایت.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-secondary">
          مشاهده سایت
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {/* Quick actions — the WordPress "add new" shortcuts. */}
      <section className="card p-6">
        <h2 className="mb-4 text-sm font-bold text-ink-900">دسترسی سریع</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link key={a.href + a.label} href={a.href} className="btn-secondary">
              <Plus className="h-4 w-4" aria-hidden />
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      {/* At a glance */}
      <section>
        <h2 className="mb-4 text-sm font-bold text-ink-900">یک نگاه به سایت</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="card flex items-center gap-4 p-5 transition-colors hover:border-brand-500/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-accent">
                <s.Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-ink-900">{toPersianDigits(s.value)}</p>
                <p className="truncate text-xs text-ink-500">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity */}
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-bold text-ink-900">آخرین تغییرات محتوا</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-ink-500">هنوز محتوایی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line-200">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{a.title}</p>
                    <p className="text-[11px] text-ink-500">{a.kind}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <time className="text-[11px] text-ink-500">
                      {formatJalaliLong(a.updatedAt)}
                    </time>
                    <Link href={a.href} className="text-[11px] font-medium text-accent">
                      ویرایش
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Health */}
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-bold text-ink-900">وضعیت سایت</h2>
          <ul className="divide-y divide-line-200">
            {health.map((h) => (
              <li key={h.label} className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-900">
                  <span
                    className={
                      h.ok
                        ? "inline-block h-2 w-2 rounded-full bg-brand-600"
                        : "inline-block h-2 w-2 rounded-full bg-amber-500"
                    }
                    aria-hidden
                  />
                  {h.label}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[11px] text-ink-500">
                    {h.ok ? "تنظیم شده" : "ناقص"}
                  </span>
                  <Link href={h.href} className="text-[11px] font-medium text-accent">
                    تنظیمات
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">
              پیام‌های تماس
              {unreadMessages > 0 ? (
                <span className="mr-2 rounded-full bg-brand-700 px-2 py-0.5 text-[11px] text-white">
                  {toPersianDigits(unreadMessages)} خوانده‌نشده
                </span>
              ) : null}
            </h2>
            <Link href="/admin/forms" className="text-xs font-medium text-accent">
              همه ({toPersianDigits(totalMessages)})
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-ink-500">پیامی دریافت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line-200">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{m.name}</p>
                    <p className="truncate text-xs text-ink-500">{m.message}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-ink-500">
                    {formatJalaliLong(m.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">
              درخواست‌های همکاری
              {newApplications > 0 ? (
                <span className="mr-2 rounded-full bg-brand-700 px-2 py-0.5 text-[11px] text-white">
                  {toPersianDigits(newApplications)} جدید
                </span>
              ) : null}
            </h2>
            <Link href="/admin/forms" className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              مشاهده
              <ArrowLeft className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-ink-500">درخواستی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line-200">
              {recentApplications.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{a.name}</p>
                    <p className="truncate text-xs text-ink-500">{a.position}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-ink-500">
                    {formatJalaliLong(a.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-line-200 pt-4 text-[11px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5" aria-hidden />
              {toPersianDigits(unreadMessages)} پیام خوانده‌نشده
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {toPersianDigits(subscribers)} عضو خبرنامه
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Small inline icon so the stats list stays a single array. */
function FileIcon({ className }: { className?: string }) {
  return <PenLine className={className} aria-hidden />;
}
