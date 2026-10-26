/** A media-library row, as handed to client components (the media picker). */
export type MediaItem = {
  id: string;
  filename: string;
  path: string;
  alt: string;
};

/**
 * True when a stored image value is safe to put in `src`.
 *
 * Only two shapes are accepted: a root-relative path (`/uploads/...`) or an
 * absolute http(s) URL. Protocol-relative (`//host`) and `javascript:` values
 * are rejected, so a value that reached the database before validation existed
 * still cannot execute in the browser.
 */
export function isSafeImageSrc(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value);
}

/** Normalises a stored image value to a renderable src, or "" when unsafe. */
export function imageSrc(value: string | null | undefined): string {
  return isSafeImageSrc(value) ? (value as string) : "";
}
