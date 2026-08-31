import { siteUrl } from "@/lib/env";
import { STORE_CONTACT } from "@/lib/config/store";

/**
 * Single source of truth for site-wide SEO identity. Every metadata helper
 * and JSON-LD builder in lib/seo pulls from here, so brand name/description/
 * logo only ever need to change in one place.
 */
export const SITE_NAME = "Gifta Guru";

export const SITE_DESCRIPTION =
  "Gifta Guru is a premium corporate gifting platform for employee onboarding, appreciation, client gifting, and bulk corporate orders across India.";

/** Absolute URL to the logo used for OG/Twitter fallback images and JSON-LD. */
export function logoUrl(): string {
  return `${siteUrl()}/SBanners/SBanners/NEW%20LOGO.png`;
}

export function organizationId(): string {
  return `${siteUrl()}/#organization`;
}

export function websiteId(): string {
  return `${siteUrl()}/#website`;
}

export const SITE_LOCALE = "en_IN";

export { STORE_CONTACT };
