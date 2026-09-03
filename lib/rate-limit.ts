import "server-only";

/**
 * Small in-process rate limiter for unauthenticated public endpoints.
 *
 * Deliberately modest in scope. It is a fixed-window counter held in module
 * memory, so it is per-instance: it will not coordinate across a horizontally
 * scaled deployment, and a serverless cold start resets it. That is acceptable
 * for what it defends against here -- casual scripted abuse of the lead form,
 * the order-tracking lookup and the logo upload -- and it is strictly better
 * than the nothing that preceded it. An edge/Redis limiter is the right answer
 * at real traffic; see the "Remaining Risks" section of the QA report.
 *
 * The previous ad-hoc `Map` in the leads route was never pruned, so it grew
 * one entry per distinct client IP for the lifetime of the process. Entries
 * here are swept on write and the table is hard-capped, so memory is bounded
 * regardless of how many distinct addresses are seen.
 */

interface Window {
  count: number;
  /** Epoch ms at which this window expires and the count resets. */
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** Ceiling on distinct tracked keys, so a spoofed-IP flood cannot exhaust memory. */
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }

  // Still oversized after dropping expired windows: evict oldest-first. Map
  // preserves insertion order, so this drops the least recently created.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds the caller should wait before retrying. Zero when `ok`. */
  retryAfter: number;
}

/**
 * Counts one hit against `key`. Returns `ok: false` once `limit` hits have
 * been recorded inside `windowMs`.
 *
 * Callers should consume the attempt BEFORE doing expensive work, so that
 * rejected input is also throttled -- otherwise an attacker gets unlimited
 * free validation.
 */
export function consume(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client address.
 *
 * `x-forwarded-for` is client-controllable in principle, but every supported
 * deployment target (Vercel, and any reverse proxy that is configured
 * correctly) overwrites it with the real peer address. There is no more
 * trustworthy source available to a route handler, so it is used with that
 * caveat and the bounded table above as the backstop.
 */
export async function clientKey(scope: string): Promise<string> {
  // Imported lazily rather than at module scope: `next/headers` only resolves
  // inside the Next build, and keeping it out of the top level lets the pure
  // counter above be unit-tested under plain `node --test`.
  const { headers } = await import("next/headers");
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip")?.trim() || "unknown";
  return `${scope}:${ip}`;
}

/** Standard 429 body plus the `Retry-After` header clients are expected to honour. */
export function tooManyRequests(message: string, retryAfter: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "content-type": "application/json",
      "retry-after": String(retryAfter),
    },
  });
}
