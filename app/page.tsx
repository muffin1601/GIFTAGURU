import type { Metadata } from "next";
import CorporateHomepage from "@/components/home/CorporateHomepage";
import FAQ from "@/components/home/FAQ";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqPageSchema } from "@/lib/seo/schema";
import { faqs } from "@/data/faqs";

export const dynamic = "force-dynamic";

/**
 * The homepage previously had no metadata export of its own and inherited the
 * root layout's defaults. That worked, but it meant the single most important
 * page on the site could not state its own canonical or its own commercial
 * positioning. It now owns the broad head terms explicitly.
 */
export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Company in India | Custom & Bulk Gifts | Gifta Guru",
  description:
    "Customised corporate gifts for employees, clients, events and festive occasions. Explore branded gift sets, welcome kits and bulk gifting solutions across India.",
  path: "",
});

export default function Home() {
  return (
    <>
      {/* Mirrors the FAQ section rendered at the bottom of this page. */}
      <JsonLd data={faqPageSchema(faqs.map(({ question, answer }) => ({ question, answer })))} />
      <div className="homepage">
        <CorporateHomepage />
        <FAQ />
      </div>
    </>
  );
}
