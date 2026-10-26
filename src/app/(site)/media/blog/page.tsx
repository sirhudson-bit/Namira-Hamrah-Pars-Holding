import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/server/content";
import { formatJalaliLong } from "@/lib/format";
import { PageHero, EmptyState } from "@/components/site/ui";
import { SiteImage } from "@/components/site/site-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مقالات",
  description: "مقالات و راهنماهای تخصصی هلدینگ نامیرا همراه پارس.",
};

export default async function BlogListPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="رسانه"
        title="مقالات"
        description="راهنمای خرید، تحلیل بازار و دیدگاه‌های تخصصی تیم نامیرا."
        breadcrumb={[{ label: "رسانه", href: "/media" }, { label: "مقالات" }]}
      />

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <EmptyState message="مقاله‌ای برای نمایش منتشر نشده است." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/media/blog/${p.slug}`}
                  className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  {p.image ? (
                    <div className="relative h-44 border-b border-line-200 bg-surface-50">
                      <SiteImage src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                  <span className="badge w-fit">{p.category}</span>
                  <h2 className="mt-3 text-base font-bold leading-7 text-ink-900 group-hover:text-accent">
                    {p.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-7 text-ink-500">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                    <span>{p.author}</span>
                    <time dateTime={p.publishedAt.toISOString()}>{formatJalaliLong(p.publishedAt)}</time>
                  </div>
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
