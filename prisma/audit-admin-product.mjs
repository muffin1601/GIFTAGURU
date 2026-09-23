import "dotenv/config";

import { Pool } from "pg";

const productId = process.argv[2];
if (!productId) throw new Error("Usage: node prisma/audit-admin-product.mjs <product-id>");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before auditing a product.");

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10_000 });

try {
  const result = await pool.query(
    `select
       p.id, p.slug, p.name, p.product_code, p.base_price, p.compare_at_price,
       p.min_order_quantity, p.status, p.category_id, c.name as category_name,
       coalesce((
         select json_agg(json_build_object('id', i.id, 'url', i.url, 'sort_order', i.sort_order) order by i.sort_order)
         from public.product_images i where i.product_id = p.id
       ), '[]'::json) as images,
       coalesce((
         select json_agg(json_build_object(
           'id', v.id, 'sku', v.sku, 'is_default', v.is_default,
           'price_override', v.price_override, 'inventory', inv.quantity_available
         ) order by v.created_at)
         from public.product_variants v
         left join public.inventory inv on inv.variant_id = v.id
         where v.product_id = p.id
       ), '[]'::json) as variants,
       coalesce((
         select json_agg(json_build_object('min_quantity', t.min_quantity, 'unit_price', t.unit_price) order by t.min_quantity)
         from public.product_price_tiers t where t.product_id = p.id
       ), '[]'::json) as price_tiers
     from public.products p
     left join public.categories c on c.id = p.category_id
     where p.id = $1`,
    [productId],
  );

  console.log(JSON.stringify(result.rows[0] ?? null, null, 2));
} finally {
  await pool.end();
}
