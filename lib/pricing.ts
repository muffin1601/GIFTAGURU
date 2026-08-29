export interface PriceTier {
  minQuantity: number;
  unitPrice: number;
}

/**
 * Resolves the per-unit price for a given quantity against a product's
 * quantity-based price tiers. The highest tier whose minQuantity is <= the
 * requested quantity wins; if no tier qualifies, the base price applies.
 * This must be the ONLY place unit price is derived from quantity so the
 * storefront display and the server-side checkout calculation can never
 * drift apart.
 */
export function resolveUnitPrice(basePrice: number, tiers: PriceTier[] | undefined, quantity: number): number {
  if (!tiers || tiers.length === 0) return basePrice;

  let best: PriceTier | null = null;
  for (const tier of tiers) {
    if (quantity >= tier.minQuantity && (!best || tier.minQuantity > best.minQuantity)) {
      best = tier;
    }
  }
  return best ? best.unitPrice : basePrice;
}

export function sortTiers(tiers: PriceTier[]): PriceTier[] {
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
}
