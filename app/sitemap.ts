import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { siteUrl } from "@/lib/env";
import { categories as fallbackCategories } from "@/data/categories";

/**
 * Database-driven. The previous version listed URLs from data/products.ts
 * and data/categories.ts -- static bootstrap fixtures with a single sample
 * product -- so the sitemap never reflected the real catalog admins actually
 * manage. This reads the same tables the storefront renders from, and only
 * includes what's genuinely live: active products, published collections.
 *
 * lastModified uses each row's real updatedAt, not the request time, so
 * Google can tell an unchanged product from one that was just edited.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  // Indexable, canonical, publicly useful pages only. Utility/account/auth
  // routes are intentionally absent -- they carry a noindex directive
  // instead (see lib/seo/metadata.ts usages), so listing them here would
  // contradict that signal.
  const staticRoutes = [
    "",
    "/shop",
    "/corporate-gifting",
    "/categories",
    "/custom-gifts",
    // /bulk-orders intentionally excluded -- it renders the identical page as
    // /bulk-enquiry (see app/bulk-orders/page.tsx) and canonicalizes there.
    "/bulk-enquiry",
    "/about",
    "/contact",
    "/track-order",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  if (!isDatabaseConfigured()) {
    // No database configured (e.g. a fresh checkout of this repo): fall back
    // to the bundled fixture categories rather than emit an empty sitemap.
    return [
      ...staticEntries,
      ...fallbackCategories.map((category) => ({
        url: `${base}/categories/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  }

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...staticEntries,
    ...collections.map((collection) => ({
      url: `${base}/categories/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
