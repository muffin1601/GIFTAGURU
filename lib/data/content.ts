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
