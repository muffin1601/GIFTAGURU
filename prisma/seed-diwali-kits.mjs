import "dotenv/config";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before seeding Diwali kits.");

const kits = [
  ["White Festive Flask & Tumbler Hamper", "premium-gift-sets", 1899],
  ["Tan Executive Diary & Flask Gift Set", "premium-gift-sets", 2499],
  ["White Notebook & Flask Gift Set", "premium-gift-sets", 1999],
  ["Copper Festive Bottle & Diya Hamper", "premium-gift-sets", 1699],
  ["Copper Celebration Hamper", "premium-gift-sets", 1999],
  ["Black Festive Flask & Cookie Hamper", "premium-gift-sets", 1799],
  ["Black Celebration Flask & Mug Hamper", "premium-gift-sets", 2199],
  ["Executive Black Mug & Diary Gift Box", "luxury-gift-sets", 2399],
  ["Premium Diya & Glass Gift Box", "luxury-gift-sets", 1499],
];

const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });

try {
  for (const [index, [name, categorySlug, price]] of kits.entries()) {
    const folder = `Set ${index + 1}`;
    const slug = slugify(name);
    const category = await pool.query("select id from public.categories where slug = $1", [categorySlug]);
    if (!category.rows[0]) throw new Error(`Missing category: ${categorySlug}`);
    const product = await pool.query(
      `insert into public.products (slug, name, description, category_id, base_price, compare_at_price, is_customizable, min_order_quantity, occasion_tags, status, is_featured, avg_rating, review_count)
       values ($1, $2, $3, $4, $5, $6, true, 5, $7, 'active', true, 0, 0)
       on conflict (slug) do update set name = excluded.name, description = excluded.description, category_id = excluded.category_id, base_price = excluded.base_price, compare_at_price = excluded.compare_at_price, status = excluded.status, is_featured = excluded.is_featured
       returning id`,
      [slug, name, `${name} for corporate Diwali gifts, employee gifting and client festive campaigns.`, category.rows[0].id, price, Math.round(price * 1.18), ["corporate-gifts", "festive-corporate-gifts", "gift-sets-hampers"]],
    );
    const variant = await pool.query(
      `insert into public.product_variants (product_id, name, sku, is_default) values ($1, 'Standard', $2, true)
       on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, is_default = excluded.is_default returning id`,
      [product.rows[0].id, `GG-DIWALI-${String(index + 1).padStart(2, "0")}-STD`],
    );
    await pool.query(`insert into public.inventory (variant_id, quantity_available, quantity_reserved) values ($1, 500, 0) on conflict (variant_id) do update set quantity_available = excluded.quantity_available, quantity_reserved = 0`, [variant.rows[0].id]);
    await pool.query("delete from public.product_images where product_id = $1", [product.rows[0].id]);
    const files = (await readdir(path.join(process.cwd(), "public", "Diwali kits", folder), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /\.webp$/i.test(entry.name))
      .sort((a, b) => Number(/primary/i.test(b.name)) - Number(/primary/i.test(a.name)) || a.name.localeCompare(b.name));
    for (const [sortOrder, file] of files.entries()) await pool.query(
      `insert into public.product_images (product_id, variant_id, url, alt_text, sort_order) values ($1, $2, $3, $4, $5)`,
      [product.rows[0].id, variant.rows[0].id, `/Diwali kits/${folder}/${file.name}`, `${name} image ${sortOrder + 1}`, sortOrder],
    );
    console.log(`Seeded ${name} with ${files[0]?.name} as primary image.`);
  }
} finally {
  await pool.end();
}
