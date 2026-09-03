import { createClient } from "@/lib/supabase/server";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  products as fallbackProducts,
  getFeaturedProducts as getFallbackFeaturedProducts,
  getProductsByCategory as getFallbackProductsByCollection,
} from "@/data/products";
import type { Product } from "@/types";
import type { StorefrontProductDetail } from "@/types/storefront";

interface ProductListRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  min_order_quantity: number;
  categories: { slug: string } | { slug: string }[] | null;
  product_images: { url: string; sort_order: number }[] | null;
}

interface SupabaseQueryResult {
  data: unknown;
  error: unknown;
}

interface SupabaseQueryBuilder extends PromiseLike<SupabaseQueryResult> {
  select(columns: string): SupabaseQueryBuilder;
  eq(column: string, value: unknown): SupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder;
  limit(count: number): PromiseLike<SupabaseQueryResult>;
  maybeSingle(): PromiseLike<SupabaseQueryResult>;
  textSearch(column: string, value: string, options?: { type?: "plain" | "phrase" | "websearch" }): SupabaseQueryBuilder;
  gte(column: string, value: unknown): SupabaseQueryBuilder;
  lte(column: string, value: unknown): SupabaseQueryBuilder;
}

interface SupabaseLooseClient {
  from(table: string): SupabaseQueryBuilder;
}

interface ProductDetailRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_customizable: boolean;
  min_order_quantity: number;
  occasion_tags: string[] | null;
  avg_rating: number;
  review_count: number;
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null;
  product_images: { url: string; alt_text: string | null; sort_order: number }[] | null;
  product_variants:
    | {
        id: string;
        name: string;
        sku: string;
        price_override: number | null;
        compare_at_price: number | null;
        option1_name: string | null;
        option1_value: string | null;
        option2_name: string | null;
        option2_value: string | null;
        is_default: boolean;
        inventory: { quantity_available: number } | { quantity_available: number }[] | null;
      }[]
    | null;
  product_customizations:
    | { customization_type: string; label: string; is_required: boolean; extra_price: number }[]
    | null;
  product_collection_mappings:
    | { collections: { slug: string; name: string } | { slug: string; name: string }[] | null }[]
    | null;
  product_price_tiers: { min_quantity: number; unit_price: number }[] | null;
}

function mapListRow(row: ProductListRow): Product {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const cover = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.slug ?? "corporate-gifts",
    description: row.description ?? "",
    price: row.base_price,
    minQuantity: row.min_order_quantity,
    featured: true,
    image: cover?.url,
  };
}

const LIST_SELECT =
  "id, slug, name, description, base_price, min_order_quantity, categories(slug), product_images(url, sort_order)";

