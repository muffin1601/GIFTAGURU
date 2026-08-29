"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

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
  const label = categoryLabel[product.category] ?? "Corporate Gifts";

  return (
    <article className="group flex flex-col">
      {/* The image is the primary target. It duplicates the title link below,
          so it is kept out of the tab order rather than announced twice. */}
      <Link
        href={`/products/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square overflow-hidden border border-line bg-surface"
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-6 transition-opacity duration-300 group-hover:opacity-85 sm:p-8"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <span className="type-eyebrow">{label}</span>

        <h3 className="font-display text-[1.0625rem] leading-snug text-navy-950">
          <Link href={`/products/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[0.9375rem] font-semibold text-navy-950">
            {formatPrice(product.price)}
          </span>
          <span className="type-meta">/ unit</span>
        </div>

        <button
          type="button"
          onClick={() => {
            addItem(product);
            setAdded(true);
          }}
          className="mt-3 self-start border-b border-navy-950/25 pb-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:border-gold-600 hover:text-gold-600"
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
