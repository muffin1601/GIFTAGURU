"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/audit";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { MIN_ORDER_QUANTITY } from "@/lib/config/store";
import { generateNextProductCode } from "@/lib/product-codes";

type ActionState = { error?: string; success?: string };

// ============================================================================
// CATEGORIES
// ============================================================================

const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createCategoryAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid category." };

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { error: `A category with the slug "${slug}" already exists.` };

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await logAdminAction(admin, { action: "category.created", entityType: "category", entityId: category.id, after: category });
  revalidatePath("/admin/categories");
  return { success: `Category "${category.name}" created.` };
}

const updateCategorySchema = categorySchema.extend({ id: z.string().uuid() });

export async function updateCategoryAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid category." };

  const before = await prisma.category.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "Category not found." };

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };
  if (slug !== before.slug) {
    const clash = await prisma.category.findUnique({ where: { slug } });
    if (clash) return { error: `A category with the slug "${slug}" already exists.` };
  }

  const category = await prisma.category.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await logAdminAction(admin, { action: "category.updated", entityType: "category", entityId: category.id, before, after: category });
  revalidatePath("/admin/categories");
  return { success: "Category updated." };
}

const categoryIdSchema = z.object({ id: z.string().uuid() });

export async function setCategoryActiveAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = categoryIdSchema.extend({ isActive: z.coerce.boolean() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid category." };

  const category = await prisma.category.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  await logAdminAction(admin, {
    action: parsed.data.isActive ? "category.restored" : "category.archived",
    entityType: "category",
    entityId: category.id,
  });
  revalidatePath("/admin/categories");
  return { success: parsed.data.isActive ? "Category restored." : "Category archived." };
}

export async function deleteCategoryAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = categoryIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid category." };

  const productCount = await prisma.product.count({ where: { categoryId: parsed.data.id } });
  if (productCount > 0) {
    return { error: `${productCount} product(s) still use this category. Reassign them first, or archive instead of deleting.` };
  }

  const category = await prisma.category.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!category) return { error: "Category not found." };

  await logAdminAction(admin, { action: "category.deleted", entityType: "category", entityId: category.id, before: category });
  revalidatePath("/admin/categories");
  return { success: "Category deleted." };
}

// ============================================================================
// COLLECTIONS
// ============================================================================

const collectionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createCollectionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };

  const existing = await prisma.collection.findUnique({ where: { slug } });
  if (existing) return { error: `A collection with the slug "${slug}" already exists.` };

  const collection = await prisma.collection.create({
    data: {
      name: parsed.data.name,
      slug,
      tagline: parsed.data.tagline || null,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      isFeatured: parsed.data.isFeatured,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await logAdminAction(admin, { action: "collection.created", entityType: "collection", entityId: collection.id, after: collection });
  revalidatePath("/admin/collections");
  revalidatePath("/categories");
  return { success: `Collection "${collection.name}" created.` };
}

const updateCollectionSchema = collectionSchema.extend({ id: z.string().uuid() });

export async function updateCollectionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateCollectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid collection." };

  const before = await prisma.collection.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "Collection not found." };

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };
  if (slug !== before.slug) {
    const clash = await prisma.collection.findUnique({ where: { slug } });
    if (clash) return { error: `A collection with the slug "${slug}" already exists.` };
  }

  const collection = await prisma.collection.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      slug,
      tagline: parsed.data.tagline || null,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      isFeatured: parsed.data.isFeatured,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await logAdminAction(admin, { action: "collection.updated", entityType: "collection", entityId: collection.id, before, after: collection });
  revalidatePath("/admin/collections");
  revalidatePath(`/categories/${collection.slug}`);
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: "Collection updated." };
}

const collectionIdSchema = z.object({ id: z.string().uuid() });

export async function setCollectionPublishedAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = collectionIdSchema.extend({ isPublished: z.coerce.boolean() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid collection." };

  const collection = await prisma.collection.update({
    where: { id: parsed.data.id },
    data: { isPublished: parsed.data.isPublished },
  });

  await logAdminAction(admin, {
    action: parsed.data.isPublished ? "collection.published" : "collection.unpublished",
    entityType: "collection",
    entityId: collection.id,
  });
  revalidatePath("/admin/collections");
  revalidatePath(`/categories/${collection.slug}`);
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: parsed.data.isPublished ? "Collection published." : "Collection unpublished." };
}

export async function deleteCollectionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = collectionIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid collection." };

  const productCount = await prisma.productCollectionMapping.count({ where: { collectionId: parsed.data.id } });
  if (productCount > 0) {
    return { error: `${productCount} product(s) are still assigned to this collection. Remove them first, or unpublish instead of deleting.` };
  }

  const collection = await prisma.collection.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!collection) return { error: "Collection not found." };

  await logAdminAction(admin, { action: "collection.deleted", entityType: "collection", entityId: collection.id, before: collection });
  revalidatePath("/admin/collections");
  revalidatePath("/categories");
  return { success: "Collection deleted." };
}

