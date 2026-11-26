/**
 * Bulk product operations as pure functions: given one product snapshot and an
 * operation, return the exact field patch (plus a human-readable diff) or a
 * reason to skip. Preview and apply both call `computeBulkChange`, so what the
 * admin approves in the preview is precisely what gets written.
 */
import { z } from "zod";
import { MIN_ORDER_QUANTITY } from "@/lib/config/store";
import { LIMITS, PRODUCT_STATUSES, STATUS_LABELS, type ProductStatusValue, type Spec } from "@/lib/admin/products/grid-schema";

const money = z.number().finite().min(0).max(LIMITS.maxPrice);
const fillMode = z.enum(["replace", "fill-empty"]);

export const bulkOperationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("set_category"), categoryId: z.string().uuid().nullable() }),
  z.object({ type: z.literal("set_price"), price: money }),
  z.object({ type: z.literal("adjust_price"), percent: z.number().finite().min(-90).max(500).refine((value) => value !== 0, "Enter a non-zero percentage"), rounding: z.enum(["none", "rupee"]) }),
  z.object({ type: z.literal("set_compare_at"), price: money.nullable() }),
  z.object({ type: z.literal("set_moq"), quantity: z.number().int().min(MIN_ORDER_QUANTITY).max(LIMITS.maxMoq) }),
  z.object({ type: z.literal("set_status"), status: z.enum(PRODUCT_STATUSES as [ProductStatusValue, ...ProductStatusValue[]]) }),
  z.object({ type: z.literal("set_featured"), value: z.boolean() }),
  z.object({ type: z.literal("set_customizable"), value: z.boolean() }),
  z.object({
    type: z.literal("set_text"),
    field: z.enum(["description", "longDescription", "seoDescription"]),
    text: z.string().max(8000),
    mode: fillMode,
  }),
  z.object({
    type: z.literal("set_spec"),
    label: z.string().trim().min(1).max(LIMITS.maxSpecLabel),
    value: z.string().trim().max(LIMITS.maxSpecValue),
    mode: fillMode,
  }),
  z.object({ type: z.literal("set_alt_text"), template: z.string().trim().min(1).max(200), mode: fillMode }),
  z.object({ type: z.literal("duplicate") }),
  z.object({ type: z.literal("delete"), confirmText: z.string() }),
]);

export type BulkOperation = z.infer<typeof bulkOperationSchema>;
export type BulkOperationType = BulkOperation["type"];

export const BULK_OPERATION_LABELS: Record<BulkOperationType, string> = {
  set_category: "Change category",
  set_price: "Set price",
  adjust_price: "Increase / decrease price by %",
  set_compare_at: "Set MRP / compare-at price",
  set_moq: "Set minimum order quantity",
  set_status: "Activate / deactivate / archive",
  set_featured: "Mark / unmark featured",
  set_customizable: "Mark / unmark customisable",
  set_text: "Update description or meta description",
  set_spec: "Set a specification (material, colour, size…)",
  set_alt_text: "Set image alt text",
  duplicate: "Duplicate products (as drafts)",
  delete: "Delete products permanently",
};

export const TEXT_FIELD_LABELS = { description: "Short description", longDescription: "Full description", seoDescription: "Meta description" } as const;

export const MAX_DUPLICATE = 50;
export const MAX_DELETE = 200;
export const MAX_BULK = 5000;

export type BulkSnapshot = {
  id: string;
  name: string;
  productCode: string | null;
  categoryId: string | null;
  categoryName: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  /** Highest volume-tier unit price, or null when the product has no tiers. */
  maxTierPrice: number | null;
  minOrderQuantity: number;
  status: ProductStatusValue;
  isFeatured: boolean;
  isCustomizable: boolean;
  description: string | null;
  longDescription: string | null;
  seoDescription: string | null;
  specifications: Spec[];
  images: Array<{ id: string; alt: string | null }>;
  orderCount: number;
};

export type ProductPatch = Partial<{
  categoryId: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  minOrderQuantity: number;
  status: ProductStatusValue;
  isFeatured: boolean;
  isCustomizable: boolean;
  description: string | null;
  longDescription: string | null;
  seoDescription: string | null;
  specifications: Spec[];
}>;

export type DiffLine = { field: string; before: string; after: string };

export type BulkChange =
  | { kind: "skip"; reason: string }
  | { kind: "noop" }
  | { kind: "patch"; patch: ProductPatch; before: ProductPatch; imageAlts?: Array<{ id: string; alt: string }>; diff: DiffLine[] }
  | { kind: "duplicate"; diff: DiffLine[] }
  | { kind: "delete"; diff: DiffLine[] };

