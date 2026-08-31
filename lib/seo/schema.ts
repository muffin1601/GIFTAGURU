import { siteUrl } from "@/lib/env";
import { STORE_CONTACT, SITE_NAME, logoUrl, organizationId, websiteId } from "@/lib/seo/site";

/** Resolves a root-relative image path (and encodes spaces/special chars in
 * it) against siteUrl(); leaves an already-absolute URL untouched. */
function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, siteUrl()).toString();
}

/**
 * Organization + WebSite JSON-LD, emitted once from the root layout and
 * referenced by @id from page-level schema (Product, BreadcrumbList) rather
 * than repeated on every page.
 */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE_NAME,
    url: siteUrl(),
    logo: logoUrl(),
    // Real, currently-displayed contact details only -- lib/config/store.ts
    // is the same source the footer and contact page render from.
    contactPoint: {
      "@type": "ContactPoint",
      telephone: STORE_CONTACT.phoneHref,
      email: STORE_CONTACT.email,
      contactType: "customer service",
      areaServed: "IN",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE_CONTACT.address,
      addressCountry: "IN",
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: SITE_NAME,
    url: siteUrl(),
    publisher: { "@id": organizationId() },
    // No internal search results are unique/indexable, so this deliberately
    // omits SearchAction -- adding one would imply a search feature Google
    // could surface directly, which /search does not currently support well
    // enough (see the noindex on that route).
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  };
}

interface ProductSchemaInput {
  name: string;
  description: string;
  slug: string;
  images: string[];
  sku?: string;
  price: number;
  currency?: string;
  /** True only when the product can actually be added to cart right now. */
  inStock: boolean;
  avgRating?: number;
  reviewCount?: number;
}

/**
 * Product JSON-LD. avgRating/reviewCount are only included when reviewCount
 * is genuinely > 0 -- this app has never seeded fake ratings (see
 * lib/data/products.ts), and this builder preserves that: no reviewCount,
 * no aggregateRating block, full stop.
 */
export function productSchema(input: ProductSchemaInput) {
  const url = `${siteUrl()}/products/${input.slug}`;

  return {
    "@type": "Product",
    name: input.name,
    description: input.description,
    // Google's Product structured data requires absolute image URLs; unlike
    // Next's <head> metadata (which resolves relative OG images against
    // metadataBase automatically), a hand-built JSON-LD object gets no such
    // help, so root-relative paths must be resolved here explicitly.
    image: input.images.map((image) => absoluteUrl(image)),
    ...(input.sku ? { sku: input.sku } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: input.currency ?? "INR",
      price: input.price.toFixed(2),
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": organizationId() },
    },
    ...(input.reviewCount && input.reviewCount > 0 && input.avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: input.avgRating,
            reviewCount: input.reviewCount,
          },
        }
      : {}),
  };
}

/**
 * Renders one or more JSON-LD objects as a single <script> tag. `</script>`
 * is escaped so a value containing that literal string (e.g. a product
 * description) can never break out of the script context.
 */
export function jsonLdScript(graph: Record<string, unknown> | Record<string, unknown>[]) {
  const payload = Array.isArray(graph)
    ? { "@context": "https://schema.org", "@graph": graph }
    : { "@context": "https://schema.org", ...graph };

  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return json;
}
