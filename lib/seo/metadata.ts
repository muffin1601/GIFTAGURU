import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";
import { SITE_LOCALE, SITE_NAME, logoUrl } from "@/lib/seo/site";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path only, e.g. "/shop" or "/products/foo" -- resolved against siteUrl(). */
  path: string;
  /** Absolute or root-relative image URL. Defaults to the brand logo. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** Set false for pages that exist and are linkable but shouldn't be indexed
   * (account, cart, search, auth flows, ...). Never set true to hide content
   * that Google should legitimately index. */
  index?: boolean;
}

/**
 * The one place every indexable (and every deliberately-non-indexable) page
 * builds its <head> metadata from. Guarantees canonical + OG + Twitter are
 * never forgotten on a new page, and that "index: false" pages consistently
 * emit a real robots directive rather than silently inheriting the default.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const url = `${siteUrl()}${input.path}`;
  const image = input.image ?? logoUrl();
  const index = input.index ?? true;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: input.type ?? "website",
      images: [{ url: image, alt: input.imageAlt ?? input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

/** Truncates on a word boundary so descriptions never cut mid-word in search snippets. */
export function truncateDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length)}…`;
}
