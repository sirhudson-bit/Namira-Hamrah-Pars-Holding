import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/server/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatJalaliLong } from "@/lib/format";
import { PageHero } from "@/components/site/ui";
import { PageBuilder } from "@/components/site/page-builder";

const RELATED = [
  { slug: "privacy", label: "حریم خصوصی" },
  { slug: "terms", label: "قوانین و مقررات" },
  { slug: "cookie-policy", label: "سیاست کوکی" },
  { slug: "refund-policy", label: "شرایط بازگشت پول" },
];

/** Shared renderer for the four legal documents stored in the Page table. */
export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow="صفحات قانونی"
        title={page.title}
        description={page.subtitle ?? undefined}
        breadcrumb={[{ label: page.title }]}
      />

      <PageBuilder slug={slug} />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_260px]">
          <article className="container-prose">
            <div
              className="prose-page max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
            />
            <p className="mt-10 border-t border-line-200 pt-6 text-xs text-ink-500">
              آخرین به‌روزرسانی: {formatJalaliLong(page.updatedAt)}
            </p>
          </article>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-bold text-ink-900">صفحات حقوقی</h2>
              <ul className="space-y-1.5">
                {RELATED.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/${r.slug}`}
                      aria-current={r.slug === slug ? "page" : undefined}
                      className={
                        r.slug === slug
                          ? "block rounded-btn bg-brand-700/20 px-3 py-2 text-sm font-medium text-accent"
                          : "block rounded-btn px-3 py-2 text-sm text-ink-700 hover:bg-surface-50"
                      }
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
