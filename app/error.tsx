"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Storefront error boundary:", error);
  }, [error]);

  return (
    <section className="flex min-h-[65vh] items-center bg-cream-200 py-20">
      <Container className="w-full">
        <div className="hanna-card mx-auto max-w-3xl border border-line bg-surface p-8 text-center sm:p-14">
          <span className="type-eyebrow">Something went wrong</span>
          <h1 className="type-h1 mt-4">We hit a snag</h1>
          <p className="type-lead mx-auto mt-5 max-w-xl">Please try again. If the problem continues, our team is happy to help.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><Button onClick={reset}>Try again</Button><Button href="/contact" variant="secondary">Contact us</Button></div>
        </div>
      </Container>
    </section>
  );
}
