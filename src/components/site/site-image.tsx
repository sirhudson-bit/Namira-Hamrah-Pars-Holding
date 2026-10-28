import { imageSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Plain responsive image for admin-supplied sources.
 *
 * Deliberately not `next/image`: uploads are written at runtime, and the
 * optimiser's on-demand fetch of a just-written file is an extra failure mode
 * for no visible gain here. Values are validated, alt text is required by the
 * callers, and loading is lazy unless the image is above the fold.
 */
export function SiteImage({
  src,
  alt,
  className,
  priority,
  width,
  height,
  style,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  const safe = imageSrc(src);
  if (!safe) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={safe}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={style}
      className={cn("block", className)}
    />
  );
}
