import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MapPin, Phone, Store as StoreIcon } from "lucide-react";
import { getStore, getStores } from "@/server/content";
import { PageHero } from "@/components/site/ui";
import { STORE_KIND_LABELS } from "@/lib/store-kinds";
import { toPersianDigits } from "@/lib/format";
import { SiteImage } from "@/components/site/site-image";
import { imagePositionCss } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "فروشگاه یافت نشد" };
  return { title: store.name, description: store.description.slice(0, 160) };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [store, allStores] = await Promise.all([getStore(slug), getStores()]);
  if (!store) notFound();

  const others = allStores.filter((s) => s.slug !== store.slug);

  const contactRows = [
    store.address ? { Icon: MapPin, label: "نشانی", value: store.address } : null,
    store.phone ? { Icon: Phone, label: "تلفن", value: toPersianDigits(store.phone), ltr: true } : null,
    store.email ? { Icon: Mail, label: "ایمیل", value: store.email, ltr: true } : null,
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string; ltr?: boolean }[];

  return (
    <>
      <PageHero
        eyebrow="فروشگاه‌ها"
        title={store.name}
        description={STORE_KIND_LABELS[store.kind] ?? store.kind}
        breadcrumb={[{ label: "فروشگاه‌ها", href: "/stores" }, { label: store.name }]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {store.image ? (
              <div className="mb-7 aspect-[16/9] overflow-hidden rounded-card border border-line-200 bg-surface-50">
                <SiteImage src={store.image} alt={store.name} style={{ objectPosition: imagePositionCss(store.imagePosition) }} className="h-full w-full object-cover" />
              </div>
            ) : null}
            <span className="flex h-16 w-16 items-center justify-center rounded-card bg-brand-700/20 text-accent">
              <StoreIcon className="h-8 w-8" aria-hidden />
            </span>
            <h2 className="mt-6 heading-2">{store.name}</h2>
            <p className="mt-4 text-base leading-8 text-ink-700">{store.description}</p>

            {store.url ? (
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-8"
              >
                ورود به فروشگاه
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <p className="mt-8 text-sm text-ink-500">
                این کانال به‌صورت حضوری و تلفنی خدمات ارائه می‌دهد.
              </p>
            )}
          </div>

          <aside>
            {contactRows.length > 0 ? (
              <div className="card p-6">
                <h2 className="heading-3">اطلاعات تماس</h2>
                <ul className="mt-4 space-y-4">
                  {contactRows.map((row) => (
                    <li key={row.label} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                        <row.Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <p className="text-xs text-ink-500">{row.label}</p>
                        <p
                          className="text-sm font-medium text-ink-900"
                          dir={row.ltr ? "ltr" : undefined}
                        >
                          {row.value}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="section border-t border-line-200 bg-surface">
          <div className="container">
            <h2 className="heading-3 mb-6">سایر کانال‌های فروش</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/stores/${s.slug}`}
                  className="card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <h3 className="text-sm font-bold text-ink-900">{s.name}</h3>
                  <p className="mt-1 text-xs text-accent">
                    {STORE_KIND_LABELS[s.kind] ?? s.kind}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
