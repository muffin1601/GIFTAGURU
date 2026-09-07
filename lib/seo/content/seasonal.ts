import type { LandingFaq, LandingLink, LandingSection } from "./types";

/**
 * Seasonal campaign hubs -- year-stamped pages, deliberately separate from the
 * evergreen occasion pages in ./occasions.ts.
 *
 * Why both exist, and why this is not duplication:
 *
 *   /occasions/diwali-corporate-gifts   evergreen, never names a year, owns
 *                                       "Diwali corporate gifts", accumulates
 *                                       authority across seasons.
 *   /guides/diwali-corporate-gifting-guide  informational, owns
 *                                       "luxury diwali gift ideas office".
 *   /diwali-2026                        THIS page. A seasonal hub that owns
 *                                       "Diwali gifts 2026" -- a query people
 *                                       genuinely type, which the evergreen
 *                                       page cannot answer without breaking
 *                                       its own no-year rule.
 *
 * The hub links UP to both of the above rather than restating them, so the
 * three pages support each other instead of cannibalising one keyword. The
 * corporate section here is deliberately a summary plus a link, not a rewrite
 * of the occasion page.
 *
 * KEYWORD MAP (section -> the term it is written to answer)
 *   H1 / title / intro ......... Diwali gifts 2026, Diwali gift ideas
 *   Diwali Gifts for 2026 ...... Diwali gifts, Diwali festive gifts, gifting ideas
 *   Corporate section .......... Diwali corporate gifts 2026, corporate Diwali
 *                                gifting, Diwali business gifts, bulk Diwali gifts
 *   Hampers section ............ Diwali gift hampers 2026, Diwali hampers,
 *                                Diwali gift boxes
 *   Employees section .......... Diwali gifts for employees
 *   Clients section ............ Diwali gifts for clients, gifts for customers,
 *                                gifts for business partners
 *   Personalisation section .... personalised Diwali gifts, customised Diwali gifts
 *   Premium section ............ premium Diwali gifts, luxury Diwali gifts
 *   Family & friends section ... Diwali gifts for family, Diwali gifts for friends
 *   Ordering / FAQs ............ Diwali gifts online, Diwali gifts delivery
 *
 * Rules this file keeps, matching ./types.ts and ./products.ts:
 *  - No prices, no stock, no dispatch dates, no delivery guarantees. Those are
 *    merchandising facts owned by the database and store settings.
 *  - No claimed product contents that the catalog does not carry. Gifta Guru's
 *    range is stationery, desk and executive gift sets; it is NOT a sweet-box
 *    or dry-fruit business, and the copy below says so plainly rather than
 *    implying otherwise for the sake of a keyword.
 *  - No certifications, client names, statistics, ratings or awards.
 */

export interface SeasonalRecipientCard {
  title: string;
  body: string;
  link: LandingLink;
}

/**
 * A gifting tier. Deliberately described by intent and scale rather than by
 * price -- editorial copy must not commit to figures the catalog owns.
 */
export interface SeasonalTier {
  title: string;
  body: string;
  link: LandingLink;
}

export interface SeasonalHubContent {
  slug: string;
  /** The one keyword this page owns. Unique across every indexable page. */
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  heroEyebrow: string;
  /** Short hero value proposition. One sentence; the hero is not for prose. */
  heroLead: string;
  heroImage: { src: string; alt: string; width: number; height: number };
  primaryCta: LandingLink;
  secondaryCta: LandingLink;
  /** Lead paragraphs under the H1. */
  intro: string[];
  sections: LandingSection[];
  recipients: SeasonalRecipientCard[];
  tiers: SeasonalTier[];
  faqs: LandingFaq[];
  recommendedProductSlugs: string[];
  relatedLinks: LandingLink[];
}

