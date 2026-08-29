"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { categories } from "@/data/categories";

export default function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:text-gold-600"
      >
        Collections
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
      </button>

      {open ? (
        // A hairline border defines the overlay instead of a drop shadow.
        <div className="absolute left-1/2 top-full z-50 mt-6 grid w-[560px] -translate-x-1/2 grid-cols-2 gap-x-8 gap-y-6 border border-line bg-surface p-7">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              onClick={() => setOpen(false)}
              className="group grid grid-cols-[84px_1fr] gap-4"
            >
              <span className="relative aspect-[4/3] overflow-hidden border border-line bg-sunken">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                  sizes="84px"
                />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[0.9375rem] text-navy-950 transition-colors duration-200 group-hover:text-gold-600">
                  {category.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-500">
                  {category.tagline}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
