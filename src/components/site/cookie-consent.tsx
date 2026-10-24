"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  CONSENT_EVENT,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

/**
 * Cookie consent banner. Non-essential cookies stay off until the visitor
 * actively opts in — declining is as easy as accepting, and the choice can be
 * changed later from the footer ("تنظیمات کوکی").
 */
export function CookieConsent() {
  const [state, setState] = useState<ConsentState | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    const current = readConsent();
    setAnalytics(current.analytics);
    setState(current);
    if (!current.decided) setForceOpen(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      setState(detail);
      setAnalytics(detail.analytics);
      setForceOpen(false);
    };
    const onRequest = () => {
      const current2 = readConsent();
      setAnalytics(current2.analytics);
      setForceOpen(true);
      setExpanded(true);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener("namira:consent-open", onRequest);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener("namira:consent-open", onRequest);
    };
  }, []);

  const visible = forceOpen || (state ? !state.decided : false);

  const decide = (value: boolean) => {
    const next = writeConsent(value);
    setState(next);
    setForceOpen(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="رضایت استفاده از کوکی"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-line-200 bg-surface shadow-lift"
    >
      <div className="container py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-accent">
              <Cookie className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <p className="max-w-3xl text-xs leading-6 text-ink-500">
              این سایت برای بهبود تجربه شما از کوکی استفاده می‌کند. کوکی‌های ضروری همیشه فعال‌اند؛
              کوکی‌های تحلیلی فقط با رضایت شما اجرا می‌شوند.{" "}
              <Link
                href="/cookie-policy"
                className="font-medium text-accent underline underline-offset-4"
              >
                بیشتر بدانید
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button type="button" onClick={() => decide(true)} className="btn-primary">
              پذیرش همه
            </button>
            {expanded ? (
              <button type="button" onClick={() => decide(analytics)} className="btn-secondary">
                پذیرش انتخاب‌شده
              </button>
            ) : null}
            <button type="button" onClick={() => decide(false)} className="btn-ghost">
              رد همه
            </button>
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-xs font-medium text-ink-500 underline underline-offset-4 hover:text-accent"
              >
                تنظیمات کوکی
              </button>
            ) : null}
          </div>
        </div>

        {expanded ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 rounded-xl border border-line-200 bg-surface-100 p-3">
              <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 accent-brand-700" />
              <span>
                <span className="block text-xs font-semibold text-ink-900">کوکی‌های ضروری</span>
                <span className="block text-[11px] text-ink-500">
                  نشست، امنیت فرم‌ها و ذخیره انتخاب شما. همیشه فعال.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2.5 rounded-xl border border-line-200 bg-surface-100 p-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span>
                <span className="block text-xs font-semibold text-ink-900">
                  کوکی‌های تحلیلی (Google Analytics)
                </span>
                <span className="block text-[11px] text-ink-500">
                  تحلیل ترافیک و صفحات پربازدید. بدون شناسایی شخصی شما.
                </span>
              </span>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Small footer affordance that re-opens the banner so consent can change. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("namira:consent-open"))}
      className={className}
    >
      تنظیمات کوکی
    </button>
  );
}
