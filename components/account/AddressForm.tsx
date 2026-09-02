"use client";

import { useActionState, useEffect } from "react";
import type { Address } from "@prisma/client";
import { createAddressAction, updateAddressAction, type AddressActionState } from "@/lib/actions/addresses";

/**
 * Add/edit form for a saved address.
 *
 * Deliberately uncontrolled (`defaultValue`): the server action is the source
 * of truth for validation, and mirroring every field into React state would
 * add re-render churn for no benefit. Field-level messages come back from the
 * action keyed by field name.
 */
export default function AddressForm({
  address,
  onDone,
}: {
  /** Present when editing; absent when adding. */
  address?: Address;
  onDone?: () => void;
}) {
  const isEdit = Boolean(address);
  const [state, formAction, pending] = useActionState<AddressActionState, FormData>(
    isEdit ? updateAddressAction : createAddressAction,
    {},
  );

  // Closing on success is the caller's decision (the list collapses the form),
  // but only once the action actually reports success. In an effect rather
  // than the render body -- calling a parent's setState while rendering warns
  // and can loop.
  useEffect(() => {
    if (state.success) onDone?.();
  }, [state.success, onDone]);

  const error = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="panel p-6">
      {isEdit ? <input type="hidden" name="id" value={address!.id} /> : null}

      <h2 className="type-h3">{isEdit ? "Edit address" : "Add a new address"}</h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="field-label" htmlFor="label">Address type</label>
          <select id="label" name="label" defaultValue={address?.label ?? "home"} className="field-input">
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Field
          id="fullName"
          label="Full name"
          defaultValue={address?.fullName}
          autoComplete="name"
          error={error("fullName")}
          required
        />

        <Field
          id="phone"
          label="Phone"
          type="tel"
          defaultValue={address?.phone}
          autoComplete="tel"
          error={error("phone")}
          required
        />

        <Field
          id="postalCode"
          label="PIN code"
          inputMode="numeric"
          defaultValue={address?.postalCode}
          autoComplete="postal-code"
          error={error("postalCode")}
          required
        />

        <div className="sm:col-span-2">
          <Field
            id="line1"
            label="Address line 1"
            defaultValue={address?.line1}
            autoComplete="address-line1"
            error={error("line1")}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Field
            id="line2"
            label="Address line 2"
            hint="Optional"
            defaultValue={address?.line2 ?? ""}
            autoComplete="address-line2"
            error={error("line2")}
          />
        </div>

        <div className="sm:col-span-2">
          <Field
            id="landmark"
            label="Landmark"
            hint="Optional — helps couriers find you"
            defaultValue={address?.landmark ?? ""}
            error={error("landmark")}
          />
        </div>

        <Field
          id="city"
          label="City"
          defaultValue={address?.city}
          autoComplete="address-level2"
          error={error("city")}
          required
        />

        <Field
          id="state"
          label="State"
          defaultValue={address?.state}
          autoComplete="address-level1"
          error={error("state")}
          required
        />
      </div>

      <label className="mt-6 flex items-center gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="h-4 w-4 accent-navy-950"
        />
        Use this as my default delivery address
      </label>

      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="field-error mt-5 border-l-2 border-current pl-4">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Save address"}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className="btn btn-secondary">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="field-input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="type-meta">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
