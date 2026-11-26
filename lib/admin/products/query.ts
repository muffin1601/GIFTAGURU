import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProductSeoContent, productSeoContent } from "@/lib/seo/content/products";
import { asSpecifications, asStringItems } from "@/lib/product-content";
import {
  FILTER_KEYS,
  PAGE_SIZES,
  SORTABLE,
  SPEC_COLUMNS,
  specValue,
  type ColumnKey,
  type GridRow,
  type ProductFilters,
} from "@/lib/admin/products/grid-schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every slug that has hand-written SEO content in code (canonical + aliases). */
export function staticSeoSlugs(): string[] {
  return productSeoContent.flatMap((entry) => [entry.slug, ...(entry.slugAliases ?? [])]);
}

/** The exact <title> app/products/[slug]/page.tsx renders for a product. */
export function renderedSeoTitle(slug: string, name: string): string {
  return `${getProductSeoContent(slug)?.seoTitle ?? name} | Gifta Guru`;
}

export function normalizeFilters(input: Record<string, string | string[] | undefined>): ProductFilters {
  const filters: ProductFilters = {};
  for (const key of FILTER_KEYS) {
    const raw = input[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (value) filters[key] = value.slice(0, 200);
  }
  return filters;
}

const blank = (field: "description" | "longDescription" | "seoDescription"): Prisma.ProductWhereInput => ({
  OR: [{ [field]: null }, { [field]: "" }],
});

async function idsWhere(sql: Prisma.Sql): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(sql);
  return rows.map((row) => row.id);
}

/**
 * Translates URL filters into a Prisma where clause. Async because a couple of
 * checks (meta length, primary-image alt text) are not expressible in Prisma's
 * filter language and are resolved to an id list with a single SQL query.
 */
