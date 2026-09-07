import { test } from "node:test";
import assert from "node:assert/strict";

import {
  productSeoContent,
  getProductSeoContent,
  expandProductSlugs,
} from "../lib/seo/content/products.ts";
import { collectionSeoContent } from "../lib/seo/content/collections.ts";
import { industryPages } from "../lib/seo/content/industries.ts";
import { useCasePages } from "../lib/seo/content/use-cases.ts";
import { occasionPages } from "../lib/seo/content/occasions.ts";
import { giftSetPages } from "../lib/seo/content/gift-sets.ts";
import { guidePages } from "../lib/seo/content/guides.ts";
import { seasonalHubs } from "../lib/seo/content/seasonal.ts";
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

// Seasonal hubs (/diwali-2026) sit at the site root rather than under a
// family segment, but they are indexable pages owning a primary keyword, so
// they belong in the same cannibalization and metadata guards as everything
// else. Leaving them out is exactly how a seasonal page ends up quietly
// competing with the evergreen occasion page it was meant to support.
const seasonalPages = seasonalHubs.map((p) => ({ path: `/${p.slug}`, ...p }));

const allPages = [
  ...productSeoContent.map((p) => ({ path: `/products/${p.slug}`, ...p })),
  ...collectionSeoContent.map((p) => ({ path: `/categories/${p.slug}`, ...p })),
  ...landingPages,
  ...seasonalPages,
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

test("slug aliases are unique and resolve to their own product", () => {
  const owner = new Map<string, string>();
  const problems: string[] = [];

  for (const product of productSeoContent) {
    for (const alias of product.slugAliases ?? []) {
      if (alias === product.slug) problems.push(`${product.slug} aliases itself`);

      const existing = owner.get(alias);
      if (existing) problems.push(`alias "${alias}" claimed by ${existing} and ${product.slug}`);
      else owner.set(alias, product.slug);

      // An alias must never be another product's real slug, or one product's
      // SEO copy would render on another product's page.
      const clash = catalogProducts.find((c) => c.slug === alias);
      if (clash && clash.slug !== product.slug) {
        problems.push(`alias "${alias}" is the real slug of a different product`);
      }

      assert.equal(
        getProductSeoContent(alias)?.slug,
        product.slug,
        `alias "${alias}" does not resolve back to ${product.slug}`,
      );
    }
  }

  assert.deepEqual(problems, []);
});

test("expandProductSlugs includes every alias, so recommendations cannot silently drop", () => {
  const aliased = productSeoContent.find((p) => (p.slugAliases ?? []).length > 0);
  assert.ok(aliased, "expected at least one aliased product to exercise this path");

  const expanded = expandProductSlugs([aliased.slug]);
  for (const alias of aliased.slugAliases ?? []) {
    assert.ok(expanded.includes(alias), `expanded list is missing alias "${alias}"`);
  }
  assert.ok(expanded.includes(aliased.slug));
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
  for (const page of [...landingPages, ...seasonalPages]) {
    assert.ok(page.faqs.length > 0, `${page.path} has no FAQs`);
    assert.ok(page.sections.length >= 2, `${page.path} has fewer than two sections`);
    assert.ok(page.relatedLinks.length >= 2, `${page.path} has fewer than two internal links`);
  }
});

test("a seasonal hub recommends only products that exist in the catalog", () => {
  const known = new Set([
    ...catalogProducts.map((p) => p.slug),
    ...productSeoContent.flatMap((p) => [p.slug, ...(p.slugAliases ?? [])]),
  ]);

  for (const hub of seasonalHubs) {
    for (const slug of hub.recommendedProductSlugs) {
      assert.ok(known.has(slug), `/${hub.slug} recommends missing product "${slug}"`);
    }
  }
});

/**
 * The seasonal hub exists precisely because the occasion pages may not name a
 * year. If someone later adds a year to an occasion or guide page, the two
 * start competing and this is the cheapest place to catch it.
 */
test("only seasonal hubs carry a year in their URL", () => {
  for (const page of landingPages) {
    assert.ok(!/\b20\d{2}\b/.test(page.path), `${page.path} names a year; that belongs on a seasonal hub`);
  }
});
