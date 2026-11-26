"use client";

import { useCallback, useSyncExternalStore } from "react";
import { COLUMNS, type ColumnKey } from "@/lib/admin/products/grid-schema";

export type GridPrefs = {
  order: ColumnKey[];
  hidden: ColumnKey[];
  widths: Partial<Record<ColumnKey, number>>;
  pageSize?: number;
};

const KEY = "gg-admin:product-grid:v1";
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cacheValue: GridPrefs | undefined;
let memoryFallback: string | null = null;

export const DEFAULT_PREFS: GridPrefs = {
  order: COLUMNS.map((column) => column.key),
  hidden: COLUMNS.filter((column) => !column.defaultVisible).map((column) => column.key),
  widths: {},
};

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memoryFallback;
  }
}

/** Merges stored prefs with the current column list so new columns appear and removed ones vanish. */
function normalize(raw: string | null): GridPrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const stored = JSON.parse(raw) as Partial<GridPrefs>;
    const known = new Set(COLUMNS.map((column) => column.key));
    const order = (stored.order ?? []).filter((key) => known.has(key));
    for (const column of COLUMNS) if (!order.includes(column.key)) order.push(column.key);
    return {
      order,
      hidden: (stored.hidden ?? DEFAULT_PREFS.hidden).filter((key) => known.has(key)),
      widths: stored.widths ?? {},
      pageSize: typeof stored.pageSize === "number" ? stored.pageSize : undefined,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function getSnapshot(): GridPrefs {
  const raw = readRaw();
  if (raw !== cacheRaw || !cacheValue) {
    cacheRaw = raw;
    cacheValue = normalize(raw);
  }
  return cacheValue;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Per-browser table preferences. useSyncExternalStore renders the defaults on
 * the server and during hydration, then switches to the stored layout, so
 * there is no hydration mismatch. Storage failures (private mode, blocked
 * storage) degrade to in-memory prefs rather than breaking the grid.
 */
export function usePersistentPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PREFS);
  const update = useCallback((updater: (current: GridPrefs) => GridPrefs) => {
    const next = JSON.stringify(updater(getSnapshot()));
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      memoryFallback = next;
    }
    listeners.forEach((listener) => listener());
  }, []);
  return [prefs, update] as const;
}
