import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@namiragroup.ir";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "NamiraAdmin!2026";

const settings: { key: string; value: string; group: string }[] = [
  { key: "site_name", value: "هلدینگ نامیرا همراه پارس", group: "general" },
  { key: "legal_name", value: "گروه بازرگانی نامیرا همراه پارس", group: "general" },
  { key: "registration_number", value: "۵۸۹۲۴۱", group: "general" },
  { key: "national_id", value: "۱۴۰۰۷۸۹۲۴۱۵", group: "general" },
  { key: "address", value: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نامیرا، طبقه ۱۰", group: "contact" },
  { key: "phone", value: "۰۲۱-۹۱۰۰۸۸۰۰", group: "contact" },
  { key: "mobile", value: "۰۹۱۲-۴۴۵-۸۸۰۰", group: "contact" },
  { key: "email", value: "info@namiragroup.ir", group: "contact" },
  { key: "hours", value: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر", group: "contact" },
  { key: "map_embed", value: "", group: "contact" },
  { key: "instagram", value: "https://instagram.com/namiraholding", group: "social" },
  { key: "linkedin", value: "https://linkedin.com/company/namira-holding", group: "social" },
  { key: "telegram", value: "https://t.me/namiraholding", group: "social" },
  {
    key: "seo_title",
    value: "هلدینگ نامیرا همراه پارس | گروه‌های کسب‌وکار، فروشگاه‌ها و نوآوری",
    group: "seo",
  },
  {
    key: "seo_description",
    value:
      "نامیرا همراه پارس هلدینگی چند‌گروهی در حوزه‌های دیجیتال، خودرو، غذا، صنعت و بازرگانی است؛ با فروشگاه‌های آنلاین و حضوری و واحد نوآوری نامیرا لبز.",
    group: "seo",
  },
  { key: "analytics_enabled", value: "false", group: "privacy" },
  { key: "ga_id", value: "", group: "privacy" },
  { key: "logo_path", value: "", group: "branding" },
  { key: "logo_light_path", value: "", group: "branding" },
  { key: "favicon_path", value: "", group: "branding" },
  { key: "logo_height", value: "44", group: "branding" },
  { key: "video_embed", value: "", group: "integration" },
  /* Home hero widget (/admin/home) */
  { key: "hero_enabled", value: "true", group: "hero" },
  { key: "hero_eyebrow", value: "هلدینگ چند‌گروهی", group: "hero" },
  {
    key: "hero_title",
    value: "گروهی که در هر بازار، یک زنجیره کامل می‌سازد",
    group: "hero",
  },
  {
    key: "hero_lead",
    value:
      "نامیرا همراه پارس با پنج گروه کسب‌وکار و کانال‌های فروش آنلاین و حضوری، از تأمین کالا تا خدمات پس از فروش را یکپارچه مدیریت می‌کند.",
    group: "hero",
  },
  { key: "hero_cta_label", value: "گروه‌های کسب‌وکار", group: "hero" },
  { key: "hero_cta_href", value: "/business-groups", group: "hero" },
  { key: "hero_video_label", value: "ویدئوی معرفی", group: "hero" },
  {
    key: "hero_stats",
    value: "14|سال تجربه\n5|گروه کسب‌وکار\n4|کانال فروش\n300+|همکار سازمانی",
    group: "hero",
  },
];

const businessGroups = [
  {
    slug: "digital",
    name: "گروه دیجیتال",
    tagline: "خرده‌فروشی و توزیع تجهیزات دیجیتال",
    description:
      "محور اصلی فعالیت نامیرا؛ تأمین، توزیع و خرده‌فروشی گوشی همراه، تبلت و لوازم جانبی دیجیتال از برندهای معتبر جهانی.",
    icon: "Smartphone",
    color: "#0F7C71",
    highlights:
      "تأمین مستقیم از نمایندگی‌های رسمی\nفروش آنلاین به مصرف‌کننده و فروش عمده\nخدمات گارانتی و تعمیرات تخصصی\nتنوع گسترده کالا در ۱۲ دسته‌بندی",
    sortOrder: 1,
  },
  {
    slug: "automotive",
    name: "گروه خودرو",
    tagline: "قطعات، لوازم و خدمات خودرو",
    description:
      "تأمین و توزیع قطعات یدکی، لوازم جانبی و تجهیزات خودرو با تمرکز بر اصالت کالا و شبکه توزیع سراسری.",
    icon: "Car",
    color: "#17998B",
    highlights:
      "قطعات اصلی و با گارانتی\nشبکه توزیع استانی\nپشتیبانی فنی برای نمایندگان\nکنترل کیفیت پیش از عرضه",
    sortOrder: 2,
  },
  {
    slug: "food",
    name: "گروه غذایی",
    tagline: "تولید و توزیع مواد غذایی",
    description:
      "تأمین و توزیع محصولات غذایی بادوام و آشامیدنی، با رعایت زنجیره سرد و استانداردهای بهداشتی.",
    icon: "UtensilsCrossed",
    color: "#26B5A6",
    highlights:
      "زنجیره تأمین سرد و انبار استاندارد\nرعایت استانداردهای بهداشتی\nتوزیع در فروشگاه‌های زنجیره‌ای\nبسته‌بندی و برندسازی اختصاصی",
    sortOrder: 3,
  },
  {
    slug: "industrial",
    name: "گروه صنعتی",
    tagline: "تأمین تجهیزات و مواد صنعتی",
    description:
      "تأمین ابزار، تجهیزات و مواد مصرفی صنعتی برای واحدهای تولیدی و پیمانکاران، با تمرکز بر تأمین پایدار.",
    icon: "Factory",
    color: "#6FD8CB",
    highlights:
      "تأمین پایدار برای خطوط تولید\nقراردادهای بلندمدت تأمین\nمشاوره فنی و انتخاب تجهیزات\nانبارش قطعات پرمصرف",
    sortOrder: 4,
  },
  {
    slug: "trading",
    name: "گروه بازرگانی",
    tagline: "واردات، صادرات و تأمین بین‌الملل",
    description:
      "بازوی بازرگانی هلدینگ برای واردات کالا، مذاکره با تأمین‌کنندگان خارجی و مدیریت فرآیندهای گمرکی و لجستیک.",
    icon: "Truck",
    color: "#0B5F57",
    highlights:
      "مذاکره و قرارداد با تأمین‌کنندگان خارجی\nمدیریت اسناد و تشریفات گمرکی\nلجستیک بین‌الملل و انبارش\nکنترل ریسک و اعتبارسنجی تأمین‌کننده",
    sortOrder: 5,
  },
];

const stores = [
  {
    slug: "gooshi-plaza",
    name: "گوشی پلازا",
    kind: "B2C",
    description:
      "فروشگاه آنلاین مصرف‌کننده برای خرید گوشی، تبلت و لوازم جانبی با ضمانت اصالت کالا و ارسال سریع.",
    url: "https://gooshiplaza.com",
    email: "support@gooshiplaza.com",
    sortOrder: 1,
  },
  {
    slug: "hamrah-plaza",
    name: "همراه پلازا",
    kind: "B2B",
    description:
      "پلتفرم فروش عمده و تأمین برای فروشندگان، کسب‌وکارها و همکاران تجاری با شرایط ویژه خرید عمده.",
    url: "https://hamrahplaza.com",
    email: "support@hamrahplaza.com",
    sortOrder: 2,
  },
  {
    slug: "physical",
    name: "فروشگاه حضوری",
    kind: "PHYSICAL",
    description:
      "تجربه خرید حضوری با امکان مشاهده و آزمایش کالا، مشاوره تخصصی و تحویل فوری.",
    address: "تهران، خیابان ولیعصر، پاساژ نامیرا، طبقه همکف",
    phone: "۰۲۱-۹۱۰۰۸۸۰۱",
    sortOrder: 3,
  },
  {
    slug: "corporate",
    name: "فروش سازمانی",
    kind: "CORPORATE",
    description:
      "تأمین تجهیزات و کالا برای سازمان‌ها، شرکت‌ها و نهادها با صدور فاکتور رسمی و قراردادهای خدماتی.",
    email: "corporate@namiragroup.ir",
    phone: "۰۲۱-۹۱۰۰۸۸۰۲",
    sortOrder: 4,
  },
];

const services = [
  {
    slug: "after-sales",
    title: "خدمات پس از فروش",
    description:
      "پشتیبانی کامل پس از خرید؛ از پذیرش درخواست تا پیگیری تا حصول نتیجه، در کانال‌های تلفنی و آنلاین.",
    icon: "Headset",
    sortOrder: 1,
  },
  {
    slug: "warranty",
    title: "گارانتی و ضمانت اصالت",
    description:
      "همه کالاها با ضمانت اصالت و گارانتی معتبر عرضه می‌شوند؛ فرآیند ثبت و پیگیری گارانتی شفاف و سریع است.",
    icon: "ShieldCheck",
    sortOrder: 2,
  },
  {
    slug: "order-tracking",
    title: "پیگیری سفارش",
    description:
      "وضعیت سفارش خود را از طریق کد رهگیری در سایت فروشگاه مربوطه پیگیری کنید؛ به‌روزرسانی وضعیت در هر مرحله.",
    icon: "Package",
    sortOrder: 3,
  },
  {
    slug: "support",
    title: "پشتیبانی مشتریان",
    description:
      "پاسخ به پرسش‌های فنی و خرید از طریق تلفن، ایمیل و فرم تماس؛ با هدف پاسخ‌دهی سریع و دقیق.",
    icon: "MessageCircle",
    sortOrder: 4,
  },
];

const orgUnits = [
  { slug: "offline", name: "فروش آفلاین", kind: "offline", description: "مدیریت فروشگاه‌های حضوری و شبکه توزیع فیزیکی.", sortOrder: 1 },
  { slug: "online", name: "فروش آنلاین", kind: "online", description: "اداره فروشگاه‌های اینترنتی و کانال‌های دیجیتال فروش.", sortOrder: 2 },
  { slug: "commercial", name: "بازرگانی", kind: "commercial", description: "تأمین، مذاکره با تأمین‌کنندگان و مدیریت قراردادها.", sortOrder: 3 },
  { slug: "finance", name: "حسابداری و انبارداری", kind: "finance", description: "مدیریت مالی، انبارش و کنترل موجودی.", sortOrder: 4 },
  { slug: "hr", name: "منابع انسانی", kind: "hr", description: "جذب، آموزش و توسعه سرمایه انسانی.", sortOrder: 5 },
  { slug: "marketing", name: "بازاریابی", kind: "marketing", description: "برندسازی، تبلیغات و تحلیل بازار.", sortOrder: 6 },
  { slug: "support", name: "پشتیبانی", kind: "support", description: "خدمات پس از فروش و پاسخ‌گویی به مشتریان.", sortOrder: 7 },
];

const news = [
  {
    slug: "namira-labs-launch",
    title: "افتتاح رسمی واحد نوآوری «نامیرا لبز»",
    excerpt:
      "واحد نوآوری و هوش مصنوعی هلدینگ با هدف بهینه‌سازی زنجیره تأمین و تجربه مشتری آغاز به کار کرد.",
    category: "هلدینگ",
    body:
      "## آغاز مسیر نوآوری\n\nواحد «نامیرا لبز» به‌عنوان بازوی فناورانه هلدینگ افتتاح شد. تمرکز این واحد بر تحلیل داده‌های فروش، پیش‌بینی تقاضا و ساخت ابزارهای کمکی برای تیم پشتیبانی است.\n\n- تحلیل داده فروش و پیش‌بینی تقاضا\n- دستیار پاسخ‌گویی به مشتریان\n- بهینه‌سازی موجودی و انبارش\n\nدر فاز نخست، خروجی این واحد در دو گروه دیجیتال و خودرو به‌صورت آزمایشی به کار گرفته می‌شود.",
    published: true,
    publishedAt: new Date("2025-07-12"),
  },
  {
    slug: "gooshi-plaza-growth",
    title: "رشد سهم فروش آنلاین گروه دیجیتال",
    excerpt:
      "با توسعه کانال‌های فروش آنلاین، سهم فروش اینترنتی گروه دیجیتال در نیمه نخست سال افزایش یافت.",
    category: "فروش",
    body:
      "## فروش آنلاین در مسیر رشد\n\nراهبرد هلدینگ بر تقویت کانال‌های فروش آنلاین متمرکز شده است. در این دوره، تجربه کاربری سایت فروشگاه، سرعت ارسال و پوشش خدمات پس از فروش بهبود یافت.\n\n- بهبود فرآیند ثبت سفارش\n- گسترش پوشش ارسال\n- تقویت پاسخ‌گویی پشتیبانی",
    published: true,
    publishedAt: new Date("2025-06-02"),
  },
  {
    slug: "corporate-supply-agreement",
    title: "قرارداد تأمین سازمانی با مجموعه‌ای از شرکت‌ها",
    excerpt:
      "واحد فروش سازمانی نامیرا، تأمین تجهیزات دیجیتال تعدادی از شرکت‌های همکار را بر عهده گرفت.",
    category: "همکاری",
    body:
      "## تأمین سازمانی\n\nواحد فروش سازمانی ضمن عقد قرارداد با چند مجموعه، تأمین تجهیزات و کالاهای مصرفی آن‌ها را بر عهده گرفت. این همکاری شامل تأمین مستمر، فاکتور رسمی و پشتیبانی اختصاصی است.",
    published: true,
    publishedAt: new Date("2025-04-20"),
  },
];

const blogPosts = [
  {
    slug: "how-to-buy-original-phone",
    title: "چگونه گوشی اصل را از نمونه غیراصل تشخیص دهیم؟",
    excerpt:
      "چند نشانه ساده که پیش از خرید گوشی همراه، به شما کمک می‌کند اصالت کالا را بررسی کنید.",
    category: "راهنمای خرید",
    author: "تیم محتوای نامیرا",
    body:
      "## بررسی اصالت کالا\n\nپیش از خرید، این موارد را بررسی کنید:\n\n1. جعبه و لوازم همراه اصیل\n2. کد رهگیری گارانتی\n3. تطابق سریال دستگاه با جعبه\n4. فاکتور رسمی فروشنده\n\nخرید از فروشگاه‌های دارای ضمانت اصالت، ریسک خرید کالای غیراصل را به‌شدت کاهش می‌دهد.",
    published: true,
    publishedAt: new Date("2025-05-18"),
  },
  {
    slug: "b2b-purchasing-guide",
    title: "راهنمای خرید عمده برای کسب‌وکارها",
    excerpt:
      "اگر فروشنده یا کسب‌وکار هستید، این نکات به شما کمک می‌کند خرید عمده بهینه‌تری داشته باشید.",
    category: "کسب‌وکار",
    author: "واحد بازرگانی",
    body:
      "## خرید عمده هوشمند\n\n- برنامه‌ریزی بر پایه تقاضای فصلی\n- توجه به حداقل سفارش و شرایط اعتباری\n- بررسی زمان تأمین و موجودی\n- انتخاب تأمین‌کننده با پشتیبانی پس از فروش",
    published: true,
    publishedAt: new Date("2025-03-09"),
  },
  {
    slug: "supply-chain-data",
    title: "چرا داده، ستون فقرات زنجیره تأمین مدرن است؟",
    excerpt:
      "نگاهی به نقش داده در پیش‌بینی تقاضا و کاهش هزینه‌های انبارش در کسب‌وکارهای توزیعی.",
    category: "تحلیل",
    author: "نامیرا لبز",
    body:
      "## داده در زنجیره تأمین\n\nداده‌های فروش، الگوی تقاضا را آشکار می‌کنند. با تحلیل این داده‌ها می‌توان موجودی را بهینه کرد، از مازاد انبار کاست و زمان تأمین را کوتاه‌تر کرد.\n\n> تصمیم درست، تصمیمی است که بر داده واقعی استوار باشد.",
    published: true,
    publishedAt: new Date("2025-02-14"),
  },
];

const jobs = [
  {
    slug: "frontend-developer",
    title: "توسعه‌دهنده فرانت‌اند",
    department: "واحد فناوری",
    location: "تهران",
    type: "تمام‌وقت",
    description:
      "برای توسعه رابط‌های کاربری فروشگاه‌های آنلاین هلدینگ، به دنبال توسعه‌دهنده فرانت‌اند با تسلط بر React و Next.js هستیم.",
    requirements:
      "تسلط بر JavaScript و TypeScript\nآشنایی با React و Next.js\nدرک طراحی واکنش‌گرا و RTL\nآشنایی با Git",
    sortOrder: 1,
  },
  {
    slug: "sales-expert",
    title: "کارشناس فروش آنلاین",
    department: "واحد فروش آنلاین",
    location: "تهران",
    type: "تمام‌وقت",
    description:
      "پیگیری سفارش‌ها، پاسخ‌گویی به مشتریان و هماهنگی فروش در کانال‌های آنلاین.",
    requirements:
      "آشنایی با فروش آنلاین\nمهارت ارتباطی مناسب\nتسلط بر ابزارهای اداری\nآشنایی با CRM (مزیت)",
    sortOrder: 2,
  },
  {
    slug: "warehouse-supervisor",
    title: "سرپرست انبار",
    department: "حسابداری و انبارداری",
    location: "تهران",
    type: "تمام‌وقت",
    description: "مدیریت انبار، کنترل موجودی و هماهنگی ورود و خروج کالا.",
    requirements:
      "تجربه کار در انبار\nآشنایی با سیستم‌های انبارداری\nدقت و نظم بالا\nتوانایی کار تیمی",
    sortOrder: 3,
  },
  {
    slug: "content-specialist",
    title: "کارشناس محتوا و رسانه",
    department: "واحد بازاریابی",
    location: "تهران",
    type: "پاره‌وقت",
    description: "تولید محتوای متنی و بصری برای سایت، شبکه‌های اجتماعی و کمپین‌ها.",
    requirements:
      "مهارت نگارش فارسی\nآشنایی با سئو مقدماتی\nتجربه تولید محتوا\nخلاقیت و نظم",
    sortOrder: 4,
  },
];

const innovationProjects = [
  { slug: "demand-forecast", title: "پیش‌بینی تقاضا", description: "مدل تحلیلی برای تخمین تقاضای هر کالا بر پایه تاریخ فروش.", status: "فاز آزمایشی", sortOrder: 1 },
  { slug: "support-assistant", title: "دستیار پشتیبانی", description: "ابزار کمکی برای پاسخ سریع‌تر به پرسش‌های پرتکرار مشتریان.", status: "در حال توسعه", sortOrder: 2 },
  { slug: "inventory-optimizer", title: "بهینه‌ساز موجودی", description: "سیستم پیشنهاد نقطه سفارش برای کاهش مازاد و کمبود موجودی.", status: "مطالعه", sortOrder: 3 },
  { slug: "price-intelligence", title: "هوش قیمت بازار", description: "پایش قیمت رقبا برای تصمیم‌گیری آگاهانه در قیمت‌گذاری.", status: "فاز آزمایشی", sortOrder: 4 },
];

const team = [
  { name: "مدیرعامل", role: "مدیرعامل هلدینگ", bio: "با بیش از دو دهه تجربه در حوزه بازرگانی و خرده‌فروشی دیجیتال.", sortOrder: 1 },
  { name: "معاونت بازرگانی", role: "معاون بازرگانی و تأمین", bio: "مسئول زنجیره تأمین و قراردادهای بین‌الملل هلدینگ.", sortOrder: 2 },
  { name: "مدیر عملیات", role: "مدیر عملیات و فروش", bio: "راهبری کانال‌های فروش آنلاین، حضوری و سازمانی.", sortOrder: 3 },
  { name: "مدیر فناوری", role: "مدیر فناوری و نوآوری", bio: "راهبری نامیرا لبز و زیرساخت داده‌های هلدینگ.", sortOrder: 4 },
];

const milestones = [
  { year: "۱۳۹۰", title: "آغاز فعالیت", description: "شروع فعالیت در حوزه بازرگانی و توزیع لوازم دیجیتال.", sortOrder: 1 },
  { year: "۱۳۹۴", title: "راه‌اندازی فروشگاه آنلاین", description: "ورود رسمی به فروش اینترنتی و توسعه کانال دیجیتال.", sortOrder: 2 },
  { year: "۱۳۹۷", title: "گسترش گروه‌های کسب‌وکار", description: "افزودن گروه‌های خودرو، غذایی و صنعتی به مجموعه.", sortOrder: 3 },
  { year: "۱۴۰۰", title: "تأسیس فروش سازمانی", description: "آغاز همکاری با سازمان‌ها و شرکت‌های بزرگ.", sortOrder: 4 },
  { year: "۱۴۰۲", title: "راه‌اندازی نامیرا لبز", description: "تأسیس واحد نوآوری و هوش مصنوعی هلدینگ.", sortOrder: 5 },
  { year: "۱۴۰۴", title: "بازار چند‌کاناله", description: "توسعه همزمان کانال‌های آنلاین، حضوری و سازمانی.", sortOrder: 6 },
];

/**
 * Editable hero copy for every top-level public page. Each entry mirrors that
 * page's built-in fallback, so a fresh install looks identical — the difference
 * is that all of it can now be changed from /admin/pages.
 */
const sitePages = [
  {
    slug: "about",
    eyebrow: "درباره نامیرا",
    title: "درباره نامیرا همراه پارس",
    subtitle: "هویت، تاریخچه و مسیر رشد هلدینگ.",
  },
  {
    slug: "business-groups",
    eyebrow: "گروه‌های کسب‌وکار",
    title: "پنج گروه تخصصی، یک هلدینگ",
    subtitle:
      "هر گروه با تیم، زنجیره تأمین و کانال فروش مستقل خود اداره می‌شود و از زیرساخت مشترک هلدینگ بهره می‌برد.",
  },
  {
    slug: "stores",
    eyebrow: "فروشگاه‌ها",
    title: "کانال‌های فروش نامیرا",
    subtitle: "از خرید تک‌عددی آنلاین تا تأمین عمده سازمانی؛ هر کانال با خدمات اختصاصی خود.",
  },
  {
    slug: "innovation",
    eyebrow: "نامیرا لبز",
    title: "نوآوری و هوش مصنوعی",
    subtitle:
      "بازوی فناورانه هلدینگ؛ جایی که داده‌های فروش به تصمیم، و ایده‌های محصول به سرویس تبدیل می‌شوند.",
  },
  {
    slug: "services",
    eyebrow: "خدمات",
    title: "پشتیبانی در تمام مسیر خرید",
    subtitle:
      "از ضمانت اصالت کالا تا پیگیری سفارش و پاسخ‌گویی پس از فروش؛ خدمات نامیرا پس از پرداخت تمام نمی‌شود.",
  },
  {
    slug: "units",
    eyebrow: "واحدهای سازمانی",
    title: "ساختاری که پشت هر سفارش کار می‌کند",
    subtitle:
      "واحدهای عملیاتی، بازرگانی و پشتیبان هلدینگ به‌صورت یکپارچه با گروه‌های کسب‌وکار همکاری می‌کنند.",
  },
  {
    slug: "media",
    eyebrow: "رسانه",
    title: "اخبار و رسانه نامیرا",
    subtitle: "رویدادها، همکاری‌ها، تحلیل‌ها و محتوای تخصصی هلدینگ.",
  },
  {
    slug: "contact",
    eyebrow: "تماس",
    title: "با ما در تماس باشید",
    subtitle: "پرسش، پیشنهاد همکاری یا درخواست پشتیبانی خود را از این صفحه ارسال کنید.",
  },
  {
    slug: "careers",
    eyebrow: "فرصت‌های شغلی",
    title: "به تیم نامیرا بپیوندید",
    subtitle: "ما به دنبال افرادی هستیم که به کیفیت، یادگیری و کار تیمی اهمیت می‌دهند.",
  },
];

const legalPages = [
  {
    slug: "privacy",
    title: "حریم خصوصی",
    subtitle: "چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.",
    seoDesc: "سیاست حریم خصوصی هلدینگ نامیرا همراه پارس؛ اطلاعات جمع‌آوری شده، نحوه استفاده و حقوق شما.",
    body: `## اطلاعاتی که جمع‌آوری می‌کنیم

### اطلاعات شخصی
- نام و نام خانوادگی (در صورت ارسال فرم تماس)
- شماره تماس (در صورت ارسال فرم تماس)
- ایمیل (در صورت ارسال فرم تماس یا عضویت در خبرنامه)
- رزومه (در صورت ارسال فرم استخدام)

### اطلاعات فنی
- آدرس IP
- نوع مرورگر و سیستم عامل
- صفحات بازدید شده
- زمان بازدید
- آدرس ارجاع‌دهنده (Referrer)

## نحوه استفاده از اطلاعات
- پاسخ‌گویی به درخواست‌های شما
- بهبود تجربه کاربری سایت
- ارسال خبرنامه (فقط در صورت عضویت)
- تحلیل ترافیک سایت

## اشتراک‌گذاری اطلاعات
ما اطلاعات شخصی شما را به هیچ شخص ثالثی نمی‌فروشیم. اطلاعات فقط در موارد زیر به اشتراک گذاشته می‌شود:
- ارائه‌دهندگان خدمات آنالیتیکس (با رعایت حریم خصوصی و فقط پس از رضایت شما)
- الزامات قانونی

## امنیت اطلاعات
ما از رمزنگاری SSL/TLS برای محافظت از اطلاعات استفاده می‌کنیم.

## حقوق شما
- حق دسترسی به اطلاعات خود
- حق اصلاح اطلاعات
- حق حذف اطلاعات
- حق اعتراض به پردازش اطلاعات

## تماس با ما
برای هرگونه سؤال درباره حریم خصوصی:
- ایمیل: privacy@namiragroup.ir
- تلفن: ۰۲۱-۹۱۰۰۸۸۰۰`,
  },
  {
    slug: "terms",
    title: "قوانین و مقررات",
    subtitle: "شرایط استفاده از وب‌سایت هلدینگ نامیرا همراه پارس.",
    seoDesc: "قوانین و مقررات استفاده از وب‌سایت هلدینگ نامیرا همراه پارس.",
    body: `## مقدمه
با استفاده از این سایت، شما با این قوانین موافقت می‌کنید.

## استفاده از سایت
- محتوای سایت فقط برای اطلاع‌رسانی است
- کپی‌برداری بدون اجازه ممنوع است
- استفاده تجاری بدون مجوز ممنوع است

## فروشگاه‌ها
- گوشی پلازا و همراه پلازا سایت‌های مستقل هستند
- قوانین خرید از این فروشگاه‌ها در سایت خودشان موجود است
- این سایت فقط معرفی‌کننده است و مسئولیت فروش بر عهده فروشگاه‌ها است

## اطلاعات تماس
تمام اطلاعات تماس در صفحه «تماس با ما» موجود است.

## محدودیت مسئولیت
- ما تلاش می‌کنیم اطلاعات دقیق باشد، اما تضمین کامل نمی‌دهیم
- مسئولیت استفاده از اطلاعات بر عهده کاربر است

## تغییرات قوانین
ما حق تغییر این قوانین را داریم. تغییرات در همین صفحه منتشر می‌شود.

## قوانین حاکم
این قوانین بر اساس قوانین جمهوری اسلامی ایران تنظیم شده است.`,
  },
  {
    slug: "cookie-policy",
    title: "سیاست کوکی",
    subtitle: "چه کوکی‌هایی استفاده می‌کنیم و چرا.",
    seoDesc: "سیاست کوکی وب‌سایت هلدینگ نامیرا همراه پارس؛ انواع کوکی، مدت زمان و نحوه مدیریت.",
    body: `## کوکی چیست؟
کوکی فایل کوچکی است که در مرورگر شما ذخیره می‌شود.

## کوکی‌هایی که استفاده می‌کنیم

### کوکی‌های ضروری (بدون نیاز به رضایت)
- ذخیره نشست کاربر
- توکن امنیت فرم‌ها (CSRF)
- ذخیره انتخاب شما درباره کوکی‌ها

### کوکی‌های آنالیتیکس (نیاز به رضایت)
- Google Analytics
- هدف: تحلیل ترافیک سایت
- داده‌های جمع‌آوری شده: صفحات بازدید شده، مدت زمان بازدید، نوع مرورگر
- مدت زمان: تا ۲ سال

### کوکی‌های بازاریابی (نیاز به رضایت)
در حال حاضر استفاده نمی‌کنیم.

## مدیریت کوکی‌ها
می‌توانید از طریق تنظیمات مرورگر خود کوکی‌ها را مدیریت کنید:
- Chrome: Settings > Privacy and Security > Cookies
- Firefox: Options > Privacy & Security > Cookies
- Safari: Preferences > Privacy

## کوکی‌های شخص ثالث
- Google Maps: در صورت باز کردن نقشه، ممکن است کوکی قرار دهد
- YouTube: در صورت پخش ویدئو، ممکن است کوکی قرار دهد

## تغییرات
این سیاست ممکن است تغییر کند. تغییرات در همین صفحه منتشر می‌شود.`,
  },
  {
    slug: "refund-policy",
    title: "شرایط بازگشت پول",
    subtitle: "روش بازگشت وجه در فروشگاه‌های نامیرا.",
    seoDesc: "شرایط بازگشت پول در فروشگاه‌های هلدینگ نامیرا همراه پارس.",
    body: `## توجه مهم
این سایت (namiragroup.ir) یک سایت معرفی‌کننده است و مستقیماً محصولی نمی‌فروشد.

## فروشگاه‌های ما

### گوشی پلازا (B2C)
برای خرید از گوشی پلازا، شرایط بازگشت پول در سایت gooshiplaza.com موجود است.

### همراه پلازا (B2B)
برای خرید از همراه پلازا، شرایط بازگشت پول در سایت hamrahplaza.com موجود است.

### فروشگاه حضوری
شرایط بازگشت پول در فروشگاه حضوری به شما ارائه می‌شود.

## تماس
برای هرگونه سؤال درباره بازگشت پول:
- گوشی پلازا: support@gooshiplaza.com
- همراه پلازا: support@hamrahplaza.com
- فروشگاه حضوری: ۰۲۱-۹۱۰۰۸۸۰۱`,
  },
  {
    slug: "about",
    title: "درباره نامیرا همراه پارس",
    subtitle: "هویت، تاریخچه و مسیر رشد هلدینگ.",
    seoDesc: "درباره هلدینگ نامیرا همراه پارس؛ تاریخچه، مأموریت، چشم‌انداز و ارزش‌ها.",
    body: `## هلدینگی چند‌گروهی
گروه بازرگانی نامیرا همراه پارس با تمرکز بر زنجیره ارزش کامل شکل گرفته است: از تأمین و بازرگانی تا فروش چند‌کاناله و خدمات پس از فروش.

## مأموریت
ارائه کالا و خدمات باکیفیت به مشتریان، با تأمین مطمئن، قیمت منصفانه و پشتیبانی مؤثر.

## چشم‌انداز
تبدیل شدن به یکی از هلدینگ‌های پیشرو در خرده‌فروشی و توزیع چند‌گروهی در ایران، با تکیه بر داده و فناوری.

## ارزش‌ها
- اصالت کالا و شفافیت
- پاسخ‌گویی به مشتری
- یادگیری و نوآوری
- مسئولیت‌پذیری تیمی`,
  },
];

async function main() {
  console.log("→ Seeding settings…");
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }

  console.log("→ Seeding admin user…");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: "مدیر سامانه", passwordHash, role: "admin" },
    create: { name: "مدیر سامانه", email: ADMIN_EMAIL, passwordHash, role: "admin" },
  });

  console.log("→ Seeding business groups…");
  for (const g of businessGroups) {
    await prisma.businessGroup.upsert({ where: { slug: g.slug }, update: g, create: g });
  }

  console.log("→ Seeding stores…");
  for (const s of stores) {
    await prisma.store.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  console.log("→ Seeding services…");
  for (const s of services) {
    await prisma.serviceItem.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  console.log("→ Seeding organizational units…");
  for (const u of orgUnits) {
    await prisma.orgUnit.upsert({ where: { slug: u.slug }, update: u, create: u });
  }

  console.log("→ Seeding news…");
  for (const n of news) {
    await prisma.newsPost.upsert({ where: { slug: n.slug }, update: n, create: n });
  }

  console.log("→ Seeding blog…");
  for (const b of blogPosts) {
    await prisma.blogPost.upsert({ where: { slug: b.slug }, update: b, create: b });
  }

  console.log("→ Seeding jobs…");
  for (const j of jobs) {
    await prisma.jobOpening.upsert({ where: { slug: j.slug }, update: j, create: j });
  }

  console.log("→ Seeding innovation projects…");
  for (const p of innovationProjects) {
    await prisma.innovationProject.upsert({ where: { slug: p.slug }, update: p, create: p });
  }

  console.log("→ Seeding team…");
  for (const m of team) {
    await prisma.teamMember.create({ data: m }).catch(() => {});
  }

  console.log("→ Seeding milestones…");
  for (const m of milestones) {
    await prisma.milestone.create({ data: m }).catch(() => {});
  }

  console.log("→ Seeding page copy…");
  for (const p of sitePages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, eyebrow: p.eyebrow, subtitle: p.subtitle },
      create: { ...p, body: "", published: true },
    });
  }

  console.log("→ Seeding pages…");
  for (const p of legalPages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, subtitle: p.subtitle, body: p.body, seoDesc: p.seoDesc },
      create: { ...p, published: true },
    });
  }

  console.log("✔ Seed complete.");
  console.log(`  Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
