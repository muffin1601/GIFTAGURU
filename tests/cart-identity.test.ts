import test from "node:test";
import assert from "node:assert/strict";
import { customizationKey, normalizeCustomization } from "../lib/cart/customization.ts";

/**
 * Cart line identity.
 *
 * `customizationKey` is the third column of the
 * `(cartId, variantId, customizationKey)` unique constraint, so it decides
 * what "the same cart line" means. Two consequences follow, and both are
 * regression-guarded here:
 *
 *  - Same variant + same customization MUST produce the same key, or a
 *    double-click creates a duplicate line instead of incrementing quantity.
 *  - Same variant + different customization MUST produce different keys, or
 *    two engravings of one product collapse into one line and a customer
 *    receives the wrong goods.
 *
 * The second case is also what made checkout fail outright before the
 * create-order route deduplicated product refs (P1-3 in the audit).
 */

test("empty customization has a stable empty key", () => {
  assert.equal(customizationKey(undefined), "");
  assert.equal(customizationKey(null), "");
  assert.equal(customizationKey({}), "");
});

test("whitespace-only fields are treated as absent", () => {
  assert.equal(customizationKey({ personalizationText: "   " }), "");
  assert.equal(customizationKey({ logoUrl: "\t\n" }), "");
});

test("identical customizations produce identical keys (adds merge)", () => {
  const a = customizationKey({ personalizationText: "For Priya", giftWrap: true });
  const b = customizationKey({ personalizationText: "For Priya", giftWrap: true });
  assert.equal(a, b);
  assert.notEqual(a, "");
});

test("surrounding whitespace does not create a second line", () => {
  assert.equal(
    customizationKey({ personalizationText: "For Priya" }),
    customizationKey({ personalizationText: "  For Priya  " }),
  );
});

test("key order in the object does not affect the key", () => {
  // JSON.stringify preserves insertion order, so the canonical form must pin
  // a fixed field order rather than serialise the object as given.
  assert.equal(
    customizationKey({ giftWrap: true, personalizationText: "Hi" }),
    customizationKey({ personalizationText: "Hi", giftWrap: true }),
  );
});

test("different personalization produces different keys (lines stay distinct)", () => {
  const priya = customizationKey({ personalizationText: "For Priya" });
  const arjun = customizationKey({ personalizationText: "For Arjun" });
  assert.notEqual(priya, arjun);
});

test("gift wrap alone distinguishes a line", () => {
  assert.notEqual(customizationKey({ giftWrap: true }), customizationKey({}));
  assert.notEqual(
    customizationKey({ personalizationText: "Hi", giftWrap: true }),
    customizationKey({ personalizationText: "Hi" }),
  );
});

test("a different logo distinguishes a line", () => {
  assert.notEqual(
    customizationKey({ logoUrl: "https://cdn/a.png" }),
    customizationKey({ logoUrl: "https://cdn/b.png" }),
  );
});

test("giftWrap false is equivalent to absent", () => {
  assert.equal(customizationKey({ giftWrap: false }), "");
});

test("normalizeCustomization drops empty fields and coerces giftWrap", () => {
  assert.deepEqual(
    normalizeCustomization({ personalizationText: "  Hi  ", logoUrl: "", giftWrap: false }),
    { personalizationText: "Hi" },
  );
  assert.deepEqual(normalizeCustomization({ giftWrap: true }), { giftWrap: true });
  assert.deepEqual(normalizeCustomization(null), {});
});

test("keys are fixed-length hex, safe for a database column", () => {
  const key = customizationKey({ personalizationText: "x".repeat(500) });
  assert.equal(key.length, 32);
  assert.match(key, /^[0-9a-f]{32}$/);
});
