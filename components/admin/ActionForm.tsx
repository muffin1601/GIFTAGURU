"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

type State = { error?: string; success?: string };

export default function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-3",
  confirmMessage,
  onSuccess,
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  /** When set, the submit button requires a second, explicit confirm click
   * before the form actually submits -- for destructive actions, in place of
   * the browser's native confirm() so the prompt matches the rest of the UI. */
  confirmMessage?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (prevState: State, formData: FormData) => {
    const result = await action(prevState, formData);
    if (result.success) onSuccess?.();
    return result;
  }, {});
  const [confirming, setConfirming] = useState(false);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !confirming) {
          event.preventDefault();
          setConfirming(true);
        }
      }}
    >
      {children}
      {state.error ? <p className="field-error">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-navy-950">{state.success}</p> : null}

      {confirmMessage && confirming ? (
        <div className="flex flex-wrap items-center gap-3 border border-line-strong bg-sunken p-3">
          <p className="text-sm text-navy-950">{confirmMessage}</p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="btn btn-secondary py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 btn btn-primary py-1.5 text-xs"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Confirm {submitLabel}
            </button>
          </div>
        </div>
      ) : (
        <button disabled={pending} className="inline-flex items-center justify-center gap-2 btn btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </button>
      )}
    </form>
  );
}

export function AdminSelect({
  name,
  defaultValue,
  options,
  labels,
}: {
  name: string;
  defaultValue?: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <select name={name} defaultValue={defaultValue} className="field-input text-sm">
      {options.map((option) => (
        <option key={option} value={option}>
          {labels?.[option] ?? option.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field-input text-sm ${props.className ?? ""}`} />;
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field-input text-sm ${props.className ?? ""}`} />;
}
