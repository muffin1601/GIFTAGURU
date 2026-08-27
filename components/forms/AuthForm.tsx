"use client";

import { useActionState } from "react";
import Link from "next/link";

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
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 ring-1 ring-navy-950/5">
      <h1 className="font-display text-3xl text-navy-950">{title}</h1>
      <p className="mt-2 text-sm text-ink-700">{subtitle}</p>
      <form action={formAction} className="mt-8 space-y-4">
        {mode === "signup" ? (
          <label className="block text-sm font-semibold text-navy-950">
            Full name
            <input name="fullName" required className="mt-2 w-full rounded-xl border border-navy-950/10 px-4 py-3 font-normal outline-none focus:border-navy-900" />
          </label>
        ) : null}
        {mode !== "reset" ? (
          <label className="block text-sm font-semibold text-navy-950">
            Email
            <input type="email" name="email" required className="mt-2 w-full rounded-xl border border-navy-950/10 px-4 py-3 font-normal outline-none focus:border-navy-900" />
          </label>
        ) : null}
        {mode === "login" || mode === "signup" || mode === "reset" ? (
          <label className="block text-sm font-semibold text-navy-950">
            Password
            <input type="password" name="password" required minLength={8} className="mt-2 w-full rounded-xl border border-navy-950/10 px-4 py-3 font-normal outline-none focus:border-navy-900" />
          </label>
        ) : null}
        {mode === "reset" ? (
          <label className="block text-sm font-semibold text-navy-950">
            Confirm password
            <input type="password" name="confirmPassword" required minLength={8} className="mt-2 w-full rounded-xl border border-navy-950/10 px-4 py-3 font-normal outline-none focus:border-navy-900" />
          </label>
        ) : null}
        {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p> : null}
        <button disabled={pending} className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 disabled:opacity-60">
          {pending ? "Please wait..." : title}
        </button>
      </form>
      <div className="mt-6 flex justify-between text-sm font-semibold text-navy-950">
        {mode !== "login" ? <Link href="/login">Log in</Link> : <Link href="/signup">Create account</Link>}
        {mode !== "forgot" && mode !== "reset" ? <Link href="/forgot-password">Forgot password?</Link> : null}
      </div>
    </div>
  );
}
