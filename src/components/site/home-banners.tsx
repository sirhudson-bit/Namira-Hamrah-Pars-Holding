import { prisma } from "@/server/db";
import { imageSrc } from "@/lib/media";
import { BannerSlider, type BannerSlide } from "./banner-slider";

/**
 * Active home banners, newest order first. Renders nothing when the admin has
 * not created a banner, so an untouched install keeps its previous home page.
 */
export async function HomeBanners() {
  const rows = await prisma.homeBanner.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  const slides: BannerSlide[] = rows
    .map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      image: imageSrc(row.image),
      imageAlt: row.imageAlt,
      imagePosition: row.imagePosition,
      href: row.href,
      ctaLabel: row.ctaLabel,
    }))
    .filter((slide) => slide.image);

  if (slides.length === 0) return null;
  return <BannerSlider slides={slides} />;
}
