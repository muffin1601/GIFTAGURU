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
        className="inline-flex items-center gap-1 text-sm font-medium text-navy-950 transition-colors hover:text-gold-600"
      >
        Collections
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full mt-5 grid w-[520px] grid-cols-2 gap-3 rounded-lg bg-white p-3 shadow-xl ring-1 ring-navy-950/10">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              onClick={() => setOpen(false)}
              className="grid grid-cols-[76px_1fr] gap-3 rounded-lg p-2 hover:bg-cream-100"
            >
              <span className="relative aspect-[4/3] overflow-hidden rounded-md bg-cream-200">
                <Image src={category.image} alt={category.name} fill className="object-cover" sizes="76px" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy-950">{category.name}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-600">{category.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
