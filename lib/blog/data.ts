import "server-only";

import { cache } from "react";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { guidePages } from "@/lib/seo/content/guides";
import type { BlogPost, BlogFaq, BlogLink, BlogSection } from "./types";

const DEFAULT_IMAGE = "/images/editorial/premium-corporate-gifting.webp";
// Repository history is the evidence for the bundled editorial dates. The
// guides were first published on 5 September and substantively revised on
// 8 September; the standalone tech-gifting article was added on 18 September.
// Do not replace these with deployment time or a generic freshness date.
const GUIDE_PUBLISHED_AT = new Date("2026-09-05T10:09:32.000Z");
const GUIDE_UPDATED_AT = new Date("2026-09-08T08:05:28.000Z");
const TECH_POST_PUBLISHED_AT = new Date("2026-09-18T11:27:30.000Z");

const GUIDE_IMAGES: Record<string, { src: string; alt: string }> = {
  "corporate-gifting-guide": { src: "/images/editorial/premium-corporate-gifting.webp", alt: "Blue and sage gift boxes wrapped with white ribbon" },
  "employee-welcome-kit-guide": { src: "/images/editorial/employee-welcome-workspace.webp", alt: "Notebooks, pen and coffee arranged on a modern workspace" },
  "client-gifting-guide": { src: "/Gifta Guru/Set 12/1 (1).png", alt: "Premium client appreciation corporate gift set" },
  "corporate-gifting-budget-guide": { src: "/Gifta Guru/Set 18/1 (1).png", alt: "Curated corporate gift set for employee programmes" },
  "eco-friendly-corporate-gifting": { src: "/images/editorial/custom-gift-preparation.webp", alt: "Hands carefully finishing a reusable green gift box" },
  "diwali-corporate-gifting-guide": { src: "/Diwali kits/Set 8/Primary_1.webp", alt: "Corporate Diwali gift box for employees and clients" },
  "conference-giveaway-guide": { src: "/catalogue-2026-images/page-03-img-06_720x541.png", alt: "Corporate event gifts and conference giveaways" },
  "logo-branding-on-corporate-gifts": { src: "/Gifta Guru/Set 16/1 (1).png", alt: "Custom branded corporate stationery gift set" },
};

/** Existing long-form guides are the initial editorial library. They are
 * exposed only at /blog; /guides permanently redirects, avoiding duplicate
 * content while the database-backed manager becomes the ongoing source. */
const guidePosts: BlogPost[] = guidePages.map((guide, index) => ({
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
  featuredImageUrl: GUIDE_IMAGES[guide.slug]?.src ?? DEFAULT_IMAGE,
  featuredImageAlt: GUIDE_IMAGES[guide.slug]?.alt ?? "Curated corporate gifting collection by Gifta Guru",
  authorName: "Gifta Guru Team",
  seoTitle: guide.seoTitle,
  metaDescription: guide.metaDescription,
  focusKeyword: guide.primaryKeyword,
  isFeatured: index < 3,
  publishedAt: GUIDE_PUBLISHED_AT,
  updatedAt: GUIDE_UPDATED_AT,
}));

