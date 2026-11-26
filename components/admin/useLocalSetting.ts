"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

/**
 * A small string setting persisted per browser (sidebar collapsed, theme).
 * Hydration-safe: the server and first client render use `fallback`.
 */
export function useLocalSetting<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(listener);
      listeners.set(key, set);
      const onStorage = (event: StorageEvent) => event.key === key && listener();
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {
        memory.set(key, next);
      }
      listeners.get(key)?.forEach((listener) => listener());
    },
    [key],
  );
  return [value, setValue] as const;
}

/** Tracks the OS colour-scheme preference. */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      query.addEventListener("change", listener);
      return () => query.removeEventListener("change", listener);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
}
