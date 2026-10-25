/**
 * Embed handling.
 *
 * Google Maps (and Aparat/YouTube) hand the administrator a full `<iframe …>`
 * snippet, not a bare URL. Pasting that snippet into a single-line "embed
 * address" field used to put the whole HTML string into `iframe[src]`, which
 * the browser requests as a relative path → the map area 404s.
 *
 * Everything that lands in an `iframe[src]` goes through `extractEmbedUrl`.
 */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#38;": "&",
  "&#x26;": "&",
  "&quot;": '"',
  "&#34;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(?:amp|#38|#x26|quot|#34|#39|apos|lt|gt|nbsp);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

/**
 * Reduces anything an administrator might paste — a bare URL, a `src` value
 * with HTML entities, or a complete `<iframe>` snippet — to one http(s) URL.
 *
 * Returns an empty string when no usable URL can be found, so callers fall
 * back to their "no embed configured" state instead of rendering a broken
 * frame.
 */
export function extractEmbedUrl(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  let candidate = raw;

  // 1) A full embed snippet: take the iframe's src and drop the markup.
  const iframe = /<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(raw);
  if (iframe) {
    candidate = iframe[1] ?? iframe[2] ?? iframe[3] ?? "";
  } else if (raw.startsWith("<")) {
    // Some other markup with no iframe in it — nothing embeddable here.
    return "";
  }

  candidate = decodeEntities(candidate).trim();

  // 2) Strip the quotes a pasted `src="…"` fragment may still carry.
  candidate = candidate.replace(/^["']|["']$/g, "").trim();

  // 3) Protocol-relative URLs.
  if (candidate.startsWith("//")) candidate = `https:${candidate}`;

  if (!/^https?:\/\/[^\s]+$/i.test(candidate)) return "";

  // 4) A Google Maps *share* link cannot be framed; only the /maps/embed
  //    endpoint can. Surface that as "nothing configured" rather than a 404.
  if (/^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(candidate)) return "";

  return candidate;
}

/** True when the value is a Google Maps embed URL the browser can frame. */
export function isGoogleMapsEmbed(url: string): boolean {
  return /^https:\/\/(?:www\.)?google\.[a-z.]+\/maps\/embed/i.test(url);
}
