"use client";

import { useActionState } from "react";
import Link from "next/link";
import PasswordField from "@/components/ui/PasswordField";

type AuthState = { error?: string; success?: string };

export default function AuthForm({
  title,
  subtitle,
  action,
  mode,
}: {
  title: string;
  subtitle: string;
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "signup" | "forgot" | "reset";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="mx-auto max-w-md">
      <h1 className="type-h2">{title}</h1>
      <p className="type-body mt-3">{subtitle}</p>

      <form action={formAction} className="mt-9 flex flex-col gap-5">
        {mode === "signup" ? (
          <div className="field">
            <label className="field-label" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" required autoComplete="name" className="field-input" />
          </div>
        ) : null}

        {mode !== "reset" ? (
          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" name="email" required autoComplete="email" className="field-input" />
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

        <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
          {pending ? "Please wait…" : title}
        </button>
      </form>

      <div className="mt-8 flex justify-between gap-4 border-t border-line pt-6 text-sm font-medium">
        {mode !== "login" ? (
          <Link href="/login" className="link-underline text-navy-950">Log in</Link>
        ) : (
          <Link href="/signup" className="link-underline text-navy-950">Create account</Link>
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
