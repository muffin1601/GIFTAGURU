import "dotenv/config";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DIRECT_URL or DATABASE_URL in .env before running the catalog seed.");
}

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
const productRoot = path.join(process.cwd(), "public", "Gifta Guru");

const categories = [
  ["office-stationery", "Office & Stationery", "Diaries, pens, and desk essentials.", 1],
  ["premium-gift-sets", "Premium Gift Sets", "Curated presentation boxes for employees and clients.", 2],
  ["luxury-gift-sets", "Luxury Gift Sets", "Executive-grade boxes, journals, and fine accessories.", 3],
  ["eco-gift-sets", "Eco-Friendly Gift Sets", "Sustainable corporate gifts with refined utility.", 4],
  ["pens-desk-accessories", "Pens & Desk Accessories", "Pens, keychains, folios, planners, and desk add-ons.", 5],
];

const collections = [
  ["corporate-gifts", "Corporate Gifts", "Gifting for every business relationship", "General corporate gifting for clients, teams, and partners.", null, true, 1],
  ["joining-gifts", "Joining Gifts", "Thoughtfully curated joining kits", "Joining kits to inspire, engage and empower.", "/SBanners/SBanners/JOINING.png", true, 2],
  ["employee-welcome-kits", "Employee Welcome Kits", "Welcome to New Beginnings.", "Onboarding kits for new hires.", "/SBanners/SBanners/JOINING.png", true, 3],
  ["premium-gifts", "Premium Gifts", "Thoughtful Gifts. Stronger Relationships.", "Premium gift kits for every corporate occasion.", "/SBanners/SBanners/PREMIUM.png", true, 4],
  ["luxury-gifts", "Luxury Gifts", "Luxury Gifts. Timeless Impressions.", "Exquisite gift sets for executive occasions.", "/SBanners/SBanners/LUXURY.png", true, 5],
  ["eco-gifts", "Eco-Friendly Gifts", "Gifts That Care. For People & Planet.", "Sustainable gift sets for a responsible tomorrow.", "/SBanners/SBanners/ECO.png", true, 6],
  ["client-gifts", "Client Gifts", "Strengthen client relationships", "Premium, branded gifts for valued clients.", null, false, 7],
  ["employee-appreciation-gifts", "Employee Appreciation Gifts", "Recognize great work", "Gifting for milestones and performance recognition.", null, false, 8],
  ["festive-corporate-gifts", "Festive Corporate Gifts", "Seasonal gifting, done right", "Festival and seasonal gifting programs delivered on time.", null, true, 9],
  ["gift-sets-hampers", "Gift Sets & Hampers", "Curated, ready to gift", "Multi-product hampers curated for every occasion.", null, false, 10],
];

