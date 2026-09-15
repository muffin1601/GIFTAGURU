/**
 * Safe, repeatable backfill after migration 0016. Existing product_code values
 * are never replaced. Products missing a code receive one from their current
 * category prefix using the same row-locked counter as product creation.
 *
 * Run: node scripts/backfill-product-codes.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function suggestedPrefix(name) {
  const compact = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (compact.slice(0, 3) || "CAT").padEnd(2, "X");
}

async function allocate(tx, prefix) {
  const rows = await tx.$queryRaw`
    insert into public.product_code_sequences (prefix, next_number)
    values (${prefix}, 2)
    on conflict (prefix) do update
    set next_number = public.product_code_sequences.next_number + 1, updated_at = now()
    returning next_number - 1 as number
  `;
  return `${prefix}-${String(rows[0].number).padStart(4, "0")}`;
}

try {
  const categories = await prisma.category.findMany({ where: { codePrefix: null }, orderBy: { createdAt: "asc" } });
  for (const category of categories) {
    let prefix = suggestedPrefix(category.name);
    let suffix = 1;
    while (await prisma.category.findFirst({ where: { codePrefix: prefix, id: { not: category.id } }, select: { id: true } })) {
      prefix = `${suggestedPrefix(category.name).slice(0, 5)}${suffix++}`;
    }
    await prisma.category.update({ where: { id: category.id }, data: { codePrefix: prefix } });
  }

  const products = await prisma.product.findMany({
    where: { productCode: null },
    include: { category: true, variants: { where: { isDefault: true }, take: 1 } },
  });
  let created = 0;
  for (const product of products) {
    if (!product.category?.codePrefix) {
      console.warn(`Skipped ${product.id} (${product.name}): no category/prefix.`);
      continue;
    }
    await prisma.$transaction(async (tx) => {
      const productCode = await allocate(tx, product.category.codePrefix);
      await tx.product.update({ where: { id: product.id }, data: { productCode } });
      if (product.variants[0]) await tx.productVariant.update({ where: { id: product.variants[0].id }, data: { sku: productCode } });
    });
    created += 1;
  }
  console.log(`Product-code backfill complete. Created ${created} code(s); existing codes were preserved.`);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
