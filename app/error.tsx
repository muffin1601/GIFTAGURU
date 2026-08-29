"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Storefront error boundary:", error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl text-navy-950 sm:text-5xl">We hit a snag</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-700">
        Please try again. If the problem continues, our team is happy to help over WhatsApp or email.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button href="/contact" variant="secondary">Contact us</Button>
      </div>
    </Container>
  );
}
