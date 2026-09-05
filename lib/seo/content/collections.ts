/**
 * Category (collection) page SEO content, keyed by the live collection slug.
 *
 * Position in the hierarchy: category pages own CLUSTER HEAD terms. Product
 * pages own specific long-tail terms and link upward; the homepage owns the
 * broadest brand-level terms. Keeping those three tiers separate is what stops
 * 24 product pages from all competing for "corporate gifts".
 *
 * CANNIBALIZATION FIX RECORDED HERE
 * The source Content Pack assigned "eco friendly corporate gifts" as BOTH the
 * Eco category head term AND the primary keyword of the Sage Green Sustainable
 * Gift Set. Two pages cannot own one primary. Resolution: the category page is
 * the canonical owner (it is a browse-intent query best served by a listing of
 * every eco set), and the Sage Green product moved to "sustainable gift set for
 * employees" -- previously its strongest secondary. See SEO_IMPLEMENTATION_REPORT.md.
 *
 * Likewise "custom stationery gift set" is deliberately NOT a Premium category
 * target even though the pack lists it there: the Complete Stationery Gift Set
 * product owns it.
 */

export interface CollectionFaq {
  question: string;
  answer: string;
}

export interface CollectionSeoContent {
  /** Live collection slug (see data/categories.ts and the collections table). */
  slug: string;
  /** The cluster head term this category page owns. Unique across categories. */
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  /** Intro copy rendered above the product grid. */
  intro: string[];
  /** "What's in this collection" bullets -- buying guidance, not adjectives. */
  buyingPoints: string[];
  faqs: CollectionFaq[];
  /** Contextual links out of this category, with descriptive anchors. */
  relatedLinks: { label: string; href: string }[];
}

