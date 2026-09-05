import type { LandingPageContent } from "./types";

/**
 * Seasonal / occasion landing pages.
 *
 * These are EVERGREEN pages, not campaign pages. Each lives at a permanent URL
 * and is updated in place rather than rebuilt each year, because seasonal
 * search demand starts climbing well before the occasion and a URL that
 * accumulates authority across years outperforms one published each autumn.
 *
 * For the same reason the copy avoids naming a specific year or date. A page
 * that says "Diwali 2026" is stale the following January; one that explains
 * when to start planning stays useful indefinitely and needs no annual edit.
 *
 * Lead-time guidance here is expressed in relative terms ("several weeks
 * ahead", "before the festive rush") rather than as a promised dispatch date,
 * because actual fulfilment timelines are a store setting the team controls,
 * not something editorial copy should commit to.
 */
export const occasionPages: LandingPageContent[] = [
  {
    slug: "diwali-corporate-gifts",
    primaryKeyword: "Diwali corporate gifts",
    secondaryKeywords: [
      "diwali corporate gifts premium",
      "diwali gifts for clients premium",
      "festival corporate gifts India",
      "premium diwali corporate gifts",
      "diwali gifts for employees",
    ],
    seoTitle: "Diwali Corporate Gifts - Premium Branded Festive Sets",
    metaDescription:
      "Diwali corporate gifts for clients, employees and partners. Branded festive gift sets with logo or name personalization, planned ahead of the rush.",
    h1: "Diwali Corporate Gifts",
    intro: [
      "Diwali is the single busiest gifting moment in the Indian corporate calendar, which is precisely the problem. Your client receives gifts from every supplier in the same fortnight, and the ones that get remembered are almost never the most expensive - they are the ones that arrived early and looked unlike everything else on the table.",
      "Planning is the whole game here. Personalization needs a proof cycle, production capacity tightens as the season approaches, and the last two weeks before the festival are when everyone tries to order at once.",
    ],
    sections: [
      {
        heading: "Start earlier than feels necessary",
        body: [
          "The practical deadline for Diwali gifting is not the festival - it is the point where personalization proofs, production and delivery still fit comfortably ahead of it. Teams that gift well usually confirm quantities and artwork weeks before they intend to send anything.",
          "Arriving early is also a competitive advantage in its own right. A gift that lands before the rush is opened properly; one that arrives in the final week joins a pile.",
        ],
      },
      {
        heading: "Standing out in a season of black and gold",
        body: [
          "Festive corporate gifting converges hard on the same palette every year. That makes differentiation cheap: a burgundy set with rose-gold detailing or a crisp white set reads as deliberate simply because it is not another black-and-gold box.",
          "Where a classic festive look is the right call - for a conservative client list, or where the gift sits alongside other brand material - the black-and-gold notebook set is the dependable choice.",
        ],
      },
      {
        heading: "Client, employee and partner lists",
        body: [
          "Most companies run three Diwali lists at once, and they rarely need the same gift. Clients and key partners justify the premium and luxury sets; employees are usually gifted at scale, where a well-made mid-range set across everyone beats an expensive gift for a few.",
        ],
        bullets: [
          "Key clients and partners: burgundy, white premium or luxury planner sets",
          "Broad client list: black-and-gold notebook set",
          "Employees at scale: journal and pen, or the compact welcome kit",
          "Dealers and distributors: multi-piece sets with full-set branding",
        ],
      },
      {
        heading: "Personalization for the festive season",
        body: [
          "Gold-foil names suit the season better than printed logos, and they turn a festive gift into a personal one. Where the recipient list is large, a logo on the presentation box with names on the items inside is the usual compromise.",
        ],
      },
    ],
    faqs: [
      {
        question: "When should we order Diwali corporate gifts?",
        answer:
          "Considerably earlier than the festival itself. Personalization needs a proof cycle before production, and capacity tightens as the season approaches - so confirm quantities and artwork several weeks ahead rather than in the final fortnight.",
      },
      {
        question: "How do we make a Diwali gift stand out?",
        answer:
          "Arrive early and avoid the default palette. Festive gifting converges on black and gold every year, so a burgundy or white set reads as deliberate, and a gift that lands before the rush gets opened properly rather than added to a pile.",
      },
      {
        question: "Should employees and clients receive the same Diwali gift?",
        answer:
          "Usually not. Client and partner gifting justifies the premium and luxury range; employee gifting is normally at scale, where a well-made mid-range set across everyone lands better than a costly gift for a few.",
      },
    ],
    recommendedProductSlugs: [
      "burgundy-relationship-gift-set",
      "black-gold-premium-notebook-set",
      "white-premium-corporate-gift-set",
      "luxury-planner-gift-box",
    ],
    relatedLinks: [
      { label: "seasonal gifting for the festive quarter", href: "/occasions/festive-corporate-gifting" },
      { label: "corporate gifts for clients", href: "/gifting/client-appreciation" },
      { label: "the luxury and executive range", href: "/categories/luxury-gifts" },
    ],
  },
  {
    slug: "new-year-corporate-gifts",
    primaryKeyword: "New Year corporate gifts",
    secondaryKeywords: [
      "new year corporate gifts premium",
      "new year gifts for office staff",
      "year end corporate gifts",
      "new year planner gifts office",
      "client gifting for new year",
      "high end new year gift set",
    ],
    seoTitle: "New Year Corporate Gifts - Planners & Executive Gift Sets",
    metaDescription:
      "New Year corporate gifts including branded planners and executive sets. Personalised with names or logos, planned ahead of the January rush.",
    h1: "New Year Corporate Gifts",
    intro: [
      "New Year gifting has a built-in advantage over every other season: planners and diaries are genuinely wanted in January, and they stay on a desk for the following twelve months. Few gifts have that kind of dwell time.",
      "It has an equally built-in deadline. A planner delivered in the second week of January has already lost part of its point, so this is one of the few occasions where being late is worse than not gifting at all.",
    ],
    sections: [
      {
        heading: "Why planners work for New Year",
        body: [
          "A planner gifted in late December or the first days of January arrives exactly when someone is willing to start using one. That timing is what makes it outperform more expensive gifts that get admired once and put away.",
          "The luxury planner box is the executive-list choice, with a structured presentation box and cover embossing; the grey planner set is the practical option for gifting a whole team.",
        ],
      },
      {
        heading: "Year-end versus new-year timing",
        body: [
          "Two distinct moments sit close together. Year-end gifting closes off the year and is often about thanks for work delivered; new-year gifting is forward-looking and is where planners and diaries belong. Choosing which one you are doing usually settles the gift.",
        ],
      },
      {
        heading: "Executive and investor gifting",
        body: [
          "January is a natural moment for board, investor and senior client gifting, because it attaches to a fresh cycle rather than a festival. Understated sets suit that: an embossed planner box or an all-black executive set carries the occasion without festive decoration.",
        ],
      },
      {
        heading: "Ordering ahead of the deadline",
        body: [
          "Because the useful window closes in early January, artwork and personalization need settling in advance - which in practice means starting while the festive season is still running. Teams that leave it until the last week of December are usually too late for embossing.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why are planners the standard New Year corporate gift?",
        answer:
          "Timing. A planner arriving at the start of the year is used for the following twelve months, which gives it far longer dwell time on a desk than a gift that is admired once and put away.",
      },
      {
        question: "When is it too late to order New Year gifts?",
        answer:
          "The useful window effectively closes in the first days of January, so artwork and personalization need settling well before then - in practice, while the festive season is still running.",
      },
      {
        question: "What is the difference between year-end and new-year gifting?",
        answer:
          "Year-end gifting closes off the year and is usually about thanks for work delivered. New-year gifting is forward-looking, which is why planners and diaries belong there rather than in December.",
      },
    ],
    recommendedProductSlugs: [
      "luxury-planner-gift-box",
      "grey-planner-corporate-set",
      "black-executive-corporate-set",
      "complete-stationery-gift-set",
    ],
    relatedLinks: [
      { label: "board and executive gift ideas", href: "/gifting/executive-leadership" },
      { label: "custom planners with your logo", href: "/products/grey-planner-corporate-set" },
      { label: "planning the festive gifting season", href: "/occasions/festive-corporate-gifting" },
    ],
  },
  {
    slug: "festive-corporate-gifting",
    primaryKeyword: "festive corporate gifting",
    secondaryKeywords: [
      "festival corporate gifts India",
      "festive hampers for business partners",
      "Christmas corporate gifts",
      "festive gifts for clients bulk",
      "premium celebration gift box",
      "corporate gift hampers",
    ],
    seoTitle: "Festive Corporate Gifting - Branded Gift Sets for Festivals",
    metaDescription:
      "Festive corporate gifting for clients, employees and partners. Branded gift sets with foil personalization, planned across the festive calendar.",
    h1: "Festive Corporate Gifting",
    intro: [
      "Festive gifting is where the largest share of most corporate gifting budgets ends up, and where the least planning usually goes into it. The result is familiar: an order placed under time pressure, a gift chosen from what can still be produced, and a recipient who receives eleven similar boxes the same week.",
      "Treating the festive calendar as a plan rather than a deadline changes the outcome more than increasing the budget does.",
    ],
    sections: [
      {
        heading: "The festive calendar as a plan",
        body: [
          "The corporate festive season is not one date. Diwali dominates it in India, Christmas and New Year follow, and many organisations also gift around regional festivals and their own annual day. Deciding at the start of the quarter which of these you will actually gift on - and which you will not - is what prevents three rushed orders in a row.",
        ],
      },
      {
        heading: "One gift or several",
        body: [
          "Standardising on a single festive set across clients, employees and partners keeps procurement simple and is entirely defensible when the set is neutral enough to suit all three. The black-and-gold notebook set exists largely for that reason.",
          "Splitting is worth it where the audiences genuinely differ in seniority - a key-account list and a full employee roster rarely want the same thing.",
        ],
      },
      {
        heading: "Making festive gifts feel personal at scale",
        body: [
          "Foil personalization is what separates a festive gift from a festive delivery. Names on the item and a logo on the box is the arrangement that works at volume without turning each gift into a bespoke project.",
        ],
      },
      {
        heading: "Sustainable festive gifting",
        body: [
          "Festive gifting generates a lot of packaging, and it is increasingly noticed. The eco range offers a genuine alternative here - recycled materials and plastic-free packaging - which also gives a sustainability-led brand something consistent to say about its own gifting.",
        ],
      },
      {
        heading: "Avoiding the last-minute order",
        bullets: [
          "Decide which festivals you will gift on at the start of the quarter",
          "Confirm recipient lists before choosing the gift, not after",
          "Settle artwork and personalization proofs early - they are the bottleneck",
          "Order ahead of the rush so gifts arrive before the pile forms",
          "Keep the approved artwork on file for next year's re-order",
        ],
      },
    ],
    faqs: [
      {
        question: "Should we send the same festive gift to clients and employees?",
        answer:
          "You can, if the set is neutral enough to suit both - that is exactly what the black-and-gold range is for. Splitting is worth the extra effort where the two audiences differ sharply in seniority.",
      },
      {
        question: "How do we make festive gifts feel personal at volume?",
        answer:
          "Foil names on the item with your logo on the presentation box. It personalises every gift without turning each one into a separate project.",
      },
      {
        question: "Is there a sustainable festive gifting option?",
        answer:
          "Yes. The eco range uses recycled materials and plastic-free packaging, which matters in a season that generates a great deal of packaging - and gives sustainability-led brands something consistent to say about their own gifting.",
      },
    ],
    recommendedProductSlugs: [
      "burgundy-relationship-gift-set",
      "black-gold-premium-notebook-set",
      "white-premium-corporate-gift-set",
      "sage-green-sustainable-gift-set",
    ],
    relatedLinks: [
      { label: "Diwali corporate gifts", href: "/occasions/diwali-corporate-gifts" },
      { label: "New Year corporate gifts", href: "/occasions/new-year-corporate-gifts" },
      { label: "corporate gifts for clients", href: "/gifting/client-appreciation" },
    ],
  },
  {
    slug: "wedding-season-corporate-gifting",
    primaryKeyword: "wedding season corporate gifting",
    secondaryKeywords: [
      "wedding welcome hamper stationery",
      "personalized wedding favors premium",
      "wedding welcome hampers",
      "premium celebration gift box",
      "celebration gift set with name",
    ],
    seoTitle: "Wedding Season Corporate Gifting - Welcome Hamper Sets",
    metaDescription:
      "Wedding-season gifting sets for welcome hampers, guest favours and corporate hospitality. Foil name personalization and premium presentation.",
    h1: "Wedding Season Corporate Gifting",
    intro: [
      "The Indian wedding season creates a gifting requirement that sits oddly between corporate and personal. Companies gift into it in several ways - welcome hampers for out-of-town guests at a client's family wedding, favours for a corporate-hosted celebration, and gifts marking an employee's marriage.",
      "What these share is that the recipient is not at work. A branded corporate box lands badly at a wedding; the same quality of item with a foil name on it lands well.",
    ],
    sections: [
      {
        heading: "Welcome hampers for wedding guests",
        body: [
          "Guest welcome hampers are typically assembled from several items, and a stationery set works as the considered component alongside consumables. The burgundy set suits the palette of most Indian wedding celebrations, and the white premium set fits lighter, contemporary styling.",
        ],
      },
      {
        heading: "Personalization instead of branding",
        body: [
          "This is the one occasion where your logo should usually stay off the gift entirely. Gold-foil or metallic names read as celebratory; a company mark reads as an advertisement at a personal event. Where the gift is from a company, a printed card carries that far better than printing on the item.",
        ],
      },
      {
        heading: "Employee wedding and milestone gifting",
        body: [
          "An employee marrying is a genuine milestone, and a personalised gift acknowledges it in a way a standard appreciation item does not. Name personalization is what makes the difference here, for the same reason it does for guests.",
        ],
      },
      {
        heading: "Quantities and timing",
        body: [
          "Wedding-season gifting tends to run on short notice and curated lists rather than large volumes. Low minimums are what make it practical, and foil personalization still needs a proof - so even a small order benefits from a few weeks of lead time.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should a wedding-season gift carry our company logo?",
        answer:
          "Usually not on the item. A foil name reads as celebratory while a company mark reads as advertising at a personal event. If the gift is from a company, a printed card carries that message far better.",
      },
      {
        question: "What works in a wedding guest welcome hamper?",
        answer:
          "A stationery set works well as the considered, keepable component alongside consumables. Burgundy suits traditional palettes; a crisp white set suits contemporary styling.",
      },
      {
        question: "Are small quantities possible for wedding gifting?",
        answer:
          "Yes - the sets suited to this occasion carry our lowest minimums, because wedding gifting runs on curated lists rather than volume. Allow lead time for the foil personalization proof even on a small order.",
      },
    ],
    recommendedProductSlugs: [
      "burgundy-relationship-gift-set",
      "white-premium-corporate-gift-set",
      "journal-matching-pen-set",
      "luxury-clutch-executive-set",
    ],
    relatedLinks: [
      { label: "gifting through the festive quarter", href: "/occasions/festive-corporate-gifting" },
      { label: "premium corporate gift sets", href: "/categories/premium-gifts" },
      { label: "request a quote", href: "/bulk-enquiry" },
    ],
  },
  {
    slug: "work-anniversary-milestones",
    primaryKeyword: "work anniversary corporate gifts",
    secondaryKeywords: [
      "work anniversary gift set",
      "employee milestone gifts",
      "long service employee gifts",
      "long service recognition gifts",
      "employee recognition gift sets",
      "promotion gifts for employees",
    ],
    seoTitle: "Work Anniversary Gifts - Employee Milestone & Service Sets",
    metaDescription:
      "Work anniversary and long-service gifts with name personalization. Tiered milestone gifting from first-year recognition to decade-long tenure.",
    h1: "Work Anniversary & Milestone Gifts",
    intro: [
      "Milestone gifting is the part of a recognition programme most likely to be running on autopilot. The same gift goes out for a first anniversary and a fifteenth, and over time employees notice that a decade of service is being marked with what a new joiner got.",
      "Getting it right is mostly structural rather than expensive: decide the tiers, make them visibly different, and personalise the ones that matter.",
    ],
    sections: [
      {
        heading: "Building a milestone tier structure",
        body: [
          "A tiered structure is what makes long service feel recognised. The specific bands matter less than the fact that each one is visibly a step up, and that employees can see the progression ahead of them.",
        ],
        bullets: [
          "Early anniversaries: journal and pen set or planner set, with the employee's name",
          "Mid-tenure: complete stationery set or a premium notebook set",
          "Long service: leather-look journal set with debossed initials",
          "Executive or exceptional tenure: luxury planner box or executive set",
        ],
      },
      {
        heading: "Promotions and role milestones",
        body: [
          "Promotions deserve their own gift rather than being folded into the anniversary calendar, because the moment is about a change in responsibility. A folio set suits a step into client-facing or managerial work in a way a generic gift does not.",
        ],
      },
      {
        heading: "Personalization is the whole point",
        body: [
          "Milestone recognition without a name on it is difficult to distinguish from stock issue. Names or initials are what convert a gift into recognition, and on longer tenures a debossed initial reads better than printed text.",
        ],
      },
      {
        heading: "Running the programme through the year",
        body: [
          "Anniversaries arrive continuously, so a standing stock is far more practical than ordering individually. Holding stock of each tier and topping it up means the gift is ready on the actual date - which matters, because a milestone gift arriving a month late has undone itself.",
        ],
      },
    ],
    faqs: [
      {
        question: "How should work anniversary gifts differ by tenure?",
        answer:
          "Visibly. A tiered structure - a personalised journal or planner for early anniversaries, a leather-look set with debossed initials for long service - is what makes tenure feel recognised. If a fifteen-year gift resembles a first-year gift, employees notice.",
      },
      {
        question: "How do we make sure milestone gifts arrive on time?",
        answer:
          "Hold a standing stock of each tier rather than ordering per employee. Anniversaries arrive continuously, and a milestone gift that turns up a month late has largely defeated its own purpose.",
      },
      {
        question: "Should promotions be gifted differently from anniversaries?",
        answer:
          "Yes - a promotion marks a change in responsibility rather than time served. A folio set suits a move into client-facing or managerial work in a way a standard anniversary gift does not.",
      },
    ],
    recommendedProductSlugs: [
      "journal-matching-pen-set",
      "brown-luxury-stationery-set",
      "grey-folio-notebook-set",
      "complete-stationery-gift-set",
    ],
    relatedLinks: [
      { label: "employee appreciation gifting", href: "/gifting/employee-appreciation" },
      { label: "premium and luxury gift sets", href: "/categories/luxury-gifts" },
      { label: "employee onboarding gifts", href: "/gifting/employee-onboarding" },
    ],
  },
];
