type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Local-verification escape hatch. The middleware is in-memory, so repeated
 * runs of `npm run verify` would otherwise throttle themselves and report
 * false failures. Set `RATE_LIMIT_DISABLED=1` **only** when driving the
 * verification suite against a local server — never in production.
 */
const DISABLED = process.env.RATE_LIMIT_DISABLED === "1";

/**
 * A small in-memory fixed-window limiter. It is deliberately simple: it exists
 * to blunt double-submits and naive abuse on the public forms, not to replace a
 * proper edge/WAF limiter in production.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSeconds: number } {
  if (DISABLED) return { ok: true, retryAfterSeconds: 0 };

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/** Strips the in-memory map occasionally so it cannot grow without bound. */
export function pruneBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}
