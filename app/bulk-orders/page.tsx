import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LeadForm from "@/components/forms/LeadForm";
import FAQ from "@/components/home/FAQ";

export const metadata: Metadata = {
  title: "Bulk Orders | Gifta Guru",
  description: "Request a quote for bulk corporate gifting orders, delivered pan-India.",
};

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
