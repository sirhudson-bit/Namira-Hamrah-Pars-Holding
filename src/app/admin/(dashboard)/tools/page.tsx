import type { Metadata } from "next";
import { Download, ExternalLink, Wrench } from "lucide-react";
import { prisma } from "@/server/db";
import { ScreenHeader } from "@/components/admin/wp/screen";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ابزارها" };

/**
 * Tools screen: exports, sitemap/robots entry points and a plain data census.
 * WordPress keeps these on tools.php rather than in settings, and so does this
 * panel — they act on data, they do not configure the site.
 */
export default async function AdminToolsPage() {
  const [pages, news, posts, media, messages, applications, subscribers] = await Promise.all([
    prisma.page.count(),
    prisma.newsPost.count(),
    prisma.blogPost.count(),
    prisma.mediaAsset.count(),
    prisma.contactMessage.count(),
    prisma.jobApplication.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  const exports = [
    { label: "پیام‌های تماس (CSV)", href: "/api/admin/export?type=messages", count: messages },
    { label: "درخواست‌های شغلی (CSV)", href: "/api/admin/export?type=applications", count: applications },
  ];

  const census = [
    { label: "برگه", value: pages },
    { label: "خبر", value: news },
    { label: "مقاله", value: posts },
    { label: "رسانه", value: media },
    { label: "پیام", value: messages },
    { label: "درخواست شغلی", value: applications },
    { label: "عضو خبرنامه", value: subscribers },
  ];

  return (
    <div>
      <ScreenHeader
        title="ابزارها"
        description="برون‌بری داده‌ها، نقشه سایت و نمای کلی حجم محتوا."
        breadcrumb={[{ label: "ابزارها" }]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <h2 className="flex items-center gap-2 border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
            <Wrench className="h-4 w-4 text-accent" aria-hidden />
            برون‌بری داده‌ها
          </h2>
          <ul className="divide-y divide-line-200">
            {exports.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-[12.5px] text-ink-900 transition-colors hover:bg-surface-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4 text-ink-400" aria-hidden />
                    {item.label}
                  </span>
                  <span className="text-[11px] text-ink-500">
                    {toPersianDigits(item.count)} ردیف
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                className="flex items-center justify-between gap-3 px-4 py-3 text-[12.5px] text-ink-900 transition-colors hover:bg-surface-100"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-ink-400" aria-hidden />
                  نقشه سایت (sitemap.xml)
                </span>
                <span className="text-[11px] text-ink-500">برای موتور جستجو</span>
              </a>
            </li>
            <li>
              <a
                href="/robots.txt"
                target="_blank"
                className="flex items-center justify-between gap-3 px-4 py-3 text-[12.5px] text-ink-900 transition-colors hover:bg-surface-100"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-ink-400" aria-hidden />
                  robots.txt
                </span>
                <span className="text-[11px] text-ink-500">قواعد خزش</span>
              </a>
            </li>
          </ul>
          <p className="border-t border-line-200 px-4 py-2.5 text-[10.5px] leading-5 text-ink-500">
            برون‌بری‌ها فقط برای کاربر واردشده ساخته می‌شوند و شامل داده‌های شخصی متقاضیان است.
          </p>
        </section>

        <section className="card">
          <h2 className="border-b border-line-200 px-4 py-2.5 text-[13px] font-bold text-ink-900">
            حجم محتوا
          </h2>
          <dl className="grid grid-cols-2 gap-px bg-line-200/60">
            {census.map((item) => (
              <div key={item.label} className="bg-surface px-4 py-3">
                <dt className="text-[11px] text-ink-500">{item.label}</dt>
                <dd className="text-[20px] font-semibold text-ink-900">
                  {toPersianDigits(item.value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="border-t border-line-200 px-4 py-2.5 text-[10.5px] leading-5 text-ink-500">
            برای پشتیبان‌گیری، فایل <span dir="ltr">prisma/dev.db</span> و پوشه{" "}
            <span dir="ltr">public/uploads</span> کافی است.
          </p>
        </section>
      </div>
    </div>
  );
}
