"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  submitContact,
  submitApplication,
  submitNewsletter,
  type ActionResult,
} from "@/server/actions";
import { cn } from "@/lib/utils";

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-btn px-4 py-3 text-sm",
        state.ok ? "bg-brand-700/20 text-accent-strong" : "bg-red-500/15 text-red-300",
      )}
    >
      {state.ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <span>{state.message}</span>
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  autoComplete,
  dir,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  dir?: "rtl" | "ltr";
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        dir={dir}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn("input", error && "border-red-400 focus:border-red-500 focus:ring-red-200")}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Consent({
  name,
  label,
  error,
  required,
}: {
  name: string;
  label: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex items-start gap-2.5 text-sm text-ink-700">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-700"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <span>
          {label}
          {required ? <span className="text-red-400"> *</span> : null}
        </span>
      </label>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Honeypot() {
  return (
    <div className="hidden" aria-hidden>
      <label htmlFor="website">وب‌سایت</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {pending ? "در حال ارسال…" : label}
    </button>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    submitContact,
    null,
  );
  const e = state?.errors ?? {};

  return (
    <form action={action} noValidate className="space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" name="name" required error={e.name} autoComplete="name" />
        <Field label="ایمیل" name="email" type="email" required error={e.email} dir="ltr" autoComplete="email" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="شماره تماس" name="phone" error={e.phone} dir="ltr" autoComplete="tel" />
        <Field label="موضوع" name="subject" error={e.subject} />
      </div>
      <div>
        <label htmlFor="message" className="label">
          پیام<span className="text-red-400"> *</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={e.message ? true : undefined}
          aria-describedby={e.message ? "message-error" : undefined}
          className={cn("input resize-y", e.message && "border-red-400")}
        />
        {e.message ? (
          <p id="message-error" className="mt-1.5 text-xs text-red-400">
            {e.message}
          </p>
        ) : null}
      </div>
      <Consent
        name="consent"
        required
        error={e.consent}
        label={
          <>
            با{" "}
            <Link href="/privacy" className="font-medium text-accent underline underline-offset-4">
              حریم خصوصی
            </Link>{" "}
            و{" "}
            <Link href="/terms" className="font-medium text-accent underline underline-offset-4">
              قوانین و مقررات
            </Link>{" "}
            موافقم.
          </>
        }
      />
      <Feedback state={state} />
      <SubmitButton pending={pending} label="ارسال پیام" />
    </form>
  );
}

export function ApplicationForm({ positions }: { positions: string[] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    submitApplication,
    null,
  );
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" name="name" required error={e.name} autoComplete="name" />
        <Field label="ایمیل" name="email" type="email" required error={e.email} dir="ltr" autoComplete="email" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="شماره تماس" name="phone" required error={e.phone} dir="ltr" autoComplete="tel" />
        <div>
          <label htmlFor="position" className="label">
            موقعیت شغلی مورد نظر<span className="text-red-400"> *</span>
          </label>
          <select
            id="position"
            name="position"
            required
            defaultValue=""
            aria-invalid={e.position ? true : undefined}
            className={cn("input", e.position && "border-red-400")}
          >
            <option value="" disabled>
              انتخاب کنید
            </option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="سایر">سایر / پیشنهاد همکاری</option>
          </select>
          {e.position ? <p className="mt-1.5 text-xs text-red-400">{e.position}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor="resume" className="label">
          رزومه (PDF یا Word)
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          className="input file:ml-3 file:rounded-btn file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
          aria-describedby="resume-hint"
        />
        <p id="resume-hint" className="mt-1.5 text-xs text-ink-500">
          حداکثر ۵ مگابایت.
        </p>
        {e.resume ? <p className="mt-1.5 text-xs text-red-400">{e.resume}</p> : null}
      </div>
      <div>
        <label htmlFor="coverLetter" className="label">
          توضیح تکمیلی
        </label>
        <textarea id="coverLetter" name="coverLetter" rows={4} className="input resize-y" />
      </div>
      <div className="space-y-3">
        <Consent
          name="dataConsent"
          required
          error={e.dataConsent}
          label={
            <>
              با{" "}
              <Link href="/privacy" className="font-medium text-accent underline underline-offset-4">
                حریم خصوصی
              </Link>{" "}
              موافقم و اجازه می‌دهم اطلاعات من برای بررسی رزومه استفاده شود.
            </>
          }
        />
        <Consent
          name="retentionConsent"
          required
          error={e.retentionConsent}
          label="موافقم اطلاعات من به مدت ۶ ماه در سیستم نگهداری شود."
        />
      </div>
      <Feedback state={state} />
      <SubmitButton pending={pending} label="ارسال رزومه" />
    </form>
  );
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    submitNewsletter,
    null,
  );
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            ایمیل
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            dir="ltr"
            required
            placeholder="email@example.com"
            aria-invalid={e.email ? true : undefined}
            className={cn("input", e.email && "border-red-400")}
          />
        </div>
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          عضویت در خبرنامه
        </button>
      </div>
      <Consent
        name="consent"
        required
        error={e.consent}
        label={
          <>
            موافقم ایمیل‌های خبرنامه را دریافت کنم و با{" "}
            <Link href="/privacy" className="font-medium text-accent underline underline-offset-4">
              حریم خصوصی
            </Link>{" "}
            موافقم.
          </>
        }
      />
      {e.email ? <p className="text-xs text-red-400">{e.email}</p> : null}
      <Feedback state={state} />
    </form>
  );
}
