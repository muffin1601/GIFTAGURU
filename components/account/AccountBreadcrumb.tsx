import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Back-link for account sub-pages. The account cards navigate one level deep
 * with no in-page way back, which on mobile left the browser's back button as
 * the only exit.
 */
export default function AccountBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <Link
        href="/account"
        className="link-underline inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-500"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
        Account
      </Link>
      <span className="sr-only"> / {current}</span>
    </nav>
  );
}
