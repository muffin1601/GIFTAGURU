import test from "node:test";
import assert from "node:assert/strict";
import { consume, tooManyRequests } from "../lib/rate-limit.ts";
import { isValidIndianPinCode } from "../lib/services/delivery.ts";

/**
 * Rate limiting and PIN-code validation.
 *
 * The limiter guards the three unauthenticated endpoints an attacker can reach
 * for free: the lead form, the order-tracking lookup (whose order numbers are
 * sequential and therefore enumerable), and the logo upload. The window reset
 * and the per-key isolation are the two properties that make it useful rather
 * than decorative.
 */

/** Unique key per test, so cases cannot bleed into one another. */
let counter = 0;
const key = () => `test-scope-${counter++}`;

test("allows requests up to the limit, rejects past it", () => {
  const k = key();
  for (let i = 0; i < 5; i++) {
    assert.equal(consume(k, 5, 60_000).ok, true, `request ${i + 1} should be allowed`);
  }
  assert.equal(consume(k, 5, 60_000).ok, false, "6th request must be rejected");
});

test("rejection reports a positive retry-after in seconds", () => {
  const k = key();
  consume(k, 1, 60_000);
  const result = consume(k, 1, 60_000);

  assert.equal(result.ok, false);
  assert.ok(result.retryAfter > 0, "retryAfter must be positive");
  assert.ok(result.retryAfter <= 60, "retryAfter must not exceed the window");
});

test("allowed requests report no retry-after", () => {
  assert.equal(consume(key(), 5, 60_000).retryAfter, 0);
});

test("separate keys have independent budgets", () => {
  const a = key();
  const b = key();
  consume(a, 1, 60_000);
  assert.equal(consume(a, 1, 60_000).ok, false);
  // One client exhausting its budget must not lock out everyone else.
  assert.equal(consume(b, 1, 60_000).ok, true);
});

test("the window expires and the budget resets", async () => {
  const k = key();
  assert.equal(consume(k, 1, 50).ok, true);
  assert.equal(consume(k, 1, 50).ok, false);

  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(consume(k, 1, 50).ok, true, "budget must reset after the window");
});

test("a limit of one allows exactly one request", () => {
  const k = key();
  assert.equal(consume(k, 1, 60_000).ok, true);
  assert.equal(consume(k, 1, 60_000).ok, false);
  assert.equal(consume(k, 1, 60_000).ok, false);
});

test("tracking many distinct keys stays bounded and functional", () => {
  // The limiter this replaced grew one permanently-retained entry per client
  // IP. Sweeping and the hard cap must not break correctness for live keys.
  for (let i = 0; i < 3_000; i++) consume(`flood-${i}`, 1, 60_000);

  const fresh = key();
  assert.equal(consume(fresh, 1, 60_000).ok, true);
  assert.equal(consume(fresh, 1, 60_000).ok, false);
});

test("tooManyRequests returns a 429 with Retry-After", async () => {
  const response = tooManyRequests("Slow down.", 30);

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "30");
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.deepEqual(await response.json(), { error: "Slow down." });
});

test("Indian PIN codes: six digits, never leading zero", () => {
  assert.equal(isValidIndianPinCode("110020"), true);
  assert.equal(isValidIndianPinCode("  110020  "), true, "should tolerate surrounding whitespace");

  assert.equal(isValidIndianPinCode("011002"), false, "leading zero is not a valid Indian PIN");
  assert.equal(isValidIndianPinCode("11002"), false, "five digits");
  assert.equal(isValidIndianPinCode("1100200"), false, "seven digits");
  assert.equal(isValidIndianPinCode("11o020"), false, "letters");
  assert.equal(isValidIndianPinCode(""), false);
});
