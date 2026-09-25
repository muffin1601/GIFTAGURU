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
  ["diwali-signature-hamper", "Utsav-on-the-go Hamper", "premium-gift-sets", "Utsav-on-the-go Hamper is thoughtfully curated with a premium 1200ml tumbler, delicious snacks, and festive candle essentials designed to bring warmth, convenience, and celebration, making it an ideal choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.", 1999, 20, "/Hampers/set 1/gift_set_1600x1600.webp", true],
  ["diwali-celebration-hamper", "The Diwali Delight Box", "premium-gift-sets", "A festive corporate hamper with a polished presentation for Diwali gifting programmes.", 2999, 15, "/Hampers/set 2/diwali_hamper_final_1600x1600.webp", true],
  ["diwali-grand-hamper", "Shubh Utsav Hamper", "luxury-gift-sets", "Diwali Special: Shubh Utsav Gift Hamper is thoughtfully curated with a premium 340ml travel flask, rich coffee, and gourmet snacks designed to create a festive and indulgent experience, making it a perfect choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.", 3999, 10, "/Hampers/set 3/gift_hamper_1600x1600_clean (1).webp", true],
  ["white-festive-flask-tumbler-hamper", "White Festive Flask & Tumbler Hamper", "premium-gift-sets", "A white flask, insulated tumbler, chocolates and diya gift box for corporate Diwali gifting.", 1899, 20, "/Diwali kits/Set 1/Primary.webp", true],
  ["tan-executive-diary-flask-gift-set", "Tan Executive Diary & Flask Gift Set", "premium-gift-sets", "A tan diary, pen and flask gift box for premium employee and client Diwali gifting.", 2499, 15, "/Diwali kits/Set 2/Primary.webp", true],
  ["white-notebook-flask-gift-set", "White Notebook & Flask Gift Set", "premium-gift-sets", "A white notebook, pen and flask corporate Diwali gift set.", 1999, 20, "/Diwali kits/Set 3/Primary.webp", true],
  ["copper-festive-bottle-diya-hamper", "Copper Festive Bottle & Diya Hamper", "premium-gift-sets", "A copper bottle, festive diya and treats hamper for corporate Diwali gifting.", 1699, 25, "/Diwali kits/Set 4/Primary.webp", true],
  ["copper-celebration-hamper", "Copper Celebration Hamper", "premium-gift-sets", "A copper tumbler, festive treats and diya hamper for employee Diwali gifts.", 1999, 20, "/Diwali kits/Set 5/Primary.webp", true],
  ["black-festive-flask-cookie-hamper", "Black Festive Flask & Cookie Hamper", "premium-gift-sets", "A black flask, cookies and festive diya hamper for corporate Diwali gifting.", 1799, 25, "/Diwali kits/Set 6/primary (1).webp", true],
  ["black-celebration-flask-mug-hamper", "Black Celebration Flask & Mug Hamper", "premium-gift-sets", "A black flask, mug, chocolates and diya gift hamper for clients and employees.", 2199, 20, "/Diwali kits/Set 7/Primary_2.webp", true],
  ["executive-black-mug-diary-gift-box", "Executive Black Mug & Diary Gift Box", "luxury-gift-sets", "A black diary, insulated mug, chocolates and diya gift box for premium corporate Diwali gifting.", 2399, 15, "/Diwali kits/Set 8/Primary_1.webp", true],
  ["premium-diya-glass-gift-box", "Premium Diya & Glass Gift Box", "luxury-gift-sets", "A premium glassware and diya gift box for client and leadership Diwali gifting.", 1499, 20, "/Diwali kits/Set 9/Primary.webp", true],
];

const productSeeds = productSeedTuples.map(([slug, name, category, description, price, , image, featured = false], index) => ({
  slug,
  name,
  category,
  description,
  price,
  // These codes are the matching standard-variant SKUs defined in prisma/seed-catalog.mjs.
  productCode: `GG-SET-${String(index + 1).padStart(2, "0")}-STD`,
  minQuantity: MIN_ORDER_QUANTITY,
  image: index < 24
    ? `/Gifta Guru/Set ${index + 1}/1 (1).png`
    : index < 27
      ? `/Hampers/set ${index - 23}/1 (1).webp`
      : image,
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
