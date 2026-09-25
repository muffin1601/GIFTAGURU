import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before auditing product content.");

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
try {
  const result = await pool.query(`
    select id, slug, name,
      jsonb_array_length(key_features) as features,
      jsonb_array_length(specifications) as specifications,
      jsonb_array_length(package_includes) as includes
    from public.products
    where status = 'active'
    order by slug
  `);
  console.table(result.rows);
} finally {
  await pool.end();
}
