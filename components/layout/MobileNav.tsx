"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NavLink } from "@/types";

/**
 * Mobile navigation drawer.
 *
 * It declares `role="dialog" aria-modal="true"`, which is a promise to
 * assistive technology that the rest of the page is inert. Previously nothing
 * upheld that: Escape did nothing, Tab walked straight out of the drawer into
 * the page behind it, focus never entered the dialog on open and never
 * returned to the trigger on close, and the body kept scrolling underneath.
 * The effects below implement the behaviour the role advertises.
 */
export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** Element that had focus before opening, so it can be restored on close. */
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Move focus into the drawer on open and hand it back to the trigger on
  // close, so a keyboard or screen-reader user is never left focused on a
  // hidden element.
  useEffect(() => {
    if (!open) return;
    // Captured now rather than read in the cleanup: by the time cleanup runs
    // the ref may already point elsewhere, and this button is the element that
    // opened the drawer, so it is the one focus must return to.
    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();
    return () => trigger?.focus();
  }, [open]);

  // Escape closes, and Tab cycles within the panel.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      // Wrap at both ends. Focus that has somehow escaped the panel entirely is
      // pulled back to the first element rather than left outside.
      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Stops the page behind the overlay scrolling with the drawer open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-navy-950/40"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => {
              // Backdrop only -- a click inside the panel must not dismiss it.
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={panelRef}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-6 border-l border-line bg-canvas p-6"
            >
              <div className="flex items-center justify-between">
                <span id={titleId} className="font-display text-lg text-navy-950">
                  Menu
                </span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5"
                >
                  <X className="h-6 w-6" aria-hidden="true" strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Main">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-base font-medium text-navy-950 hover:bg-navy-950/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex items-center gap-4 border-t border-navy-950/10 pt-6">
                <Link
                  href="/search"
                  onClick={close}
                  className="inline-flex items-center gap-2 text-sm font-medium text-navy-950"
                >
                  <Search className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
                  Search
                </Link>
                <Link
                  href="/cart"
                  onClick={close}
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
