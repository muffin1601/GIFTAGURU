"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { type AddCartItemOptions, useCart } from "@/components/cart/CartProvider";

export default function AddToCartButton({
  product,
  quantity,
  options,
  className,
}: {
  product: Product;
  quantity?: number;
  options?: AddCartItemOptions;
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product, options ?? quantity);
        setAdded(true);
      }}
      className={className ?? "inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100 transition-colors hover:bg-navy-800"}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
