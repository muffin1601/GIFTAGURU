"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface DetailSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function ProductDetailAccordion({ sections }: { sections: DetailSection[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="border-t border-line">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              aria-expanded={isOpen}
              aria-controls={`product-detail-${section.id}`}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="font-display text-[1.0625rem] text-navy-950">{section.title}</span>
              {isOpen ? (
                <Minus className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
              )}
            </button>

            {/* grid-template-rows animates to the content's real height, so
                longer sections are never clipped by a fixed max-height. */}
            <div
              id={`product-detail-${section.id}`}
              role="region"
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="type-body pb-6">{section.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
