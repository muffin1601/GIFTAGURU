import type { LandingPageContent } from "./types";

/**
 * Multi-piece gift set pages -- the consolidation target for the workbook's
 * "3-6 Piece Keywords" sheet (160 keywords) plus the 40 cross-industry piece
 * keywords on the main sheet.
 *
 * WHY FOUR PAGES AND NOT 200. Those 200 keywords are almost entirely one
 * template filled in twice over: {3,4,5,6} x {industry} x {joining kit |
 * employee welcome kit | personalized employee welcome kit}. "4 piece
 * personalized pharma employee welcome kit" and "5 piece personalized
 * healthcare employee welcome kit" describe the same product decision.
 *
 * Piece COUNT is the only axis in that set that changes what a buyer actually
 * gets, so it is the only axis that earns its own page. The industry axis is
 * already served by /industries, and the "personalized" axis is a branding
 * option covered on every page here. Building the full cross-product would
 * produce ~200 pages differing by one word each -- the definition of doorway
 * pages.
 *
 * Each page below therefore has to justify itself on genuine difference: what
 * is actually in a 3-piece versus a 6-piece kit, what it costs per head, and
 * which occasion each suits. That is a real buying question, and it is
 * answered differently on each of the four.
 */
export const giftSetPages: LandingPageContent[] = [
  {
    slug: "3-piece-corporate-gift-sets",
    primaryKeyword: "3 piece corporate gift set",
    secondaryKeywords: [
      "3 piece employee welcome kit",
      "3 piece corporate joining kit",
      "3 piece personalized onboarding kit",
      "3 piece client appreciation gift set",
      "3 piece conference welcome kit",
      "3 piece eco friendly corporate gift set",
    ],
    seoTitle: "3 Piece Corporate Gift Sets - Compact Branded Kits",
    metaDescription:
      "3 piece corporate gift sets for onboarding, events and client gifting. Compact branded kits with logo printing and per-recipient name options.",
    h1: "3 Piece Corporate Gift Sets",
    intro: [
      "A three-piece set is the smallest configuration that still reads as a gift rather than a handout. Typically that means a notebook, a pen and one accessory - a keychain, card holder or welcome card - presented together rather than handed over loose.",
      "It is the configuration most companies land on for volume gifting, because it clears the bar of feeling considered at a per-head cost that survives a large recipient list.",
    ],
    sections: [
      {
        heading: "What a three-piece set typically contains",
        bullets: [
          "A notebook or journal - the piece that gets used daily",
          "A matching or coordinated pen",
          "One accessory: keychain, card holder, or a printed welcome card",
          "Presented together, usually in a box or sleeve",
        ],
      },
      {
        heading: "Where three pieces is the right choice",
        body: [
          "High-volume situations, mostly. Conference delegate bags, campus and graduate intakes, rolling employee onboarding, and company-wide distributions all benefit more from reaching everyone with a decent set than from reaching a subset with a larger one.",
          "It also suits recurring programmes - monthly spot awards, birthday gifting - where the same set is ordered repeatedly against a standing budget.",
        ],
      },
      {
        heading: "Cost behaviour at three pieces",
        body: [
          "Three pieces is where per-head cost stays low enough that reaching everyone is realistic. That matters more than it sounds: a programme that covers the whole company at a modest level generally produces more goodwill than one that covers a third of it generously and leaves the rest wondering why they were excluded.",
          "It is also the configuration where volume pricing does the most work, because the simpler construction and single-colour printing hold up across very large runs without finish drifting between batches.",
        ],
      },
      {
        heading: "Keeping it from feeling thin",
        body: [
          "The difference between a three-piece set that feels generous and one that feels minimal is almost entirely presentation and personalization. A named cover and a proper box do more for perceived value than adding a fourth item does.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is usually included in a 3 piece corporate gift set?",
        answer:
          "A notebook or journal, a coordinated pen, and one accessory such as a keychain, card holder or printed welcome card - presented together rather than handed over separately.",
      },
      {
        question: "Is three pieces enough for an employee welcome kit?",
        answer:
          "For most volume onboarding, yes. The things that make a welcome kit land are usefulness and personalization rather than piece count - a named three-piece kit in a proper box outperforms a larger unnamed one.",
      },
      {
        question: "Can a 3 piece set be personalized per recipient?",
        answer:
          "Yes. Logo branding is standard across the set, and individual names can be added to the notebook cover, which is what makes a large batch feel individually addressed.",
      },
    ],
    recommendedProductSlugs: [
      "compact-corporate-welcome-kit",
      "minimal-notebook-pen-set",
      "blue-notebook-welcome-set",
      "green-eco-notebook-gift-set",
    ],
    relatedLinks: [
      { label: "4 piece corporate gift sets", href: "/gift-sets/4-piece-corporate-gift-sets" },
      { label: "employee onboarding gifts", href: "/gifting/employee-onboarding" },
      { label: "bulk corporate gifting", href: "/gifting/bulk-corporate-gifting" },
    ],
  },
  {
    slug: "4-piece-corporate-gift-sets",
    primaryKeyword: "4 piece corporate gift set",
    secondaryKeywords: [
      "4 piece employee welcome kit",
      "4 piece corporate joining kit",
      "4 piece client appreciation gift set",
      "4 piece personalized onboarding kit",
      "4 piece premium corporate gift set",
      "4 piece conference welcome kit",
    ],
    seoTitle: "4 Piece Corporate Gift Sets - Branded Kits for Clients",
    metaDescription:
      "4 piece corporate gift sets with notebook, pen and coordinated accessories. Branded kits for client gifting, onboarding and premium delegate tiers.",
    h1: "4 Piece Corporate Gift Sets",
    intro: [
      "Four pieces is where a gift set stops being a kit and starts being a present. The extra item - usually a card holder or a second desk accessory - is what lets the set fill a box properly, and a box that opens to something arranged rather than something packed changes how the whole gift reads.",
      "It is the configuration most often chosen for client gifting, because it carries visible substance without moving into luxury pricing.",
    ],
    sections: [
      {
        heading: "What a four-piece set typically contains",
        bullets: [
          "A notebook or journal",
          "A coordinated pen",
          "A card holder or second desk accessory",
          "A keychain or comparable fourth piece",
          "Coordinated presentation packaging",
        ],
      },
      {
        heading: "Where four pieces earns the step up",
        body: [
          "Client gifting is the clearest case. A four-piece desk set sent at a deal closure or account anniversary carries the weight of the occasion in a way a notebook and pen do not, while staying well inside a defensible spend per recipient.",
          "It also works as the upper tier of a two-tier event programme - the set that goes to speakers and sponsors while delegates receive the three-piece kit.",
        ],
      },
      {
        heading: "Four pieces as the middle tier",
        body: [
          "In a tiered programme, four pieces is usually the tier that does the most work. It is visibly better than the standard kit without carrying the cost or the lead time of the largest sets, which makes it the natural choice for the group in the middle: speakers rather than delegates, key accounts rather than the whole client list, managers rather than the full team.",
          "Because the step up is obvious at a glance, it also communicates the tiering without anyone having to explain it.",
        ],
      },
      {
        heading: "Coordination matters more at four pieces",
        body: [
          "Once there are four items in a box, whether they look like a set becomes obvious. Coordinated finishes across the pieces are what separate a curated set from an assortment, which is why the sets recommended here are designed together rather than assembled.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is in a 4 piece corporate gift set?",
        answer:
          "Typically a notebook, a coordinated pen, a card holder or desk accessory, and a keychain, in coordinated presentation packaging. The fourth piece is what lets the box present as arranged rather than packed.",
      },
      {
        question: "Is a 4 piece set better than a 3 piece for client gifting?",
        answer:
          "Generally yes. Client gifting attaches to specific relationship moments where visible substance matters, and four pieces carries that without moving into luxury pricing.",
      },
      {
        question: "Do all four pieces carry our branding?",
        answer:
          "They can. Full-set branding keeps your mark across every item, though some teams brand the box and personalise the notebook with the recipient's name instead.",
      },
    ],
    recommendedProductSlugs: [
      "client-appreciation-desk-set",
      "corporate-gift-set-with-notebook",
      "executive-onboarding-essentials-set",
      "white-premium-corporate-gift-set",
    ],
    relatedLinks: [
      { label: "3 piece corporate gift sets", href: "/gift-sets/3-piece-corporate-gift-sets" },
      { label: "5 piece corporate gift sets", href: "/gift-sets/5-piece-corporate-gift-sets" },
      { label: "corporate gifts for clients", href: "/gifting/client-appreciation" },
    ],
  },
  {
    slug: "5-piece-corporate-gift-sets",
    primaryKeyword: "5 piece corporate gift set",
    secondaryKeywords: [
      "5 piece employee welcome kit",
      "5 piece premium corporate gift set",
      "5 piece corporate joining kit",
      "5 piece luxury corporate gift set",
      "5 piece client appreciation gift set",
      "5 piece personalized onboarding kit",
    ],
    seoTitle: "5 Piece Corporate Gift Sets - Premium Multi-Item Kits",
    metaDescription:
      "5 piece corporate gift sets with notebook, pen, keychain and stationery accessories. Premium multi-item kits for dealer meets and year-end gifting.",
    h1: "5 Piece Corporate Gift Sets",
    intro: [
      "At five pieces the set is doing something specific: signalling that the recipient was worth the larger gift. This is the configuration companies reach for when the gift will be compared with what someone else sent - a dealer meet, a partner convention, a year-end client list.",
      "The trade-off is honest. Five pieces costs more per head and takes longer to produce with full-set branding, so it is worth spending on where it will be noticed rather than across an entire company.",
    ],
    sections: [
      {
        heading: "What a five-piece set typically contains",
        bullets: [
          "A quality notebook or journal",
          "A matching pen",
          "A metal keychain",
          "Additional coordinated stationery accessories",
          "A structured presentation box that holds the arrangement",
        ],
      },
      {
        heading: "Where a five-piece set makes sense",
        body: [
          "Competitive gifting situations, primarily. At a dealer meet or partner convention, recipients open several gifts in the same room, and piece count is one of the few differences visible at a glance.",
          "Year-end and festive client gifting is the other case, for the same reason: your gift sits alongside everyone else's on the same desk.",
        ],
      },
      {
        heading: "Presentation carries the piece count",
        body: [
          "Five items only work as a set if the box holds them in an arrangement. A structured box is what turns the piece count into perceived value rather than into clutter - and it is also what protects the contents in transit at volume.",
        ],
      },
      {
        heading: "When a smaller set is the better call",
        body: [
          "Five pieces is not automatically the stronger choice. If the recipient list is large, the same budget spread across five-piece sets for half the list and nothing for the rest is worse than three-piece sets for everyone. And if any of the five items is filler, the set reads as padded rather than generous.",
          "The test is whether every piece would be kept on its own. Where the answer is no for one or two of them, a smaller, better-presented set is the stronger gift.",
        ],
      },
      {
        heading: "Planning a larger set",
        body: [
          "Full-set branding across five pieces means more artwork to approve, so allow more lead time than for a simpler kit. This is a configuration to plan into a calendar rather than order reactively.",
        ],
      },
    ],
    faqs: [
      {
        question: "When is a 5 piece gift set worth the extra cost?",
        answer:
          "When the gift will be compared with others - dealer meets, partner conventions, year-end client gifting. In those situations piece count is one of the few differences visible at a glance.",
      },
      {
        question: "Does a bigger set need more lead time?",
        answer:
          "Yes. Full-set branding across five pieces means more artwork to approve before production, so it suits planned gifting rather than a reactive order.",
      },
      {
        question: "Will a five-piece set survive shipping at volume?",
        answer:
          "A structured presentation box is what makes it work - it holds the pieces in an arrangement, which both creates the perceived value and protects the contents in transit.",
      },
    ],
    recommendedProductSlugs: [
      "complete-stationery-gift-set",
      "black-gold-premium-notebook-set",
      "green-gold-corporate-stationery-set",
      "grey-folio-notebook-set",
    ],
    relatedLinks: [
      { label: "4 piece corporate gift sets", href: "/gift-sets/4-piece-corporate-gift-sets" },
      { label: "6 piece corporate gift sets", href: "/gift-sets/6-piece-corporate-gift-sets" },
      { label: "dealer and channel partner gifting", href: "/gifting/dealer-channel-partner" },
    ],
  },
  {
    slug: "6-piece-corporate-gift-sets",
    primaryKeyword: "6 piece corporate gift set",
    secondaryKeywords: [
      "6 piece luxury corporate gift set",
      "6 piece premium corporate gift set",
      "6 piece employee welcome kit",
      "6 piece corporate joining kit",
      "6 piece client appreciation gift set",
      "6 piece personalized onboarding kit",
    ],
    seoTitle: "6 Piece Corporate Gift Sets - Luxury Multi-Item Hampers",
    metaDescription:
      "6 piece corporate gift sets for executive and top-tier gifting. Full multi-item kits with coordinated branding and structured presentation boxes.",
    h1: "6 Piece Corporate Gift Sets",
    intro: [
      "Six pieces is the top of the multi-item range, and it is a deliberate statement rather than a default. Sets this size go to the recipients a company genuinely cannot afford to under-gift: top-performing distributors, flagship accounts, senior leadership.",
      "The honest caution is that piece count alone does not create a premium gift. Six mediocre items in a large box is a worse gift than three good ones - which is why the sets recommended here are chosen for the quality of each piece first.",
    ],
    sections: [
      {
        heading: "What a six-piece set typically contains",
        bullets: [
          "A premium journal, planner or folio as the anchor piece",
          "A matching pen",
          "A keychain and card holder",
          "Further coordinated desk or stationery accessories",
          "A structured presentation box",
          "An optional personalised message card",
        ],
      },
      {
        heading: "Where the largest set belongs",
        body: [
          "Top-tier recognition, essentially. The partners who actually delivered, the accounts a business depends on, the leadership tier at an annual summit. These are lists measured in tens rather than hundreds, which is what makes the per-head cost workable.",
        ],
      },
      {
        heading: "Quality before quantity",
        body: [
          "A six-piece set fails when the extra pieces are filler. If the choice is between six average items and four good ones, four wins - and a recipient senior enough to receive the largest set is precisely the person who can tell the difference.",
        ],
      },
      {
        heading: "Personalization at the top tier",
        body: [
          "At this level personalization should be understated: debossed or embossed initials on the anchor piece and a printed message card, rather than logos printed across all six items. Restraint is what keeps a large set from reading as promotional.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a 6 piece gift set always better than a smaller one?",
        answer:
          "No, and it is worth being clear about that. Six average items in a large box is a worse gift than four good ones. Piece count only helps when every piece holds up on its own.",
      },
      {
        question: "Who should receive a six-piece set?",
        answer:
          "Top-tier recipients - the distributors who genuinely delivered, flagship accounts, and senior leadership. These lists are usually in the tens, which is what makes the per-head cost sensible.",
      },
      {
        question: "How should the largest sets be personalised?",
        answer:
          "Understated. Debossed or embossed initials on the anchor piece plus a printed message card, rather than logos across all six items - heavy branding makes a large set read as promotional.",
      },
    ],
    recommendedProductSlugs: [
      "complete-stationery-gift-set",
      "luxury-planner-gift-box",
      "brown-luxury-stationery-set",
      "black-executive-corporate-set",
    ],
    relatedLinks: [
      { label: "5 piece corporate gift sets", href: "/gift-sets/5-piece-corporate-gift-sets" },
      { label: "the luxury and executive range", href: "/categories/luxury-gifts" },
      { label: "gifting for senior leadership", href: "/gifting/executive-leadership" },
    ],
  },
];
