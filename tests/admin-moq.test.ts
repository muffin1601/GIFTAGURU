import assert from "node:assert/strict";
import test from "node:test";
import { productFormSchema } from "../lib/validations/admin.ts";
import { cartItemInputSchema } from "../lib/validations/checkout.ts";

const product = {
  slug: "single-unit-gift",
  name: "Single Unit Gift",
  description: "",
  categoryId: "",
  basePrice: 100,
  compareAtPrice: 0,
  isCustomizable: false,
  occasionTags: [],
  status: "draft",
  isFeatured: false,
  collectionIds: [],
};

test("admin product validation permits MOQ 1 and rejects zero", () => {
  assert.equal(productFormSchema.safeParse({ ...product, minOrderQuantity: 1 }).success, true);
  assert.equal(productFormSchema.safeParse({ ...product, minOrderQuantity: 0 }).success, false);
});

test("checkout validation permits a single-unit item and rejects zero quantity", () => {
  const variantId = "7f4af9f3-7c66-4b77-9f60-9256782a01b4";
  assert.equal(cartItemInputSchema.safeParse({ variantId, quantity: 1 }).success, true);
  assert.equal(cartItemInputSchema.safeParse({ variantId, quantity: 0 }).success, false);
});
