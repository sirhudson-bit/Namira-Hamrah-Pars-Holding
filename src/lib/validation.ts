import { z } from "zod";

const persianPhone = /^0?9\d{9}$/;
const iranLandline = /^0\d{2,3}\d{7,8}$/;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ حرف باشد.")
    .max(100, "نام بیش از حد طولانی است."),
  email: z.string().trim().email("ایمیل معتبر نیست.").max(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || persianPhone.test(v) || iranLandline.test(v), {
      message: "شماره تماس معتبر نیست.",
    }),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "پیام باید حداقل ۱۰ حرف باشد.")
    .max(2000, "پیام بیش از حد طولانی است."),
  consent: z.boolean().refine((v) => v === true, {
    message: "برای ارسال، پذیرش حریم خصوصی الزامی است.",
  }),
});

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد.").max(100),
  email: z.string().trim().email("ایمیل معتبر نیست.").max(160),
  phone: z
    .string()
    .trim()
    .refine((v) => persianPhone.test(v) || iranLandline.test(v), {
      message: "شماره تماس معتبر نیست.",
    }),
  position: z.string().trim().min(2, "انتخاب موقعیت شغلی الزامی است.").max(120),
  coverLetter: z.string().trim().max(3000).optional().or(z.literal("")),
  dataConsent: z.boolean().refine((v) => v === true, {
    message: "پذیرش حریم خصوصی الزامی است.",
  }),
  retentionConsent: z.boolean().refine((v) => v === true, {
    message: "برای بررسی رزومه، این مورد الزامی است.",
  }),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست.").max(160),
  consent: z.boolean().refine((v) => v === true, {
    message: "پذیرش حریم خصوصی الزامی است.",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست."),
  password: z.string().min(1, "رمز عبور الزامی است."),
});

/** Flattens a ZodError into a field -> message map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ContactInput = z.infer<typeof contactSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
