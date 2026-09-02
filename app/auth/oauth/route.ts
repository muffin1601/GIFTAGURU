import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeGuestCartIntoUser } from "@/lib/cart/service";
import { safeNextPath } from "@/lib/auth/redirect";
import { logger, errorMessage } from "@/lib/logger";

/**
 * OAuth return endpoint.
 *
 * Deliberately a Route Handler, not a page, and at a different path from
 * /auth/callback. The two flows are genuinely different:
 *
 *   - Email links (PKCE-less magic/recovery) return tokens in a URL *fragment*,
 *     which never reaches the server -- hence /auth/callback is a client page.
 *   - OAuth returns an authorization *code* as a query parameter, which the
 *     server can read and exchange directly. Doing it here means the session
 *     cookie is already set on the redirect response, so the destination page
 *     renders authenticated on its first request with no client round-trip.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));

  // Google reports a declined consent screen here rather than by returning a
  // code. Surface it on the login page instead of a blank redirect.
  const oauthError = searchParams.get("error");
  if (oauthError) {
    logger.warn("auth.google.declined", { error: oauthError });
    return NextResponse.redirect(new URL(`/login?authError=${encodeURIComponent(oauthError)}`, origin));
  }

  const code = searchParams.get("code");
  if (!code) {
    logger.warn("auth.google.missing_code");
    return NextResponse.redirect(new URL("/login?authError=invalid_link", origin));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      logger.warn("auth.google.exchange_failed", { message: error?.message });
      return NextResponse.redirect(new URL("/login?authError=access_denied", origin));
    }

    // Same courtesy as password sign-in: a basket built while browsing as a
    // guest survives signing in. Never allowed to block the redirect.
    await mergeGuestCartIntoUser(data.user.id).catch(() => null);

    logger.info("auth.google.succeeded", { userId: data.user.id });
    return NextResponse.redirect(new URL(next, origin));
  } catch (error) {
    logger.error("auth.google.unexpected", { message: errorMessage(error) });
    return NextResponse.redirect(new URL("/login?authError=unknown", origin));
  }
}
