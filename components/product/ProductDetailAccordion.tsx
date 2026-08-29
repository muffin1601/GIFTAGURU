"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface DetailSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function ProductDetailAccordion({ sections }: { sections: DetailSection[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="divide-y divide-navy-950/10 rounded-2xl border border-navy-950/10 bg-white">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              aria-expanded={isOpen}
              aria-controls={`product-detail-${section.id}`}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-lg text-navy-950">{section.title}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`product-detail-${section.id}`}
              role="region"
              className={`overflow-hidden px-6 transition-all duration-300 ${isOpen ? "max-h-[480px] pb-6" : "max-h-0"}`}
            >
              <div className="text-sm leading-6 text-ink-700">{section.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
