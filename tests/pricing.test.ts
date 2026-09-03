import test from "node:test";
import assert from "node:assert/strict";
import { resolveUnitPrice, sortTiers, type PriceTier } from "../lib/pricing.ts";

/**
 * Quantity-tier pricing.
 *
 * This is the single function that turns a quantity into a per-unit price, and
 * BOTH the storefront display and the authoritative server-side checkout total
 * call it. A regression here silently overcharges or undercharges every
 * customer, so the boundaries are pinned explicitly.
 */

const TIERS: PriceTier[] = [
  { minQuantity: 10, unitPrice: 1200 },
  { minQuantity: 50, unitPrice: 1100 },
  { minQuantity: 100, unitPrice: 950 },
];

test("falls back to base price when no tiers exist", () => {
  assert.equal(resolveUnitPrice(1299, [], 5), 1299);
  assert.equal(resolveUnitPrice(1299, undefined, 5), 1299);
});

test("falls back to base price below the lowest tier", () => {
  assert.equal(resolveUnitPrice(1299, TIERS, 9), 1299);
});

test("tier applies exactly at its minimum quantity", () => {
  // Off-by-one here is the classic pricing bug: 10 must already qualify.
  assert.equal(resolveUnitPrice(1299, TIERS, 10), 1200);
  assert.equal(resolveUnitPrice(1299, TIERS, 50), 1100);
  assert.equal(resolveUnitPrice(1299, TIERS, 100), 950);
});

test("picks the highest qualifying tier, not the first match", () => {
  assert.equal(resolveUnitPrice(1299, TIERS, 75), 1100);
  assert.equal(resolveUnitPrice(1299, TIERS, 5000), 950);
});

test("tier order in the array does not affect the result", () => {
  // Rows come back from Postgres in whatever order the query yields; the
  // function must not depend on them being sorted.
  const shuffled = [TIERS[2]!, TIERS[0]!, TIERS[1]!];
  assert.equal(resolveUnitPrice(1299, shuffled, 75), 1100);
  assert.equal(resolveUnitPrice(1299, shuffled, 10), 1200);
});

test("a single tier behaves like a simple threshold", () => {
  const one: PriceTier[] = [{ minQuantity: 25, unitPrice: 999 }];
  assert.equal(resolveUnitPrice(1299, one, 24), 1299);
  assert.equal(resolveUnitPrice(1299, one, 25), 999);
});

test("sortTiers orders ascending without mutating the input", () => {
  const input = [...TIERS].reverse();
  const snapshot = [...input];
  const sorted = sortTiers(input);
  assert.deepEqual(sorted.map((t) => t.minQuantity), [10, 50, 100]);
  assert.deepEqual(input, snapshot, "input array must not be mutated");
});
