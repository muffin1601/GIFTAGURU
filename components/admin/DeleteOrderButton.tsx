"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteOrderAction } from "@/lib/actions/admin";

export default function DeleteOrderButton({
  orderId,
  orderNumber,
  redirectAfterDelete = false,
  compact = false,
}: {
  orderId: string;
  orderNumber: string;
  redirectAfterDelete?: boolean;
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteOrderAction, {});

  useEffect(() => {
    if (!state.success) return;
    dialogRef.current?.close();
    router.refresh();
  }, [router, state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={
          compact
            ? "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-700 hover:underline"
            : "btn btn-secondary w-full border-red-300 text-red-700 hover:border-red-700"
        }
        aria-label={`Delete order ${orderNumber}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete{compact ? "" : " order"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        className="m-auto w-[min(92vw,30rem)] rounded-[var(--radius-hanna-card)] border border-line bg-surface p-0 text-ink-900 shadow-2xl backdrop:bg-navy-950/65"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Permanent action</p>
              <h2 id={titleId} className="mt-2 font-display text-2xl text-navy-950">Delete order?</h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="p-1 text-ink-600 hover:text-navy-950 disabled:opacity-50"
              aria-label="Close confirmation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-ink-700">
            Order <strong className="text-navy-950">{orderNumber}</strong> and its payment, item,
            shipment, email, and status history will be permanently deleted. This cannot be undone.
          </p>

          <form action={formAction} className="mt-6">
            <input type="hidden" name="orderId" value={orderId} />
            {redirectAfterDelete ? <input type="hidden" name="redirectToOrders" value="true" /> : null}
            {state.error ? <p className="mb-3 field-error">{state.error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                disabled={pending}
                className="btn btn-secondary"
              >
                Keep order
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn border-red-700 bg-red-700 text-white hover:bg-red-800"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                {pending ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
