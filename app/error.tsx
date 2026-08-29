"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Storefront error boundary:", error);
  }, [error]);

  return (
    <Container className="max-w-lg py-24 sm:py-32">
      <span className="type-eyebrow">Something went wrong</span>
      <h1 className="type-h1 mt-4">We hit a snag</h1>
      <p className="type-lead mt-5">
        Please try again. If the problem continues, our team is happy to help over WhatsApp or
        email.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/contact" variant="secondary">Contact us</Button>
      </div>
    </Container>
  );
}
