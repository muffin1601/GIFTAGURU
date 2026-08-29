"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cartItemUnitPrice, useCart } from "@/components/cart/CartProvider";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY_MESSAGE } from "@/lib/config/store";
import { formatPrice } from "@/lib/utils";

export default function CartPageClient() {
  const { items, merchandiseSubtotal, giftWrapTotal, subtotal, updateQuantity, removeItem } = useCart();
  const [quantityMessage, setQuantityMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Cart</p>
          <h1 className="mt-3 font-display text-4xl text-navy-950">Your gifting cart is empty</h1>
          <p className="mt-4 text-ink-700">Explore corporate collections and add gifts for quote-ready checkout.</p>
          <Button href="/shop" className="mt-8">Browse Gifts</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="font-display text-4xl text-navy-950">Cart</h1>
          <div className="mt-8 divide-y divide-navy-950/10 rounded-2xl bg-white ring-1 ring-navy-950/5">
            {items.map((item) => (
              <div key={`${item.id}-${item.personalizationText ?? ""}-${item.logoUrl ?? ""}-${item.giftWrap ? "wrap" : "plain"}`} className="grid gap-5 p-5 sm:grid-cols-[110px_1fr_auto]">
                <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-cream-200">
                  {item.image ? <Image src={item.image} alt={item.name} fill className="object-contain p-3" /> : null}
                </Link>
                <div>
                  <Link href={`/products/${item.slug}`} className="font-display text-xl text-navy-950 hover:text-gold-600">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-700">Minimum order: {item.minQuantity} units</p>
                  {item.personalizationText ? <p className="mt-1 text-sm text-ink-600">Text: {item.personalizationText}</p> : null}
                  {item.logoFileName ? <p className="mt-1 text-sm text-ink-600">Logo: {item.logoFileName}</p> : null}
                  {item.giftWrap ? <p className="mt-1 text-sm text-ink-600">Gift wrap: {formatPrice(GIFT_WRAP_PRICE)}</p> : null}
                  <p className="mt-2 font-semibold text-navy-950">{formatPrice(cartItemUnitPrice(item))} / unit</p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="inline-flex h-10 items-center rounded-full border border-navy-950/15 bg-white">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="px-3"
                      onClick={() => {
                        if (item.quantity - 1 < item.minQuantity) setQuantityMessage(MIN_ORDER_QUANTITY_MESSAGE);
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button type="button" aria-label="Increase quantity" className="px-3" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-navy-950">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {quantityMessage ? <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{quantityMessage}</p> : null}
        </section>

        <aside className="h-fit rounded-2xl bg-navy-950 p-6 text-cream-100">
          <h2 className="font-display text-2xl">Order Summary</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span>Merchandise</span><span>{formatPrice(merchandiseSubtotal)}</span></div>
            <div className="flex justify-between"><span>Gift wrap</span><span>{formatPrice(giftWrapTotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Calculated after address</span></div>
            <div className="flex justify-between"><span>GST</span><span>Calculated securely</span></div>
          </div>
          <div className="mt-6 flex justify-between border-t border-white/15 pt-5 text-lg font-semibold">
            <span>Estimated total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button href="/checkout" className="mt-6 w-full bg-gold-500 text-navy-950 hover:bg-gold-400">
            Continue to Checkout
          </Button>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Need help with a large corporate order?</p>
            <Button href="/bulk-enquiry" variant="ghost" className="mt-2 w-full text-cream-100 hover:text-gold-300">
              Talk to our team
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
}
