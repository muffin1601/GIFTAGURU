"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PermissionError, requirePermission, type AdminSession } from "@/lib/auth/admin";
import type { Permission } from "@/lib/auth/permissions";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { asSpecifications } from "@/lib/product-content";
import { allocateCategoryProductCode } from "@/lib/product-codes";
import {
  EDITABLE_KEYS,
  applySpecOverrides,
  isSpecColumn,
  validateCell,
  validateRow,
  type CellValue,
  type EditableKey,
  type GridRow,
  type ProductStatusValue,
  type Spec,
  type SpecColumnKey,
} from "@/lib/admin/products/grid-schema";
import { buildProductWhere, defaultVariant, gridProductSelect, normalizeFilters, toGridRow } from "@/lib/admin/products/query";
import {
  BULK_OPERATION_LABELS,
  MAX_BULK,
  MAX_DELETE,
  MAX_DUPLICATE,
  bulkOperationSchema,
  computeBulkChange,
  type BulkOperation,
  type BulkSnapshot,
  type DiffLine,
  type ProductPatch,
} from "@/lib/admin/products/bulk";

type Db = Prisma.TransactionClient;

async function authorize(permission: Permission): Promise<{ admin?: AdminSession; error?: string }> {
  try {
    return { admin: await requirePermission(permission) };
  } catch (error) {
    if (error instanceof PermissionError) return { error: error.message };
    throw error; // lets the login redirect propagate
  }
}

function revalidateCatalog(slugs: Iterable<string>) {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/");
  for (const slug of new Set(slugs)) revalidatePath(`/products/${slug}`);
}

const isUniqueViolation = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

// ============================================================================
// SAVE ALL (Excel-style grid)
// ============================================================================

export type SaveResult = {
  ok: boolean;
  message: string;
  saved?: GridRow[];
  cellErrors?: Record<string, Partial<Record<EditableKey, string>>>;
  conflicts?: Array<{ id: string; name: string; current: GridRow }>;
};

const changeSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().nonnegative(),
  fields: z.record(z.string(), z.unknown()),
});
const changesSchema = z.array(changeSchema).min(1).max(500);

class ConflictError extends Error {
  constructor(public ids: string[]) {
    super("conflict");
  }
}

/**
 * Persists every pending grid edit in ONE transaction, or nothing at all.
 *
 * Every row carries the `updatedAt` the editor loaded (`version`). Rows are
 * locked with SELECT … FOR UPDATE and compared before writing, so if another
 * employee saved the same product in the meantime, the save is refused and
 * both versions are shown instead of one silently overwriting the other.
 */
