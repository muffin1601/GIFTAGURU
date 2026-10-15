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
    <article className="product-card group flex flex-col rounded-[30px] bg-surface p-3 pb-6 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.1)]">
      {/* The image is the primary target. It duplicates the title link below,
          so it is kept out of the tab order rather than announced twice. */}
      <Link
        href={`/products/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square overflow-hidden rounded-[18px] border border-line bg-sunken"
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

      <div className="flex flex-1 flex-col gap-1.5 px-2 pt-5">
        <span className="type-eyebrow">{label}</span>
        {product.productCode ? <span className="type-meta">Product code: {product.productCode}</span> : null}

        <h3 className="font-display text-xl font-semibold leading-snug text-navy-950">
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
          className="mt-4 self-start rounded-[30px] border border-navy-950/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:border-navy-950 hover:bg-navy-950 hover:text-white"
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
