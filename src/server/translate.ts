import { createHash } from "node:crypto";
import http2 from "node:http2";
import { prisma } from "@/server/db";
import { hasPersian, type Locale } from "@/lib/i18n";

/**
 * Live translation of Persian content.
 *
 * The site stores one authoritative Persian copy of every row. When the visitor
 * picks another locale, this module translates the strings on the way out and
 * caches each result in `Translation`, keyed by a hash of `locale + source`.
 * Consequences that matter:
 *  - the second request for a page is fast (one DB read, no network);
 *  - editing a Persian field changes its hash, so the new text is translated
 *    again while everything else keeps its cached translation;
 *  - a provider outage degrades to the Persian text instead of blanking a page.
 */

const ENDPOINT =
  process.env.TRANSLATE_ENDPOINT ??
  "https://translate.googleapis.com/translate_a/single";

/** Strings shorter than this are labels like "۲" or "ثبت" and gain nothing. */
const MIN_LENGTH = 2;

function keyFor(locale: Locale, source: string): string {
  return createHash("sha256").update(`${locale}\n${source}`).digest("hex");
}

function needsTranslation(text: string): boolean {
  return text.trim().length >= MIN_LENGTH && hasPersian(text) && !/^https?:\/\//.test(text.trim());
}

/** Extracts the translated segments out of the gtx response shape. */
function readGtx(json: unknown): string {
  if (!Array.isArray(json) || !Array.isArray(json[0])) return "";
  return (json[0] as unknown[])
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("");
}

const USER_AGENT = "Mozilla/5.0 (compatible; NamiraSite/1.0)";
const BLOCK_COOLDOWN = 5 * 60 * 1000;
let blockedUntil = 0;

type H2Response = { status: number; body: string };

/** One GET over HTTP/2 with a hard deadline; `null` means "try the fallback". */
function http2Get(url: string): Promise<H2Response | null> {
  return new Promise((resolve) => {
    const target = new URL(url);
    let settled = false;
    const timerRef: { current?: ReturnType<typeof setTimeout> } = {};

    const client = http2.connect(target.origin);
    const finish = (value: H2Response | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timerRef.current);
      resolve(value);
      try {
        client.close();
      } catch {
        // Already closed.
      }
    };

    timerRef.current = setTimeout(() => finish(null), 6000);
    client.on("error", () => finish(null));

    let status = 0;
    let body = "";
    const request = client.request({
      ":path": `${target.pathname}${target.search}`,
      "user-agent": USER_AGENT,
      accept: "*/*",
      "accept-language": "fa,en;q=0.8",
    });
    request.setEncoding("utf8");
    request.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    request.on("data", (chunk: string) => {
      if (body.length < 400_000) body += chunk;
    });
    request.on("end", () => finish(status > 0 ? { status, body } : null));
    request.on("error", () => finish(null));
    request.end();
  });
}

async function requestOne(text: string, locale: Locale): Promise<string | null> {
  if (Date.now() < blockedUntil) return null;

  const url = `${ENDPOINT}?client=gtx&sl=fa&tl=${locale}&dt=t&q=${encodeURIComponent(text)}`;

  // HTTP/2 first. Google answers 429 to HTTP/1.1 from datacenter IPs but serves
  // the same request over h2, and Node's fetch never negotiates h2 — so the
  // transport, not the provider, decides whether the site translates at all.
  const response = await http2Get(url);
  if (response) {
    if (response.status === 429) {
      blockedUntil = Date.now() + BLOCK_COOLDOWN;
      return null;
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        const translated = readGtx(JSON.parse(response.body));
        return translated.trim() ? translated : null;
      } catch {
        return null;
      }
    }
  }

  // Fallback for a custom TRANSLATE_ENDPOINT that only speaks HTTP/1.1.
  try {
    const fallback = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!fallback.ok) return null;
    const translated = readGtx(await fallback.json());
    return translated.trim() ? translated : null;
  } catch {
    return null;
  }
}

const MARK = (index: number) => `\n###${index}###\n`;

/**
 * Translates several strings in one request by joining them with a marker the
 * translator leaves untouched. Falls back to individual requests when the
 * markers do not survive, so a provider change degrades in speed, not output.
 */