export const diwali2026: SeasonalHubContent = {
  slug: "diwali-2026",
  primaryKeyword: "Diwali gifts 2026",
  secondaryKeywords: [
    "diwali gift ideas",
    "diwali corporate gifts 2026",
    "diwali gift hampers 2026",
    "diwali gifts for employees",
    "diwali gifts for clients",
    "personalised diwali gifts",
    "premium diwali gifts",
    "bulk diwali gifts",
    "diwali gifts online",
  ],
  seoTitle: "Diwali Gifts 2026 - Corporate Gifts, Hampers & Ideas",
  metaDescription:
    "Diwali gifts 2026 from Gifta Guru: corporate Diwali gifts, premium hampers and personalised gift sets for employees, clients and family. Request a bulk quote.",
  h1: "Diwali Gifts 2026 - Thoughtful Gifting for Every Celebration",

  heroEyebrow: "Diwali 2026",
  heroLead:
    "Curated Diwali gift sets for employees, clients and family - personalised with your logo or a recipient's name, and available for single orders or company-wide lists.",
  heroImage: {
    // An existing brand banner. No new asset is created for this page: the
    // luxury banner is the closest match to festive gifting already shipped.
    src: "/BANNERS/LUXURY.png",
    alt: "Premium Diwali gift sets from Gifta Guru arranged in festive presentation packaging",
    width: 1600,
    height: 900,
  },
  primaryCta: { label: "Explore Diwali Gifts", href: "/shop" },
  secondaryCta: { label: "Request a Corporate Diwali Quote", href: "/bulk-enquiry" },

  intro: [
    "Diwali is the busiest gifting fortnight in the Indian calendar, and it is also the easiest one to get wrong. The same recipients receive a dozen near-identical boxes in the same week, and by the middle of November most of them have been forgotten. What people actually keep is the gift they end up using at their desk long after the festival.",
    "This page is the starting point for Diwali gifts in 2026 - what to send to employees, clients, partners and family, how to shortlist by recipient rather than by catalogue order, and where each of those decisions leads inside the Gifta Guru range. Diwali 2026 falls in November, so artwork approvals and final quantities usually need settling through September and October rather than in the last fortnight.",
  ],

  sections: [
    {
      heading: "Diwali Gifts for 2026",
      body: [
        "Gifta Guru curates multi-piece festive gift sets built around things people genuinely use: notebooks and journals, pens, folios, planners, desk accessories, keychains and executive organisers. Every set arrives as a coordinated presentation piece rather than a bag of unrelated items, which is what makes it read as considered when it is opened in front of colleagues.",
        "One clarification worth making early, because it decides whether this range suits your list: we are a gifting company, not a sweet-box or dry-fruit business. If you are sending mithai this Diwali, our sets work best alongside it - the sweets are consumed within the week, and the gift set is what stays on the desk through the year.",
      ],
      bullets: [
        "Curated multi-piece festive gift sets, coordinated in one palette and packaged together",
        "Logo, name or initial personalisation on most sets, applied before dispatch",
        "Single orders through the online store, and quoted bulk orders for company lists",
        "Ranges that scale from full-team gifting to a short list of senior recipients",
      ],
    },
    {
      heading: "Diwali Corporate Gifts 2026",
      body: [
        "Corporate Diwali gifting is really three lists running at once, and they rarely want the same gift. Employees are gifted at scale, where a well-made mid-range set given to everyone lands better than an expensive gift given to a few. Clients and key accounts justify the premium and executive sets. Dealers, distributors and channel partners usually sit between the two, in volume.",
        "For business gifting we quote against your quantities, personalisation and delivery split rather than listing a single figure - the economics of 40 sets and 4,000 sets are not comparable. Send the list size and the recipient mix and we will come back with options across tiers.",
      ],
      bullets: [
        "Employee, client, customer, dealer, distributor and business-partner lists",
        "Branded corporate gifts carrying your logo, or the recipient's own name for senior gifting",
        "Executive and leadership sets for a short, high-value list",
        "Bulk Diwali gifting quoted on quantity, personalisation and despatch split",
      ],
    },
    {
      heading: "Diwali Gift Hampers and Multi-Piece Sets",
      body: [
        "What most buyers mean by a Diwali gift hamper is a coordinated multi-piece box rather than a single item, and that is exactly how our sets are built - typically three to six pieces chosen to work together and presented in one package. A three-piece set suits large employee lists; five and six-piece sets carry the weight expected for clients and leadership.",
        "The pieces themselves are stationery, desk and executive items. We do not assemble food, sweets, dry-fruit or wellness hampers, so nothing on this page will promise contents we do not stock. Where a set's finish matters for the festive quarter - deeper tones, foil accents, gift-ready packaging - that is described honestly on the product page.",
      ],
      bullets: [
        "3-piece and 4-piece sets for broad festive distribution",
        "5-piece and 6-piece sets where the gift needs to carry more weight",
        "Coordinated palettes and gift-ready presentation packaging",
        "Personalisation applied across the set rather than to one piece",
      ],
    },
    {
      heading: "Diwali Gifts for Employees",
      body: [
        "Employee Diwali gifting has one constraint that outweighs the rest: everyone gets the same thing, and everyone compares. That pushes the decision towards a set that looks generous at volume and is genuinely useful at a desk, rather than towards a novelty item that photographs well once.",
        "Company-wide lists also need a practical answer for people who are remote or spread across offices. Tell us how the list splits when you enquire, and the quote accounts for it rather than assuming one delivery address.",
      ],
      bullets: [
        "Consistent gifts across the full team, in one coordinated finish",
        "Company logo across the set, or individual names for milestone recipients",
        "Onboarding-style welcome kits for anyone who joined close to the festive quarter",
        "Volume-friendly sets that still open well",
      ],
    },
    {
      heading: "Diwali Gifts for Clients and Customers",
      body: [
        "Client gifting at Diwali is a crowded field, and the gifts that get remembered are usually the ones that arrived before the rush and did not look like everything else on the table. Restraint helps: a refined desk set with the client's own name on it outperforms a larger box carrying only your logo.",
        "For customers and business partners in volume - dealers, distributors, channel partners - the calculation shifts back towards consistency and quantity. The same range covers both; what changes is the tier and the personalisation choice.",
      ],
      bullets: [
        "Desk and executive sets for named client contacts",
        "Recipient-name personalisation where the gesture should feel personal",
        "Dealer, distributor and channel-partner gifting at volume",
        "Account-team gifting for relationships you want visible attention on",
      ],
    },
    {
      heading: "Personalised and Customised Diwali Gifts",
      body: [
        "Personalisation is the part of festive gifting that does most of the work, and it is a service Gifta Guru actually runs rather than a claim on a landing page - our custom branding process covers logo application, names and initials on the sets that support it.",
        "The practical point is timing. Personalised gifts need artwork approved and quantities confirmed with room to produce before they ship, which is why festive orders are best confirmed well ahead of the festival rather than in the final fortnight.",
      ],
      bullets: [
        "Company logo applied across a gift set for corporate campaigns",
        "Recipient names or initials for senior and client gifting",
        "Artwork reviewed before production rather than after",
        "Personalisation availability varies by product and is stated on each product page",
      ],
    },
    {
      heading: "Premium and Luxury Diwali Gifts",
      body: [
        "Premium and luxury Diwali gifts are not simply larger versions of the standard set - they differ in material, finish and presentation, which is what makes them appropriate for leadership, board-level recipients and your most valuable accounts.",
        "These sets suit short, carefully chosen lists. If your Diwali list is genuinely long, a premium set for the top of it and a well-made standard set for everyone else usually reads better than one compromise gift for the whole company.",
      ],
      bullets: [
        "Executive and leadership sets for a small, deliberate list",
        "Refined finishes and coordinated presentation for high-value recipients",
        "Foil and embossed personalisation where the packaging is part of the gift",
        "A premium tier and a volume tier running together across one Diwali list",
      ],
    },
    {
      heading: "Diwali Gifts for Family and Friends",
      body: [
        "Not every Diwali list is a corporate one. The same sets can be ordered individually through the online store, without a bulk enquiry, and they suit family and friends who work - a good notebook and pen, a planner for the year ahead, or a desk set for someone who has just started a new job.",
        "For a personal gift, the name option usually matters more than the size of the box. A single well-finished piece with someone's initials on it tends to be kept far longer than a larger unbranded one.",
      ],
      bullets: [
        "Individual orders through the store, with no minimum quantity",
        "Planners and journals for the year ahead",
        "Desk sets for family members starting a new role",
        "Name and initial personalisation on supported products",
      ],
    },
    {
      heading: "Why Choose Gifta Guru for Diwali Gifting",
      body: [
        "Gifta Guru is a corporate gifting platform first, which shapes what this range is good at: curated sets rather than single novelties, personalisation as a standard service rather than an add-on, and bulk orders handled as quotes against your actual list instead of a fixed page price.",
      ],
      bullets: [
        "Curated multi-piece gift sets rather than assorted single items",
        "Custom branding and personalisation run in-house as a core service",
        "Bulk and corporate orders quoted against quantity and personalisation",
        "A storefront that also serves individual orders, so one range covers both lists",
        "Order tracking available on placed orders through your account",
      ],
    },
    {
      heading: "How to Choose the Right Diwali Gift",
      body: [
        "Shortlisting works better from the recipient inwards than from the catalogue outwards. Five questions usually settle it, and answering them before browsing saves the most time.",
      ],
      bullets: [
        "Who is receiving it? Employees, clients, partners and family have different expectations of the same box.",
        "How many? Quantity decides whether you are choosing a volume set or a short-list premium one.",
        "How close is the relationship? Closer relationships justify the recipient's name over your logo.",
        "Should it carry branding? Company campaigns want the logo; personal gestures usually do not.",
        "When do you need it? Personalised gifts need production time, so confirm quantities early rather than late.",
        "Does it need to split across locations? Say so at enquiry stage so the quote reflects it.",
      ],
    },
  ],

  recipients: [
    {
      title: "Employees",
      body: "Company-wide lists where consistency matters and everyone compares. Volume-friendly sets that still open well.",
      link: { label: "See employee appreciation gifting", href: "/gifting/employee-appreciation" },
    },
    {
      title: "Clients",
      body: "Named contacts and key accounts, where restraint and early delivery beat a bigger box that arrived with everyone else's.",
      link: { label: "Plan client gifting", href: "/gifting/client-appreciation" },
    },
    {
      title: "Customers",
      body: "Loyalty and relationship gifting at scale, using the same coordinated sets with your branding applied.",
      link: { label: "Read the client gifting guide", href: "/guides/client-gifting-guide" },
    },
    {
      title: "Business partners",
      body: "Dealers, distributors and channel partners - usually volume gifting that still needs to look considered.",
      link: { label: "Dealer and channel partner gifting", href: "/gifting/dealer-channel-partner" },
    },
    {
      title: "Teams",
      body: "Department-level gifting where a mid-tier set given to everyone lands better than a premium gift for a few.",
      link: { label: "Browse corporate gifting solutions", href: "/corporate-gifting" },
    },
    {
      title: "VIP and executive recipients",
      body: "Leadership, board-level contacts and your most valuable accounts. Short lists, higher finish, personal names.",
      link: { label: "Executive and leadership gifts", href: "/gifting/executive-leadership" },
    },
    {
      title: "Family",
      body: "Individual orders with no minimum quantity - planners, journals and desk sets for people who will use them.",
      link: { label: "Shop the full gift range", href: "/shop" },
    },
    {
      title: "Friends",
      body: "A single well-finished piece with initials on it, rather than a large unbranded box.",
      link: { label: "See personalisation options", href: "/custom-gifts" },
    },
  ],

  tiers: [
    {
      title: "Thoughtful gifting",
      body: "Compact sets for broad lists where every recipient gets the same gift and the total quantity is high.",
      link: { label: "Browse joining and welcome sets", href: "/categories/joining-gifts" },
    },
    {
      title: "Premium gifting",
      body: "Larger multi-piece sets with a heavier finish, for clients and for teams you want to gift generously.",
      link: { label: "View premium gift sets", href: "/categories/premium-gifts" },
    },
    {
      title: "Luxury gifting",
      body: "Executive-grade materials and presentation for a short list of senior and board-level recipients.",
      link: { label: "View luxury gift collections", href: "/categories/luxury-gifts" },
    },
    {
      title: "Sustainable gifting",
      body: "Eco-conscious materials for organisations that want the festive gift to match their sustainability position.",
      link: { label: "Explore eco-friendly gifts", href: "/categories/eco-gifts" },
    },
    {
      title: "Bulk gifting",
      body: "Company-wide Diwali lists quoted on quantity, personalisation and delivery split rather than a page price.",
      link: { label: "Enquire for bulk orders", href: "/bulk-enquiry" },
    },
  ],

  faqs: [
    {
      question: "What are the best Diwali gifts for 2026?",
      answer:
        "The gifts that work best at Diwali are the ones still in use in February - notebooks, pens, planners, folios and desk sets rather than novelty items. Gifta Guru curates these as coordinated multi-piece sets, so the gift arrives as one considered package instead of assorted pieces.",
    },
    {
      question: "What are good corporate Diwali gifts?",
      answer:
        "For corporate lists, a well-made mid-range set given to everyone usually outperforms an expensive gift given to a few. Clients and leadership justify the premium and executive tiers. Our evergreen Diwali corporate gifts page covers how to split those lists in detail.",
    },
    {
      question: "What are good Diwali gifts for employees?",
      answer:
        "Employee gifting needs consistency, because everyone compares. Choose one coordinated set for the whole team, apply your logo across it, and confirm quantities early enough for personalisation to be produced comfortably before the festival.",
    },
    {
      question: "What are good Diwali gifts for clients?",
      answer:
        "Restraint and timing. A refined desk or executive set carrying the client's own name generally lands better than a larger box carrying only your logo, particularly if it arrives before the final festive fortnight when every supplier delivers at once.",
    },
    {
      question: "Can I order Diwali gifts in bulk?",
      answer:
        "Yes. Bulk Diwali orders are handled as quotes rather than fixed listings - submit your quantities, personalisation requirement and delivery split through the bulk enquiry form and the team will respond with options across tiers.",
    },
    {
      question: "Can Diwali gifts be customised?",
      answer:
        "Personalisation is a core Gifta Guru service. Depending on the product, that means your logo, the recipient's name, or initials applied before dispatch. Availability varies by item and is stated on each product page; the custom branding page explains the process.",
    },
    {
      question: "Can I order corporate Diwali hampers?",
      answer:
        "Yes, in the sense of coordinated multi-piece gift sets - typically three to six stationery, desk and executive pieces packaged together. We do not assemble food, sweets or dry-fruit hampers, so the contents are always the items listed on the product page.",
    },
    {
      question: "What are the premium Diwali gifting options?",
      answer:
        "The premium and luxury collections carry heavier materials, refined finishes and presentation packaging suited to leadership, board-level contacts and key accounts. They are best used for a short list alongside a volume set for everyone else.",
    },
    {
      question: "How can I order Diwali gifts from Gifta Guru?",
      answer:
        "Individual orders can be placed directly through the online store with no minimum quantity. Company lists, personalised runs and large volumes go through the bulk enquiry form so the quote can reflect your actual quantities and requirements.",
    },
    {
      question: "Can businesses request a bulk Diwali gifting quotation?",
      answer:
        "Yes. Share your list size, recipient mix, personalisation requirement and whether delivery needs to split across locations, and the team will come back with a quotation. Earlier enquiries leave more room for artwork approval and production before the festival.",
    },
  ],

  // Real catalog slugs, weighted towards the finishes that suit the festive
  // quarter. Any slug that no longer resolves simply does not render a card.
  recommendedProductSlugs: [
    "burgundy-relationship-gift-set",
    "black-gold-premium-notebook-set",
    "luxury-clutch-executive-set",
    "luxury-planner-gift-box",
    "wood-finish-premium-gift-set",
    "brown-luxury-stationery-set",
    "white-premium-corporate-gift-set",
    "sage-green-sustainable-gift-set",
  ],

  // Varied anchor text -- the validator warns when one exact anchor is reused
  // across the site, and repeated "Diwali gifts" anchors would read as
  // over-optimisation to a reviewer as much as to a crawler.
  relatedLinks: [
    { label: "Diwali corporate gifts", href: "/occasions/diwali-corporate-gifts" },
    { label: "How to plan Diwali corporate gifting", href: "/guides/diwali-corporate-gifting-guide" },
    { label: "Festive corporate gifting across the season", href: "/occasions/festive-corporate-gifting" },
    { label: "New year corporate gifts", href: "/occasions/new-year-corporate-gifts" },
    { label: "Shop premium gift hampers", href: "/categories/premium-gifts" },
    { label: "Luxury corporate gift collections", href: "/categories/luxury-gifts" },
    { label: "Explore personalised gifts", href: "/custom-gifts" },
    { label: "Corporate gifting solutions", href: "/corporate-gifting" },
    { label: "6-piece corporate gift sets", href: "/gift-sets/6-piece-corporate-gift-sets" },
    { label: "Bulk corporate gifting", href: "/gifting/bulk-corporate-gifting" },
    { label: "Talk to our gifting team", href: "/contact" },
  ],
};

/** Every seasonal hub, for the sitemap, the validator and the tests. */
export const seasonalHubs: SeasonalHubContent[] = [diwali2026];
