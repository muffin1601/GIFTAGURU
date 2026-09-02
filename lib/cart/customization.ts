import { createHash } from "crypto";

/**
 * Per-line customization, and the identity rules built on it.
 *
 * Cart line identity is (variant, customization). Two adds of the same variant
 * with the same customization are the SAME line and must merge quantities; the
 * same variant with different personalization is a genuinely different line.
 * Both the database constraint and the merge logic key off
 * `customizationKey()`, so this module is the only place that decides what
 * "the same line" means.
 */

export interface CartCustomization {
  personalizationText?: string;
  logoUrl?: string;
  logoFileName?: string;
  giftWrap?: boolean;
}

/** Canonical, comparable form: trimmed, empty-as-absent, fixed key order. */
export function normalizeCustomization(input: CartCustomization | null | undefined): CartCustomization {
  const personalizationText = input?.personalizationText?.trim();
  const logoUrl = input?.logoUrl?.trim();
  const logoFileName = input?.logoFileName?.trim();

  const normalized: CartCustomization = {};
  if (personalizationText) normalized.personalizationText = personalizationText;
  if (logoUrl) normalized.logoUrl = logoUrl;
  if (logoFileName) normalized.logoFileName = logoFileName;
  if (input?.giftWrap) normalized.giftWrap = true;
  return normalized;
}

/**
 * Digest of the normalised customization, used as the third column of the
 * `(cartId, variantId, customizationKey)` unique constraint.
 *
 * Returns "" for an empty customization rather than the hash of "{}", so the
 * overwhelmingly common plain add produces a readable, stable key. Keys are
 * emitted in a fixed order because JSON.stringify preserves insertion order
 * and two orderings would otherwise hash differently.
 */
export function customizationKey(input: CartCustomization | null | undefined): string {
  const normalized = normalizeCustomization(input);
  if (Object.keys(normalized).length === 0) return "";

  const canonical = JSON.stringify([
    normalized.personalizationText ?? null,
    normalized.logoUrl ?? null,
    normalized.logoFileName ?? null,
    normalized.giftWrap ?? false,
  ]);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}
