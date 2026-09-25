import "dotenv/config";
import { Pool } from "pg";
import { contentRecord, hamperContent } from "./product-content-data.mjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before backfilling product content.");

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
try {
  for (const [slug, source] of Object.entries(hamperContent)) {
    const matches = await pool.query("select id, slug, name from public.products where slug = $1", [slug]);
    if (matches.rowCount !== 1) throw new Error(`Expected exactly one product for ${slug}; found ${matches.rowCount}. No updates were made for this slug.`);
    const content = contentRecord(source);
    await pool.query(
      `update public.products set name = $2, description = $3, long_description = $4,
       key_features = $5::jsonb, specifications = $6::jsonb, package_includes = $7::jsonb,
       content_source = 'User-provided Diwali hamper references', last_verified_at = now(), updated_at = now()
       where id = $1`,
      [matches.rows[0].id, content.name, content.description, content.longDescription, JSON.stringify(content.keyFeatures), JSON.stringify(content.specifications), JSON.stringify(content.packageIncludes)],
    );
    console.log(`Updated ${slug} (${matches.rows[0].id}) as ${content.name}.`);
  }
} finally {
  await pool.end();
}
