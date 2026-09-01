"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Container from "@/components/ui/Container";
import { cartItemUnitPrice, useCart } from "@/components/cart/CartProvider";
import { isValidIndianPinCode } from "@/lib/services/delivery";
import { formatPrice } from "@/lib/utils";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    merchandiseSubtotal,
    giftWrapTotal,
    subtotal,
    giftWrapPrice,
    minOrderQuantityMessage,
    freeShippingThreshold,
    shippingCharge,
    gstRatePercent,
    clearCart,
  } = useCart();

  // Mirrors the exact calculation in app/api/razorpay/create-order/route.ts
  // (same settings source, same formula, same rounding) so the number shown
  // here before payment matches what the server actually charges to the
  // rupee -- this is a preview of the authoritative total, not a separate
  // estimate that could drift from it.
  const shippingTotal = subtotal >= freeShippingThreshold ? 0 : shippingCharge;
  const gstTotal = Math.round((subtotal * gstRatePercent) / 100);
  const grandTotal = subtotal + shippingTotal + gstTotal;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const postalCode = String(formData.get("postalCode") ?? "");
    const billingPostalCode = billingSameAsShipping
      ? postalCode
      : String(formData.get("billingPostalCode") ?? "");

    if (items.some((item) => item.quantity < item.minQuantity)) {
      setError(minOrderQuantityMessage);
      setPending(false);
      return;
    }

    if (!isValidIndianPinCode(postalCode)) {
      setError("Enter a valid 6-digit Indian PIN code.");
      setPending(false);
      return;
    }

    if (!billingSameAsShipping && !isValidIndianPinCode(billingPostalCode)) {
      setError("Enter a valid 6-digit Indian PIN code for the billing address.");
      setPending(false);
      return;
    }

    const checkout = Object.fromEntries(formData) as Record<string, FormDataEntryValue>;
    checkout.billingSameAsShipping = billingSameAsShipping ? "true" : "false";
    if (billingSameAsShipping) {
      checkout.billingName = String(formData.get("name") ?? "");
      checkout.billingAddress = String(formData.get("address") ?? "");
      checkout.billingCity = String(formData.get("city") ?? "");
      checkout.billingState = String(formData.get("state") ?? "");
      checkout.billingPostalCode = postalCode;
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
        checkout,
      }),
    });
    const payload = (await response.json()) as {
      orderId?: string;
      databaseOrderId?: string;
      razorpayOrderId?: string;
      amount?: number;
      currency?: string;
      keyId?: string;
      error?: string;
      demo?: boolean;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to create payment order.");
      setPending(false);
      return;
    }

    // Demo mode: no Razorpay credentials configured, order was saved with pending payment.
    if (payload.demo || !payload.razorpayOrderId || !payload.keyId) {
      clearCart();
      router.push(`/order-confirmation/${payload.orderId ?? "quote-request"}`);
      return;
    }

    if (!window.Razorpay) {
      setError("Payment gateway failed to load. Please refresh and try again.");
      setPending(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: payload.keyId,
      order_id: payload.razorpayOrderId,
      amount: payload.amount,
      currency: payload.currency,
      name: "Gifta Guru",
      description: "Corporate gifting order",
      prefill: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        contact: String(formData.get("phone") ?? ""),
      },
      notes: { orderNumber: payload.orderId ?? "" },
      handler: (razorpayResponse: RazorpayResponse) => {
        void verifyPayment(razorpayResponse, payload.orderId ?? "quote-request");
      },
      modal: {
        ondismiss: () => {
          setPending(false);
          setError("Payment was not completed. Your order is saved and you can retry from your account or contact us for help.");
        },
      },
    });

    razorpay.open();
  }

  async function verifyPayment(razorpayResponse: RazorpayResponse, orderNumber: string) {
    const response = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(razorpayResponse),
    });

    if (!response.ok) {
      setPending(false);
      setError("We couldn't verify your payment automatically. Contact us with your order reference and we'll confirm it manually.");
      return;
    }

    clearCart();
    router.push(`/order-confirmation/${orderNumber}`);
  }

  return (
    <Container className="py-12 sm:py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <form onSubmit={submitCheckout} className="flex flex-col gap-10">
          <div>
            <span className="type-eyebrow">Checkout</span>
            <h1 className="type-h1 mt-4">Secure corporate checkout</h1>
          </div>

          <section>
            <h2 className="type-eyebrow">Contact information</h2>
            <div className="mt-5 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
              <div className="field">
                <label className="field-label" htmlFor="email">Work email</label>
                <input required id="email" name="email" type="email" autoComplete="email" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="phone">Mobile number</label>
                <input required id="phone" name="phone" type="tel" autoComplete="tel" className="field-input" />
              </div>
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="company">Company name</label>
                <input required id="company" name="company" autoComplete="organization" className="field-input" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="type-eyebrow">Shipping address</h2>
            <div className="mt-5 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
              <div className="field">
                <label className="field-label" htmlFor="name">Recipient name</label>
                <input required id="name" name="name" autoComplete="name" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="postalCode">PIN code</label>
                <input required id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" className="field-input" />
              </div>
              <div className="field sm:col-span-2">
                <label className="field-label" htmlFor="address">Address</label>
                <input required id="address" name="address" autoComplete="street-address" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="city">City</label>
                <input required id="city" name="city" autoComplete="address-level2" className="field-input" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="state">State</label>
                <input required id="state" name="state" autoComplete="address-level1" className="field-input" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="type-eyebrow">Billing address</h2>
            <div className="mt-5 border-t border-line pt-6">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                  className="h-4 w-4"
                />
                Same as shipping address
              </label>

              {!billingSameAsShipping ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="field">
                    <label className="field-label" htmlFor="billingName">Billing name</label>
                    <input required id="billingName" name="billingName" autoComplete="name" className="field-input" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="billingPostalCode">PIN code</label>
                    <input required id="billingPostalCode" name="billingPostalCode" inputMode="numeric" autoComplete="postal-code" className="field-input" />
                  </div>
                  <div className="field sm:col-span-2">
                    <label className="field-label" htmlFor="billingAddress">Address</label>
                    <input required id="billingAddress" name="billingAddress" autoComplete="street-address" className="field-input" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="billingCity">City</label>
                    <input required id="billingCity" name="billingCity" autoComplete="address-level2" className="field-input" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="billingState">State</label>
                    <input required id="billingState" name="billingState" autoComplete="address-level1" className="field-input" />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {error ? (
            <p role="alert" className="field-error border-l-2 border-current pl-4">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <p className="type-body">
              Your cart is empty.{" "}
              <Link href="/shop" className="link-underline text-navy-950">Explore gifts</Link> to
              continue.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || items.length === 0}
            className="btn btn-primary self-start"
          >
            {pending ? "Creating secure order…" : "Continue to Payment"}
          </button>
        </form>

        <aside className="h-fit lg:sticky lg:top-32">
          <h2 className="type-eyebrow">Review</h2>
          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
            {items.map((item) => (
              <div key={`${item.id}-${item.personalizationText ?? ""}-${item.logoUrl ?? ""}-${item.giftWrap ? "wrap" : "plain"}`} className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(cartItemUnitPrice(item) * item.quantity + (item.giftWrap ? giftWrapPrice : 0))}</span>
                </div>
                {item.personalizationText ? <p className="text-xs text-ink-500">Text: {item.personalizationText}</p> : null}
                {item.logoFileName ? <p className="text-xs text-ink-500">Logo: {item.logoFileName}</p> : null}
                {item.giftWrap ? <p className="text-xs text-ink-500">Gift wrap: {formatPrice(giftWrapPrice)}</p> : null}
              </div>
            ))}
          </div>
          <dl className="mt-6 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-ink-700">Merchandise</dt>
              <dd className="text-navy-950">{formatPrice(merchandiseSubtotal)}</dd>
            </div>
            {giftWrapTotal > 0 ? (
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-700">Gift wrap</dt>
                <dd className="text-navy-950">{formatPrice(giftWrapTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-ink-700">Shipping</dt>
              <dd className="text-navy-950">
                {shippingTotal > 0 ? formatPrice(shippingTotal) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-ink-700">GST ({gstRatePercent}%)</dt>
              <dd className="text-navy-950">{formatPrice(gstTotal)}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-line pt-4">
              <dt className="font-semibold text-navy-950">Total</dt>
              <dd className="font-display text-xl text-navy-950">{formatPrice(grandTotal)}</dd>
            </div>
          </dl>
          <p className="type-meta mt-3">
            Discounts and payment status are verified server-side. Shipping updates if your order
            crosses the free-shipping threshold after any changes to your cart.
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm font-medium text-navy-950">Need a larger corporate order?</p>
            <Link
              href="/bulk-enquiry"
              className="link-underline mt-2 inline-block text-sm font-semibold text-navy-950"
            >
              Talk to our team
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
