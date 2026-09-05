import type { Metadata } from "next";
import LandingHubView from "@/components/seo/LandingHubView";
import { pageMetadata } from "@/lib/seo/metadata";
import { giftSetPages } from "@/lib/seo/content/gift-sets";

export const metadata: Metadata = pageMetadata({
  title: "3 to 6 Piece Corporate Gift Sets | Gifta Guru",
  description:
    "Multi-piece corporate gift sets from 3 to 6 pieces. Compare what each configuration contains, what it costs per head, and which occasion it suits.",
  path: "/gift-sets",
});

export default function GiftSetsHubPage() {
  return (
    <LandingHubView
      family="gift-sets"
      title="3 to 6 Piece Corporate Gift Sets"
      intro={[
        "Piece count is one of the first things buyers specify and one of the least useful things to optimise blindly. More pieces raise perceived value only while every piece holds up on its own - past that point a larger box reads as padding.",
        "These pages set out what each configuration typically contains, where it genuinely earns the step up, and where a smaller, better-presented set is the stronger choice.",
      ]}
      pages={giftSetPages}
      extraSections={[
        {
          heading: "Choosing a piece count",
          bullets: [
            "Three pieces: volume gifting - onboarding, delegates, recurring awards",
            "Four pieces: client gifting and the upper tier of an event programme",
            "Five pieces: competitive gifting where your box sits beside a competitor's",
            "Six pieces: top-tier recognition for lists measured in tens, not hundreds",
          ],
        },
        {
          heading: "Personalization applies at every size",
          body: [
            "Every configuration supports company logo branding, and the notebook or journal in each can carry an individual recipient name. Adding a name to a three-piece set does more for how the gift lands than adding a fourth item to it.",
          ],
        },
      ]}
    />
  );
}