export const collectionSeoContent: CollectionSeoContent[] = [
  {
    slug: "joining-gifts",
    primaryKeyword: "employee welcome kit",
    secondaryKeywords: [
      "employee starter kit",
      "corporate joining kit",
      "new joinee kit",
      "employee induction kit",
      "branded employee welcome kit",
      "bulk employee joining kits",
      "HR onboarding kit",
    ],
    seoTitle: "Employee Welcome Kits - Custom Onboarding & Joining Gifts",
    metaDescription:
      "Branded employee welcome kits and corporate joining kits with logo printing and name personalization. Built for onboarding programmes at any scale.",
    h1: "Employee Welcome Kits & Joining Gifts",
    intro: [
      "An employee welcome kit is the first physical thing a new hire receives from you, and it sets the tone for everything that follows. This collection covers the full range - from a compact, high-volume joining kit for rolling hires to a fuller diary-and-pen onboarding set for senior roles.",
      "Every kit here can carry your logo, and most support per-employee name personalization, so a batch ordered for thirty joiners still feels addressed to each individual. Re-orders reproduce the same specification, which matters when you are hiring continuously rather than in one intake.",
    ],
    buyingPoints: [
      "Choose the compact kit for high-volume and campus hiring where per-head cost matters most",
      "Choose the executive onboarding set when the kit needs a diary and a fuller presentation box",
      "Blue and colour-led kits suit brand-matched welcome desks and event onboarding",
      "All kits support logo printing; most support individual employee names",
      "Re-orders match the original batch, so kits stay consistent as headcount grows",
    ],
    faqs: [
      {
        question: "What should an employee welcome kit include?",
        answer:
          "At minimum something the new joiner will actually use from day one - a notebook or diary and a pen are the dependable core. Fuller kits add a keychain, card holder or desk accessories, and a printed welcome card carrying your culture message.",
      },
      {
        question: "Can welcome kits be personalized per employee?",
        answer:
          "Yes. Alongside company logo branding, most kits in this collection support individual name personalization, which is what makes a batch feel addressed to each joiner rather than handed out generically.",
      },
      {
        question: "Can you support continuous hiring rather than one batch?",
        answer:
          "Yes. These kits are designed for repeat ordering - the same specification and branding are reproduced, so a joiner in month nine receives the same kit as one from month one.",
      },
    ],
    relatedLinks: [
      { label: "onboarding gift ideas for new hires", href: "/gifting/employee-onboarding" },
      { label: "bulk corporate gifting programmes", href: "/gifting/bulk-corporate-gifting" },
      { label: "request a quote for your headcount", href: "/bulk-enquiry" },
    ],
  },
  {
    slug: "premium-gifts",
    primaryKeyword: "premium corporate gift sets",
    secondaryKeywords: [
      "premium gifts for employees",
      "premium client gifts",
      "premium branded gift sets",
      "premium gifts for clients",
      "premium notebook pen gift set",
      "premium corporate gifts for events",
    ],
    seoTitle: "Premium Corporate Gift Sets - Branded Gifts for Clients",
    metaDescription:
      "Premium corporate gift sets with logo branding and name personalization. Notebook, pen and stationery kits for clients, teams and events.",
    h1: "Premium Corporate Gift Sets",
    intro: [
      "Premium sits between the everyday giveaway and the executive shortlist: gifts substantial enough to send to a client or hand out at a flagship event, without the price of the luxury range. It is where most corporate gifting budgets actually land.",
      "The sets in this collection are built around quality notebooks and coordinated accessories, with gold-foil, full-colour or screen-printed branding depending on the finish. Because the palettes are neutral, one set can usually cover clients, partners and internal teams - which is why procurement teams standardize here.",
    ],
    buyingPoints: [
      "Black-and-gold and white sets suit festive campaigns and client hampers",
      "The all-purpose notebook set works as a single SKU across clients, events and staff",
      "Green-and-gold suits launches, mailers and brands with those colours",
      "Gold-foil, full-colour and screen printing available depending on the set",
      "Neutral palettes reduce how many different gifts you need to stock",
    ],
    faqs: [
      {
        question: "What separates a premium set from a luxury one?",
        answer:
          "Premium sets are built for breadth - enough quality to impress a client, priced so you can send them to a whole account list or event. Luxury sets are for short, high-value lists where the packaging and materials do more of the work.",
      },
      {
        question: "Can one premium gift set cover clients, events and employees?",
        answer:
          "Often yes, and the all-purpose notebook set is designed for exactly that. A neutral palette and consistent logo branding let a single SKU serve several audiences instead of maintaining separate inventories.",
      },
      {
        question: "Are these sets available with our logo?",
        answer:
          "Yes, every set in this collection supports logo branding, and several also support individual recipient names in foil.",
      },
    ],
    relatedLinks: [
      { label: "client appreciation gifting", href: "/gifting/client-appreciation" },
      { label: "festive corporate gifting", href: "/occasions/festive-corporate-gifting" },
      { label: "luxury corporate gifts", href: "/categories/luxury-gifts" },
    ],
  },
  {
    slug: "luxury-gifts",
    primaryKeyword: "luxury corporate gifts",
    secondaryKeywords: [
      "luxury corporate gift sets",
      "executive gift set",
      "high end corporate gifts",
      "luxury gifts for leadership",
      "luxury business gifts",
      "premium luxury corporate gifts",
    ],
    seoTitle: "Luxury Corporate Gifts - Executive Gift Sets with Branding",
    metaDescription:
      "Luxury corporate gifts and executive gift sets with embossed initials or discreet logo branding. Built for leadership, VIP clients and board gifting.",
    h1: "Luxury Corporate Gifts & Executive Gift Sets",
    intro: [
      "Luxury gifting is a different exercise from bulk gifting. The recipient list is short, each name is chosen deliberately, and the gift has to justify the relationship it represents - a managing partner, a flagship account, a retiring executive.",
      "These sets lead with materials and presentation: leather-look journals, structured folios, matte-black monochrome sets, and planner boxes built so the unboxing is part of the gift. Personalization here is deliberately understated - debossed initials, blind-embossed logos, tone-on-tone foil - because at this level restraint reads as more expensive than a large printed logo.",
    ],
    buyingPoints: [
      "Leather-look and brown journal sets suit legal, finance and heritage-brand relationships",
      "All-black executive sets suit CXO gifting, investor meetings and leadership summits",
      "The luxury planner box is the strongest new-year and festive executive gift",
      "Clutch and folio sets suit award evenings and board-level recognition",
      "Understated personalization - debossing, blind embossing, tone-on-tone foil",
    ],
    faqs: [
      {
        question: "Is there a low minimum for luxury gifting?",
        answer:
          "Yes. The luxury sets carry our lowest minimums precisely because they are meant for short, curated lists rather than mass distribution. Share your recipient count and we will quote against it.",
      },
      {
        question: "What personalization suits an executive gift?",
        answer:
          "Understated marks: debossed or embossed initials, a blind-embossed logo, or tone-on-tone foil. A large printed logo tends to work against the impression a luxury set is trying to make.",
      },
      {
        question: "Which luxury set works best for new-year gifting?",
        answer:
          "The Luxury Planner Gift Box, because a planner is most welcome at the start of the year it covers. Order well ahead of January so embossing proofs are settled in time.",
      },
    ],
    relatedLinks: [
      { label: "executive and leadership gifting", href: "/gifting/executive-leadership" },
      { label: "new year corporate gifts", href: "/occasions/new-year-corporate-gifts" },
      { label: "premium corporate gift sets", href: "/categories/premium-gifts" },
    ],
  },
  {
    slug: "eco-gifts",
    primaryKeyword: "eco friendly corporate gifts",
    secondaryKeywords: [
      "sustainable corporate gifts",
      "eco friendly corporate gift sets",
      "green corporate gifting",
      "recycled material gift set",
      "wooden corporate gifts",
      "plastic free corporate gifting",
      "ESG corporate gifting",
    ],
    seoTitle: "Eco Friendly Corporate Gifts - Sustainable Branded Gift Sets",
    metaDescription:
      "Eco friendly corporate gifts with recycled materials, wooden pens and plastic-free packaging. Debossed and laser-engraved logo branding.",
    h1: "Eco Friendly Corporate Gifts",
    intro: [
      "Sustainable gifting has moved from a nice gesture to something recipients actively notice and procurement teams have to answer for. This collection is built for that: recycled and responsibly sourced materials, wood in place of plastic, and packaging that does not undo the point of the gift.",
      "Branding methods matter as much as materials here. Laser engraving burns a logo directly into wood, debossing presses it into recycled board, and soy-ink printing keeps the finish consistent with the material story - which is what lets the gift stand up in a sustainability conversation rather than just look green.",
    ],
    buyingPoints: [
      "Wood-finish sets with laser-engraved logos for premium eco gifting",
      "Sage green recycled sets for sustainability-led brands and ESG programmes",
      "Recycled-cover notebook sets for high-volume eco campaigns",
      "Plastic-free packaging across the collection",
      "Material details available on request for ESG documentation",
    ],
    faqs: [
      {
        question: "What makes these corporate gifts eco friendly?",
        answer:
          "Recycled and responsibly sourced materials, wood in place of plastic components, and plastic-free packaging. Branding is applied by laser engraving, debossing or soy-ink printing so the finishing does not undercut the materials.",
      },
      {
        question: "Can you provide material details for our ESG reporting?",
        answer:
          "Yes, material details for these sets are available on request so they can be referenced in sustainability documentation.",
      },
      {
        question: "Is eco gifting affordable at campaign volume?",
        answer:
          "The recycled-cover notebook set exists for exactly that reason - it is the high-volume, campaign-priced option, so switching a default giveaway to an eco alternative does not require renegotiating the budget.",
      },
    ],
    relatedLinks: [
      { label: "sustainable gifting for ESG programmes", href: "/guides/eco-friendly-corporate-gifting" },
      { label: "bulk eco gifting for events", href: "/gifting/events-conferences" },
      { label: "request a quote", href: "/bulk-enquiry" },
    ],
  },
];

const bySlug = new Map(collectionSeoContent.map((entry) => [entry.slug, entry]));

export function getCollectionSeoContent(slug: string): CollectionSeoContent | undefined {
  return bySlug.get(slug);
}
