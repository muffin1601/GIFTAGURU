"use client";

import { cloneElement, isValidElement, useState, type ReactElement } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";

type LeadType = "general" | "contact" | "bulk_order" | "product" | "collection" | "customization" | "chatbot" | "consultation";

interface LeadFormProps {
  type: LeadType;
  source: string;
  compact?: boolean;
  defaults?: Partial<Record<"productId" | "productName" | "productSlug" | "productUrl" | "collectionId" | "collectionName" | "quantity" | "message", string>>;
  showBulkFields?: boolean;
  onSuccess?: () => void;
}

const requirementTypes = [
  "Corporate gifts",
  "Joining kits",
  "Eco-friendly gifts",
  "Premium gifts",
  "Luxury gifts",
  "Custom branding",
  "Bulk order",
  "Other",
];

const quantities = ["5-25", "26-50", "51-100", "101-250", "251-500", "500+"];
const brandingOptions = ["Logo printing", "Custom packaging", "Personalized gifts", "Gift cards/messages", "Not required"];

export default function LeadForm({ type, source, compact = false, defaults = {}, showBulkFields = false, onSuccess }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<{ url: string; fileName: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setUploadingLogo(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);
    const response = await fetch("/api/uploads/logo", { method: "POST", body: uploadData });
    const payload = (await response.json()) as { url?: string; fileName?: string; error?: string };
    setUploadingLogo(false);
    if (!response.ok || !payload.url || !payload.fileName) {
      setMessage(payload.error ?? "Unable to upload logo.");
      setStatus("error");
      return;
    }
    setLogo({ url: payload.url, fileName: payload.fileName });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};

    for (const field of ["name", "email", "phone", "message"]) {
      if (!String(formData.get(field) ?? "").trim()) nextErrors[field] = "Required";
    }
    if (String(formData.get("email") ?? "") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.get("email")))) {
      nextErrors.email = "Enter a valid email";
    }
    if (String(formData.get("phone") ?? "") && !/^[+]?[0-9\s-]{10,15}$/.test(String(formData.get("phone")))) {
      nextErrors.phone = "Enter a valid phone";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    setMessage(null);

    const brandingRequired = formData.get("brandingRequired") === "on";
    const payload = {
      // `defaults` must be spread FIRST. It carries context the form has no
      // input for (productId, productSlug, collectionId, ...) but it also holds
      // `message`, which only seeds the textarea's initial value. Spreading it
      // last overwrote whatever the visitor actually typed with the seed --
      // usually "" -- so the server rejected every submission as too short.
      ...defaults,
      type,
      source,
      name: String(formData.get("name") ?? ""),
      company: String(formData.get("company") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      requirementType: String(formData.get("requirementType") ?? ""),
      quantity: String(formData.get("quantity") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      totalBudget: String(formData.get("totalBudget") ?? ""),
      deliveryDate: String(formData.get("deliveryDate") ?? ""),
      deliveryLocation: String(formData.get("deliveryLocation") ?? ""),
      brandingRequired,
      brandingOptions: formData.getAll("brandingOptions").map(String),
      logoUrl: logo?.url,
      website: String(formData.get("website") ?? ""),
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Unable to submit enquiry.");
      return;
    }

    setStatus("success");
    setMessage(result.message ?? "Thanks. We received your enquiry.");
    form.reset();
    onSuccess?.();
  }

  // A confirmed enquiry replaces the form, so the outcome is unmistakable
  // rather than a small line of green text under a still-filled form.
  if (status === "success") {
    return (
      <div className={compact ? "" : "panel p-8 sm:p-10"}>
        <Check className="h-6 w-6 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
        <h3 className="type-h3 mt-4">Enquiry received</h3>
        <p className="type-body mt-2 max-w-md" role="status">
          {message ?? "Thanks. We received your enquiry."}
        </p>
        <p className="type-meta mt-4">
          Our corporate gifting team typically responds within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
            setLogo(null);
          }}
          className="btn btn-secondary mt-7"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 ${compact ? "" : "panel p-6 sm:p-8"}`}
    >
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input type="hidden" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <Field id="lead-name" label="Full name" required error={errors.name}>
        <input id="lead-name" name="name" autoComplete="name" className="field-input" />
      </Field>
      <Field id="lead-company" label="Company name">
        <input id="lead-company" name="company" autoComplete="organization" className="field-input" />
      </Field>
      <Field id="lead-email" label="Work email" required error={errors.email}>
        <input id="lead-email" name="email" type="email" autoComplete="email" className="field-input" />
      </Field>
      <Field id="lead-phone" label="Phone number" required error={errors.phone}>
        <input id="lead-phone" name="phone" type="tel" autoComplete="tel" className="field-input" />
      </Field>

      <Field id="lead-requirement" label="Requirement type">
        <select
          id="lead-requirement"
          name="requirementType"
          className="field-input"
          defaultValue={defaults.collectionName ?? ""}
        >
          <option value="">Select requirement</option>
          {requirementTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field id="lead-quantity" label="Estimated quantity">
        <select
          id="lead-quantity"
          name="quantity"
          className="field-input"
          defaultValue={defaults.quantity ?? ""}
        >
          <option value="">Select quantity</option>
          {quantities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>

      <Field id="lead-budget" label="Budget range">
        <input id="lead-budget" name="budget" className="field-input" />
      </Field>
      {showBulkFields ? (
        <Field id="lead-total-budget" label="Total budget">
          <input id="lead-total-budget" name="totalBudget" className="field-input" />
        </Field>
      ) : null}
      {showBulkFields ? (
        <Field id="lead-date" label="Required delivery date">
          <input id="lead-date" name="deliveryDate" type="date" className="field-input" />
        </Field>
      ) : null}
      {showBulkFields ? (
        <Field id="lead-location" label="Delivery city / state">
          <input id="lead-location" name="deliveryLocation" className="field-input" />
        </Field>
      ) : null}

      {showBulkFields ? (
        <div className="flex flex-col gap-5 border-t border-line pt-6 sm:col-span-2">
          {/* A fieldset/legend groups the checkboxes so screen readers announce
              what the options belong to. */}
          <fieldset>
            <legend className="field-label">Branding</legend>
            <label className="mt-3 flex items-center gap-2.5 text-sm text-navy-950">
              <input
                name="brandingRequired"
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-navy-950"
              />
              Branding required
            </label>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {brandingOptions.map((option) => (
                <label key={option} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <input
                    name="brandingOptions"
                    value={option}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-navy-950"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label className="field-label" htmlFor="lead-logo">
              Company logo
            </label>
            <input
              id="lead-logo"
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={(event) => void uploadLogo(event.target.files?.[0])}
              className="field-input file:mr-3 file:border file:border-line file:bg-sunken file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-navy-950"
            />
            {uploadingLogo ? (
              <span className="field-hint flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                Uploading logo&hellip;
              </span>
            ) : null}
            {logo ? (
              <span className="flex items-center justify-between gap-3 text-xs text-navy-950">
                <span className="flex items-center gap-1.5">
                  <Upload className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  {logo.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="inline-flex items-center gap-1 font-semibold text-ink-500 transition-colors duration-200 hover:text-navy-950"
                >
                  <X className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" /> Remove
                </button>
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <Field id="lead-message" label="Message" required error={errors.message} className="sm:col-span-2">
        <textarea
          id="lead-message"
          name="message"
          rows={compact ? 4 : 6}
          defaultValue={defaults.message ?? ""}
          className="field-input resize-none"
        />
      </Field>

      {message && status === "error" ? (
        <p role="alert" className="field-error border-l-2 border-current pl-4 sm:col-span-2">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={status === "loading"} className="btn btn-primary">
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
          ) : null}
          {status === "loading" ? "Sending…" : "Submit Enquiry"}
        </button>
        <span className="type-meta">Fields marked with * are required.</span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // The control is cloned so the error is announced by screen readers without
  // every call site having to repeat the aria wiring.
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
        "aria-required": required || undefined,
      })
    : children;

  return (
    <div className={`field ${className ?? ""}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {control}
      {error ? (
        <span id={`${id}-error`} className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
