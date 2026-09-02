"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { createClient, SupabaseConfigError } from "@/lib/supabase/client";
import { claimGuestCartAction } from "@/lib/actions/cart";

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

/**
 * Every failure below used to render the same "Link expired" screen, which was
 * wrong for most of them and impossible to diagnose from a screenshot. The
 * `kind` drives distinct copy and, importantly, a distinct next action: an
 * expired link needs a new one, a missing fragment needs the URL checking, a
 * misconfigured deployment needs an operator.
 */
type CallbackFailure = {
  kind: "expired" | "incomplete" | "config" | "session" | "unknown";
  detail?: string;
};

const FAILURE_COPY: Record<
  CallbackFailure["kind"],
  { eyebrow: string; heading: string; body: string; primary: React.ReactNode }
> = {
  expired: {
    eyebrow: "Link expired",
    heading: "This link has expired",
    body: "Password and confirmation links can only be used once, and requesting a new one immediately cancels any earlier link. Send yourself a fresh link to continue.",
    primary: <Button href="/forgot-password">Send a new link</Button>,
  },
  incomplete: {
    eyebrow: "Invalid link",
    heading: "This link is incomplete",
    body: "The security details this link carries didn't reach us. This usually means the address was altered in transit, or opened from an app that trims long links. Try opening it directly from your email in a browser.",
    primary: <Button href="/forgot-password">Send a new link</Button>,
  },
  config: {
    eyebrow: "Unavailable",
    heading: "We can't verify links right now",
    body: "This is a problem on our side, not with your link — requesting a new one won't help. Please contact us and we'll sort it out.",
    primary: <Button href="/login">Back to login</Button>,
  },
  session: {
    eyebrow: "Sign-in failed",
    heading: "We couldn't sign you in",
    body: "Your link was recognised, but we couldn't start a session with it. Requesting a fresh link usually resolves this.",
    primary: <Button href="/forgot-password">Send a new link</Button>,
  },
  unknown: {
    eyebrow: "Something went wrong",
    heading: "We couldn't complete that link",
    body: "Something unexpected happened while verifying your link. Please try a fresh one, and contact us if it keeps happening.",
    primary: <Button href="/forgot-password">Send a new link</Button>,
  },
};

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<CallbackFailure | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      const next = searchParams.get("next") || "/account";

      // Establishing a session here is opt-IN, not the default.
      //
      // Only password recovery genuinely needs one: /reset-password calls
      // updateUser() server-side, which requires the session cookie to already
      // exist. Everything else -- email confirmation -- should land on the
      // login page instead.
      //
      // Inverted deliberately rather than checking for `flow=confirm`: links
      // generated before this behaviour existed carry no `flow` at all, and
      // those emails are already sitting in customers' inboxes. Defaulting to
      // the confirm path means they behave correctly too.
      const isRecoveryFlow =
        searchParams.get("flow") === "recovery" || next.startsWith("/reset-password");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const hashError = hash.get("error_description");

      // Every setState below runs after this await, not synchronously in the
      // effect body -- required so a fast confirm doesn't cascade renders.
      await Promise.resolve();
      if (cancelled) return;

      if (hashError) {
        // Supabase reports a rejected token here, most commonly otp_expired:
        // recovery tokens are single-use, and generating a new one invalidates
        // every earlier link for that address.
        const code = hash.get("error_code") ?? undefined;
        setError({ kind: "expired", detail: code ?? hashError.replace(/\+/g, " ") });
        return;
      }

      // Email confirmation: Supabase's verify endpoint already marked the
      // address confirmed before redirecting here, so the tokens in the
      // fragment are surplus -- deliberately left unconsumed so the customer
      // arrives at the login page signed out, rather than being signed in and
      // then back out again. Their guest cart is merged when they log in.
      if (!isRecoveryFlow) {
        router.replace(`/login?confirmed=1&next=${encodeURIComponent(next)}`);
        return;
      }

      // No tokens and no error means the fragment never arrived -- typically a
      // host redirect (www to apex, or http to https) that dropped it, since a
      // fragment is client-side only and some redirect chains discard it.
      if (!accessToken || !refreshToken) {
        setError({
          kind: "incomplete",
          detail: accessToken ? "refresh_token missing" : "no tokens in URL fragment",
        });
        return;
      }

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (cancelled) return;

      if (sessionError) {
        setError({ kind: "session", detail: sessionError.message });
        return;
      }

      // Deliberately NOT awaited. Merging the guest cart is a convenience;
      // reaching the password form is the thing the customer actually came
      // for, and nothing about the merge should be able to delay or block it.
      // Awaiting a server action here meant a slow or failing one (a pending
      // migration, a database blip) held up navigation -- and before this had
      // a catch, left the page on "Confirming your account..." forever.
      void claimGuestCartAction().catch(() => {
        // Non-fatal: the guest cart cookie survives and merges on next sign-in.
      });

      router.replace(next);
    }

    // Any unanticipated throw must surface as the error screen rather than an
    // indefinite spinner.
    void confirm().catch((thrown: unknown) => {
      if (cancelled) return;

      // A misconfigured deployment and an expired link are indistinguishable
      // to the customer but need entirely different fixes, so say which it is.
      if (thrown instanceof SupabaseConfigError) {
        console.error(thrown.message);
        setError({ kind: "config", detail: thrown.message });
        return;
      }

      console.error("Auth callback failed", thrown);
      setError({ kind: "unknown", detail: thrown instanceof Error ? thrown.message : String(thrown) });
    });
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    const copy = FAILURE_COPY[error.kind];
    return (
      <Container className="max-w-lg py-24 sm:py-32">
        <span className="type-eyebrow">{copy.eyebrow}</span>
        <h1 className="type-h1 mt-4">{copy.heading}</h1>
        <p className="type-lead mt-5">{copy.body}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          {copy.primary}
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
        {/* Short technical reason, kept small and secondary. It is an auth
            link status (e.g. "otp_expired"), not internal state, and having it
            on screen turns a support ticket into a one-line answer. */}
        {error.detail ? (
          <p className="type-meta mt-8 border-t border-line pt-5">Reference: {error.detail}</p>
        ) : null}
      </Container>
    );
  }

  return (
    <Container className="max-w-lg py-24 text-center sm:py-32">
      <p className="type-body">Confirming your account&hellip;</p>
    </Container>
  );
}
