import test from "node:test";
import assert from "node:assert/strict";
import { discountAmount } from "../lib/checkout/discounts.ts";

test("percentage coupons calculate and round to currency precision", () => {
  assert.equal(discountAmount("percentage", 15, 999), 149.85);
});

test("fixed coupons cannot discount below zero", () => {
  assert.equal(discountAmount("fixed", 500, 300), 300);
});

test("invalid negative values never increase the total", () => {
  assert.equal(discountAmount("fixed", -50, 300), 0);
});
