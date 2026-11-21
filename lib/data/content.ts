import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { faqs as fallbackFaqs } from "@/data/faqs";
import type { Faq, Testimonial } from "@/types";

const legacySeedQuestions = new Set([
  "What is the minimum bulk order quantity?",
  "Can gifts be customized with our company branding?",
  "Do you deliver across India?",
  "How long does bulk order fulfillment take?",
  "Can we request a custom gift box?",
]);

export async function getFaqs(): Promise<Faq[]> {
  if (!isDatabaseConfigured()) return fallbackFaqs;

  try {
    const rows = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    // Keep older deployed databases aligned with the bundled SEO rewrite
    // before migration 0021 is applied. Any administrator-created or edited
    // FAQ set remains authoritative.
    if (rows.length === legacySeedQuestions.size && rows.every((row) => legacySeedQuestions.has(row.question))) {
      return fallbackFaqs;
    }
    // An empty, real answer ("no FAQs configured yet") is meaningfully
    // different from "the database is unreachable" -- only the latter falls
    // back to the bundled defaults.
    return rows.map((row) => ({ id: row.id, question: row.question, answer: row.answer }));
  } catch {
    return fallbackFaqs;
  }
}

export type HomeBannerSlide = { id: string; label: string; src: string; href: string };

/** Shown when the database is unreachable, the 0022 migration has not run yet,
 * or every banner has been unpublished -- the hero must never render empty. */
export const fallbackHomeBanners: HomeBannerSlide[] = [
  { id: "joining", label: "Joining gifts", src: "/BANNERS/JOINING.png", href: "/categories/joining-gifts" },
  { id: "premium", label: "Premium gifts", src: "/BANNERS/PREMIUM.png", href: "/categories/premium-gifts" },
  { id: "luxury", label: "Luxury gifts", src: "/BANNERS/LUXURY.png", href: "/categories/luxury-gifts" },
  { id: "eco", label: "Eco-friendly gifts", src: "/BANNERS/ECO.png", href: "/categories/eco-gifts" },
];

export async function getHomeBanners(): Promise<HomeBannerSlide[]> {
  if (!isDatabaseConfigured()) return fallbackHomeBanners;

  try {
    const rows = await prisma.homeBanner.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return fallbackHomeBanners;
    return rows.map((row) => ({ id: row.id, label: row.label, src: row.imageUrl, href: row.linkUrl }));
  } catch {
    return fallbackHomeBanners;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role ?? "",
      company: row.company ?? "",
      quote: row.quote,
    }));
  } catch {
    return [];
  }
}