export async function saveProductGridChanges(input: unknown): Promise<SaveResult> {
  const { admin, error } = await authorize("products.edit");
  if (!admin) return { ok: false, message: error ?? "Not allowed." };

  const parsed = changesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "The changes could not be read. Refresh the page and try again." };

  const changes = parsed.data;
  if (new Set(changes.map((change) => change.id)).size !== changes.length) return { ok: false, message: "Duplicate product rows in one save." };

  const ids = changes.map((change) => change.id);
  const [products, tiers] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: ids } }, select: gridProductSelect }),
    prisma.productPriceTier.groupBy({ by: ["productId"], where: { productId: { in: ids } }, _max: { unitPrice: true } }),
  ]);
  const byId = new Map(products.map((product) => [product.id, product]));
  const maxTier = new Map(tiers.map((tier) => [tier.productId, tier._max.unitPrice === null ? null : Number(tier._max.unitPrice)]));

  const cellErrors: NonNullable<SaveResult["cellErrors"]> = {};
  const addError = (id: string, key: EditableKey, message: string) => {
    cellErrors[id] = { ...cellErrors[id], [key]: message };
  };

  // Collect values that need a database uniqueness / existence check.
  const categoryIds = new Set<string>();
  const skuByProduct = new Map<string, string>();
  const typed = new Map<string, Partial<Record<EditableKey, CellValue>>>();

  for (const change of changes) {
    const product = byId.get(change.id);
    if (!product) return { ok: false, message: "One of the edited products no longer exists. Refresh the page." };
    const fields: Partial<Record<EditableKey, CellValue>> = {};
    for (const [key, value] of Object.entries(change.fields)) {
      if (!(EDITABLE_KEYS as readonly string[]).includes(key)) return { ok: false, message: `"${key}" cannot be edited.` };
      const editable = key as EditableKey;
      const message = validateCell(editable, value as CellValue);
      if (message) addError(change.id, editable, message);
      fields[editable] = value as CellValue;
    }
    typed.set(change.id, fields);

    const current = toGridRow(product).values;
    const merged = { basePrice: fields.basePrice ?? current.basePrice, compareAtPrice: "compareAtPrice" in fields ? fields.compareAtPrice ?? null : current.compareAtPrice };
    for (const [key, message] of Object.entries(validateRow(merged))) addError(change.id, key as EditableKey, message!);

    const tier = maxTier.get(change.id);
    if (typeof fields.basePrice === "number" && tier != null && fields.basePrice <= tier) {
      addError(change.id, "basePrice", `Must stay above this product's volume-tier price (₹${tier})`);
    }
    if (typeof fields.categoryId === "string") categoryIds.add(fields.categoryId);
    if (typeof fields.sku === "string") skuByProduct.set(change.id, fields.sku.trim());
    if (typeof fields.primaryImageId === "string" && !product.images.some((image) => image.id === fields.primaryImageId)) {
      addError(change.id, "primaryImageId", "That image does not belong to this product");
    }
    if ("imageAlt" in fields && product.images.length === 0) addError(change.id, "imageAlt", "Upload an image first");
  }

  if (categoryIds.size) {
    const found = await prisma.category.findMany({ where: { id: { in: [...categoryIds] } }, select: { id: true } });
    const known = new Set(found.map((category) => category.id));
    for (const [id, fields] of typed) if (typeof fields.categoryId === "string" && !known.has(fields.categoryId)) addError(id, "categoryId", "Category no longer exists");
  }

  if (skuByProduct.size) {
    const seen = new Map<string, string>();
    for (const [id, sku] of skuByProduct) {
      const key = sku.toLowerCase();
      if (seen.has(key)) addError(id, "sku", "Same SKU used twice in this save");
      seen.set(key, id);
    }
    const clashes = await prisma.productVariant.findMany({
      where: { sku: { in: [...skuByProduct.values()], mode: "insensitive" } },
      select: { sku: true, productId: true, product: { select: { name: true } } },
    });
    for (const clash of clashes) {
      const owner = seen.get(clash.sku.toLowerCase());
      if (owner && clash.productId !== owner) addError(owner, "sku", `Already used by "${clash.product.name}"`);
    }
  }

  const errorCount = Object.values(cellErrors).reduce((sum, row) => sum + Object.keys(row).length, 0);
  if (errorCount) return { ok: false, message: `Nothing was saved. Fix ${errorCount} highlighted cell${errorCount === 1 ? "" : "s"} first.`, cellErrors };

  const audit: Array<{ id: string; before: Record<string, unknown>; after: Record<string, unknown>; fields: string[] }> = [];

  try {
    await prisma.$transaction(
      async (tx) => {
        const locked = await tx.$queryRaw<Array<{ id: string; updated_at: Date }>>`
          select id, updated_at from public.products where id = any(${ids}::uuid[]) for update`;
        const stale = changes.filter((change) => locked.find((row) => row.id === change.id)?.updated_at.getTime() !== change.version);
        if (stale.length) throw new ConflictError(stale.map((change) => change.id));

        for (const change of changes) {
          const product = byId.get(change.id)!;
          const fields = typed.get(change.id)!;
          const currentRow = toGridRow(product).values;
          const data: Prisma.ProductUpdateInput = { updatedAt: new Date() };
          const before: Record<string, unknown> = {};
          const after: Record<string, unknown> = {};
          const record = (key: string, nextValue: unknown) => {
            before[key] = currentRow[key as EditableKey];
            after[key] = nextValue;
          };

          const text = (value: CellValue | undefined) => (typeof value === "string" && value.trim() ? value.trim() : null);
          if ("name" in fields) { data.name = text(fields.name)!; record("name", data.name); }
          if ("categoryId" in fields) {
            data.category = fields.categoryId ? { connect: { id: fields.categoryId as string } } : { disconnect: true };
            record("categoryId", fields.categoryId);
          }
          for (const key of ["description", "longDescription", "seoDescription"] as const) {
            if (key in fields) { data[key] = text(fields[key]); record(key, data[key]); }
          }
          if ("basePrice" in fields) { data.basePrice = fields.basePrice as number; record("basePrice", fields.basePrice); }
          if ("compareAtPrice" in fields) { data.compareAtPrice = (fields.compareAtPrice as number | null) ?? null; record("compareAtPrice", data.compareAtPrice); }
          if ("minOrderQuantity" in fields) { data.minOrderQuantity = fields.minOrderQuantity as number; record("minOrderQuantity", fields.minOrderQuantity); }
          if ("isCustomizable" in fields) { data.isCustomizable = fields.isCustomizable as boolean; record("isCustomizable", fields.isCustomizable); }
          if ("isFeatured" in fields) { data.isFeatured = fields.isFeatured as boolean; record("isFeatured", fields.isFeatured); }
          if ("status" in fields) { data.status = fields.status as ProductStatusValue; record("status", fields.status); }
          if ("customizationOptions" in fields) { data.customizationOptions = fields.customizationOptions as string[]; record("customizationOptions", fields.customizationOptions); }
          if ("occasionTags" in fields) { data.occasionTags = fields.occasionTags as string[]; record("occasionTags", fields.occasionTags); }

          const specOverrides: Partial<Record<SpecColumnKey, string | null>> = {};
          for (const key of Object.keys(fields)) if (isSpecColumn(key)) specOverrides[key] = (fields[key] as string | null) ?? null;
          if ("specifications" in fields || Object.keys(specOverrides).length) {
            const base = (fields.specifications as Spec[] | undefined) ?? asSpecifications(product.specifications);
            const next = applySpecOverrides(base, specOverrides);
            data.specifications = next;
            before.specifications = currentRow.specifications;
            after.specifications = next;
          }

          await tx.product.update({ where: { id: product.id }, data });

          if ("sku" in fields) {
            const variant = defaultVariant(product.variants);
            if (!variant) throw new Error(`"${product.name}" has no variant to hold a SKU.`);
            await tx.productVariant.update({ where: { id: variant.id }, data: { sku: (fields.sku as string).trim() } });
            record("sku", (fields.sku as string).trim());
          }

          let primaryId = product.images[0]?.id;
          if (typeof fields.primaryImageId === "string" && fields.primaryImageId !== primaryId) {
            const ordered = [fields.primaryImageId, ...product.images.map((image) => image.id).filter((id) => id !== fields.primaryImageId)];
            for (const [index, imageId] of ordered.entries()) await tx.productImage.update({ where: { id: imageId }, data: { sortOrder: index } });
            record("primaryImageId", fields.primaryImageId);
            primaryId = fields.primaryImageId;
          }
          if ("imageAlt" in fields && primaryId) {
            await tx.productImage.update({ where: { id: primaryId }, data: { altText: text(fields.imageAlt) } });
            record("imageAlt", text(fields.imageAlt));
          }

          audit.push({ id: product.id, before, after, fields: Object.keys(after) });
        }
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  } catch (caught) {
    if (caught instanceof ConflictError) {
      const current = await prisma.product.findMany({ where: { id: { in: caught.ids } }, select: gridProductSelect });
      return {
        ok: false,
        message: `Nothing was saved. ${current.length} product${current.length === 1 ? " was" : "s were"} changed by someone else after you opened this page.`,
        conflicts: current.map((product) => ({ id: product.id, name: product.name, current: toGridRow(product) })),
      };
    }
    if (isUniqueViolation(caught)) return { ok: false, message: "Nothing was saved. A SKU was taken by another product a moment ago. Refresh and try again." };
    console.error("Product grid save failed:", caught);
    return { ok: false, message: "Nothing was saved because of a server error. Your edits are still on screen; please try again." };
  }

  await Promise.all(
    audit.map((entry) =>
      logAdminAction(admin, {
        action: entry.fields.includes("basePrice") || entry.fields.includes("compareAtPrice") ? "product.grid_updated.price" : "product.grid_updated",
        entityType: "product",
        entityId: entry.id,
        before: entry.before,
        after: { ...entry.after, changedFields: entry.fields },
      }),
    ),
  );

  const fresh = await prisma.product.findMany({ where: { id: { in: ids } }, select: gridProductSelect });
  revalidateCatalog(fresh.map((product) => product.slug));
  return { ok: true, message: `Saved ${changes.length} product${changes.length === 1 ? "" : "s"}.`, saved: fresh.map(toGridRow) };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

const selectionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("ids"), ids: z.array(z.string().uuid()).min(1).max(MAX_BULK) }),
  z.object({ mode: z.literal("filter"), filters: z.record(z.string(), z.string().max(200)) }),
]);
export type BulkSelection = z.infer<typeof selectionSchema>;

