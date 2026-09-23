import "dotenv/config";

import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before auditing admin data.");

const supabaseUrl = process.env.SUPABASE_URL;
const allowedRemoteHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
const pool = new Pool({ connectionString, connectionTimeoutMillis: 10_000 });

try {
  const [productsWithoutVariants, productsWithoutDefaultVariant, productImages, invalidMoq, invalidPrices, moqConstraints] = await Promise.all([
    pool.query(`select p.id, p.name from public.products p where not exists (select 1 from public.product_variants v where v.product_id = p.id)`),
    pool.query(`select p.id, p.name from public.products p where exists (select 1 from public.product_variants v where v.product_id = p.id) and not exists (select 1 from public.product_variants v where v.product_id = p.id and v.is_default)`),
    pool.query(`select i.id, p.id as product_id, p.name, i.url from public.product_images i join public.products p on p.id = i.product_id`),
    pool.query(`select id, name, min_order_quantity from public.products where min_order_quantity < 1`),
    pool.query(`select id, name, base_price, compare_at_price from public.products where base_price < 0 or (compare_at_price is not null and compare_at_price <= base_price)`),
    pool.query(`select conname, pg_get_constraintdef(oid) as definition from pg_constraint where conrelid = 'public.products'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%min_order_quantity%'`),
  ]);

  console.log(JSON.stringify({
    allowedRemoteHost,
    productsWithoutVariants: productsWithoutVariants.rows,
    productsWithoutDefaultVariant: productsWithoutDefaultVariant.rows,
    invalidImageUrls: productImages.rows.filter((image) => {
      if (image.url.startsWith("/")) return false;
      return !allowedRemoteHost || !image.url.startsWith(`https://${allowedRemoteHost}/storage/v1/object/public/`);
    }),
    invalidMoq: invalidMoq.rows,
    invalidPrices: invalidPrices.rows,
    moqConstraints: moqConstraints.rows,
  }, null, 2));
} finally {
  await pool.end();
}
