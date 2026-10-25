"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import sharp from "sharp";
import { prisma } from "@/server/db";
import {
  hashPassword,
  getSessionToken,
  requireAdmin,
  verifyPassword,
} from "@/server/auth";
import { FONT_SIZE_RANGE, LINE_HEIGHT_RANGE } from "@/server/settings";
import { toPersianDigits } from "@/lib/format";
import { extractEmbedUrl } from "@/lib/embed";
import type { ActionResult } from "@/server/actions";
import type { MediaItem } from "@/lib/media";

/* ----------------------------- helpers ----------------------------- */

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function opt(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v === "" ? null : v;
}
function bool(formData: FormData, key: string): boolean {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}
function num(formData: FormData, key: string, fallback = 0): number {
  const v = Number(str(formData, key));
  return Number.isFinite(v) ? v : fallback;
}

const required = (label: string) => z.string().trim().min(1, `${label} الزامی است.`);

function fail(message: string, errors?: Record<string, string>): ActionResult {
  return { ok: false, message, errors };
}

/* ------------------------- business groups ------------------------- */

const groupSchema = z.object({
  name: required("نام گروه"),
  slug: required("نشانی (slug)"),
  tagline: required("شعار کوتاه"),
  description: required("توضیحات"),
  icon: z.string().default("Boxes"),
  color: z.string().default("#0F7C71"),
});

export async function saveBusinessGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = groupSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    icon: opt(formData, "icon") ?? "Boxes",
    color: opt(formData, "color") ?? "#0F7C71",
  });
  if (!parsed.success) {
    return fail("لطفاً خطاهای فرم را برطرف کنید.", {
      [parsed.error.issues[0].path[0] as string]: parsed.error.issues[0].message,
    });
  }
  const data = {
    ...parsed.data,
    highlights: str(formData, "highlights"),
    ctaLabel: str(formData, "ctaLabel"),
    ctaUrl: str(formData, "ctaUrl"),
    sortOrder: num(formData, "sortOrder"),
    published: bool(formData, "published"),
  };
  const id = str(formData, "id");
  try {
    if (id) {
      await prisma.businessGroup.update({ where: { id }, data });
    } else {
      await prisma.businessGroup.create({ data });
    }
  } catch {
    return fail("ذخیره نشد. ممکن است نشانی (slug) تکراری باشد.");
  }
  revalidatePath("/admin/business-groups");
  revalidatePath("/business-groups");
  revalidatePath("/");
  return { ok: true, message: "گروه کسب‌وکار ذخیره شد." };
}

export async function deleteBusinessGroup(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.businessGroup.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/business-groups");
  revalidatePath("/business-groups");
  revalidatePath("/");
}

/* ------------------------------ stores ----------------------------- */

const storeSchema = z.object({
  name: required("نام فروشگاه"),
  slug: required("نشانی (slug)"),
  kind: z.string().default("B2C"),
  description: required("توضیحات"),
});

export async function saveStore(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = storeSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    kind: opt(formData, "kind") ?? "B2C",
    description: str(formData, "description"),
  });
  if (!parsed.success) {
    return fail("لطفاً خطاهای فرم را برطرف کنید.", {
      [parsed.error.issues[0].path[0] as string]: parsed.error.issues[0].message,
    });
  }
  const data = {
    ...parsed.data,
    url: opt(formData, "url"),
    phone: opt(formData, "phone"),
    address: opt(formData, "address"),
    email: opt(formData, "email"),
    sortOrder: num(formData, "sortOrder"),
    published: bool(formData, "published"),
  };
  const id = str(formData, "id");
  try {
    if (id) await prisma.store.update({ where: { id }, data });
    else await prisma.store.create({ data });
  } catch {
    return fail("ذخیره نشد. ممکن است نشانی (slug) تکراری باشد.");
  }
  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath("/");
  return { ok: true, message: "فروشگاه ذخیره شد." };
}

export async function deleteStore(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.store.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath("/");
}

/* ------------------------------- news ------------------------------ */

