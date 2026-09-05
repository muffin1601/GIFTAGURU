import type { Metadata } from "next";
import LandingHubView from "@/components/seo/LandingHubView";
import { pageMetadata } from "@/lib/seo/metadata";
import { guidePages } from "@/lib/seo/content/guides";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Guides | Gifta Guru",
  description:
    "Practical corporate gifting guides: choosing gifts, building welcome kits, budgeting at scale, branding methods, festive planning and event giveaways.",
  path: "/guides",
});

export default function GuidesHubPage() {
  return (
    <LandingHubView
      family="guides"
      title="Corporate Gifting Guides"
      intro={[
        "These guides answer the questions that come before choosing a product: what belongs in a welcome kit, how to budget across a few hundred people, which branding method suits which material, and when to start planning a festive order.",
        "They are written to be useful whether or not you buy anything here. Where a guide recommends a specific set, it says why.",
      ]}
      pages={guidePages}
    />
  );
}
