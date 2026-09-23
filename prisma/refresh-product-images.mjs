import "dotenv/config";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before refreshing product images.");

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
const imageExtensions = /\.(png|jpe?g|webp)$/i;
const primaryImage = /^1 \(1\)\./i;

async function refreshGallery({ sku, directory, publicDirectory }) {
  const variant = await pool.query(
    `select pv.id as variant_id, p.id as product_id, p.name from public.product_variants pv join public.products p on p.id = pv.product_id where pv.sku = $1`,
    [sku],
  );
  if (!variant.rows[0]) throw new Error(`Missing product variant: ${sku}`);
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && imageExtensions.test(entry.name))
    .sort((a, b) => Number(primaryImage.test(b.name)) - Number(primaryImage.test(a.name)) || a.name.localeCompare(b.name));
  if (!files[0] || !primaryImage.test(files[0].name)) throw new Error(`${directory} is missing a 1 (1) primary image.`);

  await pool.query("delete from public.product_images where product_id = $1", [variant.rows[0].product_id]);
  for (const [sortOrder, file] of files.entries()) {
    await pool.query(
      `insert into public.product_images (product_id, variant_id, url, alt_text, sort_order) values ($1, $2, $3, $4, $5)`,
      [variant.rows[0].product_id, variant.rows[0].variant_id, `${publicDirectory}/${file.name}`, `${variant.rows[0].name} image ${sortOrder + 1}`, sortOrder],
    );
  }
  console.log(`${sku}: ${files.length} images; ${files[0].name} is primary.`);
}

try {
  for (let number = 1; number <= 24; number += 1) {
    const padded = String(number).padStart(2, "0");
    await refreshGallery({
      sku: `GG-SET-${padded}-STD`,
      directory: path.join(process.cwd(), "public", "Gifta Guru", `Set ${number}`),
      publicDirectory: `/Gifta Guru/Set ${number}`,
    });
  }
  for (let number = 1; number <= 3; number += 1) {
    await refreshGallery({
      sku: `GG-HAMP-${String(number).padStart(2, "0")}-STD`,
      directory: path.join(process.cwd(), "public", "Hampers", `set ${number}`),
      publicDirectory: `/Hampers/set ${number}`,
    });
  }
} finally {
  await pool.end();
}
