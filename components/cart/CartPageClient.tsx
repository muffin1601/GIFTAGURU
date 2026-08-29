"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cartItemUnitPrice, useCart } from "@/components/cart/CartProvider";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY_MESSAGE } from "@/lib/config/store";
import { formatPrice } from "@/lib/utils";

export default function CartPageClient() {
  const { items, merchandiseSubtotal, giftWrapTotal, subtotal, updateQuantity, removeItem } =
    useCart();
  const [quantityMessage, setQuantityMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <Container className="py-24 sm:py-32">
        <div className="max-w-lg">
          <span className="type-eyebrow">Cart</span>
          <h1 className="type-h1 mt-4">Your gifting journey starts here.</h1>
          <p className="type-lead mt-5">
            Browse our corporate collections and add gifts for quote-ready checkout.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/shop">Explore Gifts</Button>
            <Button href="/bulk-enquiry" variant="secondary">
              Request a Quote
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="type-h1">Cart</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section aria-label="Cart items">
          <div className="border-t border-line">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.personalizationText ?? ""}-${item.logoUrl ?? ""}-${item.giftWrap ? "wrap" : "plain"}`}
                className="grid gap-5 border-b border-line py-6 sm:grid-cols-[96px_1fr_auto]"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-square overflow-hidden border border-line bg-surface"
                >
                  {item.image ? (
                    <Image src={item.image} alt="" fill sizes="96px" className="object-contain p-2" />
                  ) : null}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="link-underline font-display text-lg text-navy-950"
                  >
                    {item.name}
                  </Link>
                  <p className="type-meta mt-1">Minimum order: {item.minQuantity} units</p>
                  {item.personalizationText ? (
                    <p className="type-meta mt-1">Text: {item.personalizationText}</p>
                  ) : null}
                  {item.logoFileName ? (
                    <p className="type-meta mt-1">Logo: {item.logoFileName}</p>
                  ) : null}
                  {item.giftWrap ? (
                    <p className="type-meta mt-1">Gift wrap: {formatPrice(GIFT_WRAP_PRICE)}</p>
                  ) : null}
                  <p className="mt-2.5 text-sm font-semibold text-navy-950">
                    {formatPrice(cartItemUnitPrice(item))} / unit
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                  <div className="inline-flex h-10 items-center border border-line bg-surface">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="px-3 text-navy-950 transition-colors duration-200 hover:text-gold-600"
                      onClick={() => {
                        if (item.quantity - 1 < item.minQuantity)
                          setQuantityMessage(MIN_ORDER_QUANTITY_MESSAGE);
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      className="px-3 text-navy-950 transition-colors duration-200 hover:text-gold-600"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="link-underline text-xs font-semibold uppercase tracking-[0.08em] text-ink-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {quantityMessage ? (
            <p role="alert" className="field-error mt-5">
              {quantityMessage}
            </p>
          ) : null}
        </section>

        <aside className="h-fit lg:sticky lg:top-32" aria-label="Order summary">
          <h2 className="type-eyebrow">Order Summary</h2>

          <dl className="mt-5 border-t border-line text-sm">
            {[
              ["Merchandise", formatPrice(merchandiseSubtotal)],
              ["Gift wrap", formatPrice(giftWrapTotal)],
              ["Shipping", "Calculated after address"],
              ["GST", "Calculated at checkout"],
            ].map(([term, value]) => (
              <div key={term} className="flex justify-between gap-4 border-b border-line py-3">
                <dt className="text-ink-700">{term}</dt>
                <dd className="text-right text-navy-950">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-4">
              <dt className="font-semibold text-navy-950">Estimated total</dt>
              <dd className="font-display text-xl text-navy-950">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <Button href="/checkout" className="mt-3 w-full">
            Continue to Checkout
          </Button>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm font-medium text-navy-950">Need a larger corporate order?</p>
            <p className="type-body mt-1.5">
              Our gifting team can price volumes, branding and multi-city dispatch.
            </p>
            <Link href="/bulk-enquiry" className="link-underline mt-3 inline-block text-sm font-semibold text-navy-950">
              Talk to our team
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
