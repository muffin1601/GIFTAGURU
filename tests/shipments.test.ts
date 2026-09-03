import test from "node:test";
import assert from "node:assert/strict";
import { groupIntoShipments, totalShipping, type AddressSnapshot } from "../lib/checkout/shipments.ts";

/**
 * Split-delivery grouping and per-destination shipping.
 *
 * The checkout preview and the Razorpay order route call this SAME function,
 * which is what stops the quoted total drifting from the charged total. These
 * tests pin the rule the comments claim: shipping is charged per destination,
 * and the free-shipping threshold is evaluated against each destination's own
 * subtotal -- never once across the whole order.
 */

const SETTINGS = { freeShippingThreshold: 50_000, shippingCharge: 500 };

function address(city: string): AddressSnapshot & { label: string | null } {
  return {
    label: city,
    name: `${city} recipient`,
    phone: "9999999999",
    line1: "1 Test Road",
    city,
    state: "Delhi",
    postalCode: "110020",
    country: "IN",
  };
}

const PRIMARY: AddressSnapshot = {
  name: "Primary",
  phone: "8888888888",
  line1: "HQ",
  city: "New Delhi",
  state: "Delhi",
  postalCode: "110020",
  country: "IN",
};

function build(lines: { addressId: string | null; lineTotal: number }[], saved: string[] = []) {
  return groupIntoShipments({
    lines: lines.map((line) => ({ ...line, item: line })),
    addresses: new Map(saved.map((id) => [id, address(id)])),
    primaryAddress: PRIMARY,
    primaryLabel: null,
    settings: SETTINGS,
  });
}

test("unassigned lines collapse into one primary-destination group", () => {
  const groups = build([
    { addressId: null, lineTotal: 5_000 },
    { addressId: null, lineTotal: 3_000 },
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0]!.subtotal, 8_000);
  assert.equal(groups[0]!.addressId, null);
  assert.equal(groups[0]!.address.city, "New Delhi");
});

test("charges shipping once per distinct destination", () => {
  const groups = build(
    [
      { addressId: "mumbai", lineTotal: 5_000 },
      { addressId: "chennai", lineTotal: 5_000 },
      { addressId: null, lineTotal: 5_000 },
    ],
    ["mumbai", "chennai"],
  );

  assert.equal(groups.length, 3);
  // Three deliveries to pay for, not one.
  assert.equal(totalShipping(groups), 1_500);
});

test("free-shipping threshold is per destination, not per order", () => {
  // Two destinations at 30,000 each: the order totals 60,000, which is over
  // the 50,000 threshold -- but NEITHER destination qualifies on its own, so
  // both must still be charged. Evaluating the threshold order-wide here would
  // hand over 1,000 of free shipping on every split order.
  const groups = build(
    [
      { addressId: "mumbai", lineTotal: 30_000 },
      { addressId: "chennai", lineTotal: 30_000 },
    ],
    ["mumbai", "chennai"],
  );

  assert.equal(totalShipping(groups), 1_000);
});

test("a destination over the threshold ships free while others still pay", () => {
  const groups = build(
    [
      { addressId: "mumbai", lineTotal: 60_000 },
      { addressId: "chennai", lineTotal: 1_000 },
    ],
    ["mumbai", "chennai"],
  );

  const mumbai = groups.find((g) => g.addressId === "mumbai")!;
  const chennai = groups.find((g) => g.addressId === "chennai")!;
  assert.equal(mumbai.shippingTotal, 0);
  assert.equal(chennai.shippingTotal, 500);
  assert.equal(totalShipping(groups), 500);
});

test("threshold applies exactly at the boundary", () => {
  assert.equal(totalShipping(build([{ addressId: null, lineTotal: 49_999 }])), 500);
  assert.equal(totalShipping(build([{ addressId: null, lineTotal: 50_000 }])), 0);
});

test("an address that no longer resolves falls back to the primary destination", () => {
  // Address deleted between adding to cart and paying: the order must still
  // complete, routed to the primary address, rather than failing or shipping
  // to nothing.
  const groups = build([{ addressId: "deleted-address", lineTotal: 5_000 }], []);

  assert.equal(groups.length, 1);
  assert.equal(groups[0]!.addressId, null);
  assert.equal(groups[0]!.address.city, "New Delhi");
});

test("lines sharing a destination merge into one group and one shipping charge", () => {
  const groups = build(
    [
      { addressId: "mumbai", lineTotal: 2_000 },
      { addressId: "mumbai", lineTotal: 3_000 },
    ],
    ["mumbai"],
  );

  assert.equal(groups.length, 1);
  assert.equal(groups[0]!.subtotal, 5_000);
  assert.equal(groups[0]!.items.length, 2);
  assert.equal(totalShipping(groups), 500);
});

test("an empty cart produces no groups and no shipping", () => {
  const groups = build([]);
  assert.equal(groups.length, 0);
  assert.equal(totalShipping(groups), 0);
});
