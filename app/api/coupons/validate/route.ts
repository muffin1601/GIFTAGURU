import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { DiscountValidationError, validateDiscountCode } from "@/lib/checkout/discounts";
import { logger, errorMessage } from "@/lib/logger";
import { consume, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to apply a coupon." }, { status: 401 });
  const limit = consume(`coupon:${user.id}`, 10, 60_000);
  if (!limit.ok) return tooManyRequests("Too many coupon attempts. Please wait a moment.", limit.retryAfter);

  try {
    const body = (await request.json()) as { code?: unknown; subtotal?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    const subtotal = typeof body.subtotal === "number" ? body.subtotal : Number.NaN;
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "The cart total is invalid." }, { status: 400 });
    }
    const result = await validateDiscountCode({ code, subtotal, userId: user.id });
    return NextResponse.json({ code: result.discount.code, description: result.discount.description, amount: result.amount });
  } catch (error) {
    if (error instanceof DiscountValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error("coupon.validation_failed", { message: errorMessage(error) });
    return NextResponse.json({ error: "We couldn't validate that coupon right now." }, { status: 500 });
  }
}
