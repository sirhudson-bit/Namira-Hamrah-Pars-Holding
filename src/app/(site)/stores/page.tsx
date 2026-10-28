import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Store as StoreIcon } from "lucide-react";
import { getStores } from "@/server/content";
import { PageBuilder } from "@/components/site/page-builder";
import { PageHero } from "@/components/site/ui";
import { STORE_KIND_LABELS } from "@/lib/store-kinds";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { SiteImage } from "@/components/site/site-image";
import { imagePositionCss } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فروشگاه‌ها",
  description:
    "کانال‌های فروش هلدینگ نامیرا همراه پارس: فروشگاه آنلاین B2C، سامانه عمده B2B، فروشگاه حضوری و فروش سازمانی.",
};

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <>
      <PageHero
        slug="stores"
        eyebrow="فروشگاه‌ها"
        title="کانال‌های فروش نامیرا"
        description="از خرید تک‌عددی آنلاین تا تأمین عمده سازمانی؛ هر کانال با خدمات اختصاصی خود."
        breadcrumb={[{ label: "فروشگاه‌ها" }]}
      />
      <PageBuilder slug="stores" />


      <section className="section">
        <Stagger className="container grid gap-6 lg:grid-cols-2">
          {stores.map((s) => (
            <StaggerItem key={s.id}>
              <Tilt intensity={5} className="h-full">
                <article className="card flex h-full flex-col overflow-hidden p-7">
                  {s.image ? (
                    <div className="-mx-7 -mt-7 mb-5 aspect-[16/9] border-b border-line-200 bg-surface-50">
                      <SiteImage src={s.image} alt={s.name} style={{ objectPosition: imagePositionCss(s.imagePosition) }} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-btn bg-brand-700/20 text-accent">
                      <StoreIcon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="badge">{STORE_KIND_LABELS[s.kind] ?? s.kind}</span>
                  </div>
                  <h2 className="mt-5 heading-3">{s.name}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-ink-500">{s.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href={`/stores/${s.slug}`} className="btn-secondary">
                      جزئیات
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </Link>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                      >
                        ورود به فروشگاه
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </article>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
