import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getNews } from "@/server/content";
import { formatJalaliLong } from "@/lib/format";
import { PageHero, EmptyState } from "@/components/site/ui";
import { SiteImage } from "@/components/site/site-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اخبار",
  description: "آخرین اخبار و رویدادهای هلدینگ نامیرا همراه پارس.",
};

export default async function NewsListPage() {
  const news = await getNews();

  return (
    <>
      <PageHero
        eyebrow="رسانه"
        title="اخبار"
        description="آخرین رویدادها، همکاری‌ها و دستاوردهای هلدینگ."
        breadcrumb={[{ label: "رسانه", href: "/media" }, { label: "اخبار" }]}
      />

      <section className="section">
        <div className="container">
          {news.length === 0 ? (
            <EmptyState message="خبری برای نمایش منتشر نشده است." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((n) => (
                <Link
                  key={n.id}
                  href={`/media/news/${n.slug}`}
                  className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative h-44 bg-gradient-to-br from-brand-600 to-dark-800">
                    {n.image ? (
                      <SiteImage src={n.image} alt={n.title} className="h-full w-full object-cover" />
                    ) : (
                      <Image src="/images/news-placeholder.svg" alt="" fill className="object-cover opacity-70" sizes="33vw" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="badge w-fit">{n.category}</span>
                    <h2 className="mt-3 text-base font-bold leading-7 text-ink-900 group-hover:text-accent">
                      {n.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-7 text-ink-500">{n.excerpt}</p>
                    <time dateTime={n.publishedAt.toISOString()} className="mt-4 text-xs text-ink-500">
                      {formatJalaliLong(n.publishedAt)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
