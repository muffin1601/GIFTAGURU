"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import PasswordField from "@/components/ui/PasswordField";
import { resendConfirmationAction } from "@/lib/actions/auth";
import type { AuthState } from "@/lib/actions/auth";

export default function AuthForm({
  title,
  subtitle,
  action,
  mode,
  next,
  notice,
}: {
  title: string;
  subtitle: string;
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "signup" | "forgot" | "reset";
  /** Destination to return to after authenticating; already origin-checked server-side. */
  next?: string;
  /** Page-level confirmation banner, e.g. after an email link is verified. */
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmationAction, {} as AuthState);

  // Mirrors the typed address so the resend form can submit it without the
  // customer retyping. `state.email` (echoed by the action) wins once a
  // submission has round-tripped.
  const [email, setEmail] = useState("");
  const resendEmail = state.email ?? email;

  const needsConfirmation = state.code === "email_not_confirmed";
  const alreadyRegistered = state.code === "user_already_exists";

  const withNext = (href: string) => (next ? `${href}?next=${encodeURIComponent(next)}` : href);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="type-h2">{title}</h1>
      <p className="type-body mt-3">{subtitle}</p>

      {/* Dismissed implicitly by submitting: the action's own state replaces
          it below, so a stale "email confirmed" can't sit above a live error. */}
      {notice && !state.error && !state.success ? (
        <p
          role="status"
          className="mt-6 border-l-2 border-gold-500 bg-cream-100 py-3 pl-4 text-sm font-medium text-navy-950"
        >
          {notice}
        </p>
      ) : null}

      <form action={formAction} className="mt-9 flex flex-col gap-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {mode === "signup" ? (
          <div className="field">
            <label className="field-label" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" required autoComplete="name" className="field-input" />
          </div>
        ) : null}

        {mode !== "reset" ? (
          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className="field-input"
              defaultValue={state.email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        ) : null}

        {mode === "login" || mode === "signup" || mode === "reset" ? (
          <PasswordField
            id="password"
            name="password"
            label="Password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            hint={mode !== "login" ? "At least 8 characters." : undefined}
          />
        ) : null}

        {mode === "reset" ? (
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        ) : null}

        <div aria-live="polite">
          {state.error ? (
            <p role="alert" className="field-error border-l-2 border-current pl-4">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p role="status" className="border-l-2 border-gold-500 pl-4 text-sm text-navy-950">
              {state.success}
            </p>
          ) : null}
        </div>

        {/* Recovery route out of an expired or consumed reset link. */}
        {state.code === "session_expired" && mode === "reset" ? (
          <Link href="/forgot-password" className="link-underline self-start text-sm font-medium text-navy-950">
            Request a new reset link
          </Link>
        ) : null}

        {alreadyRegistered ? (
          <div className="flex gap-4 text-sm font-medium">
            <Link href={withNext("/login")} className="link-underline text-navy-950">Log in</Link>
            <Link href="/forgot-password" className="link-underline text-navy-950">Reset password</Link>
          </div>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
          {pending ? "Please wait…" : title}
        </button>
      </form>

      {/*
        Sibling rather than nested form -- HTML forbids nesting, and this needs
        its own action so resending doesn't re-submit the credentials above.
      */}
      {needsConfirmation ? (
        <form action={resendAction} className="mt-6 border-t border-line pt-6">
          <p className="type-body text-sm">
            Didn&apos;t get the email? Check your spam folder, or send a new confirmation link to{" "}
            <strong className="text-navy-950">{resendEmail}</strong>.
          </p>
          <input type="hidden" name="email" value={resendEmail} />
          {next ? <input type="hidden" name="next" value={next} /> : null}

          <button
            type="submit"
            disabled={resendPending || !resendEmail}
            className="btn btn-secondary mt-4 w-full"
          >
            {resendPending ? "Sending…" : "Resend confirmation email"}
          </button>

          <div aria-live="polite">
            {resendState.error ? (
              <p role="alert" className="field-error mt-3 border-l-2 border-current pl-4">
                {resendState.error}
              </p>
            ) : null}
            {resendState.success ? (
              <p role="status" className="mt-3 border-l-2 border-gold-500 pl-4 text-sm text-navy-950">
                {resendState.success}
              </p>
            ) : null}
          </div>
        </form>
      ) : null}

      <div className="mt-8 flex justify-between gap-4 border-t border-line pt-6 text-sm font-medium">
        {mode !== "login" ? (
          <Link href={withNext("/login")} className="link-underline text-navy-950">Log in</Link>
        ) : (
          <Link href={withNext("/signup")} className="link-underline text-navy-950">Create account</Link>
        )}
        {mode !== "forgot" && mode !== "reset" ? (
          <Link href="/forgot-password" className="link-underline text-navy-950">
            Forgot password?
          </Link>
        ) : null}
      </div>
    </div>
  );
}
