"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useCart } from "@/components/cart/CartProvider";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY_MESSAGE } from "@/lib/config/store";
import { isValidIndianPinCode } from "@/lib/services/delivery";
import { formatPrice } from "@/lib/utils";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, merchandiseSubtotal, giftWrapTotal, subtotal, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const postalCode = String(formData.get("postalCode") ?? "");

    if (items.some((item) => item.quantity < item.minQuantity)) {
      setError(MIN_ORDER_QUANTITY_MESSAGE);
      setPending(false);
      return;
    }

    if (!isValidIndianPinCode(postalCode)) {
      setError("Enter a valid 6-digit Indian PIN code.");
      setPending(false);
      return;
    }

    const response = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ id, quantity, personalizationText, logoUrl, logoFileName, giftWrap }) => ({
          productId: id,
          quantity,
          personalizationText,
          logoUrl,
          logoFileName,
          giftWrap,
        })),
        checkout: Object.fromEntries(formData),
      }),
    });
    const payload = await response.json() as { orderId?: string; error?: string; demo?: boolean };

    if (!response.ok) {
      setError(payload.error ?? "Unable to create payment order.");
      setPending(false);
      return;
    }

    clearCart();
    router.push(`/order-confirmation/${payload.orderId ?? "quote-request"}`);
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submitCheckout} className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Checkout</p>
            <h1 className="mt-3 font-display text-4xl text-navy-950">Secure corporate checkout</h1>
          </div>
          <section className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
            <h2 className="font-display text-2xl text-navy-950">Contact information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input required name="email" type="email" placeholder="Work email" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
              <input required name="phone" placeholder="Mobile number" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
              <input required name="company" placeholder="Company name" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900 sm:col-span-2" />
            </div>
          </section>
          <section className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
            <h2 className="font-display text-2xl text-navy-950">Shipping address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input required name="name" placeholder="Recipient name" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
              <input required name="postalCode" placeholder="PIN code" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
              <input required name="address" placeholder="Address line" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900 sm:col-span-2" />
              <input required name="city" placeholder="City" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
              <input required name="state" placeholder="State" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
            </div>
          </section>
          {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
          <button disabled={pending || items.length === 0} className="rounded-full bg-navy-900 px-8 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 disabled:opacity-60">
            {pending ? "Creating secure order..." : "Continue to Payment"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
          <h2 className="font-display text-2xl text-navy-950">Review</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.personalizationText ?? ""}-${item.logoUrl ?? ""}-${item.giftWrap ? "wrap" : "plain"}`} className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity + (item.giftWrap ? GIFT_WRAP_PRICE : 0))}</span>
                </div>
                {item.personalizationText ? <p className="text-xs text-ink-500">Text: {item.personalizationText}</p> : null}
                {item.logoFileName ? <p className="text-xs text-ink-500">Logo: {item.logoFileName}</p> : null}
                {item.giftWrap ? <p className="text-xs text-ink-500">Gift wrap: {formatPrice(GIFT_WRAP_PRICE)}</p> : null}
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-navy-950/10 pt-5">
            <div className="flex justify-between text-sm text-ink-700">
              <span>Merchandise</span>
              <span>{formatPrice(merchandiseSubtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-ink-700">
              <span>Gift wrap</span>
              <span>{formatPrice(giftWrapTotal)}</span>
            </div>
            <div className="mt-4 flex justify-between font-semibold text-navy-950">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs text-ink-500">Final shipping, GST, discounts, and payment status are verified server-side.</p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
