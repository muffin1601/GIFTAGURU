"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import type { Product } from "@/types";

export default function ProductEnquiryButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-700">
        <MessageSquare className="h-4 w-4" />
        Need a bulk quote?
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-navy-950/40 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-line bg-canvas p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gold-700">Product enquiry</p>
                <h2 className="mt-1 font-display text-2xl text-navy-950">Customize for your company</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close enquiry form" className="rounded-full p-2 text-navy-950 hover:bg-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <LeadForm
              type="product"
              source="Product page"
              compact
              defaults={{
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                productUrl: typeof window !== "undefined" ? window.location.href : "",
                quantity: String(product.minQuantity),
                message: `Interested in ${product.name}.`,
              }}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
