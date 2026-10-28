import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/server/content";
import { PageBuilder } from "@/components/site/page-builder";
import { PageHero } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "صفحه یافت نشد" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDesc || page.subtitle || undefined,
  };
}

/**
 * Custom pages created in /admin/pages. Static routes (`/about`, `/contact`, …)
 * take precedence in the App Router, so this catch-all only serves slugs an
 * administrator added. Unpublished or unknown pages are a real 404.
 */
export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        slug={slug}
        title={page.title}
        breadcrumb={[{ label: page.title }]}
      />
      <PageBuilder slug={slug} />
    </>
  );
}
