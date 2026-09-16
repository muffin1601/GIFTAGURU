"use client";

import { useEffect, useRef } from "react";
import { trackViewItem, type Ga4Item } from "@/lib/analytics/ga4";

export default function ViewItemTracker({ item }: { item: Ga4Item }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackViewItem(item);
  }, [item]);
  return null;
}
