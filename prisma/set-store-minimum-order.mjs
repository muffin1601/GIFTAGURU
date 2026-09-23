import "dotenv/config";

import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before updating the store MOQ.");

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
try {
  await pool.query("update public.store_settings set value = '1'::jsonb where key = 'minimum_quantity'");
  console.log("Set the store-wide minimum order quantity to 1. Product-specific MOQs remain unchanged.");
} finally {
  await pool.end();
}
