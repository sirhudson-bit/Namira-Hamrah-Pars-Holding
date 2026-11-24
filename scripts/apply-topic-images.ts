/**
 * Fills empty image columns with the topic photography in public/images/topics.
 *
 * The seed already carries these paths for fresh installs; this script exists
 * for databases created before the photos were added, and only touches rows
 * whose image is still empty so an administrator's own choice is never
 * overwritten. Idempotent: run it as often as you like.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROUPS: Record<string, string> = {
  digital: "/images/topics/digital.webp",
  automotive: "/images/topics/automotive.webp",
  food: "/images/topics/grocery.webp",
  industrial: "/images/topics/industrial.webp",
  trading: "/images/topics/logistics.webp",
};

const STORES: Record<string, string> = {
  "gooshi-plaza": "/images/topics/retail.webp",
  "hamrah-plaza": "/images/topics/warehouse.webp",
  physical: "/images/topics/store.webp",
  corporate: "/images/topics/corporate.webp",
};

const NEWS: Record<string, string> = {
  "namira-labs-launch": "/images/topics/ai.webp",
  "gooshi-plaza-growth": "/images/topics/digital.webp",
  "corporate-supply-agreement": "/images/topics/corporate.webp",
};

const BLOG: Record<string, string> = {
  "how-to-buy-original-phone": "/images/topics/retail.webp",
  "b2b-purchasing-guide": "/images/topics/warehouse.webp",
  "supply-chain-data": "/images/topics/ai.webp",
};

const PAGES: Record<string, string> = {
  about: "/images/topics/team.webp",
  "business-groups": "/images/topics/hq.webp",
  stores: "/images/topics/retail.webp",
  innovation: "/images/topics/ai.webp",
  services: "/images/topics/support.webp",
  units: "/images/topics/industrial.webp",
  media: "/images/topics/corporate.webp",
  careers: "/images/topics/team.webp",
  contact: "/images/topics/hq.webp",
};

async function fill<T extends { slug: string; image: string; imagePosition: string }>(
  rows: T[],
  map: Record<string, string>,
  save: (slug: string, image: string) => Promise<unknown>,
) {
  let changed = 0;
  for (const row of rows) {
    const image = map[row.slug];
    if (!image || row.image) continue;
    await save(row.slug, image);
    changed += 1;
  }
  return changed;
}

async function main() {
  const groups = await fill(
    await prisma.businessGroup.findMany(),
    GROUPS,
    (slug, image) => prisma.businessGroup.update({ where: { slug }, data: { image } }),
  );
  const stores = await fill(
    await prisma.store.findMany(),
    STORES,
    (slug, image) => prisma.store.update({ where: { slug }, data: { image } }),
  );
  const news = await fill(
    await prisma.newsPost.findMany(),
    NEWS,
    (slug, image) => prisma.newsPost.update({ where: { slug }, data: { image } }),
  );
  const blog = await fill(
    await prisma.blogPost.findMany(),
    BLOG,
    (slug, image) => prisma.blogPost.update({ where: { slug }, data: { image } }),
  );
  const pages = await fill(
    await prisma.page.findMany(),
    PAGES,
    (slug, image) => prisma.page.update({ where: { slug }, data: { image } }),
  );

  console.log(`groups ${groups} · stores ${stores} · news ${news} · blog ${blog} · pages ${pages}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
