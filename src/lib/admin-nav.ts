export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
};

export const ADMIN_NAV: { section: string; items: AdminNavItem[] }[] = [
  {
    section: "نمای کلی",
    items: [{ label: "داشبورد", href: "/admin/dashboard", icon: "dashboard" }],
  },
  {
    section: "مدیریت محتوا",
    items: [
      { label: "صفحه اصلی", href: "/admin/home", icon: "home" },
      { label: "صفحات", href: "/admin/pages", icon: "pages" },
      { label: "چیدمان صفحات", href: "/admin/layout", icon: "layout" },
      { label: "گروه‌های کسب‌وکار", href: "/admin/business-groups", icon: "groups" },
      { label: "فروشگاه‌ها", href: "/admin/stores", icon: "stores" },
      { label: "اخبار", href: "/admin/news", icon: "news" },
      { label: "مقالات", href: "/admin/blog", icon: "blog" },
      { label: "موقعیت‌های شغلی", href: "/admin/careers", icon: "careers" },
    ],
  },
  {
    section: "مخاطبان",
    items: [
      { label: "پیام‌ها و فرم‌ها", href: "/admin/forms", icon: "forms" },
      { label: "رسانه", href: "/admin/media", icon: "media" },
    ],
  },
  {
    section: "سیستم",
    items: [{ label: "تنظیمات", href: "/admin/settings", icon: "settings" }],
  },
];
