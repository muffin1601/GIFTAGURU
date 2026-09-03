import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import TrackOrderForm from "@/components/account/TrackOrderForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Track Your Order | Gifta Guru",
  description: "Track the status of your Gifta Guru corporate gifting order using your order number and email.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 ring-1 ring-navy-950/5">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Track order</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Find your order</h1>
        <p className="type-body mt-3">
          Enter the order number from your confirmation email along with the email address you
          used at checkout.
        </p>
        <TrackOrderForm />
      </div>
    </Container>
  );
}
