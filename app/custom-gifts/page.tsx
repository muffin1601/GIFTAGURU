import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CustomGifting from "@/components/home/CustomGifting";
import HowItWorks from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "Custom Corporate Gifts | Gifta Guru",
  description: "Add branding, custom packaging, and personalized messages to your corporate gifts.",
};

export default function CustomGiftsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Custom Gifts"
        title="Design a gifting experience around your brand"
        description="Add your logo, choose packaging, personalize messages, and select products to build a gift set your recipients will remember."
      />
      <CustomGifting />
      <HowItWorks />
    </>
  );
}
