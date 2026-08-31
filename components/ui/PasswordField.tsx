"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required,
  minLength,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const hintId = useId();

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-describedby={hint ? hintId : undefined}
          className="field-input pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-500 transition-colors duration-200 hover:text-navy-950"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {hint ? (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