const round2 = (value: number) => Math.round(value * 100) / 100;
const rupees = (value: number | null) => (value === null ? "—" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
const short = (value: string | null) => {
  if (!value) return "(empty)";
  return value.length > 90 ? `${value.slice(0, 87)}…` : value;
};

/** Replaces {name} {code} {category} with real product data; never invents content. */
export function fillTemplate(template: string, product: Pick<BulkSnapshot, "name" | "productCode" | "categoryName">, index?: number): string {
  return template
    .replaceAll("{name}", product.name)
    .replaceAll("{code}", product.productCode ?? "")
    .replaceAll("{category}", product.categoryName ?? "")
    .replaceAll("{n}", index === undefined ? "" : String(index + 1))
    .replace(/\s{2,}/g, " ")
    .trim();
}

function priceGuard(product: BulkSnapshot, nextPrice: number): string | null {
  if (product.maxTierPrice !== null && nextPrice <= product.maxTierPrice) {
    return `New price ${rupees(nextPrice)} must stay above its volume-tier price ${rupees(product.maxTierPrice)}`;
  }
  if (product.compareAtPrice !== null && product.compareAtPrice <= nextPrice) {
    return `MRP ${rupees(product.compareAtPrice)} would no longer be higher than the new price ${rupees(nextPrice)}`;
  }
  return null;
}

export function computeBulkChange(op: BulkOperation, product: BulkSnapshot, ctx: { categoryNames: Map<string, string> }): BulkChange {
  const patch = (field: keyof ProductPatch, label: string, before: unknown, after: unknown, format: (value: never) => string): BulkChange => {
    if (JSON.stringify(before ?? null) === JSON.stringify(after ?? null)) return { kind: "noop" };
    return {
      kind: "patch",
      patch: { [field]: after } as ProductPatch,
      before: { [field]: before } as ProductPatch,
      diff: [{ field: label, before: format(before as never), after: format(after as never) }],
    };
  };

  switch (op.type) {
    case "set_category":
      return patch("categoryId", "Category", product.categoryId, op.categoryId, (id: string | null) => (id ? ctx.categoryNames.get(id) ?? "Unknown" : "Uncategorised"));
    case "set_price": {
      const guard = priceGuard(product, op.price);
      if (guard && product.basePrice !== op.price) return { kind: "skip", reason: guard };
      return patch("basePrice", "Price", product.basePrice, op.price, rupees);
    }
    case "adjust_price": {
      const raw = product.basePrice * (1 + op.percent / 100);
      const next = op.rounding === "rupee" ? Math.round(raw) : round2(raw);
      const guard = priceGuard(product, next);
      if (guard && next !== product.basePrice) return { kind: "skip", reason: guard };
      return patch("basePrice", "Price", product.basePrice, next, rupees);
    }
    case "set_compare_at": {
      if (op.price !== null && op.price <= product.basePrice) {
        return { kind: "skip", reason: `MRP ${rupees(op.price)} must be higher than the selling price ${rupees(product.basePrice)}` };
      }
      return patch("compareAtPrice", "MRP", product.compareAtPrice, op.price, rupees);
    }
    case "set_moq":
      return patch("minOrderQuantity", "Min. order qty", product.minOrderQuantity, op.quantity, (value: number) => String(value));
    case "set_status":
      return patch("status", "Status", product.status, op.status, (value: ProductStatusValue) => STATUS_LABELS[value]);
    case "set_featured":
      return patch("isFeatured", "Featured", product.isFeatured, op.value, (value: boolean) => (value ? "Yes" : "No"));
    case "set_customizable":
      return patch("isCustomizable", "Customisable", product.isCustomizable, op.value, (value: boolean) => (value ? "Yes" : "No"));
    case "set_text": {
      const current = product[op.field];
      if (op.mode === "fill-empty" && current && current.trim()) return { kind: "noop" };
      const filled = fillTemplate(op.text, product);
      const limit = op.field === "seoDescription" ? 500 : op.field === "description" ? 4000 : 8000;
      if (filled.length > limit) return { kind: "skip", reason: `Text would be ${filled.length} characters; the limit is ${limit}` };
      return patch(op.field, TEXT_FIELD_LABELS[op.field], current, filled || null, short);
    }
    case "set_spec": {
      const index = product.specifications.findIndex((spec) => spec.label.trim().toLowerCase() === op.label.toLowerCase());
      const current = index >= 0 ? product.specifications[index].value : null;
      if (op.mode === "fill-empty" && current) return { kind: "noop" };
      const value = fillTemplate(op.value, product);
      let next: Spec[];
      if (!value) next = product.specifications.filter((_, i) => i !== index);
      else if (index >= 0) next = product.specifications.map((spec, i) => (i === index ? { label: spec.label, value } : spec));
      else next = [...product.specifications, { label: op.label, value }];
      if (next.length > LIMITS.maxSpecs) return { kind: "skip", reason: `Already has ${LIMITS.maxSpecs} specifications` };
      if (JSON.stringify(next) === JSON.stringify(product.specifications)) return { kind: "noop" };
      return {
        kind: "patch",
        patch: { specifications: next },
        before: { specifications: product.specifications },
        diff: [{ field: op.label, before: current ?? "(none)", after: value || "(removed)" }],
      };
    }
    case "set_alt_text": {
      if (product.images.length === 0) return { kind: "skip", reason: "Product has no images" };
      const imageAlts = product.images
        .map((image, index) => ({ id: image.id, before: image.alt, alt: fillTemplate(op.template, product, index) }))
        .filter((image) => (op.mode === "replace" || !image.before?.trim()) && image.alt !== image.before);
      if (imageAlts.length === 0) return { kind: "noop" };
      return {
        kind: "patch",
        patch: {},
        before: {},
        imageAlts: imageAlts.map(({ id, alt }) => ({ id, alt })),
        diff: [{ field: `Alt text (${imageAlts.length} image${imageAlts.length === 1 ? "" : "s"})`, before: short(imageAlts[0].before), after: imageAlts[0].alt }],
      };
    }
    case "duplicate":
      if (!product.categoryId) return { kind: "skip", reason: "Needs a category to generate a product code" };
      return { kind: "duplicate", diff: [{ field: "New product", before: "—", after: `${product.name} (Copy) — draft` }] };
    case "delete":
      if (product.orderCount > 0) return { kind: "skip", reason: `Has ${product.orderCount} order line(s); archive it instead` };
      return { kind: "delete", diff: [{ field: "Product", before: product.name, after: "Deleted" }] };
  }
}
