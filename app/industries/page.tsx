import type { Metadata } from "next";
import LandingHubView from "@/components/seo/LandingHubView";
import { pageMetadata } from "@/lib/seo/metadata";
import { industryPages } from "@/lib/seo/content/industries";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting by Industry | Gifta Guru",
  description:
    "Corporate gifting for IT, fintech, BFSI, healthcare, manufacturing, real estate, consulting, ecommerce and education teams across India.",
  path: "/industries",
});

export default function IndustriesHubPage() {
  return (
    <LandingHubView
      family="industries"
      title="Corporate Gifting by Industry"
      intro={[
        "Every sector gifts differently. A software company onboards continuously and ships kits to home addresses; a manufacturer's largest gifting event of the year is its dealer meet; a hospital needs recognition that reaches an entire rotating shift at once.",
        "These pages cover the sectors where the gifting motion is genuinely distinct enough to change what you should order. If yours is not listed below, the gifting patterns almost always still apply - start from the use-case pages instead.",
      ]}
      pages={industryPages}
      extraSections={[
        {
          heading: "Sectors covered without a dedicated page",
          body: [
            "We supply corporate gifts to many more sectors than the nine above - logistics, telecom, legal, automotive, hospitality and travel, media and marketing agencies, coworking operators, government and PSU bodies, construction and infrastructure, recruitment and staffing, and renewable energy.",
            "There is no separate page for each of those, and that is deliberate. Their gifting requirements map almost exactly onto patterns already covered elsewhere on this site, and publishing a dozen near-identical pages would help nobody find anything. The use-case pages are the better entry point:",
          ],
          bullets: [
            "Hiring and inducting staff: see employee onboarding gifting",
            "Recognising tenure, milestones and performance: see employee appreciation",
            "Distributor, franchise, broker or agent networks: see dealer and channel partner gifting",
            "Conferences, exhibitions and delegate kits: see event and conference gifting",
            "Senior client, board and investor relationships: see executive and leadership gifting",
          ],
        },
        {
          heading: "Not sure which applies to you?",
          body: [
            "Tell us the occasion, the number of recipients and roughly what you want to spend per head, and we will come back with options rather than a catalogue. That is usually faster than working out which category you belong in.",
          ],
        },
      ]}
    />
  );
}
