/**
 * Renders an order status enum as customer-readable copy.
 *
 * The order list previously printed raw enum values ("partially_refunded",
 * "out_for_delivery"), which read as database internals. Unknown values fall
 * back to a de-underscored version rather than rendering nothing, so a new
 * enum member degrades gracefully instead of disappearing.
 */

const TONE = {
  positive: "border-green-700 text-green-800",
  pending: "border-gold-500 text-gold-600",
  negative: "border-red-700 text-red-700",
  neutral: "border-line-strong text-ink-700",
} as const;

type Tone = keyof typeof TONE;

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Payment pending", tone: "pending" },
  paid: { label: "Paid", tone: "positive" },
  failed: { label: "Payment failed", tone: "negative" },
  refunded: { label: "Refunded", tone: "neutral" },
  partially_refunded: { label: "Partially refunded", tone: "neutral" },
};

const DELIVERY: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Not dispatched", tone: "neutral" },
  processing: { label: "Processing", tone: "pending" },
  shipped: { label: "Shipped", tone: "pending" },
  out_for_delivery: { label: "Out for delivery", tone: "pending" },
  delivered: { label: "Delivered", tone: "positive" },
  cancelled: { label: "Cancelled", tone: "negative" },
  returned: { label: "Returned", tone: "neutral" },
};

export default function StatusBadge({ kind, value }: { kind: "payment" | "delivery"; value: string }) {
  const map = kind === "payment" ? PAYMENT : DELIVERY;
  const entry = map[value] ?? { label: value.replaceAll("_", " "), tone: "neutral" as Tone };

  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${TONE[entry.tone]}`}
    >
      {entry.label}
    </span>
  );
}
