import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/server/db";
import {
  parseBlockData,
  parseImageLines,
  parsePairs,
} from "@/lib/blocks";
import { imageSrc } from "@/lib/media";
import { renderMarkdown } from "@/lib/markdown";
import { extractEmbedUrl } from "@/lib/embed";
import { SectionHeading } from "./ui";
import { SiteImage } from "./site-image";

/**
 * Renders the widgets an administrator placed on a page in /admin/layout.
 *
 * Runs on the server: blocks are read per request (the pages are dynamic), text
 * is escaped through `renderMarkdown`, image values pass `imageSrc`, and video
 * URLs pass `extractEmbedUrl`. Nothing here trusts stored markup.
 */
export async function PageBuilder({ slug }: { slug: string }) {
  const blocks = await prisma.pageBlock.findMany({
    where: { pageSlug: slug, visible: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
  });
  if (blocks.length === 0) return null;

  return (
    <div className="page-builder">
      {blocks.map((block) => {
        const data = parseBlockData(block.data);
        const key = block.id;

        if (block.type === "heading") {
          if (!data.title && !data.description) return null;
          return (
            <section key={key} className="section">
              <div className="container">
                <SectionHeading
                  eyebrow={data.eyebrow || undefined}
                  title={data.title || ""}
                  description={data.description || undefined}
                  align={data.align === "center" ? "center" : "right"}
                />
              </div>
            </section>
          );
        }

        if (block.type === "text") {
          if (!data.body && !data.title) return null;
          return (
            <section key={key} className="section">
              <div className="container-prose">
                {data.title ? <h2 className="display-3 mb-6 text-ink-900">{data.title}</h2> : null}
                <div
                  className="prose-page max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(data.body || "") }}
                />
              </div>
            </section>
          );
        }

        if (block.type === "image") {
          const src = imageSrc(data.image);
          if (!src) return null;
          const ratio =
            data.ratio === "square"
              ? "aspect-square"
              : data.ratio === "auto"
                ? ""
                : "aspect-[16/9]";
          return (
            <section key={key} className="section">
              <figure className="container">
                <div className={`relative overflow-hidden rounded-card border border-line-200 bg-surface-50 ${ratio}`}>
                  <SiteImage src={src} alt={data.caption || ""} className="h-full w-full object-cover" />
                </div>
                {data.caption ? (
                  <figcaption className="mt-3 text-center text-xs text-ink-500">{data.caption}</figcaption>
                ) : null}
              </figure>
            </section>
          );
        }

        if (block.type === "split") {
          const src = imageSrc(data.image);
          const imageFirst = data.imageSide !== "left";
          return (
            <section key={key} className="section">
              <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                  {data.eyebrow ? <p className="kicker">{data.eyebrow}</p> : null}
                  {data.title ? <h2 className="display-2 mt-4 text-ink-900">{data.title}</h2> : null}
                  <div
                    className="prose-page mt-5"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(data.body || "") }}
                  />
                  {data.ctaLabel && data.ctaHref ? (
                    <Link href={data.ctaHref} className="btn-primary mt-6">
                      {data.ctaLabel}
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <div className={`${imageFirst ? "lg:order-1" : "lg:order-2"} relative aspect-[4/3] overflow-hidden rounded-card border border-line-200 bg-surface-50`}>
                  {src ? (
                    <SiteImage src={src} alt={data.title || ""} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === "cards") {
          const items = parsePairs(data.items || "");
          if (items.length === 0) return null;
          const columns =
            data.columns === "2"
              ? "sm:grid-cols-2"
              : data.columns === "4"
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3";
          return (
            <section key={key} className="section">
              <div className="container">
                {data.title || data.eyebrow ? (
                  <SectionHeading eyebrow={data.eyebrow || undefined} title={data.title || ""} />
                ) : null}
                <div className={`grid gap-5 ${columns}`}>
                  {items.map((item, index) => (
                    <article key={`${item.title}-${index}`} className="card h-full p-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-200 bg-surface-100 text-[11px] font-bold text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 text-base font-bold text-ink-900">{item.title}</h3>
                      {item.description ? (
                        <p className="mt-2 text-[13px] leading-7 text-ink-500">{item.description}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === "stats") {
          const items = parsePairs(data.items || "");
          if (items.length === 0) return null;
          return (
            <section key={key} className="band border-y border-line-200 py-14">
              <div className="container">
                {data.title ? <h2 className="mb-8 text-center text-sm font-bold text-accent">{data.title}</h2> : null}
                <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex flex-col-reverse items-center text-center">
                      <dt className="mt-2 text-[13px] text-ink-500">{item.description}</dt>
                      <dd className="text-4xl font-extrabold text-white sm:text-5xl">{item.title}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          );
        }

        if (block.type === "cta") {
          const src = imageSrc(data.image);
          return (
            <section key={key} className="section">
              <div className="container">
                <div className="relative overflow-hidden rounded-card border border-line-200 bg-brand-800 p-8 text-white sm:p-12">
                  {src ? (
                    <>
                      <SiteImage src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 bg-brand-900/80" aria-hidden />
                    </>
                  ) : null}
                  <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                      <h2 className="display-3 text-white">{data.title || "با ما در تماس باشید"}</h2>
                      {data.body ? <p className="mt-3 leading-8 text-brand-100/85">{data.body}</p> : null}
                    </div>
                    {data.ctaLabel && data.ctaHref ? (
                      <Link href={data.ctaHref} className="btn bg-white text-dark-900 hover:bg-brand-100">
                        {data.ctaLabel}
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (block.type === "gallery") {
          const images = parseImageLines(data.images || "").filter((item) => imageSrc(item.src));
          if (images.length === 0) return null;
          const columns =
            data.columns === "2"
              ? "sm:grid-cols-2"
              : data.columns === "4"
                ? "grid-cols-2 lg:grid-cols-4"
                : "grid-cols-2 lg:grid-cols-3";
          return (
            <section key={key} className="section">
              <div className="container">
                {data.title || data.eyebrow ? (
                  <SectionHeading eyebrow={data.eyebrow || undefined} title={data.title || ""} />
                ) : null}
                <div className={`grid gap-4 ${columns}`}>
                  {images.map((image, index) => (
                    <figure key={`${image.src}-${index}`} className="overflow-hidden rounded-card border border-line-200 bg-surface-50">
                      <div className="relative aspect-square">
                        <SiteImage src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                      </div>
                      {image.alt ? (
                        <figcaption className="px-3 py-2 text-[11px] text-ink-500">{image.alt}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === "video") {
          const url = extractEmbedUrl(data.url);
          if (!url) return null;
          return (
            <section key={key} className="section">
              <div className="container">
                {data.title ? <SectionHeading title={data.title} /> : null}
                <div className="relative aspect-video overflow-hidden rounded-card border border-line-200 bg-dark-900">
                  <iframe
                    src={url}
                    title={data.title || "ویدئو"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {data.caption ? <p className="mt-3 text-center text-xs text-ink-500">{data.caption}</p> : null}
              </div>
            </section>
          );
        }

        if (block.type === "spacer") {
          const height = Number(data.height);
          return <div key={key} aria-hidden style={{ height: Number.isFinite(height) ? height : 48 }} />;
        }

        return null;
      })}
    </div>
  );
}
