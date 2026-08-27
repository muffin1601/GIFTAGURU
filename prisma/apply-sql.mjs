import "dotenv/config";

import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const file = process.argv[2];

if (!file) {
  throw new Error("Usage: node prisma/apply-sql.mjs <sql-file>");
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required.");
}

const pool = new Pool({ connectionString });

try {
  const sql = await readFile(file, "utf8");
  await pool.query(sql);
  console.log(`Applied SQL: ${file}`);
} catch (error) {
  console.error("SQL apply failed:", error.code ?? "", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