const newsSchema = z.object({
  title: required("عنوان"),
  slug: required("نشانی (slug)"),
  excerpt: required("خلاصه"),
  category: z.string().default("خبر"),
});

export async function saveNews(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newsSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    excerpt: str(formData, "excerpt"),
    category: opt(formData, "category") ?? "خبر",
  });
  if (!parsed.success) {
    return fail("لطفاً خطاهای فرم را برطرف کنید.", {
      [parsed.error.issues[0].path[0] as string]: parsed.error.issues[0].message,
    });
  }
  const dateStr = str(formData, "publishedAt");
  const data = {
    ...parsed.data,
    body: str(formData, "body"),
    published: bool(formData, "published"),
    publishedAt: dateStr ? new Date(dateStr) : new Date(),
  };
  const id = str(formData, "id");
  try {
    if (id) await prisma.newsPost.update({ where: { id }, data });
    else await prisma.newsPost.create({ data });
  } catch {
    return fail("ذخیره نشد. ممکن است نشانی (slug) تکراری باشد.");
  }
  revalidatePath("/admin/news");
  revalidatePath("/media/news");
  revalidatePath("/media");
  revalidatePath("/");
  return { ok: true, message: "خبر ذخیره شد." };
}

export async function deleteNews(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.newsPost.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/news");
  revalidatePath("/media/news");
  revalidatePath("/media");
}

/* ------------------------------- blog ------------------------------ */

const blogSchema = z.object({
  title: required("عنوان"),
  slug: required("نشانی (slug)"),
  excerpt: required("خلاصه"),
  category: z.string().default("مقاله"),
  author: z.string().default("تیم نامیرا"),
});

export async function saveBlogPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blogSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    excerpt: str(formData, "excerpt"),
    category: opt(formData, "category") ?? "مقاله",
    author: opt(formData, "author") ?? "تیم نامیرا",
  });
  if (!parsed.success) {
    return fail("لطفاً خطاهای فرم را برطرف کنید.", {
      [parsed.error.issues[0].path[0] as string]: parsed.error.issues[0].message,
    });
  }
  const dateStr = str(formData, "publishedAt");
  const data = {
    ...parsed.data,
    body: str(formData, "body"),
    published: bool(formData, "published"),
    publishedAt: dateStr ? new Date(dateStr) : new Date(),
  };
  const id = str(formData, "id");
  try {
    if (id) await prisma.blogPost.update({ where: { id }, data });
    else await prisma.blogPost.create({ data });
  } catch {
    return fail("ذخیره نشد. ممکن است نشانی (slug) تکراری باشد.");
  }
  revalidatePath("/admin/blog");
  revalidatePath("/media/blog");
  revalidatePath("/media");
  return { ok: true, message: "مقاله ذخیره شد." };
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/blog");
  revalidatePath("/media/blog");
  revalidatePath("/media");
}

/* ------------------------------- jobs ------------------------------ */

const jobSchema = z.object({
  title: required("عنوان موقعیت"),
  slug: required("نشانی (slug)"),
  department: required("واحد"),
  description: required("توضیحات"),
});

export async function saveJob(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = jobSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    department: str(formData, "department"),
    description: str(formData, "description"),
  });
  if (!parsed.success) {
    return fail("لطفاً خطاهای فرم را برطرف کنید.", {
      [parsed.error.issues[0].path[0] as string]: parsed.error.issues[0].message,
    });
  }
  const data = {
    ...parsed.data,
    location: opt(formData, "location") ?? "تهران",
    type: opt(formData, "type") ?? "تمام‌وقت",
    requirements: str(formData, "requirements"),
    sortOrder: num(formData, "sortOrder"),
    active: bool(formData, "active"),
  };
  const id = str(formData, "id");
  try {
    if (id) await prisma.jobOpening.update({ where: { id }, data });
    else await prisma.jobOpening.create({ data });
  } catch {
    return fail("ذخیره نشد. ممکن است نشانی (slug) تکراری باشد.");
  }
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  return { ok: true, message: "موقعیت شغلی ذخیره شد." };
}

export async function deleteJob(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.jobOpening.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
}

/* ------------------------------- pages ----------------------------- */

