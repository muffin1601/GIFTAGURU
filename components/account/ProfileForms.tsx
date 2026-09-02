"use client";

import { useActionState } from "react";
import PasswordField from "@/components/ui/PasswordField";
import { changePasswordAction, updateProfileAction, type ProfileActionState } from "@/lib/actions/profile";

export function ProfileDetailsForm({
  fullName,
  companyName,
  phone,
  email,
}: {
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(updateProfileAction, {});
  const error = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="panel p-6 sm:p-8">
      <h2 className="type-h3">Your details</h2>
      <p className="type-body mt-2 text-sm">Used to personalise your orders and invoices.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="field-label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            required
            autoComplete="name"
            className="field-input"
            aria-invalid={error("fullName") ? "true" : undefined}
          />
          {error("fullName") ? <p role="alert" className="field-error">{error("fullName")}</p> : null}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            autoComplete="tel"
            className="field-input"
            aria-invalid={error("phone") ? "true" : undefined}
          />
          {error("phone") ? <p role="alert" className="field-error">{error("phone")}</p> : <p className="type-meta">Optional</p>}
        </div>

        <div className="field sm:col-span-2">
          <label className="field-label" htmlFor="companyName">Company</label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={companyName}
            autoComplete="organization"
            className="field-input"
            aria-invalid={error("companyName") ? "true" : undefined}
          />
          {error("companyName") ? (
            <p role="alert" className="field-error">{error("companyName")}</p>
          ) : (
            <p className="type-meta">Optional — appears on corporate invoices</p>
          )}
        </div>

        <div className="field sm:col-span-2">
          <label className="field-label" htmlFor="email">Email</label>
          {/* Read-only: the address identifies the account and changing it
              needs a verification round-trip, which is a separate flow. */}
          <input id="email" value={email} readOnly disabled className="field-input" />
          <p className="type-meta">Contact us if you need to change your account email.</p>
        </div>
      </div>

      <Feedback state={state} />

      <button type="submit" disabled={pending} className="btn btn-primary mt-7">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(changePasswordAction, {});

  return (
    <form action={formAction} className="panel mt-6 p-6 sm:p-8">
      <h2 className="type-h3">Password</h2>
      <p className="type-body mt-2 text-sm">Choose a new password for signing in.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="password"
          name="password"
          label="New password"
          required
          minLength={8}
          autoComplete="new-password"
          hint="At least 8 characters."
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <Feedback state={state} />

      <button type="submit" disabled={pending} className="btn btn-secondary mt-7">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function Feedback({ state }: { state: ProfileActionState }) {
  return (
    <div aria-live="polite">
      {state.error ? (
        <p role="alert" className="field-error mt-5 border-l-2 border-current pl-4">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="mt-5 border-l-2 border-gold-500 pl-4 text-sm text-navy-950">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
