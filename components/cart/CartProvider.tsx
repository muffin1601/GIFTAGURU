"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import type { Product } from "@/types";
import { resolveUnitPrice } from "@/lib/pricing";
import type { StoreSettings } from "@/lib/data/store-settings";
import type { CartView, CartViewItem } from "@/lib/cart/types";
import {
  addToCartAction,
  clearCartAction,
  importLegacyCartAction,
  removeCartItemAction,
  updateCartQuantityAction,
  type CartActionResult,
} from "@/lib/actions/cart";

/**
 * Client view over the server-owned cart.
 *
 * The cart itself lives in Postgres (see lib/cart/service.ts); this provider
 * only mirrors it. State is seeded server-side by the root layout, so the
 * first paint already has the real cart -- no hydration flash, and no
 * localStorage divergence between tabs.
 *
 * Every mutation applies an optimistic patch for responsiveness, then replaces
 * state wholesale with the authoritative cart the action returns. That replace
 * is also the rollback: a rejected add simply resolves to the unchanged cart.
 */

export type CartItem = CartViewItem;

/** Repriced client-side so an optimistic quantity change re-tiers instantly. */
export function cartItemUnitPrice(item: CartItem): number {
  return resolveUnitPrice(item.price, item.priceTiers, item.quantity);
}

export interface AddCartItemOptions {
  quantity?: number;
  personalizationText?: string;
  logoUrl?: string;
  logoFileName?: string;
  giftWrap?: boolean;
}

interface CartContextValue extends StoreSettings {
  items: CartItem[];
  count: number;
  merchandiseSubtotal: number;
  giftWrapTotal: number;
  subtotal: number;
  /** True while any mutation is in flight -- drives disabled/busy affordances. */
  pending: boolean;
  /** Customer-facing message from the last rejected mutation, if any. */
  error: string | null;
  clearError: () => void;
  addItem: (product: Product, options?: number | AddCartItemOptions) => void;
  /** Addressed by cart-line id, NOT product id: the same product can occupy
   *  several lines with different personalization. */
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

type OptimisticPatch =
  | { type: "replace"; cart: CartView }
  | { type: "quantity"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "clear" };

export function CartProvider({
  children,
  settings,
  initialCart,
}: {
  children: React.ReactNode;
  /** Fetched server-side (app/layout.tsx) from the same source the Razorpay
   * order route uses, so what the customer sees here always matches what
   * they're actually charged. */
  settings: StoreSettings;
  /** Authoritative cart, read server-side during the layout render. */
  initialCart: CartView;
}) {
  const { giftWrapPrice, minOrderQuantity } = settings;
  const [cart, setCart] = useState<CartView>(initialCart);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimisticCart, applyPatch] = useOptimistic(cart, reduceOptimistic);

  // Guards against a stale response from a slow earlier request overwriting a
  // newer one -- the classic double-click race, now resolved by sequence
  // number rather than by hoping the network cooperates.
  const sequence = useRef(0);

  useImportLegacyCart(setCart);

  const dispatch = useCallback(
    (patch: OptimisticPatch, action: () => Promise<CartActionResult>) => {
      const ticket = ++sequence.current;
      setError(null);
      startTransition(async () => {
        applyPatch(patch);
        const result = await action();
        if (ticket !== sequence.current) return;
        // Replacing with the server's cart is simultaneously the commit and
        // the rollback; on failure it is simply the pre-mutation state.
        setCart(result.cart);
        if (result.error) setError(result.error);
      });
    },
    [applyPatch],
  );

