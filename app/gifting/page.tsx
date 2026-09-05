import type { Metadata } from "next";
import LandingHubView from "@/components/seo/LandingHubView";
import { pageMetadata } from "@/lib/seo/metadata";
import { useCasePages } from "@/lib/seo/content/use-cases";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Solutions | Gifta Guru",
  description:
    "Corporate gifting solutions by occasion: employee onboarding, appreciation, client gifting, events, executive gifting, channel partners and bulk orders.",
  path: "/gifting",
});

export default function GiftingHubPage() {
  return (
    <LandingHubView
      family="gifting"
      title="Corporate Gifting Solutions"
      intro={[
        "Most gifting decisions start from a situation rather than a product - a hiring wave, a contract closing, a conference three weeks out. These pages are organised that way.",
        "Each one covers what the occasion actually demands of a gift, which sets suit it, and the practical details that tend to catch people out: lead times, personalization, and how much to differentiate between recipients.",
      ]}
      pages={useCasePages}
    />
  );
}