export type BulkPreview = {
  ok: boolean;
  message?: string;
  matched?: number;
  willChange?: number;
  skipped?: Array<{ id: string; name: string; reason: string }>;
  skippedCount?: number;
  unchanged?: number;
  sample?: Array<{ id: string; name: string; diff: DiffLine[] }>;
};

async function resolveSelection(selection: BulkSelection): Promise<string[]> {
  if (selection.mode === "ids") return [...new Set(selection.ids)];
  const where = await buildProductWhere(normalizeFilters(selection.filters));
  const rows = await prisma.product.findMany({ where, select: { id: true }, orderBy: { id: "asc" }, take: MAX_BULK + 1 });
  return rows.map((row) => row.id);
}

async function loadSnapshots(db: Db | typeof prisma, ids: string[]): Promise<BulkSnapshot[]> {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, productCode: true, categoryId: true, basePrice: true, compareAtPrice: true, minOrderQuantity: true,
      status: true, isFeatured: true, isCustomizable: true, description: true, longDescription: true, seoDescription: true, specifications: true,
      category: { select: { name: true } },
      images: { select: { id: true, altText: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      priceTiers: { select: { unitPrice: true } },
      _count: { select: { orderItems: true } },
    },
  });
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    productCode: product.productCode,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
    maxTierPrice: product.priceTiers.length ? Math.max(...product.priceTiers.map((tier) => Number(tier.unitPrice))) : null,
    minOrderQuantity: product.minOrderQuantity,
    status: product.status,
    isFeatured: product.isFeatured,
    isCustomizable: product.isCustomizable,
    description: product.description,
    longDescription: product.longDescription,
    seoDescription: product.seoDescription,
    specifications: asSpecifications(product.specifications),
    images: product.images.map((image) => ({ id: image.id, alt: image.altText })),
    orderCount: product._count.orderItems,
  }));
}

