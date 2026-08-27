"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`View cart${count ? `, ${count} items` : ""}`}
      className="relative hidden items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5 sm:inline-flex"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-gold-500 px-1.5 text-center text-[10px] font-bold leading-5 text-navy-950">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
