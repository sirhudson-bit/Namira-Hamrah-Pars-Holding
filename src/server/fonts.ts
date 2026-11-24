import { cache } from "react";
import { prisma } from "@/server/db";

/** The family the design ships with; always available as a fallback. */
export const DEFAULT_FONT_FAMILY = "Vazirmatn";

export type FontAssetRow = {
  id: string;
  family: string;
  weight: string;
  style: string;
  filename: string;
  path: string;
  mime: string;
  size: number;
  createdAt: Date;
};

/**
 * Families and names end up inside a `<style>` block and a CSS custom
 * property, so only letters, digits, spaces, hyphens and underscores are kept.
 * Quotes or braces in the value would otherwise be able to close the rule.
 */
export function sanitizeFamily(value: string): string {
  return value
    .replace(/["'{}<>;\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
}

/** All uploaded font files, ordered so weights group together. */
export const getFontAssets = cache(async (): Promise<FontAssetRow[]> => {
  return prisma.fontAsset.findMany({
    orderBy: [{ family: "asc" }, { weight: "asc" }, { style: "asc" }],
  });
});

/** Distinct families an administrator can pick, including the bundled one. */
export const getFontFamilies = cache(async (): Promise<string[]> => {
  const assets = await getFontAssets();
  return Array.from(new Set([DEFAULT_FONT_FAMILY, ...assets.map((asset) => asset.family)]));
});

/**
 * `@font-face` rules for every uploaded file.
 *
 * `font-display: swap` keeps the first paint at the fallback instead of an
 * invisible-text block, and the unicode-range is left open because Persian
 * sites routinely mix Arabic and Latin glyphs in the same run.
 */
export function fontFaceCss(assets: FontAssetRow[]): string {
  return assets
    .map((asset) => {
      const family = sanitizeFamily(asset.family);
      if (!family) return "";
      const weight = /^(normal|bold|[1-9]00)$/.test(asset.weight) ? asset.weight : "400";
      const style = asset.style === "italic" ? "italic" : "normal";
      return `@font-face{font-family:"${family}";src:url("${asset.path}") format("${formatFor(asset.path)}");font-weight:${weight};font-style:${style};font-display:swap;}`;
    })
    .filter(Boolean)
    .join("\n");
}

function formatFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "otf") return "opentype";
  return "truetype";
}

/** CSS font-family stacks with a safe fallback chain. */
export function familyStack(family: string, fallback = DEFAULT_FONT_FAMILY): string {
  const safe = sanitizeFamily(family) || fallback;
  const fallbacks = [`"${fallback}"`, "system-ui", "sans-serif"].filter(
    (entry) => entry !== `"${safe}"`,
  );
  return [`"${safe}"`, ...fallbacks].join(", ");
}
