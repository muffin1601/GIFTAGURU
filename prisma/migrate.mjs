import "dotenv/config";

import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";

/**
 * Applies every pending file in supabase/migrations in filename order and
 * records it in public.schema_migrations, so a migration can never be applied
 * twice and drift is visible instead of surfacing as a runtime crash.
 *
 *   node prisma/migrate.mjs             apply pending migrations
 *   node prisma/migrate.mjs --status    list applied/pending, change nothing
 *   node prisma/migrate.mjs --baseline  record all as applied without running
 *
 * --baseline is for a database that already has the schema (as this project's
 * did before the runner existed). Use it once, then plain `migrate` thereafter.
 */

const MIGRATIONS_DIR = "supabase/migrations";
const mode = process.argv[2] ?? "--apply";

if (!["--apply", "--status", "--baseline"].includes(mode)) {
  throw new Error(`Unknown option "${mode}". Use --apply, --status or --baseline.`);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required.");
}

const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

// Editors on Windows readily save a UTF-8 BOM, which Postgres rejects as a
// syntax error on the first statement.
const readSql = async (name) =>
  (await readFile(path.join(MIGRATIONS_DIR, name), "utf8")).replace(/^﻿/, "");
const pool = new Pool({ connectionString });

try {
  await pool.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const { rows } = await pool.query("select name, checksum from public.schema_migrations");
  const applied = new Map(rows.map((r) => [r.name, r.checksum]));

  const pending = [];
  for (const name of files) {
    const sql = await readSql(name);
    const checksum = createHash("sha256").update(sql).digest("hex");
    const previous = applied.get(name);

    if (previous === undefined) {
      pending.push({ name, sql, checksum });
    } else if (previous !== checksum) {
      // The file changed after being applied. Editing an applied migration
      // means the database and the repo no longer agree; add a new file instead.
      console.warn(`WARN  ${name} was modified after it was applied.`);
    }
  }

  if (mode === "--status") {
    for (const name of files) {
      console.log(`${applied.has(name) ? "applied" : "PENDING"}  ${name}`);
    }
    console.log(`\n${applied.size} applied, ${pending.length} pending.`);
  } else if (mode === "--baseline") {
    for (const { name, checksum } of pending) {
      await pool.query(
        "insert into public.schema_migrations (name, checksum) values ($1, $2) on conflict (name) do nothing",
        [name, checksum],
      );
      console.log(`baselined  ${name}`);
    }
    console.log(`\nRecorded ${pending.length} migration(s) as applied without running them.`);
  } else {
    if (pending.length === 0) {
      console.log("No pending migrations.");
    }
    for (const { name, sql, checksum } of pending) {
      const client = await pool.connect();
      try {
        // Each migration is one transaction, so a failure part-way leaves no
        // half-applied schema behind.
        await client.query("begin");
        await client.query(sql);
        await client.query(
          "insert into public.schema_migrations (name, checksum) values ($1, $2)",
          [name, checksum],
        );
        await client.query("commit");
        console.log(`applied  ${name}`);
      } catch (error) {
        await client.query("rollback");
        console.error(`FAILED   ${name}: ${error.message}`);
        process.exitCode = 1;
        break;
      } finally {
        client.release();
      }
    }
  }
} finally {
  await pool.end();
}