const productMeta = {
  1: ["Executive Onboarding Essentials Set", "office-stationery", ["corporate-gifts", "joining-gifts", "employee-welcome-kits"], 1199, 25],
  2: ["Classic Pen & Keychain Welcome Set", "pens-desk-accessories", ["corporate-gifts", "joining-gifts"], 999, 50],
  3: ["Client Appreciation Desk Set", "premium-gift-sets", ["corporate-gifts", "client-gifts", "premium-gifts"], 1499, 25],
  4: ["Refined Folio & Pen Gift Set", "luxury-gift-sets", ["corporate-gifts", "luxury-gifts", "client-gifts"], 1799, 20],
  5: ["Journal & Matching Pen Set", "office-stationery", ["corporate-gifts", "employee-appreciation-gifts"], 1099, 30],
  6: ["Luxury Clutch Executive Set", "luxury-gift-sets", ["luxury-gifts", "client-gifts"], 2499, 15],
  7: ["Green Gold Corporate Stationery Set", "premium-gift-sets", ["premium-gifts", "corporate-gifts"], 1299, 25],
  8: ["Black Gold Premium Notebook Set", "premium-gift-sets", ["premium-gifts", "client-gifts"], 1399, 25],
  9: ["Corporate Gift Set with Notebook", "premium-gift-sets", ["premium-gifts", "gift-sets-hampers"], 1599, 20],
  10: ["Compact Corporate Welcome Kit", "office-stationery", ["joining-gifts", "employee-welcome-kits"], 1199, 30],
  11: ["Complete Stationery Gift Set", "premium-gift-sets", ["corporate-gifts", "premium-gifts", "joining-gifts"], 1699, 20],
  12: ["Luxury Planner Gift Box", "luxury-gift-sets", ["luxury-gifts", "client-gifts"], 2999, 10],
  13: ["Notebook & Pen Executive Set", "office-stationery", ["corporate-gifts", "premium-gifts"], 1399, 25],
  14: ["Blue Notebook Welcome Set", "office-stationery", ["joining-gifts", "employee-welcome-kits"], 1299, 25],
  15: ["Burgundy Relationship Gift Set", "luxury-gift-sets", ["luxury-gifts", "client-gifts", "festive-corporate-gifts"], 2699, 10],
  16: ["Wood Finish Premium Gift Set", "eco-gift-sets", ["eco-gifts", "premium-gifts", "client-gifts"], 2199, 15],
  17: ["Minimal Notebook & Pen Set", "office-stationery", ["corporate-gifts", "employee-appreciation-gifts"], 999, 40],
  18: ["Sage Green Sustainable Gift Set", "eco-gift-sets", ["eco-gifts", "joining-gifts"], 1899, 20],
  19: ["Green Eco Notebook Gift Set", "eco-gift-sets", ["eco-gifts", "employee-appreciation-gifts"], 1499, 25],
  20: ["Brown Luxury Stationery Set", "luxury-gift-sets", ["luxury-gifts", "client-gifts"], 2799, 10],
  21: ["Black Executive Corporate Set", "luxury-gift-sets", ["luxury-gifts", "corporate-gifts", "client-gifts"], 2899, 10],
  22: ["Grey Folio & Notebook Set", "premium-gift-sets", ["premium-gifts", "corporate-gifts"], 1799, 20],
  23: ["White Premium Corporate Gift Set", "premium-gift-sets", ["premium-gifts", "festive-corporate-gifts"], 1999, 20],
  24: ["Grey Planner Corporate Set", "office-stationery", ["corporate-gifts", "employee-appreciation-gifts"], 1299, 30],
};

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function publicUrl(setName, fileName) {
  return `/Gifta Guru/${setName}/${fileName}`;
}

async function one(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0];
}

async function upsertTaxonomy() {
  console.log("Seeding categories and collections...");
  for (const [slug, name, description, sortOrder] of categories) {
    await one(
      `insert into public.categories (slug, name, description, sort_order)
       values ($1, $2, $3, $4)
       on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order`,
      [slug, name, description, sortOrder],
    );
  }

  for (const [slug, name, tagline, description, imageUrl, isFeatured, sortOrder] of collections) {
    await one(
      `insert into public.collections (slug, name, tagline, description, image_url, is_featured, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (slug) do update set name = excluded.name, tagline = excluded.tagline,
       description = excluded.description, image_url = excluded.image_url, is_featured = excluded.is_featured,
       sort_order = excluded.sort_order`,
      [slug, name, tagline, description, imageUrl, isFeatured, sortOrder],
    );
  }
}

