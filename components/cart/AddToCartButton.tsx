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
      className={className ?? "btn btn-primary"}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
