import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";

export const metadata: Metadata = {
  title: "About Us | Gifta Guru",
  description: "Gifta Guru is a premium corporate gifting platform for businesses across India.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Gifta Guru"
        title="Unboxing culture, one thoughtful gift at a time"
        description="We partner with HR teams, founders, and businesses to design corporate gifting that reflects their brand and values, from onboarding kits to leadership gifts."
      />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
