import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { getPageCopy } from "@/server/content";
import { getSettings } from "@/server/settings";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-7">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
        <li>
          <Link href="/" className="transition-colors hover:text-accent">
            خانه
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronLeft className="h-3 w-3" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Inner-page hero.
 *
 * Pass `slug` and the copy is read from the Page row the admin edits, falling
 * back to the built-in strings when the row is missing or unpublished. That is
 * what makes every top-level page's headline editable without a bespoke editor
 * per page.
 */
export async function PageHero({
  slug,
  eyebrow,
  title,
  description,
  breadcrumb,
  className,
}: {
  slug?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}) {
  const copy = slug ? await getPageCopy(slug) : null;
  const settings = await getSettings();
  const kicker = copy?.eyebrow || eyebrow;
  const heading = copy?.title || title;
  const lead = copy?.description || description;
  const backdrop = settings.page_hero_bg;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line-200 bg-surface-50",
        className,
      )}
    >
      {backdrop ? (
        /**
         * Admin-supplied backdrop. The scrim is painted in theme tokens rather
         * than a fixed black/white wash, so the same photo keeps the headline
         * legible in both light and dark mode: the gradient is densest behind
         * the copy on the right and fades towards the empty side.
         */
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-surface-50/90 via-surface-50/60 to-surface-50/15" />
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-30"
        aria-hidden
      />
      <div className="container relative z-10 py-16 sm:py-20 lg:py-24">
        <Reveal>
          {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
          {kicker ? (
            <p className="kicker inline-flex items-center gap-3">
              <span className="h-px w-8 bg-brand-500/60" aria-hidden />
              {kicker}
            </p>
          ) : null}
          {/* ink-900, not white: this hero sits on the themed page canvas, which
              is light in light mode — a hard-coded white heading disappeared
              there. */}
          <h1 className="display-1 mt-5 max-w-4xl text-ink-900">{heading}</h1>
          {lead ? (
            <p className="mt-6 max-w-2xl text-base leading-9 text-ink-500">{lead}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "right" | "center";
}) {
  return (
    <Reveal
      className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center")}
    >
      {eyebrow ? (
        <p
          className={cn(
            "kicker inline-flex items-center gap-3",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-8 bg-brand-500/60" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="display-2 mt-4 text-ink-900">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-9 text-ink-500">{description}</p>
      ) : null}
    </Reveal>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <p className="text-sm text-ink-500">{message}</p>
    </div>
  );
}

/** Small editorial index marker, e.g. «۰۳ — همکاری». */
export function IndexLabel({ index, label }: { index: number; label: string }) {
  const fa = new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index);
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
      {fa} — {label}
    </span>
  );
}
