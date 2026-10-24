import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  getBusinessGroups,
  getStores,
  getNews,
  getBlogPosts,
} from "@/server/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/business-groups",
    "/stores",
    "/innovation",
    "/services",
    "/units",
    "/media",
    "/media/news",
    "/media/blog",
    "/contact",
    "/careers",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/refund-policy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [groups, stores, news, posts] = await Promise.all([
      getBusinessGroups(),
      getStores(),
      getNews(),
      getBlogPosts(),
    ]);

    return [
      ...staticRoutes,
      ...groups.map((g) => ({
        url: `${SITE_URL}/business-groups/${g.slug}`,
        lastModified: g.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...stores.map((s) => ({
        url: `${SITE_URL}/stores/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...news.map((n) => ({
        url: `${SITE_URL}/media/news/${n.slug}`,
        lastModified: n.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...posts.map((p) => ({
        url: `${SITE_URL}/media/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
