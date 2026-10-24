"use server";

import { headers } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db";
import { rateLimit, pruneBuckets } from "@/lib/rate-limit";
import {
  contactSchema,
  applicationSchema,
  newsletterSchema,
  fieldErrors,
} from "@/lib/validation";

export type ActionResult = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

async function clientKey(prefix: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function submitContact(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  pruneBuckets();
  const limit = rateLimit(await clientKey("contact"), 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `تعداد درخواست‌ها زیاد است. لطفاً ${limit.retryAfterSeconds} ثانیه دیگر تلاش کنید.`,
    };
  }

  // Honeypot: a real visitor never fills this hidden field.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "پیام شما دریافت شد." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "لطفاً خطاهای فرم را برطرف کنید.",
      errors: fieldErrors(parsed.error),
    };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  });

  return { ok: true, message: "پیام شما با موفقیت ثبت شد. به‌زودی پاسخ می‌دهیم." };
}

export async function submitApplication(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  pruneBuckets();
  const limit = rateLimit(await clientKey("apply"), 3, 30 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `تعداد درخواست‌ها زیاد است. لطفاً ${limit.retryAfterSeconds} ثانیه دیگر تلاش کنید.`,
    };
  }

  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "درخواست شما دریافت شد." };
  }

  const parsed = applicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    coverLetter: formData.get("coverLetter") ?? "",
    dataConsent: formData.get("dataConsent") === "on" || formData.get("dataConsent") === "true",
    retentionConsent:
      formData.get("retentionConsent") === "on" ||
      formData.get("retentionConsent") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "لطفاً خطاهای فرم را برطرف کنید.",
      errors: fieldErrors(parsed.error),
    };
  }

  const resume = formData.get("resume");
  let resumeName: string | null = null;
  let resumePath: string | null = null;

  if (resume instanceof File && resume.size > 0) {
    if (resume.size > MAX_RESUME_BYTES) {
      return { ok: false, message: "حجم رزومه باید کمتر از ۵ مگابایت باشد.", errors: { resume: "حجم فایل زیاد است." } };
    }
    if (!ALLOWED_RESUME_TYPES.has(resume.type)) {
      return {
        ok: false,
        message: "فرمت رزومه باید PDF یا Word باشد.",
        errors: { resume: "فرمت فایل مجاز نیست." },
      };
    }
    const dir = path.join(process.cwd(), "storage", "uploads", "jobs");
    await mkdir(dir, { recursive: true });
    const ext = resume.name.split(".").pop()?.toLowerCase().slice(0, 8) ?? "pdf";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await resume.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    resumeName = resume.name.slice(0, 200);
    resumePath = path.join("storage", "uploads", "jobs", filename);
  }

  await prisma.jobApplication.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      position: parsed.data.position,
      coverLetter: parsed.data.coverLetter || null,
      resumeName,
      resumePath,
      dataConsent: true,
      retentionConsent: true,
    },
  });

  return { ok: true, message: "رزومه شما ثبت شد. در صورت تناسب، با شما تماس می‌گیریم." };
}

export async function submitNewsletter(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  pruneBuckets();
  const limit = rateLimit(await clientKey("newsletter"), 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, message: "تعداد درخواست‌ها زیاد است. کمی بعد تلاش کنید." };
  }

  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "لطفاً ایمیل و پذیرش حریم خصوصی را بررسی کنید.",
      errors: fieldErrors(parsed.error),
    };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { active: true, consent: true },
    create: { email: parsed.data.email, consent: true },
  });

  return { ok: true, message: "عضویت شما در خبرنامه ثبت شد." };
}