  const value = useMemo<CartContextValue>(() => {
    const items = optimisticCart.items;
    const merchandiseSubtotal = items.reduce((sum, item) => sum + cartItemUnitPrice(item) * item.quantity, 0);
    const giftWrapTotal = items.reduce((sum, item) => sum + (item.giftWrap ? giftWrapPrice : 0), 0);

    return {
      ...settings,
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      merchandiseSubtotal,
      giftWrapTotal,
      subtotal: merchandiseSubtotal + giftWrapTotal,
      pending,
      error,
      clearError: () => setError(null),

      addItem(product, options) {
        const normalized = typeof options === "number" ? { quantity: options } : options ?? {};
        const quantity = Math.max(normalized.quantity ?? minOrderQuantity, product.minQuantity, minOrderQuantity);

        // No optimistic patch for adds: the line id is minted by the database,
        // and inventory may reject the add outright. The transition's `pending`
        // flag carries the feedback instead of a fabricated row.
        dispatch({ type: "replace", cart: optimisticCart }, () =>
          addToCartAction({
            productRef: product.id,
            quantity,
            customization: {
              personalizationText: normalized.personalizationText,
              logoUrl: normalized.logoUrl,
              logoFileName: normalized.logoFileName,
              giftWrap: Boolean(normalized.giftWrap),
            },
          }),
        );
      },

      updateQuantity(lineId, quantity) {
        dispatch({ type: "quantity", lineId, quantity }, () => updateCartQuantityAction({ lineId, quantity }));
      },

      removeItem(lineId) {
        dispatch({ type: "remove", lineId }, () => removeCartItemAction({ lineId }));
      },

      clearCart() {
        dispatch({ type: "clear" }, () => clearCartAction());
      },
    };
  }, [optimisticCart, settings, giftWrapPrice, minOrderQuantity, pending, error, dispatch]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const LEGACY_CART_KEY = "giftaguru-cart";

/**
 * Migrates a cart left behind by the previous localStorage implementation.
 *
 * Runs once per browser: the key is removed before the request is awaited, so
 * a re-render or a failed import can't replay it. The server treats the
 * payload as an untrusted add request, so nothing here is load-bearing for
 * correctness -- it only spares in-flight shoppers from losing their basket
 * the moment this deploys.
 */
function useImportLegacyCart(setCart: (cart: CartView) => void) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    let legacy: unknown;
    try {
      const raw = window.localStorage.getItem(LEGACY_CART_KEY);
      if (!raw) return;
      window.localStorage.removeItem(LEGACY_CART_KEY);
      legacy = JSON.parse(raw);
    } catch {
      // Unreadable or unparseable storage: nothing to migrate.
      return;
    }

    if (!Array.isArray(legacy) || legacy.length === 0) return;

    const items = legacy
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        id: String(item.id ?? ""),
        quantity: Number(item.quantity ?? 0),
        personalizationText: typeof item.personalizationText === "string" ? item.personalizationText : undefined,
        logoUrl: typeof item.logoUrl === "string" ? item.logoUrl : undefined,
        logoFileName: typeof item.logoFileName === "string" ? item.logoFileName : undefined,
        giftWrap: Boolean(item.giftWrap),
      }))
      .filter((item) => item.id && Number.isFinite(item.quantity) && item.quantity > 0)
      .slice(0, 50);

    if (items.length === 0) return;

    void importLegacyCartAction({ items }).then((result) => setCart(result.cart));
  }, [setCart]);
}

function reduceOptimistic(state: CartView, patch: OptimisticPatch): CartView {
  switch (patch.type) {
    case "replace":
      return patch.cart;
    case "clear":
      return { items: [], count: 0, merchandiseSubtotal: 0, giftWrapTotal: 0, subtotal: 0 };
    case "remove":
      return withItems(state, state.items.filter((item) => item.lineId !== patch.lineId));
    case "quantity":
      return withItems(
        state,
        patch.quantity <= 0
          ? state.items.filter((item) => item.lineId !== patch.lineId)
          : state.items.map((item) =>
              item.lineId === patch.lineId ? { ...item, quantity: patch.quantity } : item,
            ),
      );
  }
}

/** Totals are recomputed from lines so an optimistic view stays self-consistent. */
function withItems(state: CartView, items: CartViewItem[]): CartView {
  const merchandiseSubtotal = items.reduce((sum, item) => sum + cartItemUnitPrice(item) * item.quantity, 0);
  const giftWrapTotal = state.giftWrapTotal;
  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    merchandiseSubtotal,
    giftWrapTotal,
    subtotal: merchandiseSubtotal + giftWrapTotal,
  };
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
