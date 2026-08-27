import "dotenv/config";

import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required.");
}

const pool = new Pool({ connectionString });

try {
  const result = await pool.query(`
    select p.id, p.full_name, p.role, u.email
    from public.profiles p
    left join auth.users u on u.id = p.id
    where p.role in ('admin', 'super_admin')
    order by p.role desc, p.created_at asc
  `);

  console.log(JSON.stringify(result.rows, null, 2));
} finally {
  await pool.end();
}
