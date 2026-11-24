"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/audit";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { formBoolean } from "@/lib/validations/form-boolean";
import { categoryBannerKey, defaultCategoryBanner, getCategoryBanner } from "@/lib/data/category-banner";

type ActionState = { error?: string; success?: string };

// ============================================================================
// FAQs
// ============================================================================

const faqSchema = z.object({
  question: z.string().trim().min(4).max(300),
  answer: z.string().trim().min(4).max(2000),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPublished: formBoolean,
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
  isPublished: formBoolean,
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

// ============================================================================
// HOMEPAGE BANNERS
// ============================================================================

// Reuses the already-provisioned product image bucket under its own prefix.
const BANNER_BUCKET = "product-images";
const BANNER_PREFIX = "home-banners/";
// Vercel rejects request bodies over 4.5MB before they reach the action, and
// next.config.ts raises the Server Action limit to 5MB to match.
const MAX_BANNER_BYTES = 4 * 1024 * 1024;
const ALLOWED_BANNER_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const bannerSchema = z.object({
  label: z.string().trim().min(2, "Label must be at least 2 characters.").max(80),
  // Internal paths ("/categories/x") or absolute https links only -- never
  // protocol-relative ("//evil.com") or javascript: URLs.
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => /^\/(?!\/)/.test(value) || /^https:\/\/[^\s]+$/.test(value), "Link must start with / or https://"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function revalidateBanners() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

async function uploadBannerImage(file: FormDataEntryValue | null): Promise<{ url?: string; error?: string; skipped?: true }> {
  if (!(file instanceof File) || file.size === 0) return { skipped: true };
  if (!ALLOWED_BANNER_TYPES.includes(file.type)) return { error: "Upload a PNG, JPG or WEBP image." };
  if (file.size > MAX_BANNER_BYTES) return { error: "Banner image must be 4MB or smaller. Export it as WEBP or JPG to reduce the size." };
  if (!isSupabaseAdminConfigured()) return { error: "Image storage is not configured on this environment." };

  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${BANNER_PREFIX}${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BANNER_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { url: supabase.storage.from(BANNER_BUCKET).getPublicUrl(path).data.publicUrl };
}

/** Best-effort cleanup of an image this feature uploaded. Bundled /public
 * images and anything outside the banner prefix are left alone. */
async function removeBannerImage(url: string) {
  const marker = `/storage/v1/object/public/${BANNER_BUCKET}/${BANNER_PREFIX}`;
  const index = url.indexOf(marker);
  if (index === -1 || !isSupabaseAdminConfigured()) return;
  const path = url.slice(index + `/storage/v1/object/public/${BANNER_BUCKET}/`.length);
  await createAdminClient().storage.from(BANNER_BUCKET).remove([path]).catch(() => undefined);
}

export async function updateCategoryBannerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = bannerSchema.pick({ label: true, linkUrl: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid banner." };

  const before = await getCategoryBanner();
  const upload = await uploadBannerImage(formData.get("file"));
  if (upload.error) return { error: upload.error };
  const value = { ...parsed.data, imageUrl: upload.url ?? before.imageUrl, isPublished: formData.get("isPublished") === "true" };
  const saved = await prisma.$transaction(async (tx) => {
    const key = categoryBannerKey;
    const updated = await tx.storeSetting.updateMany({ where: { key, value: { equals: before } }, data: { value } });
    if (updated.count) return true;
    if (before !== defaultCategoryBanner) return false;
    const created = await tx.storeSetting.createMany({ data: [{ key, value }], skipDuplicates: true });
    return created.count === 1;
  });
  if (!saved) {
    if (upload.url) await removeBannerImage(upload.url);
    return { error: "The category banner changed during this save. Refresh and try again." };
  }
  if (upload.url) await removeBannerImage(before.imageUrl);
  await logAdminAction(admin, { action: "category_banner.updated", entityType: "store_setting", before, after: value });
  revalidatePath("/admin/banners");
  revalidatePath("/categories", "layout");
  return { success: "Category banner saved." };
}

export async function createHomeBannerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = bannerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid banner." };

  const upload = await uploadBannerImage(formData.get("file"));
  if (upload.error) return { error: upload.error };
  if (!upload.url) return { error: "Choose a banner image to upload." };

  const banner = await prisma.homeBanner.create({
    data: {
      ...parsed.data,
      imageUrl: upload.url,
      isPublished: formData.get("isPublished") === "true",
    },
  });

  await logAdminAction(admin, { action: "home_banner.created", entityType: "home_banner", entityId: banner.id, after: banner });
  revalidateBanners();
  return { success: "Banner added." };
}

export async function updateHomeBannerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = bannerSchema.extend({ id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid banner." };

  const before = await prisma.homeBanner.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "Banner not found." };

  // Replacing the image is optional on edit.
  const upload = await uploadBannerImage(formData.get("file"));
  if (upload.error) return { error: upload.error };

  const { id, ...data } = parsed.data;
  const banner = await prisma.homeBanner.update({
    where: { id },
    data: {
      ...data,
      ...(upload.url ? { imageUrl: upload.url } : {}),
      isPublished: formData.get("isPublished") === "true",
    },
  });
  if (upload.url) await removeBannerImage(before.imageUrl);

  await logAdminAction(admin, { action: "home_banner.updated", entityType: "home_banner", entityId: banner.id, before, after: banner });
  revalidateBanners();
  return { success: "Banner updated." };
}

export async function deleteHomeBannerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid banner." };

  const banner = await prisma.homeBanner.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!banner) return { error: "Banner not found." };
  await removeBannerImage(banner.imageUrl);

  await logAdminAction(admin, { action: "home_banner.deleted", entityType: "home_banner", entityId: banner.id, before: banner });
  revalidateBanners();
  return { success: "Banner deleted." };
}
