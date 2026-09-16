import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

export const metadata: Metadata = pageMetadata({
  title: "About Us | Gifta Guru",
  description: "Gifta Guru is a premium corporate gifting platform for businesses across India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Gifta Guru"
        title="Unboxing culture, one thoughtful gift at a time"
        description="We partner with HR teams, founders, and businesses to design corporate gifting that reflects their brand and values, from onboarding kits to leadership gifts."
      />
      <WhyChooseUs />
      <BusinessBuyerGuide
        title="A corporate gifting partner for real business requirements"
        paragraphs={[
          "Corporate gifting is rarely a one-product decision. HR teams may be welcoming a cohort, procurement teams may be comparing a volume order, and marketing teams may need branded gifts that represent the company well at an event.",
          "Gifta Guru is built around those practical buying moments: product selection, logo branding and personalised details where appropriate, then an enquiry path for quantities or requirements that need a tailored recommendation.",
        ]}
        links={[{ label: "Corporate gifting solutions", href: "/corporate-gifting" }, { label: "Request a bulk quote", href: "/bulk-enquiry" }, { label: "Custom branded gifts", href: "/custom-gifts" }]}
      />
      <Testimonials />
    </>
  );
}
