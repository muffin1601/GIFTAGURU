import "dotenv/config";
import { Pool } from "pg";
import { productSeoContent } from "../lib/seo/content/products.ts";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before backfilling catalog content.");

function featurePair(text) {
  const colon = text.indexOf(":");
  if (colon > 0 && colon < 90) return { title: text.slice(0, colon).trim(), description: text.slice(colon + 1).trim() };
  const words = text.split(/\s+/);
  const title = words.slice(0, Math.min(5, words.length)).join(" ").replace(/[,.]$/, "");
  return { title, description: text };
}

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
try {
  for (const editorial of productSeoContent) {
    const slugs = [editorial.slug, ...(editorial.slugAliases ?? [])];
    const matches = await pool.query(
      `select id, slug, name from public.products where slug = any($1::text[]) or name = $2`,
      [slugs, editorial.h1],
    );
    if (matches.rowCount === 0) {
      console.log(`Skipped ${editorial.slug}: no matching product.`);
      continue;
    }
    if (matches.rowCount > 1) throw new Error(`Ambiguous product aliases for ${editorial.slug}; found ${matches.rowCount}.`);

    const product = matches.rows[0];
    const updated = await pool.query(
      `update public.products set
         long_description = $2,
         key_features = $3::jsonb,
         faqs = $4::jsonb,
         seo_description = $5,
         content_source = $6,
         last_verified_at = now(),
         updated_at = now()
       where id = $1
         and key_features = '[]'::jsonb
         and (content_source is null or content_source = '')
       returning id`,
      [
        product.id,
        editorial.detailedDescription.join("\n\n"),
        JSON.stringify(editorial.keyFeatures.map(featurePair)),
        JSON.stringify(editorial.faqs),
        editorial.metaDescription,
        "Gifta Guru SEO Content Pack (existing project source)",
      ],
    );
    console.log(`${updated.rowCount ? "Updated" : "Preserved"} ${product.slug} (${product.id}).`);
  }
} finally {
  await pool.end();
}
