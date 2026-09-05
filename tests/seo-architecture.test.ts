import { test } from "node:test";
import assert from "node:assert/strict";

import { productSeoContent } from "../lib/seo/content/products.ts";
import { collectionSeoContent } from "../lib/seo/content/collections.ts";
import { industryPages } from "../lib/seo/content/industries.ts";
import { useCasePages } from "../lib/seo/content/use-cases.ts";
import { occasionPages } from "../lib/seo/content/occasions.ts";
import { giftSetPages } from "../lib/seo/content/gift-sets.ts";
import { guidePages } from "../lib/seo/content/guides.ts";
import { products as catalogProducts } from "../data/products.ts";

/**
 * Guards the SEO keyword architecture at the level that actually breaks.
 *
 * `npm run seo:validate` is the full audit; these are the invariants worth
 * failing CI over, because violating them silently costs rankings rather than
 * throwing an error at runtime. In particular: the moment two pages claim one
 * primary keyword, they start competing with each other, and nothing in the
 * application would otherwise notice.
 */

const landingPages = [
  ...industryPages.map((p) => ({ path: `/industries/${p.slug}`, ...p })),
  ...useCasePages.map((p) => ({ path: `/gifting/${p.slug}`, ...p })),
  ...occasionPages.map((p) => ({ path: `/occasions/${p.slug}`, ...p })),
  ...giftSetPages.map((p) => ({ path: `/gift-sets/${p.slug}`, ...p })),
  ...guidePages.map((p) => ({ path: `/guides/${p.slug}`, ...p })),
];

const allPages = [
  ...productSeoContent.map((p) => ({ path: `/products/${p.slug}`, ...p })),
  ...collectionSeoContent.map((p) => ({ path: `/categories/${p.slug}`, ...p })),
  ...landingPages,
];

const norm = (s: string) => s.toLowerCase().trim();

test("every indexable page owns a distinct primary keyword", () => {
  const owners = new Map<string, string>();
  const conflicts: string[] = [];

  for (const page of allPages) {
    const key = norm(page.primaryKeyword);
    const existing = owners.get(key);
    if (existing) conflicts.push(`"${page.primaryKeyword}" claimed by ${existing} and ${page.path}`);
    else owners.set(key, page.path);
  }

  assert.deepEqual(conflicts, [], "keyword cannibalization");
});

test("no page targets another page's primary keyword as a secondary", () => {
  const primaryOwner = new Map(allPages.map((p) => [norm(p.primaryKeyword), p.path]));
  const shadows: string[] = [];

  for (const page of allPages) {
    for (const secondary of page.secondaryKeywords) {
      const owner = primaryOwner.get(norm(secondary));
      if (owner && owner !== page.path) {
        shadows.push(`${page.path} lists "${secondary}", owned by ${owner}`);
      }
    }
  }

  assert.deepEqual(shadows, []);
});

test("SEO content exists for every catalog product, and only for real products", () => {
  const catalogSlugs = new Set(catalogProducts.map((p) => p.slug));
  const seoSlugs = new Set(productSeoContent.map((p) => p.slug));

  assert.deepEqual(
    [...catalogSlugs].filter((slug) => !seoSlugs.has(slug)),
    [],
    "catalog products with no SEO content",
  );
  assert.deepEqual(
    [...seoSlugs].filter((slug) => !catalogSlugs.has(slug)),
    [],
    "SEO content referencing products that do not exist",
  );
});

test("every recommended product on a landing page exists in the catalog", () => {
  const catalogSlugs = new Set(catalogProducts.map((p) => p.slug));
  const broken: string[] = [];

  for (const page of landingPages) {
    for (const slug of page.recommendedProductSlugs) {
      if (!catalogSlugs.has(slug)) broken.push(`${page.path} -> ${slug}`);
    }
  }

  assert.deepEqual(broken, []);
});

test("titles and meta descriptions are unique and present", () => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const duplicates: string[] = [];

  for (const page of allPages) {
    assert.ok(page.seoTitle.trim().length > 0, `${page.path} has no SEO title`);
    assert.ok(page.metaDescription.trim().length > 0, `${page.path} has no meta description`);
    assert.ok(page.h1.trim().length > 0, `${page.path} has no H1`);

    const titleOwner = titles.get(page.seoTitle);
    if (titleOwner) duplicates.push(`title "${page.seoTitle}": ${titleOwner} + ${page.path}`);
    else titles.set(page.seoTitle, page.path);

    const descOwner = descriptions.get(page.metaDescription);
    if (descOwner) duplicates.push(`description: ${descOwner} + ${page.path}`);
    else descriptions.set(page.metaDescription, page.path);
  }

  assert.deepEqual(duplicates, []);
});

test("every landing page carries FAQs and outbound internal links", () => {
  for (const page of landingPages) {
    assert.ok(page.faqs.length > 0, `${page.path} has no FAQs`);
    assert.ok(page.sections.length >= 2, `${page.path} has fewer than two sections`);
    assert.ok(page.relatedLinks.length >= 2, `${page.path} has fewer than two internal links`);
  }
});
