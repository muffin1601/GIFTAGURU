"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The admin panel has its own chrome (AdminShell). Without this the storefront
 * header, footer and floating chat widget rendered on top of every admin page.
 *
 * Children are rendered on the server and simply passed through, so wrapping
 * them here does not turn Header/Footer into client components.
 */
export default function StorefrontOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
