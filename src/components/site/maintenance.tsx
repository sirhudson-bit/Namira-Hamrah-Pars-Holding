import Link from "next/link";
import { Mail, Phone, Wrench } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toLatinDigits } from "@/lib/format";

/**
 * Public "we are updating" screen.
 *
 * Rendered by the site layout instead of the page tree while
 * `maintenance_mode` is on, so every public URL — including ones bookmarked by
 * visitors — shows this rather than a 404 or a half-edited page. The admin
 * panel is never routed through here.
 */
export function MaintenanceScreen({
  siteName,
  message,
  logoPath,
  phone,
  email,
  isAdmin,
}: {
  siteName: string;
  message: string;
  logoPath?: string;
  phone?: string;
  email?: string;
  isAdmin: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-50 px-5 py-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 glow-accent blur-2xl"
        aria-hidden
      />

      <div className="absolute left-5 top-5">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-xl text-center">
        <div className="mb-8 flex justify-center">
          <Logo src={logoPath || undefined} />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-line-200 bg-surface-100 px-4 py-1.5 text-xs font-medium text-accent">
          <Wrench className="h-3.5 w-3.5" aria-hidden />
          در حال به‌روزرسانی
        </span>

        <h1 className="display-3 mt-6 text-ink-900">{siteName}</h1>
        <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink-500">
          {message || "سایت در حال به‌روزرسانی است. لطفاً چند دقیقه بعد دوباره سر بزنید."}
        </p>

        {(phone || email) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {phone ? (
              <a href={`tel:${toLatinDigits(phone)}`} className="btn-secondary">
                <Phone className="h-4 w-4 text-accent" aria-hidden />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="btn-secondary">
                <Mail className="h-4 w-4 text-accent" aria-hidden />
                <span dir="ltr">{email}</span>
              </a>
            ) : null}
          </div>
        )}

        {isAdmin ? (
          <div className="mt-10 rounded-card border border-dashed border-line-200 bg-surface/70 p-5 text-sm text-ink-500">
            <p>حالت تعمیر فعال است؛ شما به‌عنوان مدیر وارد شده‌اید.</p>
            <Link href="/admin/dashboard" className="btn-primary mt-3">
              رفتن به پنل مدیریت
            </Link>
          </div>
        ) : (
          <p className="mt-10 text-xs text-ink-400">
            برای دیدن سایت به‌عنوان مدیر، وارد پنل مدیریت شوید.
          </p>
        )}
      </div>
    </div>
  );
}
