import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/server/settings";
import { getCurrentUser } from "@/server/auth";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود به داشبورد",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Authoritative "already signed in" check. The edge middleware only sees a
  // cookie, which may belong to a revoked or expired session, so the redirect
  // belongs here, next to the database lookup.
  const user = await getCurrentUser();
  if (user) redirect("/admin/dashboard");

  const settings = await getSettings();

  return (
    <main className="grid min-h-screen place-items-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo
            variant="light"
            src={settings.logo_light_path || settings.logo_path || undefined}
          />
        </div>
        <div className="card p-7 sm:p-9">
          <h1 className="heading-3">ورود به پنل مدیریت</h1>
          <p className="mt-1.5 mb-6 text-sm text-ink-500">
            برای مدیریت محتوای سایت، وارد شوید.
          </p>
          <LoginForm />
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            بازگشت به سایت
          </Link>
        </div>
      </div>
    </main>
  );
}
