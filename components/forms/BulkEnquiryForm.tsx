"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Container from "@/components/ui/Container";
import SocialIcon from "@/components/ui/SocialIcon";

interface BulkEnquiryFormProps {
  productInterest?: string;
}

/** Field order matches the shape of a real corporate enquiry. */
const fields = [
  { id: "bulk-name", name: "fullName", label: "Full name", required: true },
  { id: "bulk-email", name: "email", label: "Work email", required: true, type: "email" },
  { id: "bulk-phone", name: "phone", label: "Phone / WhatsApp", required: true, type: "tel" },
  { id: "bulk-company", name: "companyName", label: "Company name" },
  { id: "bulk-product", name: "productInterest", label: "Product interest" },
  { id: "bulk-quantity", name: "quantity", label: "Quantity", type: "number", min: 5 },
  { id: "bulk-budget", name: "budgetRange", label: "Budget range" },
  { id: "bulk-occasion", name: "occasion", label: "Occasion" },
] satisfies {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  min?: number;
}[];

export default function BulkEnquiryForm({ productInterest = "" }: BulkEnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    setWhatsappUrl(null);

    const form = event.currentTarget;
    const response = await fetch("/api/bulk-enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const payload = (await response.json()) as { message?: string; error?: string; whatsappUrl?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Unable to submit enquiry.");
      return;
    }

    setStatus("success");
    setMessage(payload.message ?? "Bulk enquiry received.");
    setWhatsappUrl(payload.whatsappUrl ?? null);
    form.reset();
  }

  return (
    <section className="section bg-sunken">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="type-eyebrow">Bulk Enquiry</span>
          <h2 className="type-h2 mt-4">Tell us what you need</h2>
          <p className="type-lead mt-5">
            Share quantity, budget, occasion and product preference. Our corporate gifting team
            typically responds within one business day.
          </p>
        </div>

        {status === "success" ? (
          // A confirmed enquiry replaces the form so the outcome is unmistakable.
          <div className="panel p-8 sm:p-10">
            <Check className="h-6 w-6 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
            <h3 className="type-h3 mt-4">Enquiry received</h3>
            <p className="type-body mt-2 max-w-md" role="status">
              {message ?? "Bulk enquiry received."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  <SocialIcon platform="whatsapp" />
                  Continue on WhatsApp
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setMessage(null);
                  setWhatsappUrl(null);
                }}
                className="btn btn-secondary"
              >
                Send another enquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="panel grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
            {fields.map(({ id, name, label, required, type, min }) => (
              <div key={name} className="field">
                <label className="field-label" htmlFor={id}>
                  {label}
                  {required ? <span aria-hidden="true"> *</span> : null}
                  {required ? <span className="sr-only"> (required)</span> : null}
                </label>
                <input
                  id={id}
                  name={name}
                  type={type ?? "text"}
                  min={min}
                  required={required}
                  defaultValue={name === "productInterest" ? productInterest : undefined}
                  className="field-input"
                />
              </div>
            ))}

            <div className="field sm:col-span-2">
              <label className="field-label" htmlFor="bulk-message">
                Requirements
              </label>
              <textarea
                id="bulk-message"
                name="message"
                rows={5}
                className="field-input resize-none"
              />
            </div>

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
        )}
      </Container>
    </section>
  );
}
