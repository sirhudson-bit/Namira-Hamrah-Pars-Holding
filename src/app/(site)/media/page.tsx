import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Video } from "lucide-react";
import { getNews, getBlogPosts } from "@/server/content";
import { getSettings } from "@/server/settings";
import { prisma } from "@/server/db";
import { formatJalaliLong } from "@/lib/format";
import { PageBuilder } from "@/components/site/page-builder";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { SiteImage } from "@/components/site/site-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "رسانه",
  description: "اخبار، مقالات، گالری تصاویر و ویدئوهای هلدینگ نامیرا همراه پارس.",
};

export default async function MediaPage() {
  const [news, posts, settings, gallery] = await Promise.all([
    getNews(3),
    getBlogPosts(3),
    getSettings(),
    prisma.mediaAsset.findMany({
      where: { inGallery: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <>
      <PageHero
        slug="media"
        eyebrow="رسانه"
        title="اخبار و رسانه نامیرا"
        description="رویدادها، همکاری‌ها، تحلیل‌ها و محتوای تخصصی هلدینگ."
        breadcrumb={[{ label: "رسانه" }]}
      />
      <PageBuilder slug="media" />


      {/* News */}
      <section className="section">
        <div className="container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="اخبار" title="آخرین رویدادها" />
            <Link href="/media/news" className="btn-ghost mb-10 px-0">
              همه اخبار
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                href={`/media/news/${n.slug}`}
                className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative h-40 bg-gradient-to-br from-brand-600 to-dark-800">
                  {n.image ? (
                    <SiteImage src={n.image} alt={n.title} className="h-full w-full object-cover" />
                  ) : (
                    <Image src="/images/news-placeholder.svg" alt="" fill className="object-cover opacity-70" sizes="33vw" />
                  )}
                </div>
                <div className="p-6">
                  <span className="badge">{n.category}</span>
                  <h3 className="mt-3 text-base font-bold leading-7 text-ink-900 group-hover:text-accent">
                    {n.title}
                  </h3>
                  <time dateTime={n.publishedAt.toISOString()} className="mt-3 block text-xs text-ink-500">
                    {formatJalaliLong(n.publishedAt)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="section bg-surface">
        <div className="container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="مقالات" title="تحلیل و راهنما" />
            <Link href="/media/blog" className="btn-ghost mb-10 px-0">
              همه مقالات
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/media/blog/${p.slug}`}
                className="group card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="badge">{p.category}</span>
                <h3 className="mt-3 text-base font-bold leading-7 text-ink-900 group-hover:text-accent">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-ink-500">{p.excerpt}</p>
                <p className="mt-4 text-xs text-ink-500">{p.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="section scroll-mt-24">
        <div className="container">
          <SectionHeading eyebrow="گالری" title="تصاویر رویدادها و مجموعه" />
          {gallery.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              هنوز تصویری در گالری منتشر نشده است. تصاویر از پنل مدیریت ← رسانه اضافه می‌شوند.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {gallery.map((asset) => (
                <a
                  key={asset.id}
                  href={asset.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-card border border-line-200 bg-surface-50"
                >
                  <SiteImage
                    src={asset.path}
                    alt={asset.alt || asset.title || asset.filename}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {asset.title ? (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-900/85 to-transparent px-3 pb-2 pt-6 text-[11px] text-white">
                      {asset.title}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Videos */}
      <section id="videos" className="section scroll-mt-24 bg-surface">
        <div className="container">
          <SectionHeading
            eyebrow="ویدئوها"
            title="ویدئوهای معرفی"
            description="ویدئوهای معرفی هلدینگ و گروه‌ها در کانال‌های رسمی ما منتشر می‌شوند."
          />
          <div className="flex flex-wrap gap-3">
            {[
              { label: "اینستاگرام", href: settings.instagram },
              { label: "لینکدین", href: settings.linkedin },
              { label: "تلگرام", href: settings.telegram },
            ]
              .filter((s) => s.href)
              .map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <Video className="h-4 w-4" aria-hidden />
                  کانال {s.label}
                </a>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
