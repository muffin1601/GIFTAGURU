"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Rescues auth errors that Supabase delivers to the wrong page.
 *
 * When a confirmation or recovery link fails -- expired token, already-used
 * token, or a `redirect_to` that didn't match the project's allow list --
 * Supabase appends the reason to the URL as a hash fragment and sends the
 * browser to whatever page it decided on, frequently the site root:
 *
 *   http://localhost:3000/#error=access_denied&error_code=otp_expired&...
 *
 * A fragment never reaches the server, so the page renders as an ordinary
 * homepage and the customer is left with no idea their link failed. This
 * watches for that fragment anywhere in the app and routes it to the login
 * page with a readable message.
 *
 * Mounted globally rather than on /auth/callback specifically, precisely
 * because the failure case is Supabase NOT landing on the callback.
 */
export default function AuthHashErrorWatcher() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("error")) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const code = params.get("error_code");
    const description = params.get("error_description");
    if (!code && !description) return;

    // Strip the fragment before navigating, so a back-button press doesn't
    // replay this redirect forever.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    router.replace(`/login?authError=${encodeURIComponent(code ?? "invalid_link")}`);
  }, [router]);

  return null;
}
