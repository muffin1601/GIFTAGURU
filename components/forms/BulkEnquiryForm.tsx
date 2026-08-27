"use client";

import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";

interface BulkEnquiryFormProps {
  productInterest?: string;
}

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
    <section className="bg-cream-100 py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Bulk Enquiry</p>
          <h2 className="mt-3 font-display text-3xl text-navy-950">Tell us what you need</h2>
          <p className="mt-4 text-ink-700">
            Share quantity, budget, occasion, and product preference. The request is saved for admin follow-up.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-4 rounded-lg bg-white p-6 ring-1 ring-navy-950/5 sm:grid-cols-2">
          <input required name="fullName" placeholder="Full name" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input required name="email" type="email" placeholder="Work email" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input required name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="companyName" placeholder="Company name" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="productInterest" defaultValue={productInterest} placeholder="Product interest" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="quantity" type="number" min={5} placeholder="Quantity" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="budgetRange" placeholder="Budget range" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="occasion" placeholder="Occasion" className="rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <textarea name="message" rows={4} placeholder="Requirements" className="resize-none rounded-xl border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900 sm:col-span-2" />
          {message ? (
            <p className={`rounded-xl p-3 text-sm sm:col-span-2 ${status === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button disabled={status === "loading"} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 disabled:opacity-60">
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Enquiry
            </button>
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-950/15 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-cream-200">
                <MessageCircle className="h-4 w-4" />
                Continue on WhatsApp
              </a>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
