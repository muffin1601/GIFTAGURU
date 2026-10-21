import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LeadForm from "@/components/forms/LeadForm";
import FAQ from "@/components/home/FAQ";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

// This implementation is re-exported by /bulk-enquiry. next.config redirects
// /bulk-orders permanently before this route can render, leaving one public
// URL for the content while preserving old bookmarks and campaign links.
export const metadata: Metadata = pageMetadata({
  title: "Bulk Orders | Gifta Guru",
  description: "Request a quote for bulk corporate gifting orders, delivered pan-India.",
  path: "/bulk-enquiry",
});

export default async function BulkOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ product?: string; code?: string; quantity?: string; collection?: string; type?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Bulk Orders"
        title="Corporate gifting at scale, without the hassle"
        description="Tell us your occasion, quantity, and budget. We'll take care of curation, branding, and delivery."
      />
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <LeadForm
            type="bulk_order"
            source="Bulk enquiry page"
            showBulkFields
            defaults={{
              productName: params?.product ?? "",
              productCode: params?.code ?? "",
              quantity: params?.quantity ?? "",
              collectionName: params?.collection ?? "",
              message: params?.product
                ? `Interested in ${params.product}.`
                : params?.collection
                  ? `Interested in the ${params.collection} collection.`
                  : "",
            }}
          />
        </div>
      </section>
      <BusinessBuyerGuide
        title="Planning a bulk corporate gift order"
        paragraphs={[
          "Bulk orders work best when the recipient group and purpose are agreed before a set is selected. Employee programmes often need consistency and re-ordering; client or leadership lists may need a more premium presentation; event lists need a useful item that travels well.",
          "Share the quantity, intended recipients, approximate budget and branding requirement in your enquiry. Product pricing and availability are confirmed from the current catalogue rather than assumed from a generic package.",
        ]}
        links={[{ label: "Employee gifting programmes", href: "/gifting/employee-appreciation" }, { label: "Custom branded gifts", href: "/custom-gifts" }, { label: "Corporate Diwali gifts", href: "/occasions/diwali-corporate-gifts" }]}
      />
      <FAQ />
    </>
  );
}
