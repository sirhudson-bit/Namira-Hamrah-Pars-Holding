import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getBusinessGroup, getBusinessGroups, getStores } from "@/server/content";
import { PageHero } from "@/components/site/ui";
import { IconByName } from "@/components/site/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = await getBusinessGroup(slug);
  if (!group) return { title: "گروه یافت نشد" };
  return {
    title: group.name,
    description: `${group.tagline} — ${group.description}`.slice(0, 160),
  };
}

export default async function BusinessGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [group, allGroups, stores] = await Promise.all([
    getBusinessGroup(slug),
    getBusinessGroups(),
    getStores(),
  ]);
  if (!group) notFound();

  const others = allGroups.filter((g) => g.slug !== group.slug);
  const highlights = group.highlights.split("\n").filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="گروه‌های کسب‌وکار"
        title={group.name}
        description={group.tagline}
        breadcrumb={[
          { label: "گروه‌های کسب‌وکار", href: "/business-groups" },
          { label: group.name },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-card text-white"
                style={{ backgroundColor: group.color }}
              >
                <IconByName name={group.icon} className="h-8 w-8" />
              </span>
              <h2 className="heading-2">{group.name}</h2>
            </div>
            <p className="mt-6 text-base leading-8 text-ink-700">{group.description}</p>

            {highlights.length > 0 ? (
              <div className="mt-8">
                <h3 className="heading-3">محورهای فعالیت</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 rounded-btn border border-line-200 bg-surface p-3.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-700/20 text-accent">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="text-sm text-ink-700">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="card p-6">
              <h2 className="heading-3">کانال‌های فروش مرتبط</h2>
              <ul className="mt-4 space-y-2">
                {stores.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/stores/${s.slug}`}
                      className="flex items-center justify-between rounded-btn px-3 py-2.5 text-sm hover:bg-brand-700/20"
                    >
                      <span className="font-medium text-ink-900">{s.name}</span>
                      <ArrowLeft className="h-4 w-4 text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card bg-brand-800 p-6 text-white">
              <h2 className="text-sm font-bold">همکاری تجاری</h2>
              <p className="mt-2 text-xs leading-6 text-brand-100/80">
                برای تأمین کالا، نمایندگی یا همکاری با این گروه با ما تماس بگیرید.
              </p>
              <Link href="/contact" className="btn mt-4 bg-white text-dark-900 hover:bg-brand-100">
                تماس با ما
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="section border-t border-line-200 bg-surface">
          <div className="container">
            <h2 className="heading-3 mb-6">سایر گروه‌های کسب‌وکار</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((g) => (
                <Link
                  key={g.id}
                  href={`/business-groups/${g.slug}`}
                  className="card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-btn text-white"
                    style={{ backgroundColor: g.color }}
                  >
                    <IconByName name={g.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-ink-900">{g.name}</h3>
                  <p className="mt-1 text-xs leading-6 text-ink-500">{g.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
