import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { faqs as fallbackFaqs } from "@/data/faqs";
import type { Faq, Testimonial } from "@/types";

export async function getFaqs(): Promise<Faq[]> {
  if (!isDatabaseConfigured()) return fallbackFaqs;

  try {
    const rows = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
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
