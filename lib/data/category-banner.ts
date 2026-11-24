import { z } from "zod";
import { newYearCampaign } from "@/lib/campaign/new-year";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { fallbackHomeBanners } from "@/lib/data/content";

export function categoryBannerKey(slug?: string) {
  return slug ? `category_banner:${slug}` : "category_banner";
}
export const defaultCategoryBanner = {
  label: "New Year 2027 gifts",
  linkUrl: newYearCampaign.path,
  imageUrl: newYearCampaign.bannerImage,
  isPublished: true,
};

const schema = z.object({
  label: z.string(),
  linkUrl: z.string(),
  imageUrl: z.string(),
  isPublished: z.boolean(),
});

export type BannerCategory = { slug: string; name: string; imageUrl: string | null };

export async function getCategoryBanner(category?: BannerCategory) {
  if (isDatabaseConfigured()) {
    const key = categoryBannerKey(category?.slug);
    const row = await prisma.storeSetting.findUnique({ where: { key } });
    if (row) return schema.parse(row.value);
  }
  if (!category) return defaultCategoryBanner;
  const artwork = fallbackHomeBanners.find((slide) => slide.href === `/categories/${category.slug}`);
  const imageUrl = artwork?.src ?? category.imageUrl ?? "/images/editorial/premium-corporate-gifting.webp";
  return { imageUrl, label: category.name, linkUrl: `/categories/${category.slug}#products`, isPublished: Boolean(imageUrl) };
}
