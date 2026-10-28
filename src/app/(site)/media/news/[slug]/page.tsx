import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getNewsPost, getNews } from "@/server/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatJalaliLong } from "@/lib/format";
import { PageHero } from "@/components/site/ui";
import { SiteImage } from "@/components/site/site-image";
import { imagePositionCss } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) return { title: "خبر یافت نشد" };
  return { title: post.title, description: post.excerpt.slice(0, 160) };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) notFound();

  const others = (await getNews(4)).filter((n) => n.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        breadcrumb={[
          { label: "رسانه", href: "/media" },
          { label: "اخبار", href: "/media/news" },
          { label: post.title },
        ]}
      />

      <article className="section">
        <div className="container-prose">
          <time dateTime={post.publishedAt.toISOString()} className="mb-6 block text-sm text-ink-500">
            {formatJalaliLong(post.publishedAt)}
          </time>
          {post.image ? (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-card border border-line-200 bg-surface-50">
              <SiteImage src={post.image} alt={post.title} priority style={{ objectPosition: imagePositionCss(post.imagePosition) }} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <p className="lead mb-8">{post.excerpt}</p>
          <div
            className="prose-page max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
          />

          {others.length > 0 ? (
            <div className="mt-16 border-t border-line-200 pt-8">
              <h2 className="heading-3 mb-4">اخبار مرتبط</h2>
              <ul className="space-y-3">
                {others.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/media/news/${n.slug}`}
                      className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-strong"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden />
                      {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
