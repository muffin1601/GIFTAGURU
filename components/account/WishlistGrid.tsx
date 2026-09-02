"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { removeWishlistItemAction } from "@/lib/actions/wishlist";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export interface WishlistEntry {
  product: Product;
  /** Sellable stock at render time; 0 renders as out of stock. */
  available: number;
}

export default function WishlistGrid({ entries }: { entries: WishlistEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="panel mt-10 p-10 text-center">
        <Heart className="mx-auto h-6 w-6 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
        <h2 className="type-h3 mt-4">Your wishlist is empty</h2>
        <p className="type-body mx-auto mt-3 max-w-md">
          Save gifts you&apos;re considering and come back to them when you&apos;re ready to order.
        </p>
        <Button href="/shop" className="mt-7">
          Browse gifts
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <WishlistCard key={entry.product.id} entry={entry} />
      ))}
    </div>
  );
}

function WishlistCard({ entry }: { entry: WishlistEntry }) {
  const { product, available } = entry;
  const { addItem, pending: cartPending } = useCart();
  const [removing, startRemoving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const outOfStock = available <= 0;

  return (
    <div className="panel flex flex-col p-5">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden border border-line bg-surface"
      >
        {product.image ? (
          <Image src={product.image} alt="" fill sizes="(min-width: 1024px) 20rem, 45vw" className="object-contain p-4" />
        ) : null}
        {outOfStock ? (
          <span className="absolute left-3 top-3 bg-navy-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-cream-100">
            Out of stock
          </span>
        ) : null}
      </Link>

      <Link href={`/products/${product.slug}`} className="link-underline mt-4 font-display text-lg text-navy-950">
        {product.name}
      </Link>
      <p className="mt-1.5 text-sm font-semibold text-navy-950">
        {product.price !== null ? formatPrice(product.price) : "Price on request"}
      </p>
      <p className="type-meta mt-1">Minimum order: {product.minQuantity} units</p>

      <div aria-live="polite">
        {error ? (
          <p role="alert" className="field-error mt-3">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-5">
        <button
          type="button"
          // Out-of-stock items stay visible and removable, but can't be added:
          // silently dropping them would lose the customer's saved intent.
          disabled={outOfStock || cartPending}
          onClick={() => {
            addItem(product);
            setAdded(true);
          }}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {outOfStock ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
        </button>

        <form
          action={(formData) =>
            startRemoving(async () => {
              const result = await removeWishlistItemAction({}, formData);
              if (result.error) setError(result.error);
            })
          }
        >
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            disabled={removing}
            aria-label={`Remove ${product.name} from wishlist`}
            className="btn btn-secondary px-3 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
