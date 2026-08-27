import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { siteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = [
    "",
    "/shop",
    "/search",
    "/corporate-gifting",
    "/categories",
    "/custom-gifts",
    "/bulk-enquiry",
    "/bulk-orders",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...categories.map((category) => ({
      url: `${base}/categories/${category.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
