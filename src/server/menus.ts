import { cache } from "react";
import { prisma } from "@/server/db";
import { FOOTER_NAV, MAIN_NAV, type NavChild, type NavItem } from "@/lib/site";

/**
 * Default menus, used to seed the database the first time the menu editor is
 * opened. The site header/footer always fall back to these when the database
 * has no rows, so an install upgraded from the old hard-coded nav keeps working.
 */
const DEFAULT_HEADER: { label: string; href: string; children?: NavChild[] }[] = MAIN_NAV.map(
  (item) => ({
    label: item.label,
    href: item.href,
    children: item.children,
  }),
);

const DEFAULT_FOOTERS = FOOTER_NAV.map((column, index) => ({
  key: `footer-${index + 1}`,
  title: column.title,
  sortOrder: index,
  items: column.items,
}));

export type FooterColumn = { title: string; items: NavChild[] };
export type MenuWithItems = {
  id: string;
  key: string;
  title: string;
  sortOrder: number;
  items: {
    id: string;
    parentId: string | null;
    label: string;
    href: string;
    description: string;
    sortOrder: number;
    visible: boolean;
    openInNewTab: boolean;
  }[];
};

/** Creates the default header/footer menus when they do not exist yet. */
export async function ensureMenus(): Promise<void> {
  const existing = await prisma.menu.findUnique({ where: { key: "header" }, select: { id: true } });
  if (!existing) {
    const menu = await prisma.menu.create({
      data: { key: "header", title: "منوی اصلی", sortOrder: 0 },
    });
    for (const [index, item] of DEFAULT_HEADER.entries()) {
      const parent = await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          href: item.href,
          sortOrder: index * 10,
        },
      });
      if (item.children) {
        for (const [childIndex, child] of item.children.entries()) {
          await prisma.menuItem.create({
            data: {
              menuId: menu.id,
              parentId: parent.id,
              label: child.label,
              href: child.href,
              description: child.description ?? "",
              sortOrder: childIndex * 10,
            },
          });
        }
      }
    }
  }

  const footerCount = await prisma.menu.count({ where: { key: { startsWith: "footer-" } } });
  if (footerCount === 0) {
    for (const column of DEFAULT_FOOTERS) {
      const menu = await prisma.menu.create({
        data: { key: column.key, title: column.title, sortOrder: column.sortOrder },
      });
      for (const [index, item] of column.items.entries()) {
        await prisma.menuItem.create({
          data: {
            menuId: menu.id,
            label: item.label,
            href: item.href,
            sortOrder: index * 10,
          },
        });
      }
    }
  }
}

function buildHeader(items: MenuWithItems["items"]): NavItem[] {
  const byParent = new Map<string | null, MenuWithItems["items"]>();
  for (const item of items.filter((row) => row.visible)) {
    const key = item.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(item);
    byParent.set(key, list);
  }
  const toChild = (item: MenuWithItems["items"][number]): NavChild => ({
    label: item.label,
    href: item.href,
    ...(item.description ? { description: item.description } : {}),
  });
  return (byParent.get(null) ?? []).map((item) => {
    const children = (byParent.get(item.id) ?? []).map(toChild);
    return {
      label: item.label,
      href: item.href,
      ...(children.length > 0 ? { children } : {}),
    };
  });
}

export const getHeaderNav = cache(async (): Promise<NavItem[]> => {
  const menu = await prisma.menu.findUnique({
    where: { key: "header" },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
  });
  if (!menu) return MAIN_NAV;
  return buildHeader(menu.items);
});

export const getFooterMenus = cache(async (): Promise<FooterColumn[]> => {
  const menus = await prisma.menu.findMany({
    where: { key: { not: "header" } },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    include: { items: { where: { parentId: null }, orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
  });
  if (menus.length === 0) return FOOTER_NAV;
  return menus
    .map((menu) => ({
      title: menu.title,
      items: menu.items.filter((item) => item.visible).map((item) => ({ label: item.label, href: item.href })),
    }))
    .filter((column) => column.items.length > 0);
});

export async function getMenusForAdmin(): Promise<MenuWithItems[]> {
  await ensureMenus();
  return prisma.menu.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    include: { items: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
  });
}
