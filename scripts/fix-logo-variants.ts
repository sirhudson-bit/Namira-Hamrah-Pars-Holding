/**
 * One-time repair for the two logo uploads.
 *
 * The original labels («لوگوی اصلی» / «لوگوی روشن») did not say which background
 * each file was drawn for, so several installs uploaded them the other way
 * round: the white artwork sat in `logo_path` (used on light backgrounds) and
 * the dark artwork in `logo_light_path` (used on dark ones). The result was an
 * invisible mark in one of the two themes.
 *
 * The labels now say «پس‌زمینه روشن» / «پس‌زمینه تیره». This script brings the
 * stored values in line with them by measuring the average luminance of the
 * opaque pixels: a file whose ink is light belongs on the dark background.
 * Files that are already correct, or that have no clearly light/dark ink
 * (a mid-tone brand colour), are left untouched and reported.
 *
 *   npx tsx scripts/fix-logo-variants.ts          # report only
 *   npx tsx scripts/fix-logo-variants.ts --apply  # swap when inverted
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "../src/server/db";

const APPLY = process.argv.includes("--apply");

/** Average luminance (0–255) of the pixels that are not fully transparent. */
async function inkLuminance(storedPath: string): Promise<number | null> {
  const file = path.join(process.cwd(), "public", storedPath.replace(/^\//, ""));
  try {
    const { data } = await sharp(await readFile(file))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let total = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 16) continue;
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      count += 1;
    }
    return count === 0 ? null : total / count;
  } catch {
    return null;
  }
}

async function main() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["logo_path", "logo_light_path"] } },
  });
  const value = (key: string) => rows.find((row) => row.key === key)?.value ?? "";

  const onLight = value("logo_path");
  const onDark = value("logo_light_path");

  if (!onLight || !onDark) {
    console.log("Both logo files are not uploaded — nothing to swap.");
    return;
  }

  const lightInk = await inkLuminance(onLight);
  const darkInk = await inkLuminance(onDark);
  console.log(`logo_path       ${onLight}  ink luminance ${lightInk?.toFixed(1) ?? "?"}`);
  console.log(`logo_light_path ${onDark}  ink luminance ${darkInk?.toFixed(1) ?? "?"}`);

  if (lightInk === null || darkInk === null) {
    console.log("Could not measure one of the files — leaving settings untouched.");
    return;
  }

  // The file used on light backgrounds must be the dark ink, and vice versa.
  const inverted = lightInk > darkInk + 20;
  if (!inverted) {
    console.log("Already correct: the light-background logo has the darker ink.");
    return;
  }

  console.log("Inverted: the white artwork is on the light background. Swapping.");
  if (!APPLY) {
    console.log("Dry run — re-run with --apply to write the change.");
    return;
  }

  await prisma.$transaction([
    prisma.setting.update({ where: { key: "logo_path" }, data: { value: onDark } }),
    prisma.setting.update({ where: { key: "logo_light_path" }, data: { value: onLight } }),
  ]);
  console.log("Swapped. The site now renders dark ink on light and light ink on dark.");
}

main().finally(() => prisma.$disconnect());
