export type AdminNavChild = {
  label: string;
  href: string;
};

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  /** Secondary screens, shown as a WordPress-style submenu. */
  children?: AdminNavChild[];
};

/**
 * Dashboard navigation, modelled on the WordPress admin menu.
 *
 * Two rules keep it usable:
 *  - one top-level entry per job ("content", "appearance", "settings"), with
 *    the individual screens as submenu links, so the sidebar never grows past
 *    a single column;
 *  - every entry points at a real screen — no dead links and no item whose
 *    label promises a different screen than it opens.
 */
export const ADMIN_NAV: { items: AdminNavItem[] }[] = [
  {
    items: [{ label: "داشبورد", href: "/admin/dashboard", icon: "dashboard" }],
  },
  {
    items: [
      {
        label: "نوشته‌ها",
        href: "/admin/news",
        icon: "posts",
        children: [
          { label: "همه نوشته‌ها", href: "/admin/news" },
          { label: "افزودن خبر", href: "/admin/news?new=1" },
          { label: "مقالات", href: "/admin/blog" },
          { label: "افزودن مقاله", href: "/admin/blog?new=1" },
        ],
      },
      {
        label: "رسانه",
        href: "/admin/media",
        icon: "media",
        children: [
          { label: "کتابخانه", href: "/admin/media" },
          { label: "افزودن رسانه", href: "/admin/media?new=1" },
        ],
      },
      {
        label: "برگه‌ها",
        href: "/admin/pages",
        icon: "pages",
        children: [
          { label: "همه برگه‌ها", href: "/admin/pages" },
          { label: "افزودن برگه", href: "/admin/pages?new=1" },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "نمایش",
        href: "/admin/menus",
        icon: "appearance",
        children: [
          { label: "منوها", href: "/admin/menus" },
          { label: "ابزارک‌ها", href: "/admin/layout" },
          { label: "صفحه اصلی", href: "/admin/home" },
        ],
      },
      {
        label: "محتوای سایت",
        href: "/admin/site-content",
        icon: "content",
        children: [
          { label: "گروه‌های کسب‌وکار", href: "/admin/business-groups" },
          { label: "فروشگاه‌ها", href: "/admin/stores" },
          { label: "فرصت‌های شغلی", href: "/admin/careers" },
          { label: "خدمات", href: "/admin/site-content?type=services" },
          { label: "واحدهای سازمانی", href: "/admin/site-content?type=units" },
          { label: "پروژه‌های نوآوری", href: "/admin/site-content?type=projects" },
          { label: "تیم و تاریخچه", href: "/admin/site-content?type=team" },
        ],
      },
      {
        label: "فرم‌ها",
        href: "/admin/forms",
        icon: "forms",
        children: [
          { label: "پیام‌های تماس", href: "/admin/forms?tab=messages" },
          { label: "درخواست‌های شغلی", href: "/admin/forms?tab=applications" },
          { label: "خبرنامه", href: "/admin/forms?tab=subscribers" },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "تنظیمات",
        href: "/admin/settings",
        icon: "settings",
        children: [
          { label: "عمومی", href: "/admin/settings?tab=general" },
          { label: "تماس و نشانی", href: "/admin/settings?tab=contact" },
          { label: "برند و ظاهر", href: "/admin/settings?tab=branding" },
          { label: "تایپوگرافی", href: "/admin/settings?tab=typography" },
          { label: "سئو و آمار", href: "/admin/settings?tab=seo" },
          { label: "چت‌بات", href: "/admin/settings?tab=chat" },
          { label: "پروفایل و گذرواژه", href: "/admin/settings?tab=general&view=profile" },
        ],
      },
      {
        label: "ابزارها",
        href: "/admin/tools",
        icon: "tools",
        children: [
          { label: "برون‌بری داده‌ها", href: "/admin/tools" },
        ],
      },
    ],
  },
];

/** Flattened list, for matching the active screen without walking the tree. */
export const ADMIN_LINKS: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);
