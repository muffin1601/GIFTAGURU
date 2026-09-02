/**
 * Open-redirect guard for the `?next=` parameter.
 *
 * The middleware stamps `?next=<pathname>` onto its login redirect and the
 * checkout auth gate does the same, so that value is attacker-controllable
 * (anyone can send a victim a /login?next=... link). Only same-origin,
 * absolute-path destinations are honoured; everything else falls back.
 */

const DEFAULT_DESTINATION = "/account";

export function safeNextPath(value: unknown, fallback: string = DEFAULT_DESTINATION): string {
  if (typeof value !== "string" || value.length === 0) return fallback;

  // Must be a site-relative absolute path. Rejects "https://evil.test",
  // protocol-relative "//evil.test", and backslash variants that some
  // browsers normalise to "//".
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  // Never bounce a freshly authenticated user back into the auth funnel --
  // the middleware would only redirect them out again.
  const path = value.split("?")[0] ?? "";
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"];
  if (authRoutes.some((route) => path === route || path.startsWith(`${route}/`))) return fallback;

  return value;
}