const techDiwaliPost: BlogPost = {
  slug: "tech-corporate-gifting-kits",
  title: "Corporate Tech Gifting Kits for Diwali",
  excerpt: "A practical guide to branded corporate gadgets, technology gifts and Diwali tech gifting kits for employee and client programmes.",
  category: "Tech Gifts",
  featuredImageUrl: "/Diwali kits/Set 9/Primary.webp",
  featuredImageAlt: "Corporate technology gifting kit for Diwali",
  authorName: "Gifta Guru Team",
  seoTitle: "Corporate Tech Gifting Kits for Diwali",
  metaDescription: "Plan corporate technology gifts, branded electronics gifts and Diwali tech gifting kits for employees and clients.",
  focusKeyword: "corporate tech gifting kits diwali",
  isFeatured: true,
  publishedAt: TECH_POST_PUBLISHED_AT,
  updatedAt: TECH_POST_PUBLISHED_AT,
  sections: [
    { heading: "Choose corporate technology gifts by recipient", body: ["Branded corporate gadgets work best when the recipient group and use case are clear. A Diwali tech gift for employees should be useful across a broad team; a Diwali tech gift for clients should be considered for the relationship and appropriate for the recipient’s policy."] },
    { heading: "Build a corporate tech gifting kit", bullets: ["Start with one useful technology gift rather than adding filler", "Keep branding restrained so the item remains useful after Diwali", "Use a consistent kit for employee lists and a premium tier for selected clients", "Confirm the recipient list and delivery split before finalising the kit"] },
    { heading: "Plan branded tech Diwali gifts", body: ["A corporate tech gifting kit needs the same planning as any Diwali programme: recipient groups, branding, approvals and delivery locations. Share those requirements in the enquiry so the recommendation is based on the actual campaign rather than a generic electronics list."] },
  ],
  faqs: [
    { question: "What belongs in a corporate tech gifting kit?", answer: "Choose one useful technology gift as the anchor, then build only the supporting items that improve the presentation or usefulness of the kit." },
    { question: "Can branded electronics gifts work for Diwali?", answer: "Yes, when branding is appropriately restrained and the item suits the employee or client recipient group." },
  ],
  relatedLinks: [
    { label: "Corporate tech gifts", href: "/gifting/tech-corporate-gifts" },
    { label: "Corporate Diwali gifts", href: "/occasions/diwali-corporate-gifts" },
    { label: "Request a corporate gifting quote", href: "/bulk-enquiry" },
  ],
  recommendedProductSlugs: [],
};

const newYearPost: BlogPost = {
  slug: "new-year-corporate-gifting-guide-2027",
  title: "New Year 2027 Gifts for Employees and Clients",
  excerpt: "A desk calendar, a pocket diary or a planner and pen? Match the gift to the way your recipients work, then plan the details for January delivery.",
  category: "New Year Gifting",
  featuredImageUrl: "/CALENDERS 2027/1/Initial.webp",
  featuredImageAlt: "Desk calendar from the Gifta Guru 2027 collection",
  authorName: "Gifta Guru Team",
  seoTitle: "New Year 2027 Corporate Gift Guide",
  metaDescription: "Choose calendars, diaries and planner sets for employees and clients, with practical advice on personalisation and delivery for New Year 2027.",
  focusKeyword: "New Year corporate gifts",
  isFeatured: true,
  publishedAt: new Date("2026-11-24"),
  updatedAt: new Date("2026-11-24"),
  sections: [
    { heading: "Start with the recipient’s working day", body: ["A desk calendar gives an office team a quick way to check dates during calls. For someone who travels between client sites, a diary that slips into a bag may get more use. If colleagues already keep their schedules online, consider an undated notebook for meeting notes."] },
    { heading: "Make a client gift personal", body: ["Pair a planner with a pen and tuck a signed note inside the cover. Mention a project you enjoyed working on together. If you personalise the cover, confirm the spelling of the recipient’s name and review a proof at the actual print size."] },
    { heading: "Work back from the first week of January", bullets: ["Pick the day you want the gifts in hand and confirm when each office reopens.", "Count gifts by delivery address and keep personalised pieces matched to the packing list.", "Approve a sample and agree on dispatch dates before confirming the full order."] },
  ],
  faqs: [],
  relatedLinks: [{ label: "Explore the New Year 2027 collection", href: "/new-year-2027" }],
  recommendedProductSlugs: ["grey-planner-corporate-set", "journal-matching-pen-set"],
};

const builtInPosts: BlogPost[] = [newYearPost, techDiwaliPost, ...guidePosts];

export function homepageBlogHighlights(posts: BlogPost[]) {
  const priority = [newYearPost.slug, techDiwaliPost.slug];
  const featured = priority.flatMap((slug) => posts.filter((post) => post.slug === slug));
  return [...featured, ...posts.filter((post) => !priority.includes(post.slug))].slice(0, 3);
}

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
