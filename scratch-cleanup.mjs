import "dotenv/config";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const product = await pool.query("select id from public.products where slug = 'qa-test-product'");
if (product.rows[0]) {
  const images = await pool.query("select url from public.product_images where product_id = $1", [product.rows[0].id]);
  for (const row of images.rows) {
    const path = row.url.split("/product-images/")[1];
    if (path) await supabase.storage.from("product-images").remove([path]);
  }
  await pool.query("delete from public.products where id = $1", [product.rows[0].id]);
  console.log("removed QA Test Product + images");
}

await pool.query("delete from public.collections where slug = 'qa-test-collection'");
console.log("removed QA Test Collection");

await pool.query("delete from public.categories where slug = 'qa-test-category'");
console.log("removed QA Test Category");

await pool.end();
