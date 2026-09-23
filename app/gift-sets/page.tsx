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
      visualGallery={[
        {
          src: "/catalogue-2026-images/page-03-img-01_480x445.png",
          alt: "Black executive Diwali corporate gift kit in a presentation box",
        },
        {
          src: "/catalogue-2026-images/page-03-img-02_480x431.png",
          alt: "Corporate Diwali gift kit with bottle, tumbler and desk accessories",
        },
        {
          src: "/catalogue-2026-images/page-03-img-03_560x423.png",
          alt: "Multi-item corporate gift kit in a black presentation box",
        },
        {
          src: "/catalogue-2026-images/page-03-img-04_560x385.png",
          alt: "Corporate Diwali gift kit with notebook, mug and accessories",
        },
        {
          src: "/catalogue-2026-images/page-03-img-05_640x476.png",
          alt: "Black corporate gift kit with bottle and desk accessories",
        },
        {
          src: "/catalogue-2026-images/page-03-img-06_720x541.png",
          alt: "Corporate Diwali gift kit with bottle, notebook, pen and keychain",
        },
      ]}
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
        {
          heading: "Corporate gift kits by recipient and occasion",
          body: [
            "Corporate gift kits should be chosen for the recipient before their piece count. A two or three item corporate gift kit is often enough for a broad employee list, a new employee welcome kit or an event delegate programme because every item can be useful and the presentation stays compact. Four item corporate gift sets add the substance that client gifting and middle-tier recognition often need. Larger premium and luxury corporate gift kits are best reserved for leadership, flagship accounts and important partners, where the relationship supports a more considered presentation.",
            "For Diwali corporate gifting, the same structure makes procurement simpler. Choose a consistent Diwali gift kit for employees, then consider a premium Diwali corporate gift set for clients and senior recipients. The aim is not to increase item count for its own sake. Each piece should earn its place, work together visually and fit securely in the box. A well-presented three-piece gift set regularly makes a stronger impression than a padded four-piece set.",
          ],
        },
        {
          heading: "Branded, customised and sustainable gift sets",
          body: [
            "Logo branding turns a gift set into a company programme, while a recipient name turns it into a personal gesture. Many teams use both: understated branding on the box and a name, initials or message card inside. The available branding method depends on the selected product, so use the product page and bulk enquiry to confirm what is possible before planning a personalised run.",
            "Sustainable corporate gift kits deserve the same level of scrutiny as any other set. Look for materials and packaging that fit the brief, then make sure the contents are useful enough to stay in use. This is especially important for eco-friendly Diwali gift kits, employee welcome kits and large corporate gifting programmes, where a durable desk item has a longer life than a novelty product.",
          ],
        },
      ]}
    />
  );
}
