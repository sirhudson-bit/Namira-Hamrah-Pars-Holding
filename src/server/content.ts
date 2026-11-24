import { cache } from "react";
import { prisma } from "@/server/db";
import { getLocale } from "@/server/locale";
import { localizeRow, localizeRows, translateLong } from "@/server/translate";

/**
 * Read helpers used by the public site. Each returns already-published rows so
 * a draft can never leak into a public page, and — when the visitor is not on
 * the Persian locale — the text columns are translated on the way out.
 *
 * Every reader is wrapped in React.cache(): within one request the same query
 * is often asked for twice — `generateMetadata` and the page body both load the
 * record behind a `[slug]` route, and the layout and page both need settings —
 * and without deduplication each of those is a second identical round trip.
 * Cache keys are the primitive arguments, so keep them primitives.
 */

export const getBusinessGroups = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.businessGroup.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["name", "tagline", "description", "highlights", "imageAlt", "ctaLabel"], locale);
});

export const getBusinessGroup = cache(async (slug: string) => {
  const locale = await getLocale();
  const row = await prisma.businessGroup.findFirst({ where: { slug, published: true } });
  return localizeRow(row, ["name", "tagline", "description", "highlights", "imageAlt", "ctaLabel"], locale);
});

export const getStores = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.store.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["name", "description", "address"], locale);
});

export const getStore = cache(async (slug: string) => {
  const locale = await getLocale();
  const row = await prisma.store.findFirst({ where: { slug, published: true } });
  return localizeRow(row, ["name", "description", "address"], locale);
});

export const getServices = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.serviceItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["title", "description"], locale);
});

export const getOrgUnits = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.orgUnit.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["name", "description"], locale);
});

export const getInnovationProjects = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.innovationProject.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["title", "description", "status"], locale);
});

export const getNews = cache(async (limit?: number) => {
  const locale = await getLocale();
  const rows = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return localizeRows(rows, ["title", "excerpt", "category"], locale);
});

export const getNewsPost = cache(async (slug: string) => {
  const locale = await getLocale();
  const row = await prisma.newsPost.findFirst({ where: { slug, published: true } });
  if (!row) return null;
  const [localized] = await localizeRows([row], ["title", "excerpt", "category"], locale);
  return { ...localized, body: await translateLong(row.body, locale) };
});

export const getBlogPosts = cache(async (limit?: number) => {
  const locale = await getLocale();
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return localizeRows(rows, ["title", "excerpt", "category", "author"], locale);
});

export const getBlogPost = cache(async (slug: string) => {
  const locale = await getLocale();
  const row = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  if (!row) return null;
  const [localized] = await localizeRows([row], ["title", "excerpt", "category", "author"], locale);
  return { ...localized, body: await translateLong(row.body, locale) };
});

export const getJobOpenings = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.jobOpening.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["title", "department", "location", "type", "description", "requirements"], locale);
});

export const getTeam = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return localizeRows(rows, ["role", "bio"], locale);
});

export const getMilestones = cache(async () => {
  const locale = await getLocale();
  const rows = await prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } });
  return localizeRows(rows, ["title", "description"], locale);
});

export const getPage = cache(async (slug: string) => {
  const locale = await getLocale();
  const row = await prisma.page.findFirst({ where: { slug, published: true } });
  if (!row) return null;
  const [localized] = await localizeRows([row], ["title", "eyebrow", "subtitle", "seoTitle", "seoDesc"], locale);
  return { ...localized, body: await translateLong(row.body, locale) };
});

/**
 * Hero copy for a route. Unpublishing a Page row (or deleting it) falls the page
 * back to its built-in copy rather than blanking the hero.
 */
export const getPageCopy = cache(async (slug: string) => {
  const locale = await getLocale();
  const page = await prisma.page.findFirst({ where: { slug, published: true } });
  if (!page) return null;
  const [copy] = await localizeRows(
    [page],
    ["eyebrow", "title", "subtitle", "seoTitle", "seoDesc"],
    locale,
  );
  return {
    eyebrow: copy.eyebrow,
    title: copy.title,
    description: copy.subtitle,
    body: await translateLong(page.body, locale),
    image: page.image,
    imagePosition: page.imagePosition,
    seoTitle: copy.seoTitle,
    seoDesc: copy.seoDesc,
  };
});
