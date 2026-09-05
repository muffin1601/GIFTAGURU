/**
 * Shared shape for every editorial SEO landing page (industry, use-case,
 * occasion, multi-piece gift set, and guide).
 *
 * One shape means one renderer and one metadata path, so a new page cannot
 * accidentally ship without a title, an H1, FAQs or internal links -- the type
 * makes those mandatory. It also keeps these pages structurally consistent for
 * crawlers without making them read as templated: `sections` is free-form, and
 * every page supplies its own headings and copy.
 *
 * Deliberately NOT in this shape: prices, stock, delivery promises or
 * certifications. Those are merchandising facts that live in the database and
 * store settings; repeating them in editorial copy is how a storefront ends up
 * publishing claims it cannot honour.
 */

export interface LandingSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingLink {
  /** Descriptive anchor text. Avoid repeating one exact anchor site-wide. */
  label: string;
  href: string;
}

export interface LandingPageContent {
  slug: string;
  /** The single keyword this page owns. Unique across ALL landing pages. */
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  /** Lead paragraphs under the H1. */
  intro: string[];
  /** Body sections, rendered as H2 + copy/bullets. */
  sections: LandingSection[];
  faqs: LandingFaq[];
  /**
   * Catalog slugs recommended on this page. Rendered as real product cards,
   * resolved against the live catalog -- a slug that no longer exists simply
   * does not render, so a deleted product cannot leave a broken link.
   */
  recommendedProductSlugs: string[];
  /** Contextual internal links out of this page. */
  relatedLinks: LandingLink[];
}

/** The five editorial page families, each mounted on its own route segment. */
export type LandingFamily = "industries" | "gifting" | "occasions" | "gift-sets" | "guides";

export interface LandingFamilyConfig {
  family: LandingFamily;
  /** URL segment, e.g. "/industries". */
  basePath: string;
  /** Breadcrumb + hub page label. */
  label: string;
}

export const landingFamilies: Record<LandingFamily, LandingFamilyConfig> = {
  industries: { family: "industries", basePath: "/industries", label: "Industries" },
  gifting: { family: "gifting", basePath: "/gifting", label: "Gifting Solutions" },
  occasions: { family: "occasions", basePath: "/occasions", label: "Occasions" },
  "gift-sets": { family: "gift-sets", basePath: "/gift-sets", label: "Gift Sets" },
  guides: { family: "guides", basePath: "/guides", label: "Guides" },
};

export function landingPath(family: LandingFamily, slug: string): string {
  return `${landingFamilies[family].basePath}/${slug}`;
}
