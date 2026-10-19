import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "eco-gifts",
    name: "Eco Gifts",
    tagline: "Gifts That Care. For People & Planet.",
    description: "Sustainable gift sets crafted from natural materials, for teams who value responsible choices.",
    image: "/images/editorial/category-eco-friendly-gifts.webp",
    ctaLabel: "Explore Eco Gifts",
  },
  {
    slug: "joining-gifts",
    name: "Joining Gifts",
    tagline: "Welcome to New Beginnings.",
    description: "Thoughtfully curated onboarding kits that make a new hire's first day feel like a celebration.",
    image: "/images/editorial/category-joining-gifts.webp",
    ctaLabel: "Explore Joining Kits",
  },
  {
    slug: "luxury-gifts",
    name: "Luxury Gifts",
    tagline: "Luxury Gifts. Timeless Impressions.",
    description: "Exquisite gift sets for leadership moments and clients who expect nothing but the finest.",
    image: "/images/editorial/category-luxury-gifts.webp",
    ctaLabel: "Explore Luxury Gifts",
  },
  {
    slug: "premium-gifts",
    name: "Premium Gifts",
    tagline: "Thoughtful Gifts. Stronger Relationships.",
    description: "Premium gift kits for every corporate occasion, designed to leave a lasting impression.",
    image: "/images/editorial/category-premium-gifts.webp",
    ctaLabel: "Explore Collection",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