export async function savePage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!id || !title) return fail("عنوان صفحه الزامی است.");
  const data = {
    title,
    eyebrow: opt(formData, "eyebrow"),
    subtitle: opt(formData, "subtitle"),
    body: str(formData, "body"),
    seoTitle: opt(formData, "seoTitle"),
    seoDesc: opt(formData, "seoDesc"),
    published: bool(formData, "published"),
  };
  await prisma.page.update({ where: { id }, data });
  const slug = str(formData, "slug");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  return { ok: true, message: "صفحه ذخیره شد." };
}

/* ----------------------------- settings ---------------------------- */

const EDITABLE_SETTING_KEYS = [
  "site_name",
  "legal_name",
  "registration_number",
  "national_id",
  "address",
  "phone",
  "mobile",
  "email",
  "hours",
  "map_embed",
  "instagram",
  "linkedin",
  "telegram",
  "seo_title",
  "seo_description",
  "analytics_enabled",
  "ga_id",
  "video_embed",
  "font_size",
  "line_height",
  "maintenance_mode",
  "maintenance_message",
];

/** Keys posted by a checkbox ("on"/"") rather than a text field. */
const CHECKBOX_SETTING_KEYS = new Set(["analytics_enabled", "maintenance_mode"]);

/** Keys whose stored form must be a Persian-numeral string. */
const PERSIAN_NUMBER_KEYS = new Set([
  "phone",
  "mobile",
  "registration_number",
  "national_id",
]);

/** Keys whose stored form must be a bare URL, never an embed snippet. */
const EMBED_KEYS = new Set(["map_embed", "video_embed"]);

export async function saveSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  for (const key of EDITABLE_SETTING_KEYS) {
    if (CHECKBOX_SETTING_KEYS.has(key)) continue;

    let value = str(formData, key);

    // An administrator typing Latin digits (021-91008800) still gets the
    // Persian numerals the rest of the site is set in.
    if (PERSIAN_NUMBER_KEYS.has(key)) value = toPersianDigits(value);

    // Google Maps / video snippets are reduced to the bare `src` so a pasted
    // `<iframe …>` can never be requested as a relative path (the 404 map).
    if (EMBED_KEYS.has(key)) value = extractEmbedUrl(value);

    if (key === "font_size") {
      value = String(clampNumber(value, FONT_SIZE_RANGE.min, FONT_SIZE_RANGE.max, FONT_SIZE_RANGE.fallback));
    }
    if (key === "line_height") {
      value = clampNumber(value, LINE_HEIGHT_RANGE.min, LINE_HEIGHT_RANGE.max, LINE_HEIGHT_RANGE.fallback).toFixed(2);
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "general" },
    });
  }

  // Checkboxes post "on"/"" — normalize to an explicit boolean string.
  for (const key of CHECKBOX_SETTING_KEYS) {
    const value = bool(formData, key) ? "true" : "false";
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        group: key === "analytics_enabled" ? "privacy" : "general",
      },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true, message: "تنظیمات ذخیره شد." };
}

function clampNumber(value: string, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, Math.max(min, n));
}

/* ------------------------------ password ---------------------------- */

/**
 * Changes the signed-in operator's password.
 *
 * The current password is required (a stolen session alone must not be enough
 * to lock the real owner out), and every *other* session is revoked so the
 * change also evicts anyone already holding a valid cookie.
 */
