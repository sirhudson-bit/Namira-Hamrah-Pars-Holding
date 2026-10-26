import { cache } from "react";
import { prisma } from "@/server/db";

/**
 * Read helpers used by the public site. Each returns already-published rows so
 * a draft can never leak into a public page.
 *
 * Every reader is wrapped in React.cache(): within one request the same query
 * is often asked for twice — `generateMetadata` and the page body both load the
 * record behind a `[slug]` route, and the layout and page both need settings —
 * and without deduplication each of those is a second identical round trip.
 * Cache keys are the primitive arguments, so keep them primitives.
 */

export const getBusinessGroups = cache(async () =>
  prisma.businessGroup.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getBusinessGroup = cache(async (slug: string) =>
  prisma.businessGroup.findFirst({ where: { slug, published: true } }),
);

export const getStores = cache(async () =>
  prisma.store.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getStore = cache(async (slug: string) =>
  prisma.store.findFirst({ where: { slug, published: true } }),
);

export const getServices = cache(async () =>
  prisma.serviceItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getOrgUnits = cache(async () =>
  prisma.orgUnit.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getInnovationProjects = cache(async () =>
  prisma.innovationProject.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getNews = cache(async (limit?: number) =>
  prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  }),
);

export const getNewsPost = cache(async (slug: string) =>
  prisma.newsPost.findFirst({ where: { slug, published: true } }),
);

export const getBlogPosts = cache(async (limit?: number) =>
  prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  }),
);

export const getBlogPost = cache(async (slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, published: true } }),
);

export const getJobOpenings = cache(async () =>
  prisma.jobOpening.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getTeam = cache(async () =>
  prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export const getMilestones = cache(async () =>
  prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
);

export const getPage = cache(async (slug: string) =>
  prisma.page.findFirst({ where: { slug, published: true } }),
);

/**
 * Hero copy for a route. Unpublishing a Page row (or deleting it) falls the page
 * back to its built-in copy rather than blanking the hero.
 */
export const getPageCopy = cache(async (slug: string) => {
  const page = await prisma.page.findFirst({ where: { slug, published: true } });
  if (!page) return null;
  return {
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.subtitle,
    body: page.body,
    image: page.image,
    seoTitle: page.seoTitle,
    seoDesc: page.seoDesc,
  };
});
