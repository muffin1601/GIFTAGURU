import "server-only";

import { cache } from "react";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { guidePages } from "@/lib/seo/content/guides";
import type { BlogPost, BlogFaq, BlogLink, BlogSection } from "./types";

const DEFAULT_IMAGE = "/BANNERS/PREMIUM.png";
const DEFAULT_DATE = new Date("2026-01-15T00:00:00.000Z");

/** Existing long-form guides are the initial editorial library. They are
 * exposed only at /blog; /guides permanently redirects, avoiding duplicate
 * content while the database-backed manager becomes the ongoing source. */
const builtInPosts: BlogPost[] = guidePages.map((guide, index) => ({
  slug: guide.slug,
  title: guide.h1,
  excerpt: guide.intro[0],
  sections: guide.sections,
  faqs: guide.faqs,
  relatedLinks: guide.relatedLinks,
  recommendedProductSlugs: guide.recommendedProductSlugs,
  category:
    guide.slug.includes("welcome") ? "Employee Gifting" :
    guide.slug.includes("client") ? "Client Gifting" :
    guide.slug.includes("eco") ? "Sustainable Gifting" :
    guide.slug.includes("conference") || guide.slug.includes("branding") ? "Promotional Merchandise" :
    guide.slug.includes("diwali") ? "Festive Gifting" : "Corporate Gifting",
  featuredImageUrl: DEFAULT_IMAGE,
  featuredImageAlt: "Curated corporate gifting collection by Gifta Guru",
  authorName: "Gifta Guru Team",
  seoTitle: guide.seoTitle,
  metaDescription: guide.metaDescription,
  focusKeyword: guide.primaryKeyword,
  isFeatured: index < 3,
  publishedAt: DEFAULT_DATE,
  updatedAt: DEFAULT_DATE,
}));

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function sections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.heading !== "string" || !row.heading.trim()) return [];
    return [{ heading: row.heading, body: stringArray(row.body), bullets: stringArray(row.bullets) }];
  });
}

function links(value: unknown): BlogLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row.label === "string" && typeof row.href === "string" && row.href.startsWith("/")
      ? [{ label: row.label, href: row.href }]
      : [];
  });
}

function faqs(value: unknown): BlogFaq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row.question === "string" && typeof row.answer === "string"
      ? [{ question: row.question, answer: row.answer }]
      : [];
  });
}

function fromDatabase(row: Awaited<ReturnType<typeof prisma.blogPost.findFirst>>): BlogPost | null {
  if (!row) return null;
  const document = row.content as Record<string, unknown>;
  const parsedSections = sections(document.sections);
  if (parsedSections.length === 0) return null;
  return {
    slug: row.slug, title: row.title, excerpt: row.excerpt, sections: parsedSections,
    faqs: faqs(document.faqs), relatedLinks: links(document.relatedLinks),
    recommendedProductSlugs: stringArray(document.recommendedProductSlugs), category: row.category,
    featuredImageUrl: row.featuredImageUrl ?? DEFAULT_IMAGE,
    featuredImageAlt: row.featuredImageAlt ?? "Corporate gifting guide by Gifta Guru",
    authorName: row.authorName ?? undefined, seoTitle: row.seoTitle ?? row.title,
    metaDescription: row.metaDescription ?? row.excerpt, canonicalUrl: row.canonicalUrl ?? undefined, ogTitle: row.ogTitle ?? undefined,
    ogDescription: row.ogDescription ?? undefined, ogImageUrl: row.ogImageUrl ?? undefined,
    focusKeyword: row.focusKeyword ?? undefined, isFeatured: row.isFeatured,
    publishedAt: row.publishedAt ?? row.createdAt, updatedAt: row.updatedAt,
  };
}

export const getPublishedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const fallback = [...builtInPosts];
  if (!isDatabaseConfigured()) return fallback;
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "published", publishedAt: { not: null, lte: new Date() } },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    });
    const databasePosts = rows.map(fromDatabase).filter((post): post is BlogPost => post !== null);
    const dbSlugs = new Set(databasePosts.map((post) => post.slug));
    return [...databasePosts, ...fallback.filter((post) => !dbSlugs.has(post.slug))];
  } catch {
    return fallback;
  }
});

export const getPublishedBlogPost = cache(async (slug: string) =>
  (await getPublishedBlogPosts()).find((post) => post.slug === slug) ?? null,
);

export function blogCategories(posts: BlogPost[]) {
  return [...new Set(posts.map((post) => post.category))].sort();
}
