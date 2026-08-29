import { createClient } from "@/lib/supabase/server";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { categories as fallbackFeaturedCollections } from "@/data/categories";
import type { Category } from "@/types";
import type { StorefrontCollection } from "@/types/storefront";

interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
}

export async function getCollections(): Promise<StorefrontCollection[]> {
  if (isDatabaseConfigured()) {
    try {
      const collections = await prisma.collection.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      });

      return collections.map((collection) => ({
        id: collection.id,
        slug: collection.slug,
        name: collection.name,
        tagline: collection.tagline,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isFeatured: collection.isFeatured,
      }));
    } catch {
      // Fall through to the configured Supabase or local catalog when Prisma is unavailable.
    }
  }

  if (!isSupabaseConfigured()) {
    return fallbackFeaturedCollections.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      imageUrl: c.image,
      isFeatured: true,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, tagline, description, image_url, is_featured")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as CollectionRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    imageUrl: row.image_url,
    isFeatured: row.is_featured,
  }));
}

/**
 * Returns the featured, image-led collections in the legacy `Category` shape
 * so the existing GiftCategories / CategoryCard components keep working
 * unchanged while the underlying data source moves to Supabase.
 */
export async function getFeaturedCollectionsAsCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return fallbackFeaturedCollections;

  const collections = await getCollections();
  const featured = collections.filter((c) => c.isFeatured && c.imageUrl);

  if (featured.length === 0) return fallbackFeaturedCollections;

  return featured.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline ?? c.name,
    description: c.description ?? "",
    image: c.imageUrl!,
    ctaLabel: `Explore ${c.name}`,
  }));
}

export async function getCollectionBySlug(slug: string): Promise<Category | undefined> {
  if (isDatabaseConfigured()) {
    const collection = await prisma.collection.findUnique({ where: { slug } });
    if (!collection || !collection.isPublished) return undefined;

    return {
      slug: collection.slug,
      name: collection.name,
      tagline: collection.tagline ?? collection.name,
      description: collection.description ?? "",
      image: collection.imageUrl ?? "/SBanners/SBanners/PREMIUM.png",
      ctaLabel: `Explore ${collection.name}`,
    };
  }

  const collections = await getFeaturedCollectionsAsCategories();
  const match = collections.find((c) => c.slug === slug);
  if (match) return match;

  if (!isSupabaseConfigured()) return undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("slug, name, tagline, description, image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return undefined;

  const row = data as unknown as Omit<CollectionRow, "id" | "is_featured">;

  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? row.name,
    description: row.description ?? "",
    image: row.image_url ?? "/SBanners/SBanners/PREMIUM.png",
    ctaLabel: `Explore ${row.name}`,
  };
}