export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAdmin();

  const current = str(formData, "current_password");
  const next = str(formData, "new_password");
  const confirm = str(formData, "confirm_password");

  if (!current || !next || !confirm) {
    return fail("همه فیلدها الزامی است.");
  }
  if (next.length < 8) {
    return fail("رمز جدید باید حداقل ۸ کاراکتر باشد.", {
      new_password: "حداقل ۸ کاراکتر.",
    });
  }
  if (next !== confirm) {
    return fail("تکرار رمز جدید مطابقت ندارد.", {
      confirm_password: "با رمز جدید یکسان نیست.",
    });
  }

  const row = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!row) return fail("حساب کاربری یافت نشد.");

  if (!(await verifyPassword(current, row.passwordHash))) {
    return fail("رمز فعلی نادرست است.", { current_password: "رمز فعلی نادرست است." });
  }
  if (await verifyPassword(next, row.passwordHash)) {
    return fail("رمز جدید باید با رمز فعلی متفاوت باشد.", {
      new_password: "رمز جدید با رمز فعلی یکسان است.",
    });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  // Keep the session that made the change; drop every other device.
  const token = await getSessionToken();
  await prisma.session.deleteMany({
    where: token ? { userId: user.id, NOT: { token } } : { userId: user.id },
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "رمز عبور تغییر کرد و سایر نشست‌ها خارج شدند." };
}

/* --------------------------- home hero widget ---------------------- */

/** Text keys of the home hero widget, written verbatim from the form. */
const HERO_TEXT_KEYS = [
  "hero_eyebrow",
  "hero_title",
  "hero_lead",
  "hero_cta_label",
  "hero_cta_href",
  "hero_video_label",
  "hero_stats",
] as const;

export async function saveHero(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const title = str(formData, "hero_title").trim();
  if (!title) return fail("عنوان اصلی صفحه الزامی است.");

  for (const key of HERO_TEXT_KEYS) {
    const value = str(formData, key).trim();
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "hero" },
    });
  }

  // Checkboxes post "on"/"" — normalize to an explicit boolean string.
  const enabled = bool(formData, "hero_enabled") ? "true" : "false";
  await prisma.setting.upsert({
    where: { key: "hero_enabled" },
    update: { value: enabled },
    create: { key: "hero_enabled", value: enabled, group: "hero" },
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true, message: "بخش صفحه اصلی ذخیره شد." };
}

/* ------------------------------ inbox ------------------------------ */

export async function setMessageRead(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const read = bool(formData, "read");
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}

export async function deleteContactMessage(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}

export async function setApplicationStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  await prisma.jobApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}

export async function deleteApplication(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (app?.resumePath) {
    await unlink(path.join(process.cwd(), app.resumePath)).catch(() => {});
  }
  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}

export async function deleteSubscriber(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.newsletterSubscriber.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin/forms");
}

/* ------------------------------ media ------------------------------ */

const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

/* --------------------------- image encoding ------------------------ */

/**
 * Formats that must keep their bytes: SVG would lose its scalability if
 * rasterised, and ICO is the format browsers expect for a favicon. Every other
 * raster image is re-encoded to WebP on the way in.
 */
