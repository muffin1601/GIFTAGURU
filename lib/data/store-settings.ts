import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import {
  FREE_SHIPPING_THRESHOLD as DEFAULT_FREE_SHIPPING_THRESHOLD,
  GIFT_WRAP_PRICE as DEFAULT_GIFT_WRAP_PRICE,
  MIN_ORDER_QUANTITY as DEFAULT_MIN_ORDER_QUANTITY,
  SHIPPING_CHARGE as DEFAULT_SHIPPING_CHARGE,
} from "@/lib/config/store";

export interface StoreSettings {
  minOrderQuantity: number;
  minOrderQuantityMessage: string;
  giftWrapPrice: number;
  freeShippingThreshold: number;
  shippingCharge: number;
  shippingMessage: string;
  shippingTimeline: string;
  /** Whole-number percentage, e.g. 18 for 18% GST -- not a 0-1 fraction. */
  gstRatePercent: number;
}

const DEFAULT_GST_RATE_PERCENT = 18;

const DEFAULTS: StoreSettings = {
  minOrderQuantity: DEFAULT_MIN_ORDER_QUANTITY,
  minOrderQuantityMessage: `You must select at least ${DEFAULT_MIN_ORDER_QUANTITY} products.`,
  giftWrapPrice: DEFAULT_GIFT_WRAP_PRICE,
  freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
  shippingCharge: DEFAULT_SHIPPING_CHARGE,
  shippingMessage: "Delivery available across India",
  shippingTimeline: "Ships within 10-15 days",
  gstRatePercent: DEFAULT_GST_RATE_PERCENT,
};

/**
 * The single source of truth for admin-configurable, price-affecting store
 * settings (gift wrap, minimum quantity, shipping). /admin/settings writes
 * to public.store_settings; every place that charges or displays these
 * values -- product page, cart, checkout, the Razorpay order route -- reads
 * through here, so a change in admin takes effect everywhere at once instead
 * of silently doing nothing.
 *
 * `cache()` memoizes this per request/render pass, so pages that read it more
 * than once don't issue duplicate queries.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!isDatabaseConfigured()) return DEFAULTS;

  try {
    const rows = await prisma.storeSetting.findMany({
      where: { key: { in: ["minimum_quantity", "gift_wrap_price", "free_shipping_threshold", "shipping_charge", "shipping_message", "shipping_timeline", "gst_rate_percent"] } },
    });
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    const minOrderQuantity = toPositiveInt(values.minimum_quantity, DEFAULTS.minOrderQuantity);
    const giftWrapPrice = toNonNegativeNumber(values.gift_wrap_price, DEFAULTS.giftWrapPrice);
    const freeShippingThreshold = toNonNegativeNumber(values.free_shipping_threshold, DEFAULTS.freeShippingThreshold);
    const shippingCharge = toNonNegativeNumber(values.shipping_charge, DEFAULTS.shippingCharge);
    const gstRatePercent = toNonNegativeNumber(values.gst_rate_percent, DEFAULTS.gstRatePercent);

    return {
      minOrderQuantity,
      minOrderQuantityMessage: `You must select at least ${minOrderQuantity} product${minOrderQuantity === 1 ? "" : "s"}.`,
      giftWrapPrice,
      freeShippingThreshold,
      shippingCharge,
      shippingMessage: toText(values.shipping_message, DEFAULTS.shippingMessage),
      shippingTimeline: toText(values.shipping_timeline, DEFAULTS.shippingTimeline),
      gstRatePercent,
    };
  } catch {
    // Unreachable database: fall back to defaults rather than break checkout.
    return DEFAULTS;
  }
});

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

function toNonNegativeNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function toText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
