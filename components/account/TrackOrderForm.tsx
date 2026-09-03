"use client";

import { useState } from "react";
import StatusBadge from "@/components/account/StatusBadge";
import { formatPrice } from "@/lib/utils";

/**
 * Order tracking for customers who checked out as guests.
 *
 * The page previously submitted a plain GET form straight at
 * /api/track-order, which navigated the browser to the route handler -- so a
 * customer looking up their order was shown a raw JSON document, and a wrong
 * order number produced a bare `{"error":"Order not found."}` page with no way
 * back. The lookup is done with fetch here and the result rendered.
 */

interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
}

export default function TrackOrderForm() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setOrder(null);

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      orderNumber: String(formData.get("orderNumber") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    });

    try {
      const response = await fetch(`/api/track-order?${params}`);
      const payload = (await response.json()) as Partial<TrackedOrder> & { error?: string };

      if (!response.ok) {
        // 404 is deliberately phrased as "check your details" rather than
        // "no such order", so the endpoint does not confirm which of the two
        // values was wrong.
        setError(payload.error ?? "We couldn't find that order. Check the order number and email and try again.");
        return;
      }

      setOrder(payload as TrackedOrder);
    } catch {
      setError("We couldn't reach the tracking service. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  const estimated = order ? formatDate(order.estimatedDeliveryAt) : null;
  const delivered = order ? formatDate(order.deliveredAt) : null;
  const placed = order ? formatDate(order.createdAt) : null;

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="field">
          <label className="field-label" htmlFor="orderNumber">
            Order number
          </label>
          <input
            id="orderNumber"
            name="orderNumber"
            required
            autoComplete="off"
            placeholder="GG-1001"
            className="field-input"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="email">
            Email used at checkout
          </label>
          <input id="email" name="email" required type="email" autoComplete="email" className="field-input" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
          {pending ? "Checking…" : "Track Order"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="field-error mt-5 border-l-2 border-current pl-4">
          {error}
        </p>
      ) : null}

      {order ? (
        <div aria-live="polite" className="mt-8 border-t border-line pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl text-navy-950">{order.orderNumber}</p>
              {placed ? <p className="type-meta mt-1">Placed {placed}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="payment" value={order.paymentStatus} />
              <StatusBadge kind="delivery" value={order.deliveryStatus} />
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {order.items.map((item, index) => (
              <li key={`${item.productName}-${index}`} className="text-ink-700">
                {item.productName} &times; {item.quantity}
              </li>
            ))}
          </ul>

          <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-700">Order total</dt>
              <dd className="font-semibold text-navy-950">{formatPrice(order.total)}</dd>
            </div>
            {order.courierName ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-700">Courier</dt>
                <dd className="text-navy-950">{order.courierName}</dd>
              </div>
            ) : null}
            {order.trackingNumber ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-700">Tracking number</dt>
                <dd className="text-navy-950">{order.trackingNumber}</dd>
              </div>
            ) : null}
            {delivered ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-700">Delivered</dt>
                <dd className="text-navy-950">{delivered}</dd>
              </div>
            ) : estimated ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-700">Estimated delivery</dt>
                <dd className="text-navy-950">{estimated}</dd>
              </div>
            ) : null}
          </dl>

          {order.trackingUrl ? (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline mt-5 inline-block text-sm font-semibold text-navy-950"
            >
              Track with courier
            </a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
