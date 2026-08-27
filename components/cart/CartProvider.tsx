"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY } from "@/lib/config/store";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  minQuantity: number;
  personalizationText?: string;
  logoUrl?: string;
  logoFileName?: string;
  giftWrap?: boolean;
}

export interface AddCartItemOptions {
  quantity?: number;
  personalizationText?: string;
  logoUrl?: string;
  logoFileName?: string;
  giftWrap?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  merchandiseSubtotal: number;
  giftWrapTotal: number;
  subtotal: number;
  addItem: (product: Product, options?: number | AddCartItemOptions) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem("giftaguru-cart");
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("giftaguru-cart", JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const merchandiseSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const giftWrapTotal = items.reduce((sum, item) => sum + (item.giftWrap ? GIFT_WRAP_PRICE : 0), 0);
    const subtotal = merchandiseSubtotal + giftWrapTotal;

    return {
      items,
      count,
      merchandiseSubtotal,
      giftWrapTotal,
      subtotal,
      addItem(product, options) {
        const normalizedOptions = typeof options === "number" ? { quantity: options } : options ?? {};
        const quantity = normalizedOptions.quantity ?? MIN_ORDER_QUANTITY;
        const price = product.price ?? 0;
        const minQuantity = Math.max(product.minQuantity, MIN_ORDER_QUANTITY);
        const customizationKey = JSON.stringify({
          id: product.id,
          personalizationText: normalizedOptions.personalizationText?.trim() || undefined,
          logoUrl: normalizedOptions.logoUrl,
          logoFileName: normalizedOptions.logoFileName,
          giftWrap: Boolean(normalizedOptions.giftWrap),
        });
        setItems((current) => {
          const existing = current.find((item) => {
            const itemKey = JSON.stringify({
              id: item.id,
              personalizationText: item.personalizationText,
              logoUrl: item.logoUrl,
              logoFileName: item.logoFileName,
              giftWrap: Boolean(item.giftWrap),
            });
            return itemKey === customizationKey;
          });
          if (existing) {
            return current.map((item) =>
              item === existing
                ? { ...item, quantity: Math.max(item.quantity + quantity, item.minQuantity, MIN_ORDER_QUANTITY) }
                : item,
            );
          }

          return [
            ...current,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              price,
              quantity: Math.max(quantity, minQuantity),
              minQuantity,
              personalizationText: normalizedOptions.personalizationText?.trim() || undefined,
              logoUrl: normalizedOptions.logoUrl,
              logoFileName: normalizedOptions.logoFileName,
              giftWrap: Boolean(normalizedOptions.giftWrap),
            },
          ];
        });
      },
      updateQuantity(id, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(quantity, item.minQuantity, MIN_ORDER_QUANTITY) } : item,
          ),
        );
      },
      removeItem(id) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
