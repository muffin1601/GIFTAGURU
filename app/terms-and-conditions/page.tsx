import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions | Gifta Guru",
  description: "The terms governing quote requests, orders and bulk gifting purchases placed through Gifta Guru.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms and Conditions" />
      <section className="py-16 sm:py-20">
        <Container className="flex max-w-3xl flex-col gap-4 text-ink-700">
          <p>
            These terms govern the use of the Gifta Guru website and the placement of gifting
            inquiries, quote requests, and bulk orders through our team.
          </p>
          <p>
            Pricing shared through quotes is subject to confirmation based on final quantity,
            customization, and delivery location. Orders are confirmed only after written
            acknowledgement from Gifta Guru.
          </p>
          <p>
            This is placeholder content for the initial frontend build. Complete terms will be
            published once ordering and payment systems are finalized.
          </p>
        </Container>
      </section>
    </>
  );
}
