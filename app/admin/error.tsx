"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

/** Keeps a failing admin page isolated instead of replacing the whole app shell. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin route error:", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <section className="panel mx-auto max-w-xl p-8">
      <p className="type-eyebrow">Admin page unavailable</p>
      <h1 className="type-h2 mt-3">This page could not be loaded</h1>
      <p className="mt-3 text-sm text-ink-600">Your other admin pages are still available. Try loading this page again.</p>
      {error.digest ? <p className="mt-3 text-xs text-ink-500">Error reference: {error.digest}</p> : null}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/admin" variant="secondary">Admin home</Button>
      </div>
    </section>
  );
}
