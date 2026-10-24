"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createSession, destroySession, verifyPassword } from "@/server/auth";
import { loginSchema, fieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`login:${ip}`, 5, 5 * 60 * 1000);
  if (!limit.ok) {
    return { error: "تلاش‌های ناموفق زیاد است. چند دقیقه بعد دوباره امتحان کنید." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { error: errors.email || errors.password || "اطلاعات ورود نامعتبر است." };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  // Identical message whether the email is unknown or the password is wrong.
  const invalid = { error: "ایمیل یا رمز عبور نادرست است." };
  if (!user) return invalid;
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  await createSession(user.id);
  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
