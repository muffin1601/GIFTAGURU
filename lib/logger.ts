import "server-only";

/**
 * Minimal structured server logger.
 *
 * Emits one JSON line per event so a log drain (Vercel, Datadog, CloudWatch)
 * can index the fields rather than regex-ing prose. Deliberately tiny -- the
 * point is a consistent shape and a single place that scrubs secrets, not a
 * logging framework.
 */

type LogLevel = "info" | "warn" | "error";

/**
 * Field names that must never reach a log drain. Matching is substring-based
 * and case-insensitive so `razorpayKeySecret`, `access_token`, and
 * `SUPABASE_SERVICE_ROLE_KEY` are all caught by one entry each.
 */
const REDACTED_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "signature",
  "service_role",
];

function scrub(context: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const lower = key.toLowerCase();
    safe[key] = REDACTED_KEYS.some((needle) => lower.includes(needle)) ? "[redacted]" : value;
  }
  return safe;
}

function emit(level: LogLevel, event: string, context: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    level,
    event,
    at: new Date().toISOString(),
    ...scrub(context),
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => emit("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) => emit("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) => emit("error", event, context),
};

/**
 * Reduces an unknown thrown value to a loggable message. Never returns the
 * stack -- stacks go to the console via the thrown error itself, not into
 * structured context that may be shipped to a third party.
 */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
