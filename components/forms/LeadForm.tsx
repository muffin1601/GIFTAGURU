"use client";

import { useState } from "react";
import { Loader2, Send, Upload, X } from "lucide-react";

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
      ...defaults,
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

  return (
    <form onSubmit={submit} className={`grid gap-4 ${compact ? "" : "rounded-lg bg-white p-6 ring-1 ring-navy-950/5"} sm:grid-cols-2`}>
      <input type="hidden" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <Field label="Full name *" error={errors.name}><input name="name" required className={inputClass} /></Field>
      <Field label="Company name"><input name="company" className={inputClass} /></Field>
      <Field label="Work email *" error={errors.email}><input name="email" type="email" required className={inputClass} /></Field>
      <Field label="Phone number *" error={errors.phone}><input name="phone" required className={inputClass} /></Field>
      <Field label="Requirement type *">
        <select name="requirementType" className={inputClass} defaultValue={defaults.collectionName ?? ""}>
          <option value="">Select requirement</option>
          {requirementTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <Field label="Estimated quantity">
        <select name="quantity" className={inputClass} defaultValue={defaults.quantity ?? ""}>
          <option value="">Select quantity</option>
          {quantities.map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <Field label="Budget range"><input name="budget" className={inputClass} /></Field>
      {showBulkFields ? <Field label="Total budget"><input name="totalBudget" className={inputClass} /></Field> : null}
      {showBulkFields ? <Field label="Required delivery date"><input name="deliveryDate" type="date" className={inputClass} /></Field> : null}
      {showBulkFields ? <Field label="Delivery city/state"><input name="deliveryLocation" className={inputClass} /></Field> : null}
      {showBulkFields ? (
        <div className="space-y-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input name="brandingRequired" type="checkbox" className="h-4 w-4 accent-navy-950" />
            Branding required?
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {brandingOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-ink-700">
                <input name="brandingOptions" value={option} type="checkbox" className="h-4 w-4 accent-navy-950" />
                {option}
              </label>
            ))}
          </div>
          <label className="mt-3 block rounded-lg border border-navy-950/10 bg-cream-100/40 p-4 text-sm font-medium text-navy-950">
            Company logo
            <input type="file" accept=".png,.jpg,.jpeg" onChange={(event) => void uploadLogo(event.target.files?.[0])} className="mt-2 block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-950" />
            {uploadingLogo ? <span className="mt-2 flex items-center gap-2 text-xs text-ink-600"><Loader2 className="h-3 w-3 animate-spin" /> Uploading logo...</span> : null}
            {logo ? (
              <span className="mt-2 flex items-center justify-between gap-3 text-xs text-green-700">
                <span><Upload className="mr-1 inline h-3 w-3" /> {logo.fileName}</span>
                <button type="button" onClick={() => setLogo(null)} className="inline-flex items-center gap-1 font-semibold text-ink-500 hover:text-navy-950"><X className="h-3 w-3" /> Remove</button>
              </span>
            ) : null}
          </label>
        </div>
      ) : null}
      <Field label="Message *" error={errors.message} className="sm:col-span-2">
        <textarea name="message" required rows={compact ? 3 : 5} defaultValue={defaults.message ?? ""} className={`${inputClass} resize-none`} />
      </Field>
      {message ? <p className={`rounded-lg p-3 text-sm sm:col-span-2 ${status === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message}</p> : null}
      <button disabled={status === "loading"} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 sm:col-span-2">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit Enquiry
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-navy-900";

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-navy-950 ${className ?? ""}`}>
      {label}
      {children}
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
