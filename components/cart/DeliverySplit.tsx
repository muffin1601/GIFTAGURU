"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { assignCartAddressAction } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";
import type { CheckoutAddress } from "@/components/cart/CheckoutClient";

/**
 * Per-line destination picker for split delivery.
 *
 * Assignment is persisted on the cart line rather than held in component
 * state, so navigating away from checkout and back doesn't silently reset
 * where everything was going.
 */
export default function DeliverySplit({
  addresses,
  signedIn,
}: {
  addresses: CheckoutAddress[];
  signedIn: boolean;
}) {
  const { items } = useCart();
  const [pendingLine, setPendingLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Split delivery needs saved addresses to route to. Rather than hiding the
  // capability from guests, explain how to unlock it.
  if (!signedIn) {
    return (
      <section className="mt-12">
        <Header />
        <p className="type-body mt-4 text-sm">
          <Link href="/login?next=/checkout" className="link-underline font-semibold text-navy-950">
            Sign in
          </Link>{" "}
          to send items in this order to more than one address.
        </p>
      </section>
    );
  }

  if (addresses.length === 0) {
    return (
      <section className="mt-12">
        <Header />
        <p className="type-body mt-4 text-sm">
          Everything ships to the address above.{" "}
          <Link href="/account/addresses" className="link-underline font-semibold text-navy-950">
            Save more addresses
          </Link>{" "}
          to split this order across several destinations.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <Header />
      <p className="type-body mt-4 text-sm">
        Send each item to a different saved address. Shipping is charged per destination.
      </p>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.lineId}
            className="grid gap-3 border-b border-line pb-4 sm:grid-cols-[1fr_18rem] sm:items-center"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-950">{item.name}</p>
              <p className="type-meta mt-0.5">
                Qty {item.quantity} · {formatPrice(item.lineTotal)}
              </p>
            </div>

            <div className="field">
              <label className="sr-only" htmlFor={`dest-${item.lineId}`}>
                Delivery address for {item.name}
              </label>
              <select
                id={`dest-${item.lineId}`}
                value={item.addressId ?? ""}
                disabled={pendingLine === item.lineId}
                className="field-input"
                onChange={(event) => {
                  const value = event.target.value || null;
                  setPendingLine(item.lineId);
                  setError(null);
                  startTransition(async () => {
                    const result = await assignCartAddressAction({ lineId: item.lineId, addressId: value });
                    if (result.error) setError(result.error);
                    setPendingLine(null);
                  });
                }}
              >
                <option value="">Address entered above</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {labelFor(address)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div aria-live="polite">
        {error ? (
          <p role="alert" className="field-error mt-4">
            {error}
          </p>
        ) : null}
      </div>

      <Link href="/account/addresses" className="link-underline mt-5 inline-block text-sm font-semibold text-navy-950">
        Manage saved addresses
      </Link>
    </section>
  );
}

function Header() {
  return (
    <>
      <h2 className="type-eyebrow flex items-center gap-2">
        <Truck className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        Delivery destinations
      </h2>
      <div className="mt-3 h-px bg-line" />
    </>
  );
}

/** Compact one-line description so the select stays readable. */
function labelFor(address: CheckoutAddress): string {
  const name = address.label ? address.label[0]!.toUpperCase() + address.label.slice(1) : "Address";
  return `${name} — ${address.fullName}, ${address.city} ${address.postalCode}`;
}

/** Summary of what each destination costs, shown beside the order totals. */
export function ShipmentSummary({
  groups,
}: {
  groups: { label: string | null; city: string; subtotal: number; shippingTotal: number }[];
}) {
  if (groups.length <= 1) return null;

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="type-eyebrow flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
        {groups.length} destinations
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {groups.map((group, index) => (
          <li key={index} className="flex justify-between gap-4">
            <span className="text-ink-700">
              {group.label ? `${group.label[0]!.toUpperCase()}${group.label.slice(1)}` : "Primary"} · {group.city}
            </span>
            <span className="text-navy-950">
              {group.shippingTotal > 0 ? formatPrice(group.shippingTotal) : "Free"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
