"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { NavLink } from "@/types";

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-navy-950/40" role="dialog" aria-modal="true">
            <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-6 bg-cream-100 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-navy-950">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-navy-950 hover:bg-navy-950/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex items-center gap-4 border-t border-navy-950/10 pt-6">
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  aria-label="Search"
                  className="inline-flex items-center gap-2 text-sm font-medium text-navy-950"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Search
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  aria-label="View cart"
                  className="inline-flex items-center gap-2 text-sm font-medium text-navy-950"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  Cart
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
