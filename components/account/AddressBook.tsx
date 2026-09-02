"use client";

import { useActionState, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Address } from "@prisma/client";
import AddressForm from "@/components/account/AddressForm";
import {
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/lib/actions/addresses";

const LABELS: Record<string, string> = { home: "Home", office: "Office", other: "Other" };

export default function AddressBook({ addresses }: { addresses: Address[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (addresses.length === 0 && !adding) {
    return (
      <div className="panel mt-10 p-10 text-center">
        <MapPin className="mx-auto h-6 w-6 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
        <h2 className="type-h3 mt-4">No saved addresses yet</h2>
        <p className="type-body mx-auto mt-3 max-w-md">
          Save the places you send gifts to — home, office, a client site — and pick one at checkout
          instead of retyping it each time.
        </p>
        <button type="button" onClick={() => setAdding(true)} className="btn btn-primary mt-7">
          <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          Add your first address
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="grid gap-5 md:grid-cols-2">
        {addresses.map((address) =>
          editingId === address.id ? (
            <div key={address.id} className="md:col-span-2">
              <AddressForm address={address} onDone={() => setEditingId(null)} />
            </div>
          ) : (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditingId(address.id)}
              // Only meaningful with something to fall back to; the last
              // address is always the default.
              canDelete={addresses.length > 1}
            />
          ),
        )}
      </div>

      {adding ? (
        <div className="mt-6">
          <AddressForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-secondary mt-6">
          <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          Add another address
        </button>
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  canDelete,
}: {
  address: Address;
  onEdit: () => void;
  canDelete: boolean;
}) {
  const [deleteState, deleteAction, deleting] = useActionState<AddressActionState, FormData>(
    deleteAddressAction,
    {},
  );
  const [defaultState, defaultAction, settingDefault] = useActionState<AddressActionState, FormData>(
    setDefaultAddressAction,
    {},
  );
  const [confirming, setConfirming] = useState(false);

  const error = deleteState.error ?? defaultState.error;

  return (
    <div className="panel flex flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="type-eyebrow">{LABELS[address.label ?? "home"] ?? "Other"}</span>
        {address.isDefault ? (
          <span className="inline-flex items-center gap-1.5 border border-gold-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold-600">
            <Star className="h-3 w-3" aria-hidden="true" strokeWidth={2} />
            Default
          </span>
        ) : null}
      </div>

      <address className="mt-4 not-italic">
        <p className="font-display text-lg text-navy-950">{address.fullName}</p>
        <p className="type-body mt-2 text-sm">
          {address.line1}
          {address.line2 ? <>, {address.line2}</> : null}
          {address.landmark ? <><br />Near {address.landmark}</> : null}
          <br />
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="type-meta mt-2">{address.phone}</p>
      </address>

      <div aria-live="polite">
        {error ? (
          <p role="alert" className="field-error mt-4">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5 text-xs font-semibold uppercase tracking-[0.08em]">
        <button type="button" onClick={onEdit} className="link-underline inline-flex items-center gap-1.5 text-navy-950">
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
          Edit
        </button>

        {!address.isDefault ? (
          <form action={defaultAction}>
            <input type="hidden" name="id" value={address.id} />
            <button
              type="submit"
              disabled={settingDefault}
              className="link-underline inline-flex items-center gap-1.5 text-navy-950 disabled:opacity-50"
            >
              <Star className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
              {settingDefault ? "Setting…" : "Set as default"}
            </button>
          </form>
        ) : null}

        {canDelete ? (
          confirming ? (
            // Two-step rather than a window.confirm: deletion is destructive
            // and a native dialog can't be styled or made accessible here.
            <form action={deleteAction} className="flex items-center gap-3">
              <input type="hidden" name="id" value={address.id} />
              <span className="text-ink-700 normal-case tracking-normal">Delete this address?</span>
              <button type="submit" disabled={deleting} className="link-underline text-red-700 disabled:opacity-50">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="link-underline text-ink-700">
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="link-underline inline-flex items-center gap-1.5 text-ink-500"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
              Delete
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