async function seedProducts() {
  const setDirs = (await readdir(productRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^Set \d+$/.test(entry.name))
    .sort((a, b) => Number(a.name.replace("Set ", "")) - Number(b.name.replace("Set ", "")));

  for (const dir of setDirs) {
    const setNumber = Number(dir.name.replace("Set ", ""));
    const meta = productMeta[setNumber];
    if (!meta) continue;

    const [name, categorySlug, collectionSlugs, price] = meta;
    const minOrderQuantity = 5;
    console.log(`Seeding ${dir.name}: ${name}`);

    const category = await one("select id from public.categories where slug = $1", [categorySlug]);
    const slug = slugify(name);
    const description = `${name} curated for premium corporate gifting, custom branding, employee programs, and bulk business orders.`;
    const featured = setNumber <= 12 || [15, 18, 20, 21, 23].includes(setNumber);

    const product = await one(
      `insert into public.products
       (slug, name, description, category_id, base_price, compare_at_price, is_customizable,
        min_order_quantity, occasion_tags, status, is_featured, avg_rating, review_count)
       values ($1, $2, $3, $4, $5, $6, true, $7, $8, 'active', $9, 4.8, $10)
       on conflict (slug) do update set name = excluded.name, description = excluded.description,
       category_id = excluded.category_id, base_price = excluded.base_price,
       compare_at_price = excluded.compare_at_price, min_order_quantity = excluded.min_order_quantity,
       occasion_tags = excluded.occasion_tags, status = excluded.status, is_featured = excluded.is_featured
       returning id`,
      [slug, name, description, category.id, price, Math.round(price * 1.18), minOrderQuantity, collectionSlugs, featured, 18 + setNumber],
    );

    const variant = await one(
      `insert into public.product_variants (product_id, name, sku, is_default)
       values ($1, 'Standard', $2, true)
       on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, is_default = excluded.is_default
       returning id`,
      [product.id, `GG-SET-${String(setNumber).padStart(2, "0")}-STD`],
    );

    await one(
      `insert into public.inventory (variant_id, quantity_available, quantity_reserved)
       values ($1, 500, 0)
       on conflict (variant_id) do update set quantity_available = excluded.quantity_available, quantity_reserved = 0`,
      [variant.id],
    );

    await pool.query("delete from public.product_customizations where product_id = $1", [product.id]);
    for (const [type, label, required, extraPrice] of [
      ["logo_upload", "Company logo upload", false, 0],
      ["personalization_text", "Personalization text", false, 0],
      ["gift_message", "Gift message card", false, 0],
      ["gift_wrap", "Premium gift wrap", false, 99],
    ]) {
      await one(
        `insert into public.product_customizations
         (product_id, customization_type, label, is_required, extra_price)
         values ($1, $2, $3, $4, $5)`,
        [product.id, type, label, required, extraPrice],
      );
    }

    await pool.query("delete from public.product_collection_mappings where product_id = $1", [product.id]);
    for (const collectionSlug of collectionSlugs) {
      const collection = await one("select id from public.collections where slug = $1", [collectionSlug]);
      if (collection) {
        await one(
          `insert into public.product_collection_mappings (product_id, collection_id)
           values ($1, $2) on conflict do nothing`,
          [product.id, collection.id],
        );
      }
    }

    await pool.query("delete from public.product_images where product_id = $1", [product.id]);
    const files = (await readdir(path.join(productRoot, dir.name), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
      .sort((a, b) => {
        const aGift = a.name.toLowerCase().includes("gift_set") || a.name.toLowerCase().includes("corporate_gift_set");
        const bGift = b.name.toLowerCase().includes("gift_set") || b.name.toLowerCase().includes("corporate_gift_set");
        return Number(bGift) - Number(aGift) || a.name.localeCompare(b.name);
      });

    for (const [index, file] of files.entries()) {
      await one(
        `insert into public.product_images (product_id, variant_id, url, alt_text, sort_order)
         values ($1, $2, $3, $4, $5)`,
        [product.id, variant.id, publicUrl(dir.name, file.name), `${name} image ${index + 1}`, index],
      );
    }
  }
}

try {
  await upsertTaxonomy();
  await seedProducts();
  const counts = await one(
    `select
      (select count(*)::int from public.products) as products,
      (select count(*)::int from public.product_images) as images`,
  );
  console.log(`Seeded ${counts.products} products with ${counts.images} product images.`);
} finally {
  await pool.end();
}
