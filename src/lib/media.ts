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

/**
 * Admin-selectable crop focus for cover images. The same list feeds every
 * image-position select in the admin and the CSS value used on the public site,
 * so a new option cannot drift between the two.
 */
export const IMAGE_POSITION_OPTIONS = [
  { value: "center", label: "وسط" },
  { value: "top", label: "بالا" },
  { value: "bottom", label: "پایین" },
  { value: "left", label: "چپ" },
  { value: "right", label: "راست" },
  { value: "top left", label: "بالا چپ" },
  { value: "top right", label: "بالا راست" },
  { value: "bottom left", label: "پایین چپ" },
  { value: "bottom right", label: "پایین راست" },
] as const;

export type ImagePosition = (typeof IMAGE_POSITION_OPTIONS)[number]["value"];

/** Valid CSS object/background position; unknown values fall back to center. */
export function imagePositionCss(value: string | null | undefined): string {
  return IMAGE_POSITION_OPTIONS.some((option) => option.value === value) ? (value as string) : "center";
}
