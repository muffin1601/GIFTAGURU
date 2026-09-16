"use client";

import { useEffect, useRef } from "react";
import { trackPurchase, type Ga4Item } from "@/lib/analytics/ga4";

export default function PurchaseTracker({ transactionId, value, tax, shipping, items }: { transactionId: string; value: number; tax: number; shipping: number; items: Ga4Item[] }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackPurchase({ transactionId, value, tax, shipping, items });
  }, [transactionId, value, tax, shipping, items]);
  return null;
}
