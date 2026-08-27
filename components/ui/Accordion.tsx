"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@/types";

export default function Accordion({ items }: { items: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-medium text-navy-950">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              className={`overflow-hidden px-6 transition-all duration-200 ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}
            >
              <p className="text-sm text-ink-700">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
