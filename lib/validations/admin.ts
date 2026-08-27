import { z } from "zod";

export const categoryFormSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export const collectionFormSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const productFormSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  basePrice: z.coerce.number().nonnegative(),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  isCustomizable: z.boolean().default(false),
  minOrderQuantity: z.coerce.number().int().min(1).default(1),
  occasionTags: z.array(z.string()).default([]),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  collectionIds: z.array(z.string().uuid()).default([]),
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "processing", "fulfilled", "cancelled", "refunded"]),
});

export const quoteStatusUpdateSchema = z.object({
  quoteId: z.string().uuid(),
  status: z.enum(["new", "contacted", "quoted", "won", "lost"]),
  adminNotes: z.string().trim().max(2000).optional(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
export type CollectionFormInput = z.infer<typeof collectionFormSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
