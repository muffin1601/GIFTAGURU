import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CorporateSolutions from "@/components/home/CorporateSolutions";
import HowItWorks from "@/components/home/HowItWorks";
import BulkOrderCTA from "@/components/home/BulkOrderCTA";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Solutions | Gifta Guru",
  description: "Gifting programs for onboarding, appreciation, client relationships, and events.",
  path: "/corporate-gifting",
});

export default function CorporateGiftingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Corporate Gifting"
        title="Gifting solutions built around your business moments"
        description="From a new hire's first day to your most valued client relationship, we design gifting programs that fit the occasion and scale with your team."
      />
      <CorporateSolutions />
      <HowItWorks />
      <BulkOrderCTA />
    </>
  );
}
