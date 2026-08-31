import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * robots.txt blocks crawling of areas with no public search value or that
 * are sensitive (admin, account, checkout, auth, internal APIs). It does NOT
 * block pages like /cart or /search -- those are crawlable but carry a
 * `noindex` meta directive instead (see lib/seo/metadata.ts usages), which
 * is the correct pattern: a robots.txt block would hide the noindex tag
 * itself from Googlebot, so the page could still get indexed with no
 * snippet. Blocking generation/action endpoints here is about crawl budget
 * and privacy, not indexation.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/account",
        "/account/",
        "/checkout",
        "/api/",
        "/auth/callback",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
