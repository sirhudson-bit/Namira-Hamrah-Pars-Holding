"use client";

import { useEffect, useRef, useState } from "react";
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
const FA_LABELS = {
  consentLabel: "رضایت استفاده از کوکی",
  consentText:
    "این سایت برای بهبود تجربه شما از کوکی استفاده می‌کند. کوکی‌های ضروری همیشه فعال‌اند و کوکی‌های تحلیلی فقط با رضایت شما اجرا می‌شوند.",
  consentMore: "بیشتر بدانید",
  consentAcceptAll: "پذیرش همه",
  consentAcceptSelected: "پذیرش انتخاب‌شده",
  consentRejectAll: "رد همه",
  cookieSettings: "تنظیمات کوکی",
  consentNecessary: "کوکی‌های ضروری",
  consentNecessaryDesc: "نشست، امنیت فرم‌ها و ذخیره انتخاب شما. همیشه فعال.",
  consentAnalytics: "کوکی‌های تحلیلی (Google Analytics)",
  consentAnalyticsDesc: "تحلیل ترافیک و صفحات پربازدید، بدون شناسایی شخصی شما.",
};

export function CookieConsent({ labels = FA_LABELS }: { labels?: typeof FA_LABELS } = {}) {
  const [state, setState] = useState<ConsentState | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

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

  /**
   * Publishes the banner height as `--consent-h`. Floating controls (the chat
   * launcher) offset themselves by it, so the consent strip never sits on top
   * of them — and the gap disappears the moment the visitor decides.
   */
  useEffect(() => {
    const root = document.documentElement;
    const banner = bannerRef.current;
    if (!visible || !banner) {
      root.style.setProperty("--consent-h", "0px");
      return;
    }
    const publish = () => root.style.setProperty("--consent-h", `${banner.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.setProperty("--consent-h", "0px");
    };
  }, [visible]);

  const decide = (value: boolean) => {
    const next = writeConsent(value);
    setState(next);
    setForceOpen(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="false"
      aria-label={labels.consentLabel}
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-line-200 bg-surface shadow-lift"
    >
      <div className="container py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-accent">
              <Cookie className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <p className="max-w-3xl text-xs leading-6 text-ink-500">
              {labels.consentText}{" "}
              <Link
                href="/cookie-policy"
                className="font-medium text-accent underline underline-offset-4"
              >
                {labels.consentMore}
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button type="button" onClick={() => decide(true)} className="btn-primary">
              {labels.consentAcceptAll}
            </button>
            {expanded ? (
              <button type="button" onClick={() => decide(analytics)} className="btn-secondary">
                {labels.consentAcceptSelected}
              </button>
            ) : null}
            <button type="button" onClick={() => decide(false)} className="btn-ghost">
              {labels.consentRejectAll}
            </button>
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-xs font-medium text-ink-500 underline underline-offset-4 hover:text-accent"
              >
                {labels.cookieSettings}
              </button>
            ) : null}
          </div>
        </div>

        {expanded ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 rounded-xl border border-line-200 bg-surface-100 p-3">
              <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 accent-brand-700" />
              <span>
                <span className="block text-xs font-semibold text-ink-900">{labels.consentNecessary}</span>
                <span className="block text-[11px] text-ink-500">
                  {labels.consentNecessaryDesc}
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
                  {labels.consentAnalytics}
                </span>
                <span className="block text-[11px] text-ink-500">
                  {labels.consentAnalyticsDesc}
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
export function CookieSettingsButton({ className, label = "تنظیمات کوکی" }: { className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("namira:consent-open"))}
      className={className}
    >
      {label}
    </button>
  );
}
