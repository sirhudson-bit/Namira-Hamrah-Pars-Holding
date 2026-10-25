"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, FormFeedback, SubmitBar } from "@/components/admin/fields";

/**
 * Self-service password change for the signed-in operator.
 *
 * The current password is required even though the session is already
 * authenticated: a borrowed browser must not be enough to take the account
 * over. Submitting also revokes every other active session.
 */
export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    changePassword,
    null,
  );

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-brand-700/15 text-accent">
          <KeyRound className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="heading-3">تغییر رمز عبور</h2>
          <p className="mt-1 text-sm text-ink-500">
            رمز عبور حساب <span dir="ltr" className="font-medium">{email}</span> را
            اینجا عوض کنید. پس از تغییر، سایر دستگاه‌هایی که با این حساب وارد شده‌اند از
            حساب خارج می‌شوند.
          </p>
        </div>
      </div>

      <form action={action} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="رمز عبور فعلی"
              name="current_password"
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              error={state?.errors?.current_password}
            />
          </div>
          <Field
            label="رمز عبور جدید"
            name="new_password"
            type="password"
            dir="ltr"
            required
            autoComplete="new-password"
            hint="حداقل ۸ کاراکتر."
            error={state?.errors?.new_password}
          />
          <Field
            label="تکرار رمز عبور جدید"
            name="confirm_password"
            type="password"
            dir="ltr"
            required
            autoComplete="new-password"
            error={state?.errors?.confirm_password}
          />
        </div>

        {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}
        <SubmitBar pending={pending} label="تغییر رمز عبور" />
      </form>
    </section>
  );
}