async function categoryNames() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  return new Map(categories.map((category) => [category.id, category.name]));
}

function permissionFor(op: BulkOperation): Permission {
  return op.type === "delete" ? "products.delete" : "products.bulk";
}

async function validateOperation(op: BulkOperation, count: number): Promise<string | null> {
  if (count === 0) return "No products match this selection.";
  if (count > MAX_BULK) return `Bulk operations are limited to ${MAX_BULK.toLocaleString()} products at a time. Narrow the filter.`;
  if (op.type === "duplicate" && count > MAX_DUPLICATE) return `Duplicate up to ${MAX_DUPLICATE} products at a time.`;
  if (op.type === "delete" && count > MAX_DELETE) return `Delete up to ${MAX_DELETE} products at a time.`;
  if (op.type === "set_category" && op.categoryId && !(await prisma.category.findUnique({ where: { id: op.categoryId }, select: { id: true } }))) return "That category no longer exists.";
  return null;
}

export async function previewBulkOperation(selectionInput: unknown, opInput: unknown): Promise<BulkPreview> {
  const selection = selectionSchema.safeParse(selectionInput);
  const op = bulkOperationSchema.safeParse(opInput);
  if (!selection.success) return { ok: false, message: "Select at least one product." };
  if (!op.success) return { ok: false, message: op.error.issues[0]?.message ?? "Check the operation settings." };

  const { admin, error } = await authorize(permissionFor(op.data));
  if (!admin) return { ok: false, message: error };

  const ids = await resolveSelection(selection.data);
  const invalid = await validateOperation(op.data, ids.length);
  if (invalid) return { ok: false, message: invalid, matched: ids.length };

  const [snapshots, names] = await Promise.all([loadSnapshots(prisma, ids), categoryNames()]);
  const skipped: NonNullable<BulkPreview["skipped"]> = [];
  const sample: NonNullable<BulkPreview["sample"]> = [];
  let willChange = 0;
  let unchanged = 0;
  for (const product of snapshots) {
    const change = computeBulkChange(op.data, product, { categoryNames: names });
    if (change.kind === "skip") skipped.push({ id: product.id, name: product.name, reason: change.reason });
    else if (change.kind === "noop") unchanged += 1;
    else {
      willChange += 1;
      if (sample.length < 25) sample.push({ id: product.id, name: product.name, diff: change.diff });
    }
  }
  return { ok: true, matched: ids.length, willChange, unchanged, skippedCount: skipped.length, skipped: skipped.slice(0, 50), sample };
}

