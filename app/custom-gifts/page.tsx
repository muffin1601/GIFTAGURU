import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CustomGifting from "@/components/home/CustomGifting";
import HowItWorks from "@/components/home/HowItWorks";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

export const metadata: Metadata = pageMetadata({
  title: "Custom Corporate Gifts | Gifta Guru",
  description: "Add branding, custom packaging, and personalized messages to your corporate gifts.",
  path: "/custom-gifts",
});

export default function CustomGiftsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Custom Gifts"
        title="Design a gifting experience around your brand"
        description="Add your logo, choose packaging, personalize messages, and select products to build a gift set your recipients will remember."
      />
      {/* Already on /custom-gifts, so the CTA sends visitors to the enquiry
          form rather than back to this page. */}
      <CustomGifting ctaHref="/bulk-enquiry" ctaLabel="Start a Corporate Enquiry" />
      <HowItWorks />
      <BusinessBuyerGuide
        title="Custom corporate gifts that stay useful after the event"
        paragraphs={[
          "The strongest branded gifts start with an item the recipient will genuinely keep using. That makes notebooks, planners, pens, desk accessories and curated gift sets practical choices for employee, client and event programmes.",
          "Start with the occasion and recipient list, then share your logo or personalisation requirement. Gifta Guru can guide the selection and quote process without presenting branding as an afterthought.",
        ]}
        links={[{ label: "Corporate gifting solutions", href: "/corporate-gifting" }, { label: "Conference and event gifting", href: "/gifting/events-conferences" }, { label: "Get a custom quote", href: "/bulk-enquiry" }]}
      />
    </>
  );
}