export async function buildProductWhere(filters: ProductFilters): Promise<Prisma.ProductWhereInput> {
  const P = Prisma;
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    const q = filters.q;
    and.push({
      OR: [
        ...(UUID.test(q) ? [{ id: q }] : []),
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { productCode: { contains: q, mode: "insensitive" } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }

  if (filters.category === "none") and.push({ categoryId: null });
  else if (filters.category && UUID.test(filters.category)) and.push({ categoryId: filters.category });

  if (filters.status === "inactive") and.push({ status: { in: ["draft", "archived"] } });
  else if (filters.status === "active" || filters.status === "draft" || filters.status === "archived") and.push({ status: filters.status });

  if (filters.featured === "yes") and.push({ isFeatured: true });
  if (filters.featured === "no") and.push({ isFeatured: false });

  const min = Number(filters.priceMin);
  const max = Number(filters.priceMax);
  if (filters.priceMin && Number.isFinite(min)) and.push({ basePrice: { gte: min } });
  if (filters.priceMax && Number.isFinite(max)) and.push({ basePrice: { lte: max } });

  const missingImage: Prisma.ProductWhereInput = { images: { none: {} } };
  const missingSpecs: Prisma.ProductWhereInput = { specifications: { equals: [] } };
  switch (filters.quality) {
    case "missing-image":
      and.push(missingImage);
      break;
    case "missing-description":
      and.push(blank("description"));
      break;
    case "missing-long-description":
      and.push(blank("longDescription"));
      break;
    case "missing-specs":
      and.push(missingSpecs);
      break;
    case "incomplete":
      and.push({ OR: [missingImage, missingSpecs, blank("description"), blank("longDescription")] });
      break;
  }

  switch (filters.seo) {
    case "missing-meta":
      and.push(blank("seoDescription"), { slug: { notIn: staticSeoSlugs() } });
      break;
    case "no-custom-meta":
      and.push(blank("seoDescription"));
      break;
    case "meta-too-long":
      and.push({ id: { in: await idsWhere(P.sql`select id from public.products where length(seo_description) > 160`) } });
      break;
    case "meta-too-short":
      and.push({ id: { in: await idsWhere(P.sql`select id from public.products where length(trim(seo_description)) between 1 and 69`) } });
      break;
    case "missing-alt":
      and.push({
        id: {
          in: await idsWhere(P.sql`
            select p.id from public.products p
            join lateral (
              select alt_text from public.product_images i
              where i.product_id = p.id order by i.sort_order asc, i.created_at asc limit 1
            ) primary_image on true
            where coalesce(trim(primary_image.alt_text), '') = ''`),
        },
      });
      break;
  }

  return and.length ? { AND: and } : {};
}

export function parseSort(sort?: string, dir?: string): { key: ColumnKey; dir: "asc" | "desc"; orderBy: Prisma.ProductOrderByWithRelationInput[] } {
  const key = (sort && sort in SORTABLE ? sort : "updatedAt") as ColumnKey;
  const direction = dir === "asc" ? "asc" : dir === "desc" ? "desc" : key === "updatedAt" || key === "createdAt" ? "desc" : "asc";
  const field = SORTABLE[key]!;
  const primary: Prisma.ProductOrderByWithRelationInput =
    field === "category" ? { category: { name: direction } } : ({ [field]: direction } as Prisma.ProductOrderByWithRelationInput);
  // id as a tiebreaker keeps pagination stable when many rows share a value.
  return { key, dir: direction, orderBy: [primary, { id: "asc" }] };
}

export function parsePaging(page?: string, size?: string) {
  const pageSize = PAGE_SIZES.includes(Number(size) as (typeof PAGE_SIZES)[number]) ? Number(size) : 50;
  return { page: Math.max(1, Math.floor(Number(page)) || 1), pageSize };
}

export const gridProductSelect = {
  id: true,
  name: true,
  slug: true,
  productCode: true,
  description: true,
  longDescription: true,
  specifications: true,
  customizationOptions: true,
  occasionTags: true,
  seoDescription: true,
  categoryId: true,
  basePrice: true,
  compareAtPrice: true,
  minOrderQuantity: true,
  isCustomizable: true,
  isFeatured: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  variants: { select: { id: true, sku: true, isDefault: true }, orderBy: { createdAt: "asc" } },
  images: { select: { id: true, url: true, altText: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
} satisfies Prisma.ProductSelect;

export type GridProduct = Prisma.ProductGetPayload<{ select: typeof gridProductSelect }>;

export function defaultVariant<T extends { isDefault: boolean }>(variants: T[]): T | undefined {
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

export function toGridRow(product: GridProduct): GridRow {
  const specs = asSpecifications(product.specifications);
  const primary = product.images[0];
  return {
    id: product.id,
    version: product.updatedAt.getTime(),
    images: product.images.map((image) => ({ id: image.id, url: image.url, alt: image.altText })),
    values: {
      id: product.id,
      primaryImageId: primary?.id ?? null,
      name: product.name,
      productCode: product.productCode,
      sku: defaultVariant(product.variants)?.sku ?? null,
      categoryId: product.categoryId,
      slug: product.slug,
      description: product.description,
      longDescription: product.longDescription,
      specifications: specs,
      material: specValue(specs, SPEC_COLUMNS.material),
      colour: specValue(specs, SPEC_COLUMNS.colour),
      size: specValue(specs, SPEC_COLUMNS.size),
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
      minOrderQuantity: product.minOrderQuantity,
      customizationOptions: asStringItems(product.customizationOptions),
      isCustomizable: product.isCustomizable,
      isFeatured: product.isFeatured,
      status: product.status,
      seoTitle: renderedSeoTitle(product.slug, product.name),
      seoDescription: product.seoDescription,
      occasionTags: product.occasionTags,
      imageAlt: primary?.altText ?? null,
      indexing: product.status === "active" ? "Indexable" : "Hidden",
      imageCount: product.images.length,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
  };
}

export async function getProductGridPage(params: Record<string, string | string[] | undefined>) {
  const filters = normalizeFilters(params);
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const sort = parseSort(first(params.sort), first(params.dir));
  const { page, pageSize } = parsePaging(first(params.page), first(params.size));
  const where = await buildProductWhere(filters);

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: sort.orderBy, skip: (page - 1) * pageSize, take: pageSize, select: gridProductSelect }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, isActive: true } }),
  ]);

  return { filters, sort: { key: sort.key, dir: sort.dir }, page, pageSize, total, rows: products.map(toGridRow), categories };
}
