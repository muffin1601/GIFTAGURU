import { z } from "zod";
import { newYearCampaign } from "@/lib/campaign/new-year";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const categoryBannerKey = "category_banner";
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

export async function getCategoryBanner() {
  if (!isDatabaseConfigured()) return defaultCategoryBanner;
  const row = await prisma.storeSetting.findUnique({ where: { key: categoryBannerKey } });
  return row ? schema.parse(row.value) : defaultCategoryBanner;
}
