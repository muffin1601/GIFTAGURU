"use client";

/** Browser-only wrapper around the one GA4 bootstrap in app/layout. */
export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, parameters: Record<string, unknown>) => void;
    dataLayer?: unknown[][];
  }
}

function send(eventName: string, parameters: Record<string, unknown>): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    } else {
      // Preserve the event until the existing afterInteractive GA bootstrap
      // defines gtag. This does not initialize another GA instance.
      (window.dataLayer ??= []).push(["event", eventName, parameters]);
    }
    return true;
  } catch {
    // Analytics must never interrupt commerce when a tag is blocked or delayed.
    return false;
  }
}

export function trackViewItem(item: Ga4Item) {
  return send("view_item", { currency: "INR", value: item.price, items: [{ ...item, quantity: 1 }] });
}

export function trackAddToCart(item: Ga4Item) {
  return send("add_to_cart", { currency: "INR", value: item.price * item.quantity, items: [item] });
}

export function trackBeginCheckout(input: { value: number; items: Ga4Item[]; coupon?: string }) {
  return send("begin_checkout", {
    currency: "INR", value: input.value, ...(input.coupon ? { coupon: input.coupon } : {}), items: input.items,
  });
}

const PURCHASE_STORAGE_PREFIX = "giftaguru:ga4-purchase:";

export function trackPurchase(input: { transactionId: string; value: number; tax: number; shipping: number; items: Ga4Item[]; coupon?: string }) {
  if (typeof window === "undefined") return false;
  const storageKey = `${PURCHASE_STORAGE_PREFIX}${input.transactionId}`;
  try { if (window.sessionStorage.getItem(storageKey)) return false; } catch {}
  const sent = send("purchase", {
    transaction_id: input.transactionId, currency: "INR", value: input.value, tax: input.tax, shipping: input.shipping,
    ...(input.coupon ? { coupon: input.coupon } : {}), items: input.items,
  });
  if (sent) try { window.sessionStorage.setItem(storageKey, "1"); } catch {}
  return sent;
}
