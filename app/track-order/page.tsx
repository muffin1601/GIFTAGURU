import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import TrackOrderForm from "@/components/account/TrackOrderForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Track Your Order | Gifta Guru",
  description: "Track the status of your Gifta Guru corporate gifting order using your order number and email.",
  path: "/track-order",
  // This form has no standalone search intent and exposes a customer-service
  // workflow, so it must not compete with the indexable commercial pages.
  index: false,
});

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Order support"
        title="Track your corporate gift order"
        description="Use your order reference and checkout email to view the latest payment, fulfilment and delivery information."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Track order" }]}
        image="/BANNERS/PREMIUM.png"
      />
      <section className="section bg-canvas">
        <Container className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="hanna-card bg-navy-950 p-7 text-cream-100 sm:p-9">
            <p className="font-script text-lg text-gold-300">Before you begin</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Have these details ready</h2>
            <ol className="mt-7 space-y-5 text-sm leading-6 text-cream-100/72">
              <li className="flex gap-4"><span className="font-display text-xl text-gold-300">01</span><span>Your Gifta Guru order number from the confirmation email.</span></li>
              <li className="flex gap-4"><span className="font-display text-xl text-gold-300">02</span><span>The same email address used when the order was placed.</span></li>
            </ol>
          </div>
          <div className="page-card p-6 sm:p-9">
            <p className="type-eyebrow">Secure order lookup</p>
            <h2 className="type-h2 mt-3">Find your order</h2>
            <p className="type-body mt-3">Enter both details below to see the current status.</p>
            <TrackOrderForm />
          </div>
        </Container>
      </section>
    </>
  );
}
