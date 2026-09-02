import type { PriceTier } from "@/lib/pricing";

/**
 * Shared cart shapes.
 *
 * Deliberately separate from `lib/cart/service.ts`, which is `server-only`:
 * the client provider and its consumers need these types, and importing them
 * from the service would put a server-only module in a client component's
 * import graph.
 */

export interface CartViewItem {
  /** cart_items.id -- the line identity for update/remove. */
  lineId: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image?: string;
  /** Base unit price before quantity tiers. */
  price: number;
  priceTiers: PriceTier[];
  quantity: number;
  minQuantity: number;
  /** Server-resolved price actually charged at this quantity. */
  unitPrice: number;
  lineTotal: number;
  /** Sellable stock (available minus already reserved) at read time. */
  maxQuantity: number;
  /** True when the line exceeds what is currently sellable. */
  exceedsStock: boolean;
  /** Saved address this line ships to; null means the order's primary address. */
  addressId: string | null;
  personalizationText?: string;
  logoUrl?: string;
  logoFileName?: string;
  giftWrap?: boolean;
}

export interface CartView {
  items: CartViewItem[];
  count: number;
  merchandiseSubtotal: number;
  giftWrapTotal: number;
  subtotal: number;
}

export const EMPTY_CART: CartView = {
  items: [],
  count: 0,
  merchandiseSubtotal: 0,
  giftWrapTotal: 0,
  subtotal: 0,
};