type PrismaListProduct = Awaited<ReturnType<typeof getPrismaProducts>>[number];

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function getPrismaProducts(args: {
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
  orderByReviewCount?: boolean;
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  customizableOnly?: boolean;
}) {
  return prisma.product.findMany({
    skip: args.offset ?? 0,
    where: {
      status: "active",
      ...(args.featuredOnly ? { isFeatured: true } : {}),
      ...(args.categorySlug ? { category: { slug: args.categorySlug } } : {}),
      ...(args.query
        ? {
            OR: [
              { name: { contains: args.query, mode: "insensitive" } },
              { description: { contains: args.query, mode: "insensitive" } },
              { category: { name: { contains: args.query, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(typeof args.minPrice === "number" ? { basePrice: { gte: args.minPrice } } : {}),
      ...(typeof args.maxPrice === "number" ? { basePrice: { lte: args.maxPrice } } : {}),
      ...(args.customizableOnly ? { isCustomizable: true } : {}),
    },
    orderBy: args.orderByReviewCount ? { reviewCount: "desc" } : { createdAt: "desc" },
    take: args.limit ?? 24,
    include: {
      category: { select: { slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
}

function mapPrismaListProduct(product: PrismaListProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category?.slug ?? "corporate-gifts",
    description: product.description ?? "",
    price: toNumber(product.basePrice),
    minQuantity: product.minOrderQuantity,
    featured: product.isFeatured,
    image: product.images[0]?.url,
    inStock: true,
  };
}

function filterFallbackProducts(filters: ProductFilters): Product[] {
  let results = fallbackProducts;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  if (filters.categorySlug) results = results.filter((p) => p.category === filters.categorySlug);
  if (typeof filters.minPrice === "number") {
    results = results.filter((p) => (p.price ?? 0) >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number") {
    results = results.filter((p) => (p.price ?? 0) <= filters.maxPrice!);
  }
  return results.slice(0, filters.limit ?? results.length);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (isDatabaseConfigured()) {
    try {
      const products = await getPrismaProducts({ limit, featuredOnly: true });
      if (products.length > 0) return products.map(mapPrismaListProduct);
    } catch {
      // Fall through to the configured Supabase or local catalog when Prisma is unavailable.
    }
  }

  if (!isSupabaseConfigured()) return getFallbackFeaturedProducts();

  const supabase = (await createClient()) as unknown as SupabaseLooseClient;
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .limit(limit);

  const rows = data as ProductListRow[] | null;
  if (error || !rows || rows.length === 0) return getFallbackFeaturedProducts();

  return rows.map(mapListRow);
}

export async function getMostGiftedProducts(limit = 8): Promise<Product[]> {
  if (isDatabaseConfigured()) {
    const products = await getPrismaProducts({ limit, orderByReviewCount: true });
    if (products.length > 0) return products.map(mapPrismaListProduct);
  }

  if (!isSupabaseConfigured()) return getFallbackFeaturedProducts();

  const supabase = (await createClient()) as unknown as SupabaseLooseClient;
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .order("review_count", { ascending: false })
    .limit(limit);

  const rows = data as ProductListRow[] | null;
  if (error || !rows || rows.length === 0) return getFallbackFeaturedProducts();

  return rows.map(mapListRow);
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  if (isDatabaseConfigured()) {
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        collections: { some: { collection: { slug: collectionSlug } } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    if (products.length > 0) return products.map(mapPrismaListProduct);
  }

  if (!isSupabaseConfigured()) return getFallbackProductsByCollection(collectionSlug);

  const supabase = (await createClient()) as unknown as SupabaseLooseClient;
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", collectionSlug)
    .maybeSingle();

  const collectionRow = collection as unknown as { id: string } | null;
  if (!collectionRow) return getFallbackProductsByCollection(collectionSlug);

  const { data, error } = await supabase
    .from("product_collection_mappings")
    .select(`product_id, products!inner(${LIST_SELECT})`)
    .eq("collection_id", collectionRow.id);

  const rows = data as { products: ProductListRow | ProductListRow[] | null }[] | null;
  if (error || !rows || rows.length === 0) return getFallbackProductsByCollection(collectionSlug);

  return rows
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      return product ? mapListRow(product as unknown as ProductListRow) : null;
    })
    .filter((product): product is Product => product !== null);
}

export interface ProductFilters {
  /** Rows to skip, for paginated listings. */
  offset?: number;
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  customizableOnly?: boolean;
  query?: string;
  limit?: number;
}

export async function searchProducts(filters: ProductFilters): Promise<Product[]> {
  if (isDatabaseConfigured()) {
    if (filters.collectionSlug) return getProductsByCollection(filters.collectionSlug);
    const products = await getPrismaProducts({
      limit: filters.limit,
      offset: filters.offset,
      categorySlug: filters.categorySlug,
      query: filters.query,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      customizableOnly: filters.customizableOnly,
    });
    return products.map(mapPrismaListProduct);
  }

  if (!isSupabaseConfigured()) {
    return filterFallbackProducts(filters);
  }

  const supabase = (await createClient()) as unknown as SupabaseLooseClient;
  let queryBuilder = supabase.from("products").select(LIST_SELECT).eq("status", "active");

  if (filters.query) {
    queryBuilder = queryBuilder.textSearch("name", filters.query, { type: "websearch" });
  }
  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    const categoryRow = category as unknown as { id: string } | null;
    if (categoryRow) queryBuilder = queryBuilder.eq("category_id", categoryRow.id);
  }
  if (typeof filters.minPrice === "number") queryBuilder = queryBuilder.gte("base_price", filters.minPrice);
  if (typeof filters.maxPrice === "number") queryBuilder = queryBuilder.lte("base_price", filters.maxPrice);
  if (filters.customizableOnly) queryBuilder = queryBuilder.eq("is_customizable", true);

  const { data, error } = await queryBuilder.limit(filters.limit ?? 24);
  if (error || !data || (Array.isArray(data) && data.length === 0)) return filterFallbackProducts(filters);

  return (data as unknown as ProductListRow[]).map(mapListRow);
}

/**
 * Total active products matching the same filters `searchProducts` applies,
 * so a listing can render page controls.
 *
 * Returns null when the catalogue is being served from the bundled fallback
 * data rather than the database -- there is no meaningful total to page
 * through in that case, and the caller renders the single page it has.
 */
export async function countProducts(filters: Pick<ProductFilters, "categorySlug" | "query">): Promise<number | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    return await prisma.product.count({
      where: {
        status: "active",
        ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
        ...(filters.query
          ? {
              OR: [
                { name: { contains: filters.query, mode: "insensitive" } },
                { description: { contains: filters.query, mode: "insensitive" } },
                { category: { name: { contains: filters.query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
    });
  } catch {
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<StorefrontProductDetail | null> {
  if (isDatabaseConfigured()) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { slug: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
          include: { inventory: true },
        },
        customizations: true,
        collections: {
          include: { collection: { select: { slug: true, name: true } } },
        },
        priceTiers: { orderBy: { minQuantity: "asc" } },
      },
    });

    if (!product || product.status !== "active") return null;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categorySlug: product.category?.slug ?? null,
      categoryName: product.category?.name ?? null,
      basePrice: toNumber(product.basePrice),
      compareAtPrice: product.compareAtPrice === null ? null : toNumber(product.compareAtPrice),
      isCustomizable: product.isCustomizable,
      minOrderQuantity: product.minOrderQuantity,
      occasionTags: product.occasionTags,
      avgRating: toNumber(product.avgRating),
      reviewCount: product.reviewCount,
      images: product.images.map((image) => ({ url: image.url, alt: image.altText })),
      variants: product.variants.map((variant) => {
        const price = variant.priceOverride ?? product.basePrice;
        const quantityAvailable = variant.inventory?.quantityAvailable ?? 0;
        return {
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: toNumber(price),
          compareAtPrice: variant.compareAtPrice === null ? null : toNumber(variant.compareAtPrice),
          option1Name: variant.option1Name,
          option1Value: variant.option1Value,
          option2Name: variant.option2Name,
          option2Value: variant.option2Value,
          isDefault: variant.isDefault,
          quantityAvailable,
          inStock: quantityAvailable > 0,
        };
      }),
      customizations: product.customizations.map((customization) => ({
        type: customization.customizationType,
        label: customization.label,
        required: customization.isRequired,
        extraPrice: toNumber(customization.extraPrice),
      })),
      collections: product.collections.map(({ collection }) => collection),
      priceTiers: product.priceTiers.map((tier) => ({
        minQuantity: tier.minQuantity,
        unitPrice: toNumber(tier.unitPrice),
      })),
    };
  }

  if (!isSupabaseConfigured()) {
    const fallback = fallbackProducts.find((p) => p.slug === slug);
    if (!fallback) return null;

    return {
      id: fallback.id,
      slug: fallback.slug,
      name: fallback.name,
      description: fallback.description,
      categorySlug: fallback.category,
      categoryName: fallback.category,
      basePrice: fallback.price ?? 0,
      compareAtPrice: null,
      isCustomizable: true,
      minOrderQuantity: fallback.minQuantity,
      occasionTags: [],
      avgRating: 0,
      reviewCount: 0,
      images: fallback.image ? [{ url: fallback.image, alt: fallback.name }] : [],
      variants: [
        {
          id: fallback.id,
          name: "Standard",
          sku: fallback.id.toUpperCase(),
          price: fallback.price ?? 0,
          compareAtPrice: null,
          option1Name: null,
          option1Value: null,
          option2Name: null,
          option2Value: null,
          isDefault: true,
          quantityAvailable: 100,
          inStock: true,
        },
      ],
      customizations: [],
      collections: [],
      priceTiers: [],
    };
  }

  const supabase = (await createClient()) as unknown as SupabaseLooseClient;
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, description, base_price, compare_at_price, is_customizable,
       min_order_quantity, occasion_tags, avg_rating, review_count,
       categories(slug, name),
       product_images(url, alt_text, sort_order),
       product_variants(id, name, sku, price_override, compare_at_price, option1_name, option1_value, option2_name, option2_value, is_default, inventory(quantity_available)),
       product_customizations(customization_type, label, is_required, extra_price),
       product_collection_mappings(collections(slug, name)),
       product_price_tiers(min_quantity, unit_price)`,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    const fallback = fallbackProducts.find((p) => p.slug === slug);
    if (!fallback) return null;

    return {
      id: fallback.id,
      slug: fallback.slug,
      name: fallback.name,
      description: fallback.description,
      categorySlug: fallback.category,
      categoryName: fallback.category,
      basePrice: fallback.price ?? 0,
      compareAtPrice: null,
      isCustomizable: true,
      minOrderQuantity: fallback.minQuantity,
      occasionTags: [],
      // No invented ratings -- the product page hides the rating when count is 0.
      avgRating: 0,
      reviewCount: 0,
      images: fallback.image ? [{ url: fallback.image, alt: fallback.name }] : [],
      variants: [
        {
          id: fallback.id,
          name: "Standard",
          sku: fallback.id.toUpperCase(),
          price: fallback.price ?? 0,
          compareAtPrice: null,
          option1Name: null,
          option1Value: null,
          option2Name: null,
          option2Value: null,
          isDefault: true,
          quantityAvailable: 100,
          inStock: true,
        },
      ],
      customizations: [],
      collections: [],
      priceTiers: [],
    };
  }

  const row = data as unknown as ProductDetailRow;
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const variants = (row.product_variants ?? []).map((v) => {
    const inventory = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
    const quantityAvailable = inventory?.quantity_available ?? 0;
    return {
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price_override ?? row.base_price,
      compareAtPrice: v.compare_at_price,
      option1Name: v.option1_name,
      option1Value: v.option1_value,
      option2Name: v.option2_name,
      option2Value: v.option2_value,
      isDefault: v.is_default,
      quantityAvailable,
      inStock: quantityAvailable > 0,
    };
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    categorySlug: category?.slug ?? null,
    categoryName: category?.name ?? null,
    basePrice: row.base_price,
    compareAtPrice: row.compare_at_price,
    isCustomizable: row.is_customizable,
    minOrderQuantity: row.min_order_quantity,
    occasionTags: row.occasion_tags ?? [],
    avgRating: row.avg_rating,
    reviewCount: row.review_count,
    images: (row.product_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ url: img.url, alt: img.alt_text })),
    variants,
    customizations: (row.product_customizations ?? []).map((c) => ({
      type: c.customization_type,
      label: c.label,
      required: c.is_required,
      extraPrice: c.extra_price,
    })),
    collections: (row.product_collection_mappings ?? [])
      .map((m) => (Array.isArray(m.collections) ? m.collections[0] : m.collections))
      .filter((c): c is { slug: string; name: string } => Boolean(c)),
    priceTiers: (row.product_price_tiers ?? [])
      .map((tier) => ({ minQuantity: tier.min_quantity, unitPrice: tier.unit_price }))
      .sort((a, b) => a.minQuantity - b.minQuantity),
  };
}
