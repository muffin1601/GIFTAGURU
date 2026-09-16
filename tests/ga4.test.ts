import test from "node:test";
import assert from "node:assert/strict";
import { trackAddToCart, trackBeginCheckout, trackPurchase, trackViewItem } from "@/lib/analytics/ga4";

type Event = { name: string; payload: Record<string, unknown> };

function installGa4(events: Event[]) {
  const storage = new Map<string, string>();
  Object.assign(globalThis, {
    window: {
      gtag: (_command: string, name: string, payload: Record<string, unknown>) => events.push({ name, payload }),
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    },
  });
}

const item = {
  item_id: "GG-SET-01-STD",
  item_name: "Executive Onboarding Essentials Set",
  item_category: "Office & Stationery",
  item_variant: "Standard",
  price: 249,
  quantity: 5,
};

test("GA4 ecommerce helpers emit recommended INR payloads", () => {
  const events: Event[] = [];
  installGa4(events);

  assert.equal(trackViewItem(item), true);
  assert.equal(trackAddToCart(item), true);
  assert.equal(trackBeginCheckout({ value: 1245, items: [item] }), true);

  assert.deepEqual(events, [
    { name: "view_item", payload: { currency: "INR", value: 249, items: [{ ...item, quantity: 1 }] } },
    { name: "add_to_cart", payload: { currency: "INR", value: 1245, items: [item] } },
    { name: "begin_checkout", payload: { currency: "INR", value: 1245, items: [item] } },
  ]);
});

test("purchase uses the unique transaction id and suppresses confirmation-page refresh duplicates", () => {
  const events: Event[] = [];
  installGa4(events);
  const purchase = { transactionId: "GG-100123", value: 1500, tax: 225, shipping: 50, items: [item] };

  assert.equal(trackPurchase(purchase), true);
  assert.equal(trackPurchase(purchase), false);
  assert.deepEqual(events, [{
    name: "purchase",
    payload: { transaction_id: "GG-100123", currency: "INR", value: 1500, tax: 225, shipping: 50, items: [item] },
  }]);
});

test("tracking queues safely when GA4 is temporarily unavailable", () => {
  Object.assign(globalThis, { window: {} });
  assert.equal(trackAddToCart(item), true);
  assert.deepEqual(window.dataLayer, [["event", "add_to_cart", { currency: "INR", value: 1245, items: [item] }]]);
});
