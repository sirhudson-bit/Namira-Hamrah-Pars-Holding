export type ConsentState = {
  necessary: true;
  analytics: boolean;
  decided: boolean;
};

export const CONSENT_KEY = "namira_cookie_consent";
export const CONSENT_EVENT = "namira:consent-change";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  decided: false,
};

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      decided: Boolean(parsed.decided),
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function writeConsent(analytics: boolean): ConsentState {
  const next: ConsentState = { necessary: true, analytics, decided: true };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  }
  return next;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent().analytics;
}
