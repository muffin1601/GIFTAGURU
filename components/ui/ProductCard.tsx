"use client";

import { Eye, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

const categoryTint: Record<string, string> = {
  "eco-gifts": "from-emerald-100 to-cream-200",
  "joining-gifts": "from-amber-100 to-cream-200",
  "luxury-gifts": "from-navy-900/10 to-cream-200",
  "premium-gifts": "from-gold-300/40 to-cream-200",
  "diaries-notebooks": "from-slate-100 to-cream-200",
  "gift-sets": "from-gold-300/40 to-cream-200",
  "pens-desk-accessories": "from-zinc-100 to-cream-200",
  "office-stationery": "from-stone-100 to-cream-200",
  "premium-gift-sets": "from-gold-300/40 to-cream-200",
  "luxury-gift-sets": "from-navy-900/10 to-cream-200",
  "eco-gift-sets": "from-emerald-100 to-cream-200",
};

const categoryLabel: Record<string, string> = {
  "eco-gifts": "Eco Gifts",
  "joining-gifts": "Joining Gifts",
  "luxury-gifts": "Luxury Gifts",
  "premium-gifts": "Premium Gifts",
  "diaries-notebooks": "Diaries & Notebooks",
  "gift-sets": "Corporate Gift Sets",
  "pens-desk-accessories": "Pens & Desk Accessories",
  "office-stationery": "Office & Stationery",
  "premium-gift-sets": "Premium Gift Sets",
  "luxury-gift-sets": "Luxury Gift Sets",
  "eco-gift-sets": "Eco-Friendly Gift Sets",
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const tint = categoryTint[product.category] ?? "from-cream-200 to-white";
  const label = categoryLabel[product.category] ?? "Corporate Gifts";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-950/5 transition-shadow duration-300 hover:shadow-lg">
      <div
        className={cn("relative flex aspect-square items-center justify-center bg-gradient-to-br", tint)}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ShoppingBag className="h-10 w-10 text-navy-900/40" aria-hidden="true" />
        )}
        <Link
          href={`/products/${product.slug}`}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy-900 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Quick View
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
          {label}
        </span>
        <h3 className="font-display text-lg text-navy-950">
          <Link href={`/products/${product.slug}`} className="hover:text-gold-600">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-700">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-semibold text-navy-950">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={() => {
              addItem(product);
              setAdded(true);
            }}
            className="rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-cream-100 transition-colors hover:bg-navy-800"
          >
            {added ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
