import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | Gifta Guru",
  description: "How Gifta Guru collects, uses and protects information shared through inquiries, quote requests and orders.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="py-16 sm:py-20">
        <Container className="flex max-w-3xl flex-col gap-4 text-ink-700">
          <p>
            Gifta Guru respects the privacy of every business and individual we work with. This
            page outlines, at a high level, how we handle information shared with us through
            inquiries, quote requests, and orders.
          </p>
          <p>
            We collect only the information necessary to respond to inquiries, prepare quotes,
            and fulfil orders, such as company name, contact details, and order requirements. We
            do not sell contact information to third parties.
          </p>
          <p>
            This is placeholder content for the initial frontend build. A complete privacy policy
            will be added once data handling and order-processing systems are finalized.
          </p>
        </Container>
      </section>
    </>
  );
}