export type BulkApplyResult = { ok: boolean; message: string; changed?: number; skipped?: number };

async function duplicateProduct(tx: Db, id: string): Promise<{ id: string; slug: string; name: string }> {
  const source = await tx.product.findUniqueOrThrow({
    where: { id },
    include: { images: true, priceTiers: true, customizations: true, collections: true, category: { select: { codePrefix: true } } },
  });
  if (!source.category?.codePrefix) throw new Error(`"${source.name}" has no category code prefix.`);
  const productCode = await allocateCategoryProductCode(tx, source.category.codePrefix);
  const base = `${source.slug}-copy`;
  const taken = new Set((await tx.product.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((row) => row.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;

  const json = (value: Prisma.JsonValue) => value as Prisma.InputJsonValue;
  const created = await tx.product.create({
    data: {
      name: `${source.name} (Copy)`.slice(0, 200),
      slug,
      productCode,
      description: source.description,
      longDescription: source.longDescription,
      keyFeatures: json(source.keyFeatures),
      specifications: json(source.specifications),
      packageIncludes: json(source.packageIncludes),
      customizationOptions: json(source.customizationOptions),
      brandingMethods: json(source.brandingMethods),
      additionalDetails: json(source.additionalDetails),
      faqs: json(source.faqs),
      seoDescription: source.seoDescription,
      contentSource: source.contentSource,
      sourceUrl: source.sourceUrl,
      lastVerifiedAt: source.lastVerifiedAt,
      categoryId: source.categoryId,
      basePrice: source.basePrice,
      compareAtPrice: source.compareAtPrice,
      isCustomizable: source.isCustomizable,
      minOrderQuantity: source.minOrderQuantity,
      occasionTags: source.occasionTags,
      status: "draft",
      isFeatured: false,
      variants: { create: { name: "Standard", sku: productCode, isDefault: true, inventory: { create: { quantityAvailable: 0, lowStockThreshold: 5 } } } },
      images: { create: source.images.map((image) => ({ url: image.url, altText: image.altText, sortOrder: image.sortOrder })) },
      priceTiers: { create: source.priceTiers.map((tier) => ({ minQuantity: tier.minQuantity, unitPrice: tier.unitPrice })) },
      customizations: {
        create: source.customizations.map((item) => ({ customizationType: item.customizationType, label: item.label, isRequired: item.isRequired, extraPrice: item.extraPrice })),
      },
      collections: { create: source.collections.map((mapping) => ({ collectionId: mapping.collectionId })) },
    },
    select: { id: true, slug: true, name: true },
  });
  return created;
}

export async function applyBulkOperation(selectionInput: unknown, opInput: unknown, expectedMatched: unknown): Promise<BulkApplyResult> {
  const selection = selectionSchema.safeParse(selectionInput);
  const op = bulkOperationSchema.safeParse(opInput);
  if (!selection.success || !op.success) return { ok: false, message: "The bulk operation could not be read. Preview it again." };

  const { admin, error } = await authorize(permissionFor(op.data));
  if (!admin) return { ok: false, message: error ?? "Not allowed." };
  if (op.data.type === "delete" && op.data.confirmText !== "DELETE") return { ok: false, message: 'Type DELETE to confirm permanent deletion.' };

  const ids = await resolveSelection(selection.data);
  if (ids.length !== expectedMatched) {
    return { ok: false, message: `The selection now matches ${ids.length} products instead of ${expectedMatched}. Preview again before applying.` };
  }
  const invalid = await validateOperation(op.data, ids.length);
  if (invalid) return { ok: false, message: invalid };

  const names = await categoryNames();
  const operation = op.data;
  const log: Array<{ id: string; name: string; before?: unknown; after?: unknown }> = [];
  const slugs: string[] = [];
  let skipped = 0;
  const CHUNK = operation.type === "duplicate" ? 10 : 100;

  try {
    for (let start = 0; start < ids.length; start += CHUNK) {
      const chunk = ids.slice(start, start + CHUNK);
      // Per-chunk results are only merged after the chunk commits, so the audit
      // log never claims changes from a batch that was rolled back.
      const committed = await prisma.$transaction(
        async (tx) => {
          const chunkLog: typeof log = [];
          const chunkSlugs: string[] = [];
          let chunkSkipped = 0;
          // Lock, then recompute from the locked state, so a percentage change
          // is always applied to the price as it is at write time.
          await tx.$queryRaw`select id from public.products where id = any(${chunk}::uuid[]) for update`;
          const snapshots = await loadSnapshots(tx, chunk);
          const groups = new Map<string, { patch: ProductPatch; ids: string[] }>();

          for (const product of snapshots) {
            const change = computeBulkChange(operation, product, { categoryNames: names });
            if (change.kind === "skip") { chunkSkipped += 1; continue; }
            if (change.kind === "noop") continue;

            if (change.kind === "duplicate") {
              const copy = await duplicateProduct(tx, product.id);
              chunkLog.push({ id: copy.id, name: copy.name, after: { duplicatedFrom: product.id } });
              continue;
            }
            if (change.kind === "delete") {
              const orderLines = await tx.orderItem.count({ where: { productId: product.id } });
              if (orderLines > 0) { chunkSkipped += 1; continue; }
              const full = await tx.product.findUnique({ where: { id: product.id }, include: { images: true, variants: true, priceTiers: true } });
              await tx.product.delete({ where: { id: product.id } });
              if (full) chunkSlugs.push(full.slug);
              chunkLog.push({ id: product.id, name: product.name, before: full });
              continue;
            }

            if (Object.keys(change.patch).length) {
              const key = JSON.stringify(change.patch);
              const group = groups.get(key) ?? { patch: change.patch, ids: [] };
              group.ids.push(product.id);
              groups.set(key, group);
            }
            for (const image of change.imageAlts ?? []) await tx.productImage.update({ where: { id: image.id }, data: { altText: image.alt } });
            if (change.imageAlts?.length && !Object.keys(change.patch).length) {
              // Alt text lives on images; bump the product so open editors see the change.
              await tx.product.update({ where: { id: product.id }, data: { updatedAt: new Date() } });
            }
            chunkLog.push({ id: product.id, name: product.name, before: change.imageAlts ? { images: product.images } : change.before, after: change.imageAlts ? { images: change.imageAlts } : change.patch });
          }

          for (const group of groups.values()) {
            const { specifications, ...rest } = group.patch;
            await tx.product.updateMany({
              where: { id: { in: group.ids } },
              data: { ...rest, ...(specifications ? { specifications } : {}) },
            });
          }
          return { chunkLog, chunkSlugs, chunkSkipped };
        },
        { timeout: 60_000, maxWait: 10_000 },
      );
      log.push(...committed.chunkLog);
      slugs.push(...committed.chunkSlugs);
      skipped += committed.chunkSkipped;
    }
  } catch (caught) {
    console.error("Bulk product operation failed:", caught);
    const done = log.length;
    return {
      ok: false,
      message: done
        ? `Stopped after ${done} product(s) because of an error. Completed batches were saved and logged; the failing batch was rolled back.`
        : "Nothing was changed because of a server error. Please try again.",
      changed: done,
    };
  } finally {
    if (log.length) {
      await logAdminAction(admin, {
        action: `product.bulk.${operation.type}`,
        entityType: "product",
        after: {
          operation: operation.type === "delete" ? { type: "delete" } : operation,
          label: BULK_OPERATION_LABELS[operation.type],
          count: log.length,
          skipped,
          changes: log,
        },
      });
    }
  }

  const touched = await prisma.product.findMany({ where: { id: { in: [...ids, ...log.map((entry) => entry.id)] } }, select: { slug: true } });
  slugs.push(...touched.map((product) => product.slug));
  revalidateCatalog(slugs);

  const verb = operation.type === "duplicate" ? "Created" : operation.type === "delete" ? "Deleted" : "Updated";
  return {
    ok: true,
    message: `${verb} ${log.length} product${log.length === 1 ? "" : "s"}${skipped ? `; skipped ${skipped}` : ""}.`,
    changed: log.length,
    skipped,
  };
}
