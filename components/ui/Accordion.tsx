"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@/types";

export default function Accordion({ items }: { items: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="border-t border-line">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="font-display text-[1.0625rem] text-navy-950">{item.question}</span>
              {isOpen ? (
                <Minus className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
              )}
            </button>

            {/* Animating grid-template-rows expands to the answer's real height,
                so long answers are never clipped the way a max-height would. */}
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="type-body max-w-2xl pb-6 pr-10">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
