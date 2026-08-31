import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LeadForm from "@/components/forms/LeadForm";
import FAQ from "@/components/home/FAQ";
import { pageMetadata } from "@/lib/seo/metadata";

// This file's default export and metadata are re-exported verbatim at
// /bulk-enquiry (see app/bulk-enquiry/page.tsx) -- same component, same
// content, two URLs. Rather than duplicate content across both, the
// canonical always points at /bulk-enquiry, which is the URL actually linked
// from navigation and CTAs sitewide; /bulk-orders remains reachable (nothing
// that links to it breaks) but tells Google the content lives at the other URL.
export const metadata: Metadata = pageMetadata({
  title: "Bulk Orders | Gifta Guru",
  description: "Request a quote for bulk corporate gifting orders, delivered pan-India.",
  path: "/bulk-enquiry",
});

export default async function BulkOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ product?: string; collection?: string; type?: string }>;
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
      <FAQ />
    </>
  );
}
