import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Boxes,
  Briefcase,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Inbox,
  Mail,
  Plus,
  Store,
} from "lucide-react";
import { prisma } from "@/server/db";
import { getSettings } from "@/server/settings";
import { formatJalaliLong, toPersianDigits } from "@/lib/format";
import { ScreenHeader } from "@/components/admin/wp/screen";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پیشخوان" };

/** A dashboard modelled on WordPress: welcome panel, at-a-glance, activity. */
export default async function AdminDashboardPage() {
  const [
    groups,
    stores,
    newsCount,
    postsCount,
    jobs,
    pagesCount,
    mediaCount,
    unreadMessages,
    newApplications,
    subscribers,
    messagesCount,
  ] = await Promise.all([
    prisma.businessGroup.count(),
    prisma.store.count(),
    prisma.newsPost.count(),
    prisma.blogPost.count(),
    prisma.jobOpening.count({ where: { active: true } }),
    prisma.page.count(),
    prisma.mediaAsset.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.jobApplication.count({ where: { status: "new" } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.contactMessage.count(),
  ]);

  const [recentMessages, settings, recentNews, recentPages, recentMedia] =
    await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      getSettings(),
      prisma.newsPost.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
      prisma.page.findMany({ orderBy: { updatedAt: "desc" }, take: 3 }),
      prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    ]);

  const activity = [
    ...recentNews.map((item) => ({
      id: `news-${item.id}`,
      title: item.title,
      kind: "خبر",
      href: `/admin/news?edit=${item.id}`,
      updatedAt: item.updatedAt,
    })),
    ...recentPages.map((item) => ({
      id: `page-${item.id}`,
      title: item.title,
      kind: "برگه",
      href: `/admin/pages/${item.id}`,
      updatedAt: item.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const glance = [
    { label: "خبر", count: newsCount, href: "/admin/news", Icon: FileText },
    { label: "مقاله", count: postsCount, href: "/admin/blog", Icon: FileText },
    { label: "برگه", count: pagesCount, href: "/admin/pages", Icon: FileText },
    { label: "رسانه", count: mediaCount, href: "/admin/media", Icon: ImageIcon },
    { label: "گروه کسب‌وکار", count: groups, href: "/admin/business-groups", Icon: Boxes },
    { label: "فروشگاه", count: stores, href: "/admin/stores", Icon: Store },
    { label: "موقعیت شغلی باز", count: jobs, href: "/admin/careers", Icon: Briefcase },
    { label: "عضو خبرنامه", count: subscribers, href: "/admin/forms?tab=subscribers", Icon: Mail },
  ];

  const health = [
    { label: "لوگو و فاوآیکون", ok: Boolean(settings.logo_path && settings.favicon_path) },
    { label: "عنوان و توضیح سئو", ok: Boolean(settings.seo_title && settings.seo_description) },
    { label: "اطلاعات تماس", ok: Boolean(settings.phone && settings.email && settings.address) },
    { label: "تصویر هیروی صفحه اصلی", ok: Boolean(settings.hero_image) },
    { label: "ویدئوی معرفی", ok: Boolean(settings.video_embed) },
  ];

  return (
    <div>
      <ScreenHeader
        title="پیشخوان"
        description="نمای کلی سایت، محتوای اخیر و کارهای در انتظار."
        action={
          <Link href="/" target="_blank" className="btn-secondary">
            مشاهده سایت
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Welcome panel */}
        <section className="card overflow-hidden">
          <div className="border-b border-line-200 px-5 py-4">
            <h2 className="text-[15px] font-bold text-ink-900">خوش آمدید</h2>
            <p className="mt-1 text-[12.5px] leading-6 text-ink-500">
              این پیشخوان، همان ساختار وردپرس را دارد: هر بخش از منوی کنار صفحه باز می‌شود،
              فهرست‌ها جدول قابل‌جستجو دارند و ویرایش هر مورد در یک صفحه‌ی مستقل انجام می‌شود.
            </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            {[
              { label: "افزودن خبر", href: "/admin/news?new=1", Icon: FileText },
              { label: "بارگذاری رسانه", href: "/admin/media?new=1", Icon: ImageIcon },
              { label: "برگه جدید", href: "/admin/pages?new=1", Icon: Plus },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 border-b border-line-200 px-5 py-4 transition-colors hover:bg-surface-100 sm:border-b-0 sm:border-s sm:first:border-s-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-200 bg-surface-100 text-accent transition-colors group-hover:border-accent/40">
                  <action.Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-[12.5px] font-medium text-ink-900">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* At a glance */}
        <section className="card">
          <h2 className="border-b border-line-200 px-5 py-3 text-[14px] font-bold text-ink-900">
            در یک نگاه
          </h2>
          <ul className="grid grid-cols-2 gap-px bg-line-200/60">
            {glance.map((item) => (
              <li key={item.label} className="bg-surface">
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-surface-100"
                >
                  <item.Icon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[16px] font-semibold leading-tight text-ink-900">
                      {toPersianDigits(item.count)}
                    </span>
                    <span className="block truncate text-[11px] text-ink-500">{item.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-line-200 px-5 py-3 text-[14px] font-bold text-ink-900">
            فعالیت اخیر
          </h2>
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-ink-500">هنوز محتوایی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line-200">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="block truncate text-[12.5px] font-medium text-accent hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[10.5px] text-ink-500">
                      {item.kind} · {formatJalaliLong(item.updatedAt)}
                    </span>
                  </div>
                  <Link href={item.href} className="shrink-0 text-[11px] text-accent">
                    ویرایش
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="flex items-center justify-between border-b border-line-200 px-5 py-3 text-[14px] font-bold text-ink-900">
            در انتظار بررسی
            <span className="text-[11px] font-normal text-ink-500">
              {toPersianDigits(unreadMessages + newApplications)} مورد
            </span>
          </h2>
          <ul className="divide-y divide-line-200">
            <li>
              <Link
                href="/admin/forms?tab=messages"
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-100"
              >
                <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-900">
                  <Inbox className="h-4 w-4 text-ink-400" aria-hidden />
                  پیام‌های تماس
                  {unreadMessages > 0 ? (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {toPersianDigits(unreadMessages)}
                    </span>
                  ) : null}
                </span>
                <span className="text-[11px] text-ink-500">{toPersianDigits(messagesCount)} کل</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/forms?tab=applications"
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-100"
              >
                <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-900">
                  <Briefcase className="h-4 w-4 text-ink-400" aria-hidden />
                  درخواست‌های شغلی
                  {newApplications > 0 ? (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {toPersianDigits(newApplications)}
                    </span>
                  ) : null}
                </span>
                <span className="text-[11px] text-ink-500">جدید</span>
              </Link>
            </li>
          </ul>

          {recentMessages.length ? (
            <div className="border-t border-line-200 px-5 py-3">
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                آخرین پیام‌ها
              </p>
              <ul className="space-y-1.5">
                {recentMessages.map((message) => (
                  <li key={message.id} className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11.5px] text-ink-700">{message.name}</span>
                    <span className="shrink-0 text-[10px] text-ink-400">
                      {formatJalaliLong(message.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card">
          <h2 className="border-b border-line-200 px-5 py-3 text-[14px] font-bold text-ink-900">
            وضعیت سایت
          </h2>
          <ul className="divide-y divide-line-200">
            {health.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-900">
                  <CheckCircle2
                    className={`h-4 w-4 ${item.ok ? "text-brand-500" : "text-amber-400"}`}
                    aria-hidden
                  />
                  {item.label}
                </span>
                <Link href="/admin/settings" className="text-[11px] text-accent">
                  {item.ok ? "تنظیم شده" : "تکمیل کنید"}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="flex items-center justify-between border-b border-line-200 px-5 py-3 text-[14px] font-bold text-ink-900">
            آخرین رسانه‌ها
            <Link href="/admin/media" className="text-[11px] font-normal text-accent">
              کتابخانه
            </Link>
          </h2>
          {recentMedia.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-ink-500">رسانه‌ای بارگذاری نشده است.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-4">
              {recentMedia.map((asset) => (
                <Link
                  key={asset.id}
                  href="/admin/media"
                  className="relative aspect-square overflow-hidden rounded border border-line-200 bg-surface-100"
                  title={asset.title || asset.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.path} alt={asset.alt || ""} className="h-full w-full object-cover" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
