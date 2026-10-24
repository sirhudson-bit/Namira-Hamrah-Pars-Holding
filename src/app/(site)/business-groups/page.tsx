import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBusinessGroups } from "@/server/content";
import { PageHero } from "@/components/site/ui";
import { IconByName } from "@/components/site/icon";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "گروه‌های کسب‌وکار",
  description:
    "پنج گروه تخصصی هلدینگ نامیرا همراه پارس در حوزه‌های دیجیتال، خودرو، غذایی، صنعتی و بازرگانی.",
};

export default async function BusinessGroupsPage() {
  const groups = await getBusinessGroups();

  return (
    <>
      <PageHero
        slug="business-groups"
        eyebrow="گروه‌های کسب‌وکار"
        title="پنج گروه تخصصی، یک هلدینگ"
        description="هر گروه با تیم، زنجیره تأمین و کانال فروش مستقل خود اداره می‌شود و از زیرساخت مشترک هلدینگ بهره می‌برد."
        breadcrumb={[{ label: "گروه‌های کسب‌وکار" }]}
      />

      <section className="section">
        <Stagger className="container grid gap-6 lg:grid-cols-2">
          {groups.map((g) => (
            <StaggerItem key={g.id}>
              <Tilt intensity={5} className="h-full">
                <article className="card flex h-full flex-col p-7">
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-btn text-white"
                      style={{ backgroundColor: g.color }}
                    >
                      <IconByName name={g.icon} className="h-7 w-7" />
                    </span>
                    <div>
                      <h2 className="heading-3">{g.name}</h2>
                      <p className="text-sm font-medium text-accent">{g.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink-500">{g.description}</p>
                  {g.highlights ? (
                    <ul className="mt-4 space-y-1.5">
                      {g.highlights
                        .split("\n")
                        .filter(Boolean)
                        .map((h) => (
                          <li key={h} className="flex items-start gap-2 text-sm text-ink-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                            {h}
                          </li>
                        ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto pt-6">
                    <Link href={`/business-groups/${g.slug}`} className="btn-secondary w-fit">
                      جزئیات {g.name}
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </Link>
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
