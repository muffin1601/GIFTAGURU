import type { Product } from "@/types";
import { MIN_ORDER_QUANTITY } from "@/lib/config/store";

type ProductSeedTuple = [
  slug: string,
  name: string,
  category: string,
  description: string,
  price: number,
  minQuantity: number,
  image: string,
  featured?: boolean,
];

const productSeedTuples: ProductSeedTuple[] = [
  ["executive-onboarding-essentials-set", "Executive Onboarding Essentials Set", "office-stationery", "Diary, pen, and corporate essentials curated for new hire welcome kits.", 1199, 25, "/Gifta Guru/Set 1/gift_set (1).png", true],
  ["classic-pen-keychain-welcome-set", "Classic Pen & Keychain Welcome Set", "pens-desk-accessories", "A practical branded pen and keychain set for events and joining gifts.", 999, 50, "/Gifta Guru/Set 2/pen_keychain_300x300.png", true],
  ["client-appreciation-desk-set", "Client Appreciation Desk Set", "premium-gift-sets", "Card holder, pen, keychain, and gift set for client relationship moments.", 1499, 25, "/Gifta Guru/Set 3/gift_set_300x300.png", true],
  ["refined-folio-pen-gift-set", "Refined Folio & Pen Gift Set", "luxury-gift-sets", "Folio and pen presentation set for leadership gifting and premium clients.", 1799, 20, "/Gifta Guru/Set 4/gift_set_enhanced_300x300 (1).png", true],
  ["journal-matching-pen-set", "Journal & Matching Pen Set", "office-stationery", "A clean notebook and pen set for employee appreciation and everyday work.", 1099, 30, "/Gifta Guru/Set 5/notebook_gift_set_300x300.png", true],
  ["luxury-clutch-executive-set", "Luxury Clutch Executive Set", "luxury-gift-sets", "Luxury clutch, pen, and refined accessories for senior stakeholders.", 2499, 15, "/Gifta Guru/Set 6/luxury_gift_set_300x300.png", true],
  ["green-gold-corporate-stationery-set", "Green Gold Corporate Stationery Set", "premium-gift-sets", "Premium green stationery set with notebook and pen for memorable gifting.", 1299, 25, "/Gifta Guru/Set 7/corporate_gift_set_transparent_300x300.png", true],
  ["black-gold-premium-notebook-set", "Black Gold Premium Notebook Set", "premium-gift-sets", "Elegant black and gold notebook and pen set for premium corporate gifting.", 1399, 25, "/Gifta Guru/Set 8/premium_gift_set_transparent_300x300.png", true],
  ["corporate-gift-set-with-notebook", "Corporate Gift Set with Notebook", "premium-gift-sets", "A compact branded gift set for clients, teams, and event participants.", 1599, 20, "/Gifta Guru/Set 9/corporate_gift_set_enhanced_300x300.png", true],
  ["compact-corporate-welcome-kit", "Compact Corporate Welcome Kit", "office-stationery", "Notebook and gift set made for onboarding programs and welcome desks.", 1199, 30, "/Gifta Guru/Set 10/corporate_gift_set_300x300_v2.png", true],
  ["complete-stationery-gift-set", "Complete Stationery Gift Set", "premium-gift-sets", "Notebook, pen, keychain, and stationery accessories in a polished set.", 1699, 20, "/Gifta Guru/Set 11/stationery_gift_set_transparent_300x300.png", true],
  ["luxury-planner-gift-box", "Luxury Planner Gift Box", "luxury-gift-sets", "Luxury planner and presentation box for executive and festive gifting.", 2999, 10, "/Gifta Guru/Set 12/luxury_gift_set_1200x1200.png", true],
  ["notebook-pen-executive-set", "Notebook & Pen Executive Set", "office-stationery", "Classic notebook and pen pairing for daily productivity gifting.", 1399, 25, "/Gifta Guru/Set 13/gift_set_1200x1200_v2.png"],
  ["blue-notebook-welcome-set", "Blue Notebook Welcome Set", "office-stationery", "Blue notebook and pen kit for new employees and event attendees.", 1299, 25, "/Gifta Guru/Set 14/blue_gift_set_1200x1200_transparent.png"],
  ["burgundy-relationship-gift-set", "Burgundy Relationship Gift Set", "luxury-gift-sets", "Burgundy gift set with premium details for clients and festive gifting.", 2699, 10, "/Gifta Guru/Set 15/burgundy_gift_set_1200x1200.png", true],
  ["wood-finish-premium-gift-set", "Wood Finish Premium Gift Set", "eco-gift-sets", "Wood-inspired premium stationery gift set with sustainable appeal.", 2199, 15, "/Gifta Guru/Set 16/stationery_gift_set_1200x1200.png"],
  ["minimal-notebook-pen-set", "Minimal Notebook & Pen Set", "office-stationery", "Minimal gift set for team appreciation, events, and daily use.", 999, 40, "/Gifta Guru/Set 17/gift_set_1200x1200_transparent(2).png"],
  ["sage-green-sustainable-gift-set", "Sage Green Sustainable Gift Set", "eco-gift-sets", "Eco-conscious green gift set for responsible corporate gifting.", 1899, 20, "/Gifta Guru/Set 18/sage_green_gift_set_1200x1200.png", true],
  ["green-eco-notebook-gift-set", "Green Eco Notebook Gift Set", "eco-gift-sets", "Green notebook and pen set designed for sustainable gifting campaigns.", 1499, 25, "/Gifta Guru/Set 19/green_gift_set_1200x1200_transparent.png"],
  ["brown-luxury-stationery-set", "Brown Luxury Stationery Set", "luxury-gift-sets", "Brown journal, pen, and stationery set for high-end business gifting.", 2799, 10, "/Gifta Guru/Set 20/luxury_stationery_gift_set_1200x1200.png", true],
  ["black-executive-corporate-set", "Black Executive Corporate Set", "luxury-gift-sets", "Black executive gift set with a strong premium corporate presence.", 2899, 10, "/Gifta Guru/Set 21/black_corporate_gift_set_1200x1200.png", true],
  ["grey-folio-notebook-set", "Grey Folio & Notebook Set", "premium-gift-sets", "Grey folio, notebook, and pen kit for polished business gifting.", 1799, 20, "/Gifta Guru/Set 22/gray_folio_pen_1200x1200_transparent.png"],
  ["white-premium-corporate-gift-set", "White Premium Corporate Gift Set", "premium-gift-sets", "White premium gift set for festive campaigns and client gifting.", 1999, 20, "/Gifta Guru/Set 23/white_gift_set_1200x1200_transparent.png", true],
  ["grey-planner-corporate-set", "Grey Planner Corporate Set", "office-stationery", "Grey planner and black pen set for practical employee appreciation.", 1299, 30, "/Gifta Guru/Set 24/grey_notebook_gift_set_1200x1200.png"],
];

const productSeeds = productSeedTuples.map(([slug, name, category, description, price, , image, featured = false]) => ({
  slug,
  name,
  category,
  description,
  price,
  minQuantity: MIN_ORDER_QUANTITY,
  image,
  featured,
}));

export const products: Product[] = productSeeds.map((product) => ({
  id: product.slug,
  ...product,
}));

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}
