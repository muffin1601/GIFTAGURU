import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

/**
 * Provision (or promote) an admin user.
 *
 *   node prisma/create-admin.mjs <email> [password] [role]
 *
 * role defaults to "super_admin". If the auth user already exists the password
 * argument is ignored and the existing account is simply promoted.
 */

const [email, password, roleArg] = process.argv.slice(2);
const role = roleArg || "super_admin";

if (!email) {
  throw new Error("Usage: node prisma/create-admin.mjs <email> [password] [role]");
}
if (role !== "admin" && role !== "super_admin") {
  throw new Error(`Invalid role "${role}". Use "admin" or "super_admin".`);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findAuthUserByEmail(target) {
  const wanted = target.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === wanted);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

const pool = new Pool({ connectionString });

try {
  let user = await findAuthUserByEmail(email);

  if (user) {
    console.log(`Auth user already exists (${user.id}); promoting to ${role}.`);
  } else {
    if (!password) {
      throw new Error("No auth user found for that email; pass a password to create one.");
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created auth user ${user.id}.`);
  }

  // The on_auth_user_created trigger inserts the profile, but upsert so this
  // script also repairs accounts whose profile row is missing.
  await pool.query(
    `insert into public.profiles (id, role)
     values ($1, $2::public.user_role)
     on conflict (id) do update set role = excluded.role, updated_at = now()`,
    [user.id, role],
  );

  console.log(`${email} is now ${role}. Sign in at /login and open /admin.`);
} finally {
  await pool.end();
}
