"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

type State = { error?: string; success?: string };

export default function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-3",
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {children}
      {state.error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{state.success}</p> : null}
      <button disabled={pending} className="inline-flex items-center justify-center gap-2 btn btn-primary">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </button>
    </form>
  );
}

export function AdminSelect({ name, defaultValue, options }: { name: string; defaultValue?: string; options: string[] }) {
  return (
    <select name={name} defaultValue={defaultValue} className="field-input text-sm">
      {options.map((option) => (
        <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
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