async function requestBatch(texts: string[], locale: Locale): Promise<(string | null)[]> {
  if (texts.length === 1) {
    return [await requestOne(texts[0], locale)];
  }

  const payload = texts.map((text, index) => `${text}${MARK(index)}`).join("");
  const raw = await requestOne(payload, locale);
  if (!raw) return texts.map(() => null);

  const parts = raw.split(/###\s*\d+\s*###/);
  // The first chunk is text, every marker closes one entry; a trailing empty
  // string is expected. Anything else means the markers did not survive.
  if (parts.length < texts.length) {
    return Promise.all(texts.map((text) => requestOne(text, locale)));
  }

  return texts.map((text, index) => {
    const value = (parts[index] ?? "").trim();
    return value ? value : null;
  });
}

async function runBatches(
  texts: string[],
  locale: Locale,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const batchSize = 8;

  for (let index = 0; index < texts.length; index += batchSize) {
    const slice = texts.slice(index, index + batchSize);
    const translated = await requestBatch(slice, locale);
    translated.forEach((value, offset) => {
      if (value) result.set(slice[offset], value);
    });
  }

  return result;
}

/**
 * Translates a list of strings, reusing the cache and writing new results back.
 * Order is preserved and untranslatable/empty entries come back untouched.
 */
export async function translateMany(texts: string[], locale: Locale): Promise<string[]> {
  if (locale === "fa") return texts;

  const unique = Array.from(new Set(texts.filter(needsTranslation)));
  if (unique.length === 0) return texts;

  const keys = new Map(unique.map((text) => [keyFor(locale, text), text]));
  const cached = await prisma.translation.findMany({
    where: { key: { in: Array.from(keys.keys()) } },
    select: { key: true, target: true },
  });
  const resolved = new Map<string, string>();
  for (const row of cached) {
    const source = keys.get(row.key);
    if (source) resolved.set(source, row.target);
  }

  const missing = unique.filter((text) => !resolved.has(text));
  if (missing.length > 0) {
    const fresh = await runBatches(missing, locale);
    fresh.forEach((target, source) => resolved.set(source, target));

    if (fresh.size > 0) {
      // SQLite's `createMany` has no `skipDuplicates`, and two concurrent
      // requests can race on the same key; an upsert per row is both safe and
      // small (a page translates a few dozen strings, not thousands).
      await prisma
        .$transaction(
          Array.from(fresh.entries()).map(([source, target]) =>
            prisma.translation.upsert({
              where: { key: keyFor(locale, source) },
              update: { target: target.slice(0, 8000) },
              create: {
                key: keyFor(locale, source),
                locale,
                source: source.slice(0, 4000),
                target: target.slice(0, 8000),
              },
            }),
          ),
        )
        .catch(() => {
          // A cache write must never fail the page; the text is still returned.
        });
    }
  }

  return texts.map((text) => (needsTranslation(text) ? resolved.get(text) ?? text : text));
}

/** Single-string convenience wrapper. */
export async function translate(text: string, locale: Locale): Promise<string> {
  const [result] = await translateMany([text], locale);
  return result;
}

/**
 * Long Markdown bodies: translate paragraph by paragraph so each request stays
 * inside the provider's length limit, and keep the Markdown structure.
 */
export async function translateLong(text: string, locale: Locale): Promise<string> {
  if (locale === "fa" || !needsTranslation(text)) return text;

  const blocks = text.split(/\n{2,}/);
  if (blocks.length <= 1) {
    return (await translateMany([text.slice(0, 4000)], locale))[0];
  }

  const translated = await translateMany(
    blocks.slice(0, 24).map((block) => block.slice(0, 1500)),
    locale,
  );
  const rest = blocks.slice(24);
  return [...translated, ...rest].join("\n\n");
}

type Row = Record<string, unknown>;

/**
 * Localizes the given text fields of a list of records. Missing/empty values
 * and non-text columns pass through untouched.
 */
export async function localizeRows<T extends Row>(
  rows: T[],
  fields: (keyof T & string)[],
  locale: Locale,
): Promise<T[]> {
  if (locale === "fa" || rows.length === 0) return rows;

  const values: string[] = [];
  for (const row of rows) {
    for (const field of fields) {
      const value = row[field];
      if (typeof value === "string" && value.trim()) values.push(value);
    }
  }

  const translated = await translateMany(values, locale);
  const map = new Map<string, string>();
  values.forEach((value, index) => map.set(value, translated[index]));

  return rows.map((row) => {
    const copy: Row = { ...row };
    for (const field of fields) {
      const value = copy[field];
      if (typeof value === "string" && map.has(value)) copy[field] = map.get(value);
    }
    return copy as T;
  });
}

/** Same as `localizeRows` for a single record. */
export async function localizeRow<T extends Row>(
  row: T | null,
  fields: (keyof T & string)[],
  locale: Locale,
): Promise<T | null> {
  if (!row) return row;
  const [result] = await localizeRows([row], fields, locale);
  return result;
}

/**
 * Translates every string inside a plain data structure (objects, arrays,
 * strings), preserving its shape. Non-plain values — React components, Date,
 * class instances — are passed through untouched, which is what lets a page
 * keep its icon components next to translated copy.
 */
export async function localizeTree<T>(value: T, locale: Locale): Promise<T> {
  if (locale === "fa") return value;

  const strings: string[] = [];
  const collect = (node: unknown): void => {
    if (typeof node === "string") {
      if (needsTranslation(node)) strings.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (node && typeof node === "object" && Object.getPrototypeOf(node) === Object.prototype) {
      Object.values(node as Record<string, unknown>).forEach(collect);
    }
  };
  collect(value);
  if (strings.length === 0) return value;

  const translated = await translateMany(strings, locale);
  const map = new Map(strings.map((source, index) => [source, translated[index]]));

  const rebuild = (node: unknown): unknown => {
    if (typeof node === "string") return map.get(node) ?? node;
    if (Array.isArray(node)) return node.map(rebuild);
    if (node && typeof node === "object" && Object.getPrototypeOf(node) === Object.prototype) {
      const copy: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node)) copy[key] = rebuild(child);
      return copy;
    }
    return node;
  };

  return rebuild(value) as T;
}
