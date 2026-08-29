"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string; success?: string };

// ============================================================================
// FAQs
// ============================================================================

const faqSchema = z.object({
  question: z.string().trim().min(4).max(300),
  answer: z.string().trim().min(4).max(2000),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export async function createFaqAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid FAQ." };

  const faq = await prisma.faq.create({ data: parsed.data });

  await logAdminAction(admin, { action: "faq.created", entityType: "faq", entityId: faq.id, after: faq });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/corporate-gifting");
  return { success: "FAQ added." };
}

const updateFaqSchema = faqSchema.extend({ id: z.string().uuid() });

export async function updateFaqAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateFaqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid FAQ." };

  const before = await prisma.faq.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "FAQ not found." };

  const { id, ...data } = parsed.data;
  const faq = await prisma.faq.update({ where: { id }, data });

  await logAdminAction(admin, { action: "faq.updated", entityType: "faq", entityId: faq.id, before, after: faq });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/corporate-gifting");
  return { success: "FAQ updated." };
}

export async function deleteFaqAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid FAQ." };

  const faq = await prisma.faq.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!faq) return { error: "FAQ not found." };

  await logAdminAction(admin, { action: "faq.deleted", entityType: "faq", entityId: faq.id, before: faq });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/corporate-gifting");
  return { success: "FAQ deleted." };
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  quote: z.string().trim().min(10).max(1000),
  imageUrl: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.coerce.boolean().default(true),
});

export async function createTestimonialAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid testimonial." };

  const testimonial = await prisma.testimonial.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role || null,
      company: parsed.data.company || null,
      quote: parsed.data.quote,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
      isPublished: parsed.data.isPublished,
    },
  });

  await logAdminAction(admin, { action: "testimonial.created", entityType: "testimonial", entityId: testimonial.id, after: testimonial });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial added." };
}

const updateTestimonialSchema = testimonialSchema.extend({ id: z.string().uuid() });

export async function updateTestimonialAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateTestimonialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid testimonial." };

  const before = await prisma.testimonial.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "Testimonial not found." };

  const testimonial = await prisma.testimonial.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role || null,
      company: parsed.data.company || null,
      quote: parsed.data.quote,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
      isPublished: parsed.data.isPublished,
    },
  });

  await logAdminAction(admin, { action: "testimonial.updated", entityType: "testimonial", entityId: testimonial.id, before, after: testimonial });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial updated." };
}

export async function deleteTestimonialAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid testimonial." };

  const testimonial = await prisma.testimonial.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!testimonial) return { error: "Testimonial not found." };

  await logAdminAction(admin, { action: "testimonial.deleted", entityType: "testimonial", entityId: testimonial.id, before: testimonial });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial deleted." };
}
