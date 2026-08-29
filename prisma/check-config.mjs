import "dotenv/config";

import { readdir } from "node:fs/promises";
import { Pool } from "pg";

/**
 * Pre-deploy checklist: reports which integrations are wired and whether an
 * admin account exists. Exits non-zero if anything required is missing.
 *
 *   node prisma/check-config.mjs
 */

const checks = [];

function check(name, ok, hint, required = true) {
  checks.push({ name, ok, hint, required });
}

const placeholder = (value) => !value || value.includes("USER:PASSWORD@HOST");

check("SUPABASE_URL", Boolean(process.env.SUPABASE_URL), "Project Settings -> API");
check("SUPABASE_ANON_KEY", Boolean(process.env.SUPABASE_ANON_KEY), "Project Settings -> API");
check("SUPABASE_SERVICE_ROLE_KEY", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), "Server-only key; enables logo uploads");
check("DATABASE_URL", !placeholder(process.env.DATABASE_URL), "Pooled Postgres URL");
check("DIRECT_URL", !placeholder(process.env.DIRECT_URL), "Direct Postgres URL for migrations");
check("RAZORPAY_KEY_ID", Boolean(process.env.RAZORPAY_KEY_ID), "Checkout is disabled without it");
check("RAZORPAY_KEY_SECRET", Boolean(process.env.RAZORPAY_KEY_SECRET), "Checkout is disabled without it");
check("RAZORPAY_WEBHOOK_SECRET", Boolean(process.env.RAZORPAY_WEBHOOK_SECRET), "Needed to verify /api/razorpay/webhook");
check("RESEND_API_KEY", Boolean(process.env.RESEND_API_KEY), "All email is recorded as skipped without it");
check("EMAIL_FROM", Boolean(process.env.EMAIL_FROM), "Must use a domain verified in Resend");
check("ADMIN_EMAIL", Boolean(process.env.ADMIN_EMAIL), "Recipient for order/lead/enquiry notifications");
check("SITE_URL", Boolean(process.env.SITE_URL), "Absolute links in email, metadata and sitemap", false);

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (connectionString && !placeholder(connectionString)) {
  const pool = new Pool({ connectionString });
  try {
    const { rows } = await pool.query(
      "select count(*)::int as count from public.profiles where role in ('admin','super_admin')",
    );
    check(
      "Admin account",
      rows[0].count > 0,
      "Run: node prisma/create-admin.mjs <email> <password>",
    );

    const files = (await readdir("supabase/migrations")).filter((f) => f.endsWith(".sql"));
    const tracked = await pool
      .query("select name from public.schema_migrations")
      .then((r) => new Set(r.rows.map((x) => x.name)))
      .catch(() => null);

    if (!tracked) {
      check("Migrations", false, "Run: npm run db:migrate:baseline (no tracking table yet)");
    } else {
      const pending = files.filter((f) => !tracked.has(f));
      check(
        "Migrations",
        pending.length === 0,
        `${pending.length} pending: ${pending.join(", ")} -- run npm run db:migrate`,
      );
    }
  } catch (error) {
    check("Database reachable", false, error.message);
  } finally {
    await pool.end();
  }
} else {
  check("Database reachable", false, "No usable DIRECT_URL/DATABASE_URL");
}

let failed = false;
for (const { name, ok, hint, required } of checks) {
  if (!ok && required) failed = true;
  const mark = ok ? "OK  " : required ? "FAIL" : "WARN";
  console.log(`${mark}  ${name}${ok ? "" : `  -- ${hint}`}`);
}

if (failed) {
  console.log("\nSome required configuration is missing.");
  process.exitCode = 1;
} else {
  console.log("\nAll required configuration is present.");
}
