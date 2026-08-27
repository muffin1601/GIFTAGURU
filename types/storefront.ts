export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export interface StorefrontCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
}

export interface StorefrontVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  isDefault: boolean;
  quantityAvailable: number;
  inStock: boolean;
}

export interface StorefrontProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isCustomizable: boolean;
  minOrderQuantity: number;
  occasionTags: string[];
  avgRating: number;
  reviewCount: number;
  images: { url: string; alt: string | null }[];
  variants: StorefrontVariant[];
  customizations: { type: string; label: string; required: boolean; extraPrice: number }[];
  collections: { slug: string; name: string }[];
}
