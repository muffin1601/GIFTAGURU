"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase's hosted email-confirmation and password-reset links verify the
 * token server-side, then redirect here with the session as a URL hash
 * fragment (#access_token=...&refresh_token=...) -- classic implicit-grant
 * behaviour, designed for pure client-side apps.
 *
 * A fragment never reaches our Next.js server (browsers strip it before
 * sending the request), so the server-rendered destination page saw no
 * session and the confirmation silently did nothing. This page runs
 * client-side specifically to read that fragment, hand the tokens to
 * Supabase's browser client (which persists them as the same cookies the
 * server reads), and only then move on to the real destination.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      const next = searchParams.get("next") || "/account";
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const hashError = hash.get("error_description");

      // Every setState below runs after this await, not synchronously in the
      // effect body -- required so a fast confirm doesn't cascade renders.
      await Promise.resolve();
      if (cancelled) return;

      if (hashError) {
        setError(hashError.replace(/\+/g, " "));
        return;
      }
      if (!accessToken || !refreshToken) {
        setError("This confirmation link is missing or has already been used.");
        return;
      }

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (cancelled) return;

      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      router.replace(next);
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <Container className="max-w-lg py-24 sm:py-32">
        <span className="type-eyebrow">Link expired</span>
        <h1 className="type-h1 mt-4">We couldn&apos;t confirm that link</h1>
        <p className="type-lead mt-5">{error}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/login">Back to login</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-lg py-24 text-center sm:py-32">
      <p className="type-body">Confirming your account&hellip;</p>
    </Container>
  );
}
