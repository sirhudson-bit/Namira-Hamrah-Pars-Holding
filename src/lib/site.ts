export type NavChild = { label: string; href: string; description?: string };
export type NavItem = {
  label: string;
  /** Shorter label for the desktop bar, where horizontal space is tight. */
  shortLabel?: string;
  href: string;
  children?: NavChild[];
};

export const MAIN_NAV: NavItem[] = [
  { label: "صفحه اصلی", href: "/" },
  { label: "درباره نامیرا", shortLabel: "درباره", href: "/about" },
  {
    label: "گروه‌های کسب‌وکار",
    shortLabel: "گروه‌ها",
    href: "/business-groups",
    children: [
      { label: "نمای کلی", href: "/business-groups", description: "پنج گروه تخصصی زیر یک هلدینگ" },
      { label: "گروه دیجیتال", href: "/business-groups/digital", description: "تجهیزات و خرده‌فروشی دیجیتال" },
      { label: "گروه خودرو", href: "/business-groups/automotive", description: "قطعات و خدمات خودرو" },
      { label: "گروه غذایی", href: "/business-groups/food", description: "تولید و توزیع مواد غذایی" },
      { label: "گروه صنعتی", href: "/business-groups/industrial", description: "تأمین و تجهیزات صنعتی" },
    ],
  },
  {
    label: "فروشگاه‌ها",
    href: "/stores",
    children: [
      { label: "همه فروشگاه‌ها", href: "/stores", description: "کانال‌های فروش نامیرا" },
      { label: "گوشی پلازا", href: "/stores/gooshi-plaza", description: "فروش آنلاین به مصرف‌کننده" },
      { label: "همراه پلازا", href: "/stores/hamrah-plaza", description: "فروش عمده و سازمانی" },
      { label: "فروشگاه حضوری", href: "/stores/physical", description: "تجربه خرید حضوری" },
      { label: "فروش سازمانی", href: "/stores/corporate", description: "تأمین سازمان‌ها و شرکت‌ها" },
    ],
  },
  { label: "نوآوری و هوش مصنوعی", shortLabel: "نوآوری", href: "/innovation" },
  {
    label: "خدمات",
    href: "/services",
    children: [
      { label: "همه خدمات", href: "/services", description: "خدمات پس از فروش نامیرا" },
      { label: "گارانتی", href: "/services#warranty", description: "شرایط و پوشش گارانتی" },
      { label: "پیگیری سفارش", href: "/services#tracking", description: "وضعیت سفارش خود را ببینید" },
      { label: "پشتیبانی", href: "/services#support", description: "راه‌های ارتباط با پشتیبانی" },
    ],
  },
  {
    label: "رسانه",
    href: "/media",
    children: [
      { label: "اخبار", href: "/media/news", description: "آخرین رویدادهای نامیرا" },
      { label: "مقالات", href: "/media/blog", description: "تحلیل و دیدگاه تخصصی" },
      { label: "گالری", href: "/media#gallery", description: "تصاویر رویدادها" },
      { label: "ویدئوها", href: "/media#videos", description: "ویدئوهای معرفی" },
    ],
  },
  { label: "تماس", href: "/contact" },
];

export const FOOTER_NAV: { title: string; items: NavChild[] }[] = [
  {
    title: "هلدینگ",
    items: [
      { label: "درباره نامیرا", href: "/about" },
      { label: "گروه‌های کسب‌وکار", href: "/business-groups" },
      { label: "واحدهای سازمانی", href: "/units" },
      { label: "فرصت‌های شغلی", href: "/careers" },
    ],
  },
  {
    title: "فروشگاه‌ها",
    items: [
      { label: "گوشی پلازا", href: "/stores/gooshi-plaza" },
      { label: "همراه پلازا", href: "/stores/hamrah-plaza" },
      { label: "فروشگاه حضوری", href: "/stores/physical" },
      { label: "فروش سازمانی", href: "/stores/corporate" },
    ],
  },
  {
    title: "خدمات",
    items: [
      { label: "خدمات پس از فروش", href: "/services" },
      { label: "نوآوری و هوش مصنوعی", href: "/innovation" },
      { label: "رسانه", href: "/media" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
  {
    title: "قوانین",
    items: [
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "سیاست کوکی", href: "/cookie-policy" },
      { label: "شرایط بازگشت پول", href: "/refund-policy" },
    ],
  },
];

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
