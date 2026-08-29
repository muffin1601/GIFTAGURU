"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/config/store";
import ChatbotWidget from "@/components/lead/ChatbotWidget";
import SocialIcon from "@/components/ui/SocialIcon";

export default function FloatingCommunication() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const message = useMemo(() => whatsappMessage(pathname), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <ChatbotWidget />
      {open ? (
        <div className="w-[280px] border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-navy-950">Need help choosing gifts?</p>
              <p className="mt-1 text-sm text-ink-600">Chat with our corporate gifting team.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close WhatsApp help" className="rounded-full p-1 text-ink-500 hover:bg-cream-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={buildWhatsAppUrl(message)}
            target="_blank"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1ebc59]"
          >
            <SocialIcon platform="whatsapp" />
            Chat on WhatsApp
          </Link>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1ebc59]"
        aria-expanded={open}
        aria-label="Chat with us on WhatsApp"
      >
        <SocialIcon platform="whatsapp" className="h-[1.15rem] w-[1.15rem]" />
        <span className="hidden sm:inline">Chat with us</span>
      </button>
    </div>
  );
}

function whatsappMessage(pathname: string) {
  if (pathname.startsWith("/products/")) return "Hi Gifta Guru, I am interested in this product.";
  if (pathname.startsWith("/categories/")) return "Hi Gifta Guru, I am interested in your gift collection.";
  if (pathname.startsWith("/cart")) return "Hi Gifta Guru, I need assistance with my corporate gift order.";
  if (pathname.startsWith("/bulk-enquiry") || pathname.startsWith("/bulk-orders")) return "Hi Gifta Guru, I would like to place a bulk corporate gifting order.";
  return "Hi Gifta Guru, I would like to know more about your corporate gifting solutions.";
}