const toggleCollectionMemberSchema = z.object({
  collectionId: z.string().uuid(),
  productId: z.string().uuid(),
  member: z.coerce.boolean(),
});

export async function toggleCollectionMemberAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = toggleCollectionMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid selection." };

  if (parsed.data.member) {
    await prisma.productCollectionMapping.upsert({
      where: { productId_collectionId: { productId: parsed.data.productId, collectionId: parsed.data.collectionId } },
      update: {},
      create: { productId: parsed.data.productId, collectionId: parsed.data.collectionId },
    });
  } else {
    await prisma.productCollectionMapping
      .delete({
        where: { productId_collectionId: { productId: parsed.data.productId, collectionId: parsed.data.collectionId } },
      })
      .catch(() => null);
  }

  await logAdminAction(admin, {
    action: parsed.data.member ? "product.added_to_collection" : "product.removed_from_collection",
    entityType: "product",
    entityId: parsed.data.productId,
    after: { collectionId: parsed.data.collectionId },
  });
  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidatePath("/shop");
  revalidatePath("/categories");
  return { success: parsed.data.member ? "Added to collection." : "Removed from collection." };
}

// ============================================================================
// PRODUCTS
// ============================================================================

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(220).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional(),
  basePrice: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  minOrderQuantity: z.coerce.number().int().min(MIN_ORDER_QUANTITY).default(MIN_ORDER_QUANTITY),
  isCustomizable: z.coerce.boolean().default(false),
  productCode: z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/, "Use letters, numbers, dots, hyphens, underscores or slashes").optional().or(z.literal("")),
});

export async function createProductAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = createProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product." };

  if (parsed.data.compareAtPrice && Number(parsed.data.compareAtPrice) <= parsed.data.basePrice) {
    return { error: "Compare-at price must be higher than the selling price." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { error: `A product with the slug "${slug}" already exists.` };

  const sku = parsed.data.productCode || await generateNextProductCode();
  const codeClash = await prisma.productVariant.findUnique({ where: { sku }, select: { id: true } });
  if (codeClash) return { error: `Product code "${sku}" is already in use.` };

  // New products start in draft so they never appear on the storefront
  // (status = "active") until an admin deliberately publishes them.
  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      categoryId: parsed.data.categoryId || null,
      basePrice: parsed.data.basePrice,
      compareAtPrice: parsed.data.compareAtPrice ? Number(parsed.data.compareAtPrice) : null,
      minOrderQuantity: parsed.data.minOrderQuantity,
      isCustomizable: parsed.data.isCustomizable,
      status: "draft",
      variants: {
        create: {
          name: "Standard",
          sku,
          isDefault: true,
          inventory: { create: { quantityAvailable: 0, lowStockThreshold: 5 } },
        },
      },
    },
  });

  await logAdminAction(admin, { action: "product.created", entityType: "product", entityId: product.id, after: product });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid(),
  isFeatured: z.coerce.boolean().default(false),
});

