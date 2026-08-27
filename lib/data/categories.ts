import { createClient } from "@/lib/supabase/server";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { productCategories as fallbackCategories } from "@/data/product-categories";
import type { ProductCategory } from "@/types/storefront";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  if (isDatabaseConfigured()) {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
    }));
  }

  if (!isSupabaseConfigured()) return fallbackCategories;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, image_url")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallbackCategories;

  return (data as unknown as CategoryRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
  }));
}

export async function getProductCategoryBySlug(slug: string): Promise<ProductCategory | undefined> {
  const categories = await getProductCategories();
  return categories.find((category) => category.slug === slug);
}
