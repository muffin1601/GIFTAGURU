/** @deprecated legacy literal union kept only for the bootstrap fallback data in data/*.ts */
export type CategorySlug = "eco-gifts" | "joining-gifts" | "luxury-gifts" | "premium-gifts";

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  ctaLabel: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  minQuantity: number;
  featured: boolean;
  image?: string;
  inStock?: boolean;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}
