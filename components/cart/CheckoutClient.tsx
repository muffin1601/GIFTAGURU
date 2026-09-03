"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Container from "@/components/ui/Container";
import { cartItemUnitPrice, useCart } from "@/components/cart/CartProvider";
import DeliverySplit, { ShipmentSummary } from "@/components/cart/DeliverySplit";
import { groupIntoShipments, totalShipping } from "@/lib/checkout/shipments";
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

/**
 * Stand-in for the destination typed into the form below.
 *
 * At preview time the form may still be empty, and only `city` is rendered
 * (in the destinations breakdown) -- the authoritative snapshot is built
 * server-side from the submitted form, never from this.
 */
const PLACEHOLDER_PRIMARY = {
  name: "",
  phone: "",
  line1: "",
  city: "Address entered above",
  state: "",
  postalCode: "",
  country: "IN",
};

/** Saved address as passed from the server; mirrors the columns checkout needs. */
export interface CheckoutAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutClient({
  savedAddresses = [],
  signedIn = false,
}: {
  savedAddresses?: CheckoutAddress[];
  signedIn?: boolean;
}) {
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

  // Shipping is grouped by destination through the SAME function the order
  // route uses (lib/checkout/shipments.ts), so this preview cannot drift from
  // what is actually charged. GST and the free-shipping threshold follow the
  // same settings source for the same reason.
  const shipmentGroups = groupIntoShipments({
    lines: items.map((item) => ({
      addressId: item.addressId,
      lineTotal: item.lineTotal,
      item,
    })),
    addresses: new Map(
      savedAddresses.map((address) => [
        address.id,
        {
          label: address.label,
          name: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? undefined,
          landmark: address.landmark ?? undefined,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      ]),
    ),
    primaryAddress: PLACEHOLDER_PRIMARY,
    primaryLabel: null,
    settings: { freeShippingThreshold, shippingCharge },
  });

  const shippingTotal = totalShipping(shipmentGroups);
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
        items: items.map(({ productId, quantity, addressId, personalizationText, logoUrl, logoFileName, giftWrap }) => ({
          productId,
          addressId,
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
      requiresAuth?: boolean;
    };

    if (!response.ok) {
      // The session can lapse while this page sits open. Rather than showing a
      // dead-end error on a form the customer has already filled in, send them
      // to sign in and straight back here -- the cart is server-side and is
      // re-merged on login, so nothing they entered is lost from the basket.
      if (response.status === 401 || payload.requiresAuth) {
        router.push("/login?next=/checkout");
        return;
      }

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

          {/* Placed after the billing block so the address typed above is
              already established as the default destination before the
              customer is offered the option to route items elsewhere. */}
          {items.length > 0 ? <DeliverySplit addresses={savedAddresses} signedIn={signedIn} /> : null}

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
              <div key={item.lineId} className="space-y-1 text-sm">
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
              <dt className="text-ink-700">
                Shipping
                {shipmentGroups.length > 1 ? (
                  <span className="type-meta block">{shipmentGroups.length} destinations</span>
                ) : null}
              </dt>
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

          <ShipmentSummary
            groups={shipmentGroups.map((group) => ({
              label: group.label,
              city: group.address.city,
              subtotal: group.subtotal,
              shippingTotal: group.shippingTotal,
            }))}
          />

          <p className="type-meta mt-3">
            Discounts and payment status are verified server-side. Shipping is charged per
            destination, and updates if a destination crosses the free-shipping threshold after any
            changes to your cart.
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