const KEEP_ORIGINAL = new Set(["image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]);
const WEBP_QUALITY = 82;

/**
 * Returns the bytes to store and the extension to store them under.
 *
 * Best-effort by design: if a file cannot be decoded it is stored untouched
 * rather than losing the upload — an optimisation must never reject work.
 */
async function toWebp(
  buffer: Buffer,
  mime: string,
  fallbackExt: string,
): Promise<{ data: Buffer; ext: string }> {
  if (KEEP_ORIGINAL.has(mime)) return { data: buffer, ext: fallbackExt };
  try {
    const data = await sharp(buffer, { animated: mime === "image/gif" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { data, ext: "webp" };
  } catch {
    return { data: buffer, ext: fallbackExt };
  }
}

export async function uploadMedia(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("فایلی انتخاب نشده است.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return fail("حجم فایل باید کمتر از ۵ مگابایت باشد.");
  }
  if (!ALLOWED_MEDIA.has(file.type)) {
    return fail("فقط تصاویر PNG، JPEG، WEBP، SVG و GIF مجاز هستند.");
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase().slice(0, 8) ?? "bin";
  const stored = await toWebp(Buffer.from(await file.arrayBuffer()), file.type, rawExt);

  const filename = `${randomUUID()}.${stored.ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "media");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), stored.data);

  await prisma.mediaAsset.create({
    data: {
      filename: file.name.slice(0, 200),
      path: `/uploads/media/${filename}`,
      mime: stored.ext === "webp" ? "image/webp" : file.type,
      size: stored.data.length,
      alt: str(formData, "alt").slice(0, 200),
    },
  });

  revalidatePath("/admin/media");
  return { ok: true, message: "فایل رسانه بارگذاری شد." };
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (asset) {
    const rel = asset.path.replace(/^\//, "");
    await unlink(path.join(process.cwd(), "public", rel)).catch(() => {});
    await prisma.mediaAsset.delete({ where: { id } });
  }
  revalidatePath("/admin/media");
}

/** Latest media assets, for the editor's image picker. */
export async function listMediaAssets(): Promise<MediaItem[]> {
  await requireAdmin();
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
  });
  return assets.map((a) => ({
    id: a.id,
    filename: a.filename,
    path: a.path,
    alt: a.alt,
  }));
}

/* ----------------------------- branding ---------------------------- */

/**
 * Header logo height. A focused form rather than part of `saveSettings`, which
 * rewrites every key it knows — a partial post there would blank the rest.
 */
export async function saveLogoSize(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const raw = Number(str(formData, "logo_height"));
  if (!Number.isFinite(raw)) return fail("عدد وارد شده معتبر نیست.");
  const height = Math.min(96, Math.max(24, Math.round(raw)));

  await prisma.setting.upsert({
    where: { key: "logo_height" },
    update: { value: String(height) },
    create: { key: "logo_height", value: String(height), group: "branding" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true, message: `اندازه لوگو روی ${height} پیکسل تنظیم شد.` };
}

const BRAND_KINDS = ["logo", "logo_light", "favicon"] as const;
type BrandKind = (typeof BRAND_KINDS)[number];

const BRAND_SETTING_KEY: Record<BrandKind, string> = {
  logo: "logo_path",
  logo_light: "logo_light_path",
  favicon: "favicon_path",
};

const MAX_BRAND_BYTES = 2 * 1024 * 1024;
const ALLOWED_BRAND = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function brandingDir(): string {
  return path.join(process.cwd(), "public", "uploads", "branding");
}

function brandExtension(filename: string, mime: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "ico" || ext === "svg" || ext === "png" || ext === "webp") return ext;
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  return "png";
}

async function removeBrandFile(value: string | undefined | null): Promise<void> {
  if (!value?.startsWith("/uploads/branding/")) return;
  const rel = value.replace(/^\//, "");
  await unlink(path.join(process.cwd(), "public", rel)).catch(() => {});
}

export async function uploadBrandAsset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const kind = str(formData, "kind") as BrandKind;
  if (!BRAND_KINDS.includes(kind)) return fail("نوع دارایی نامعتبر است.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("فایلی انتخاب نشده است.");
  if (file.size > MAX_BRAND_BYTES) return fail("حجم فایل باید کمتر از ۲ مگابایت باشد.");
  if (!ALLOWED_BRAND.has(file.type)) {
    return fail("فرمت فایل مجاز نیست (PNG، SVG، WEBP، JPG یا ICO).");
  }

  const key = BRAND_SETTING_KEY[kind];
  const existing = await prisma.setting.findUnique({ where: { key } });

  const dir = brandingDir();
  await mkdir(dir, { recursive: true });

  // Raster uploads are stored as WebP; SVG and ICO keep their bytes.
  const stored = await toWebp(
    Buffer.from(await file.arrayBuffer()),
    file.type,
    brandExtension(file.name, file.type),
  );

  const filename = `${kind}-${randomUUID()}.${stored.ext}`;
  await writeFile(path.join(dir, filename), stored.data);

  // Remove the file this upload replaces so the folder cannot grow without bound.
  await removeBrandFile(existing?.value);
  const value = `/uploads/branding/${filename}`;

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group: "branding" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true, message: "فایل با موفقیت بارگذاری شد." };
}

export async function removeBrandAsset(formData: FormData): Promise<void> {
  await requireAdmin();
  const kind = str(formData, "kind") as BrandKind;
  if (!BRAND_KINDS.includes(kind)) return;

  const key = BRAND_SETTING_KEY[kind];
  const existing = await prisma.setting.findUnique({ where: { key } });
  await removeBrandFile(existing?.value);

  await prisma.setting.upsert({
    where: { key },
    update: { value: "" },
    create: { key, value: "", group: "branding" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
