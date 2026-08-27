import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const count = await prisma.product.count();
  console.log(`prisma_count_ok ${count}`);
} catch (error) {
  console.log("prisma_count_failed", error.code ?? "", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
}
