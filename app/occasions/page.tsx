import type { Metadata } from "next";
import LandingHubView from "@/components/seo/LandingHubView";
import { pageMetadata } from "@/lib/seo/metadata";
import { occasionPages } from "@/lib/seo/content/occasions";

export const metadata: Metadata = pageMetadata({
  title: "Seasonal & Occasion Corporate Gifting | Gifta Guru",
  description:
    "Corporate gifting by occasion: Diwali, New Year, the festive season, wedding-season gifting, and work anniversary and milestone recognition.",
  path: "/occasions",
});

export default function OccasionsHubPage() {
  return (
    <LandingHubView
      family="occasions"
      title="Seasonal & Occasion Gifting"
      intro={[
        "Seasonal gifting rewards planning more than spending. The festive quarter is crowded, planners only work if they arrive before the year starts, and personalization needs a proof cycle that cannot be compressed at the last minute.",
        "These pages cover when to start each occasion, how to split client and employee lists, and how to be noticed in a season when everyone is gifting at once.",
      ]}
      pages={occasionPages}
      extraSections={[
        {
          heading: "A simple gifting calendar",
          bullets: [
            "Festive quarter - plan at the start of the quarter, not the final fortnight",
            "Diwali - the most crowded moment; arriving early is the cheapest advantage",
            "Year-end - thanks for the year delivered, aimed at clients and teams",
            "New Year - planners and diaries, useful only if they arrive before January",
            "Wedding season - curated lists, foil names rather than company logos",
            "Anniversaries and milestones - continuous, best served from standing stock",
          ],
        },
      ]}
    />
  );
}
