import type { ProductCategory } from "@/types/storefront";

/** Bootstrap fallback used only when Supabase is not yet configured. */
export const productCategories: ProductCategory[] = [
  { id: "tech-electronics", slug: "tech-electronics", name: "Tech & Electronics", description: "Power banks, speakers, gadgets, and tech accessories.", imageUrl: null },
  { id: "office-stationery", slug: "office-stationery", name: "Office & Stationery", description: "Diaries, pens, and desk essentials.", imageUrl: null },
  { id: "drinkware", slug: "drinkware", name: "Drinkware", description: "Bottles, mugs, and flasks.", imageUrl: null },
  { id: "bags-travel", slug: "bags-travel", name: "Bags & Travel", description: "Backpacks, travel organizers, and pouches.", imageUrl: null },
  { id: "lifestyle-wellness", slug: "lifestyle-wellness", name: "Lifestyle & Wellness", description: "Wellness and self-care gifting.", imageUrl: null },
  { id: "home-living", slug: "home-living", name: "Home & Living", description: "Decor and home essentials.", imageUrl: null },
  { id: "awards-recognition", slug: "awards-recognition", name: "Awards & Recognition", description: "Trophies, plaques, and recognition gifts.", imageUrl: null },
  { id: "gourmet-hampers", slug: "gourmet-hampers", name: "Gourmet & Food Hampers", description: "Curated food and beverage hampers.", imageUrl: null },
  { id: "apparel-merchandise", slug: "apparel-merchandise", name: "Apparel & Merchandise", description: "Branded apparel and merchandise.", imageUrl: null },
  { id: "desk-essentials", slug: "desk-essentials", name: "Desk Essentials", description: "Organizers and desk accessories.", imageUrl: null },
];
