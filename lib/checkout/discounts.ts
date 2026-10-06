import "server-only";

import type { Discount } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class DiscountValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscountValidationError";
  }
}

export function discountAmount(
  type: "percentage" | "fixed",
  value: number,
  subtotal: number,
): number {
  const raw = type === "percentage" ? (subtotal * value) / 100 : value;
  return Math.min(subtotal, Math.max(0, Math.round(raw * 100) / 100));
}

/** Resolve a coupon against the customer and authoritative merchandise total. */
export async function validateDiscountCode(input: {
  code: string;
  subtotal: number;
  userId: string;
}): Promise<{ discount: Discount; amount: number }> {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new DiscountValidationError("Enter a coupon code.");

  const discount = await prisma.discount.findUnique({ where: { code } });
  const now = new Date();
  if (!discount || !discount.isActive) throw new DiscountValidationError("This coupon code is not valid.");
  if (discount.startsAt && discount.startsAt > now) throw new DiscountValidationError("This coupon is not active yet.");
  if (discount.expiresAt && discount.expiresAt <= now) throw new DiscountValidationError("This coupon has expired.");
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    throw new DiscountValidationError("This coupon has reached its usage limit.");
  }
  if (input.subtotal < Number(discount.minOrderValue)) {
    throw new DiscountValidationError(
      `This coupon requires a minimum merchandise total of ₹${Number(discount.minOrderValue).toLocaleString("en-IN")}.`,
    );
  }
  if (discount.perUserLimit !== null) {
    const usageCount = await prisma.discountUsage.count({ where: { discountId: discount.id, userId: input.userId } });
    if (usageCount >= discount.perUserLimit) {
      throw new DiscountValidationError("You have already used this coupon the maximum number of times.");
    }
  }

  return { discount, amount: discountAmount(discount.type, Number(discount.value), input.subtotal) };
}
