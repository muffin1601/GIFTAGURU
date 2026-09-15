import type { Prisma } from "@prisma/client";

export const PRODUCT_CODE_PREFIX_PATTERN = /^[A-Z0-9]{2,6}$/;

export function normalizeProductCodePrefix(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidProductCodePrefix(value: string): boolean {
  return PRODUCT_CODE_PREFIX_PATTERN.test(normalizeProductCodePrefix(value));
}

/** A readable default for categories created before an admin chooses a prefix. */
export function suggestProductCodePrefix(name: string): string {
  const lettersAndNumbers = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (lettersAndNumbers.slice(0, 3) || "CAT").padEnd(2, "X");
}

export function formatCategoryProductCode(prefix: string, number: number): string {
  return `${normalizeProductCodePrefix(prefix)}-${String(number).padStart(4, "0")}`;
}

/**
 * Allocates one number atomically in PostgreSQL. INSERT … ON CONFLICT takes a
 * row lock for a prefix, so simultaneous product creates cannot receive the
 * same number. It must be called through the transaction that creates product.
 */
export async function allocateCategoryProductCode(
  tx: Prisma.TransactionClient,
  prefix: string,
): Promise<string> {
  const normalized = normalizeProductCodePrefix(prefix);
  if (!isValidProductCodePrefix(normalized)) throw new Error("Category product-code prefix is invalid.");
  const rows = await tx.$queryRaw<Array<{ number: number }>>`
    insert into public.product_code_sequences (prefix, next_number)
    values (${normalized}, 2)
    on conflict (prefix)
    do update set next_number = public.product_code_sequences.next_number + 1,
                  updated_at = now()
    returning next_number - 1 as number
  `;
  return formatCategoryProductCode(normalized, rows[0]!.number);
}
