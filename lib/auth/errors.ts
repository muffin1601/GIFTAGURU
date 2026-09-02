import type { AuthError } from "@supabase/supabase-js";

/**
 * Translates Supabase auth errors into customer-facing copy.
 *
 * Supabase's raw `error.message` was previously surfaced verbatim, which is
 * how "Email not confirmed" ended up in the UI as a dead end with no recovery
 * action. Returning a stable `code` alongside the message lets the form render
 * the right affordance (a resend button, a link to signup) instead of just
 * printing a sentence.
 */

export type AuthErrorCode =
  | "email_not_confirmed"
  | "invalid_credentials"
  | "user_already_exists"
  | "rate_limited"
  | "weak_password"
  | "session_expired"
  | "network"
  | "unknown";

export type MappedAuthError = { code: AuthErrorCode; message: string };

/** Supabase's `code` field is authoritative when present; message text is the fallback. */
export function mapAuthError(error: AuthError | null | undefined): MappedAuthError {
  if (!error) return { code: "unknown", message: "Something went wrong. Please try again." };

  const code = error.code ?? "";
  const text = (error.message ?? "").toLowerCase();

  if (code === "email_not_confirmed" || text.includes("email not confirmed")) {
    return {
      code: "email_not_confirmed",
      message: "Your email address hasn't been confirmed yet. Check your inbox for the confirmation link.",
    };
  }

  if (code === "invalid_credentials" || text.includes("invalid login credentials")) {
    return { code: "invalid_credentials", message: "That email and password combination doesn't match an account." };
  }

  if (code === "user_already_exists" || code === "email_exists" || text.includes("already registered")) {
    return { code: "user_already_exists", message: "An account already exists for this email address." };
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429 ||
    text.includes("rate limit") ||
    text.includes("too many requests")
  ) {
    return { code: "rate_limited", message: "Too many attempts. Please wait a minute and try again." };
  }

  if (code === "weak_password" || text.includes("password should be")) {
    return { code: "weak_password", message: "Choose a stronger password of at least 8 characters." };
  }

  if (
    code === "session_not_found" ||
    code === "refresh_token_not_found" ||
    text.includes("auth session missing") ||
    text.includes("token has expired") ||
    text.includes("invalid token")
  ) {
    return {
      code: "session_expired",
      message: "This link has expired or was already used. Please request a new one.",
    };
  }

  if (text.includes("fetch failed") || text.includes("network")) {
    return { code: "network", message: "We couldn't reach the authentication service. Check your connection and retry." };
  }

  // Deliberately generic: never surface an unrecognised provider message,
  // which can leak internal configuration details.
  return { code: "unknown", message: "We couldn't complete that request. Please try again." };
}