export async function updateProductAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product." };

  if (parsed.data.compareAtPrice && Number(parsed.data.compareAtPrice) <= parsed.data.basePrice) {
    return { error: "Compare-at price must be higher than the selling price." };
  }

  const before = await prisma.product.findUnique({ where: { id: parsed.data.id } });
  if (!before) return { error: "Product not found." };

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a name that produces a valid URL slug." };
  if (slug !== before.slug) {
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash) return { error: `A product with the slug "${slug}" already exists.` };
  }

  const defaultVariant = await prisma.productVariant.findFirst({
    where: { productId: before.id, isDefault: true },
    select: { id: true, sku: true },
  });
  const productCode = parsed.data.productCode || defaultVariant?.sku;
  if (parsed.data.productCode) {
    const codeClash = await prisma.productVariant.findUnique({ where: { sku: parsed.data.productCode }, select: { productId: true } });
    if (codeClash && codeClash.productId !== before.id) return { error: `Product code "${parsed.data.productCode}" is already in use.` };
  }

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description || null,
        categoryId: parsed.data.categoryId || null,
        basePrice: parsed.data.basePrice,
        compareAtPrice: parsed.data.compareAtPrice ? Number(parsed.data.compareAtPrice) : null,
        minOrderQuantity: parsed.data.minOrderQuantity,
        isCustomizable: parsed.data.isCustomizable,
        isFeatured: parsed.data.isFeatured,
      },
    });
    if (defaultVariant && productCode && productCode !== defaultVariant.sku) {
      await tx.productVariant.update({ where: { id: defaultVariant.id }, data: { sku: productCode } });
    }
    return updated;
  });

  await logAdminAction(admin, { action: "product.updated", entityType: "product", entityId: product.id, before, after: product });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${product.id}`);
  revalidatePath(`/products/${before.slug}`);
  if (slug !== before.slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/shop");
  revalidatePath("/admin/inventory");
  return { success: "Product updated." };
}

const bulkPricingSchema = z.object({
  scope: z.enum(["selected", "all"]),
  basePrice: z.coerce.number().min(0),
  productIds: z.array(z.string().uuid()).default([]),
});

/** Sets one base unit price across an explicit selection or the entire catalogue. */
export async function bulkUpdateProductPricingAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = bulkPricingSchema.safeParse({
    scope: formData.get("scope"),
    basePrice: formData.get("basePrice"),
    productIds: formData.getAll("productIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a valid price and product selection." };
  if (parsed.data.scope === "selected" && parsed.data.productIds.length === 0) {
    return { error: "Select at least one product, or choose all products." };
  }

  const where = parsed.data.scope === "all" ? {} : { id: { in: parsed.data.productIds } };
  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      slug: true,
      basePrice: true,
      priceTiers: { where: { unitPrice: { gte: parsed.data.basePrice } }, select: { id: true }, take: 1 },
    },
  });
  if (products.length === 0) return { error: "No products matched this update." };

  const tierConflict = products.find((product) => product.priceTiers.length > 0);
  if (tierConflict) {
    return { error: "The new base price must stay above every existing volume-tier price. Update that product's tiers first." };
  }

  const changed = products.filter((product) => Number(product.basePrice) !== parsed.data.basePrice);
  if (changed.length === 0) return { success: "Those products already use this base price." };

  await prisma.product.updateMany({ where: { id: { in: changed.map((product) => product.id) } }, data: { basePrice: parsed.data.basePrice } });
  await logAdminAction(admin, {
    action: "product.bulk_price_updated",
    entityType: "product",
    after: { scope: parsed.data.scope, productIds: changed.map((product) => product.id), basePrice: parsed.data.basePrice },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  for (const product of changed) revalidatePath(`/products/${product.slug}`);
  return { success: `Updated the base price for ${changed.length} product${changed.length === 1 ? "" : "s"}.` };
}

type PriceFileRow = { productCode: string; newPrice: string | number };
type PriceFileResult = ActionState & { totalRows?: number; updated?: number; unchanged?: number; failed?: number; notFound?: number; report?: Array<{ productCode: string; status: string }> };

function readPrice(value: string | number): number | null {
  const text = String(value).trim().replace(/[₹,$\s]/g, "").replace(/,/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const price = Number(text);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

/** Rechecks every uploaded row server-side before updating only base prices. */
export async function applyPriceFileAction(_state: PriceFileResult, formData: FormData): Promise<PriceFileResult> {
  const admin = await requireAdmin();
  let rows: PriceFileRow[];
  try { rows = JSON.parse(String(formData.get("rows") ?? "")); } catch { return { error: "We could not read the reviewed price rows." }; }
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 1_000) return { error: "Choose a price file with between 1 and 1,000 rows." };

  const seen = new Set<string>();
  const report: Array<{ productCode: string; status: string }> = [];
  const valid = rows.flatMap((row) => {
    const productCode = typeof row.productCode === "string" ? row.productCode.trim() : "";
    const price = readPrice(row.newPrice);
    if (!productCode) { report.push({ productCode: "(blank)", status: "Product Code is missing" }); return []; }
    if (seen.has(productCode)) { report.push({ productCode, status: "Duplicate Product Code in file" }); return []; }
    seen.add(productCode);
    if (price === null) { report.push({ productCode, status: "Invalid price" }); return []; }
    return [{ productCode, price }];
  });
  const variants = await prisma.productVariant.findMany({ where: { sku: { in: valid.map((row) => row.productCode) }, isDefault: true }, include: { product: { include: { priceTiers: true } } } });
  const byCode = new Map(variants.map((variant) => [variant.sku, variant.product]));
  const updates: Array<{ id: string; slug: string; price: number }> = [];
  for (const row of valid) {
    const product = byCode.get(row.productCode);
    if (!product) { report.push({ productCode: row.productCode, status: "Product code not found" }); continue; }
    if (product.priceTiers.some((tier) => Number(tier.unitPrice) >= row.price)) { report.push({ productCode: row.productCode, status: "Price must stay above its volume-tier price" }); continue; }
    if (Number(product.basePrice) === row.price) { report.push({ productCode: row.productCode, status: "No change" }); continue; }
    updates.push({ id: product.id, slug: product.slug, price: row.price });
    report.push({ productCode: row.productCode, status: "Updated" });
  }
  await prisma.$transaction(updates.map((update) => prisma.product.update({ where: { id: update.id }, data: { basePrice: update.price } })));
  if (updates.length) await logAdminAction(admin, { action: "product.price_file_updated", entityType: "product", after: { updated: updates.length, totalRows: rows.length } });
  revalidatePath("/admin/products"); revalidatePath("/shop"); revalidatePath("/");
  for (const update of updates) revalidatePath(`/products/${update.slug}`);
  const notFound = report.filter((row) => row.status === "Product code not found").length;
  return { success: `Updated ${updates.length} product${updates.length === 1 ? "" : "s"}.`, totalRows: rows.length, updated: updates.length, unchanged: report.filter((row) => row.status === "No change").length, failed: report.filter((row) => !["Updated", "No change", "Product code not found"].includes(row.status)).length, notFound, report };
}

const productStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "active", "archived"]),
});

export async function setProductStatusAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = productStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid status." };

  const product = await prisma.product.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    include: { images: { take: 1 } },
  });

  if (parsed.data.status === "active" && product.images.length === 0) {
    // Not blocked -- some catalogues genuinely launch text-first -- but the
    // admin should know a live product has no photo.
    await logAdminAction(admin, { action: "product.published_without_image", entityType: "product", entityId: product.id });
  }

  await logAdminAction(admin, { action: "product.status_changed", entityType: "product", entityId: product.id, after: { status: parsed.data.status } });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${product.id}`);
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/shop");
  return { success: `Product marked ${parsed.data.status}.` };
}

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function addProductImageAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("file");

  if (!z.string().uuid().safeParse(productId).success) return { error: "Invalid product." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file to upload." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { error: "Upload a PNG, JPG or WEBP image." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be 8MB or smaller." };
  if (!isSupabaseAdminConfigured()) return { error: "Image storage is not configured on this environment." };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!product) return { error: "Product not found." };

  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${productId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

  const maxSortOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  const image = await prisma.productImage.create({
    data: { productId, url: data.publicUrl, altText: null, sortOrder: nextSortOrder },
  });

  await logAdminAction(admin, { action: "product.image_added", entityType: "product", entityId: productId, after: { imageId: image.id, sortOrder: nextSortOrder } });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${product.slug}`);
  return { success: nextSortOrder === 0 ? "Image uploaded and set as primary." : "Image uploaded." };
}

const productImageIdSchema = z.object({ imageId: z.string().uuid(), productId: z.string().uuid() });

export async function deleteProductImageAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = productImageIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid image." };

  const image = await prisma.productImage.findUnique({ where: { id: parsed.data.imageId } });
  if (!image || image.productId !== parsed.data.productId) return { error: "Image not found." };

  await prisma.productImage.delete({ where: { id: image.id } });

  // Close the gap so sort orders stay a dense 0..n-1 sequence -- required for
  // "move up" / "move down" to always have a valid neighbour to swap with.
  await prisma.productImage.updateMany({
    where: { productId: parsed.data.productId, sortOrder: { gt: image.sortOrder } },
    data: { sortOrder: { decrement: 1 } },
  });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { slug: true } });

  await logAdminAction(admin, { action: "product.image_removed", entityType: "product", entityId: parsed.data.productId, before: image });
  revalidatePath(`/admin/products/${parsed.data.productId}`);
  if (product) revalidatePath(`/products/${product.slug}`);
  return { success: "Image removed." };
}

const reorderImageSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

export async function reorderProductImageAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = reorderImageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const images = await prisma.productImage.findMany({
    where: { productId: parsed.data.productId },
    orderBy: { sortOrder: "asc" },
  });
  const index = images.findIndex((image) => image.id === parsed.data.imageId);
  if (index === -1) return { error: "Image not found." };

  const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= images.length) return { success: "Already at that end." };

  const a = images[index];
  const b = images[swapIndex];

  // Swapping through a temporary value avoids a transient unique-constraint
  // collision if (productId, sortOrder) is ever made unique.
  await prisma.$transaction([
    prisma.productImage.update({ where: { id: a.id }, data: { sortOrder: -1 } }),
    prisma.productImage.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
    prisma.productImage.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
  ]);

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { slug: true } });

  await logAdminAction(admin, {
    action: "product.images_reordered",
    entityType: "product",
    entityId: parsed.data.productId,
    after: { swapped: [a.id, b.id] },
  });
  revalidatePath(`/admin/products/${parsed.data.productId}`);
  if (product) revalidatePath(`/products/${product.slug}`);
  return { success: swapIndex === 0 ? "Now the primary image." : "Order updated." };
}
