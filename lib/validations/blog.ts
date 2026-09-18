import { z } from "zod";

const linkSchema = z.object({ label: z.string().trim().min(2).max(120), href: z.string().trim().regex(/^\//, "Links must be internal paths") });
const sectionSchema = z.object({ heading: z.string().trim().min(4).max(160), body: z.array(z.string().trim().min(10).max(2000)).max(12).optional(), bullets: z.array(z.string().trim().min(2).max(300)).max(20).optional() });
const faqSchema = z.object({ question: z.string().trim().min(4).max(300), answer: z.string().trim().min(4).max(2000) });
const imageUrlSchema = z.string().trim().max(500).refine(
  (value) => value === "" || value.startsWith("/") || /^https:\/\/[^/]+\/storage\/v1\/object\/public\//.test(value),
  "Use a site image path or an approved Supabase Storage image URL.",
);

export const blogDocumentSchema = z.object({
  sections: z.array(sectionSchema).min(1).max(30),
  faqs: z.array(faqSchema).max(12).default([]),
  relatedLinks: z.array(linkSchema).max(12).default([]),
  recommendedProductSlugs: z.array(z.string().trim().regex(/^[a-z0-9-]+$/)).max(12).default([]),
});

export const blogPostFormSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  title: z.string().trim().min(10).max(160),
  excerpt: z.string().trim().min(40).max(500),
  category: z.string().trim().min(2).max(80),
  content: z.string().trim().min(2).transform((value, ctx) => { try { return blogDocumentSchema.parse(JSON.parse(value)); } catch { ctx.addIssue({ code: "custom", message: "Content must be valid blog JSON." }); return z.NEVER; } }),
  featuredImageUrl: imageUrlSchema.optional(),
  featuredImageAlt: z.string().trim().max(250).optional().or(z.literal("")),
  authorName: z.string().trim().max(120).optional().or(z.literal("")),
  seoTitle: z.string().trim().min(10).max(60).optional().or(z.literal("")),
  metaDescription: z.string().trim().min(50).max(160).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  ogTitle: z.string().trim().max(160).optional().or(z.literal("")),
  ogDescription: z.string().trim().max(200).optional().or(z.literal("")),
  ogImageUrl: imageUrlSchema.optional(),
  focusKeyword: z.string().trim().max(120).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.coerce.boolean().default(false),
  publishedAt: z.string().datetime().optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.featuredImageUrl && !value.featuredImageAlt) ctx.addIssue({ code: "custom", path: ["featuredImageAlt"], message: "Image alt text is required when an image is used." });
  if (value.status === "published" && !value.publishedAt) ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Published posts need a publication date." });
});
