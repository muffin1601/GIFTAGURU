import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import CorporateSolutions from "@/components/home/CorporateSolutions";
import HowItWorks from "@/components/home/HowItWorks";
import BulkOrderCTA from "@/components/home/BulkOrderCTA";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Solutions in India | Gifta Guru",
  description: "Corporate gifting solutions for Indian businesses: branded gifts, employee and client gifting, welcome kits, events and bulk orders.",
  path: "/corporate-gifting",
});

export default function CorporateGiftingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Corporate Gifting"
        title="Corporate gifting solutions for teams, clients and business events"
        description="Gifta Guru helps HR, procurement, admin and marketing teams plan branded corporate gifts, employee welcome kits and bulk gifting programmes across India."
      />
      <CorporateSolutions />
      <section className="section border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="type-h2">Explore corporate gifting by requirement</h2>
          <p className="type-body mt-4 max-w-3xl">
            Start with the business moment you are planning, then shortlist gift sets and request a quote with your quantity, branding and delivery requirements.
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Employee onboarding and welcome kits", "/gifting/employee-onboarding"],
              ["Employee appreciation and recognition gifts", "/gifting/employee-appreciation"],
              ["Corporate gifts for clients", "/gifting/client-appreciation"],
              ["Bulk corporate gifting", "/gifting/bulk-corporate-gifting"],
              ["Custom branded corporate gifts", "/custom-gifts"],
              ["Conference and event gifting", "/gifting/events-conferences"],
              ["Corporate Diwali gifts", "/occasions/diwali-corporate-gifts"],
              ["Corporate gifting guide", "/blog/corporate-gifting-guide"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="link-underline type-body text-navy-950">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <HowItWorks />
      <BulkOrderCTA />
    </>
  );
}
