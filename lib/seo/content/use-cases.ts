import type { LandingPageContent } from "./types";

/**
 * Use-case ("gifting solutions") landing pages.
 *
 * These sit between the homepage and the product pages in the hierarchy: each
 * owns a broad commercial term describing an OCCASION or PROGRAMME rather than
 * a product or a sector. They are the pages that catch "what should we give
 * our new joiners" style searches, where the buyer knows the situation but not
 * the product.
 *
 * Keyword ownership is deliberately kept clear of the product tier. For
 * example the Client Appreciation Desk Set owns "client appreciation gifts",
 * so the client use-case page below owns the broader "corporate gifts for
 * clients" instead -- a browse query that a page listing several sets serves
 * better than any single product can.
 */
export const useCasePages: LandingPageContent[] = [
  {
    slug: "employee-onboarding",
    primaryKeyword: "employee onboarding gifts",
    secondaryKeywords: [
      "corporate onboarding kit",
      "employee induction kit",
      "new joinee kit",
      "personalized employee onboarding",
      "bulk onboarding gifts",
      "custom branded onboarding kits",
      "employee first day welcome kit",
    ],
    seoTitle: "Employee Onboarding Gifts - Welcome Kits for New Joiners",
    metaDescription:
      "Employee onboarding gifts and branded welcome kits for new joiners. Logo printing, per-employee names, and kits that re-order identically as you hire.",
    h1: "Employee Onboarding Gifts & Welcome Kits",
    intro: [
      "A welcome kit is doing a specific job: it turns an administrative first day into a moment where someone feels expected. That is worth getting right, because the first week is when a new joiner decides what kind of company they have joined.",
      "The practical requirements are usually the same regardless of sector - the kit has to be useful from day one, brand consistently across everyone who receives it, and be re-orderable months later without quietly changing.",
    ],
    sections: [
      {
        heading: "What belongs in an onboarding kit",
        body: [
          "The dependable core is something to write in and something to write with, because those are used regardless of role, seniority or location. Everything beyond that is a choice about how substantial the kit should feel.",
          "A compact kit typically holds a notebook, a pen and a welcome card. A fuller kit adds a diary in place of the notebook, plus a keychain or card holder, and arrives in a presentation box that makes the unboxing part of the gift.",
        ],
        bullets: [
          "Notebook or diary - used from the first meeting onward",
          "Pen - the item most likely to stay on the desk",
          "Welcome card carrying your culture message",
          "Keychain, card holder or desk accessory for a fuller kit",
          "Presentation box where the unboxing itself should land",
        ],
      },
      {
        heading: "Matching the kit to how you hire",
        body: [
          "Hiring pattern matters more than headcount when choosing. If joiners arrive continuously, prioritise a kit that re-orders identically, so someone joining in month nine is not visibly given a lesser version than a founding hire. If hiring happens in scheduled intakes, batch size and finish consistency across a large run matter more.",
          "Where roles differ sharply in seniority, running two kits is common and reasonable: a compact kit for volume hiring and a fuller onboarding set for leadership joiners.",
        ],
      },
      {
        heading: "Remote and distributed joiners",
        body: [
          "Once kits go to home addresses rather than a welcome desk, shipping cost and packing footprint become part of the decision. Compact, flat-packing kits keep per-shipment cost sensible, and stationery travels far better than fragile or battery-powered items.",
        ],
      },
      {
        heading: "Personalization that is worth the effort",
        body: [
          "Company logo branding makes the kit official; an individual name is what makes it feel addressed. If you only do one, the name has more effect - a batch of thirty identical logo kits reads as procurement, while thirty named kits read as thirty welcomes.",
        ],
      },
      {
        heading: "Planning ahead",
        body: [
          "Personalization needs a proof cycle before production, so onboarding kits are not a same-week purchase. Teams that hire continuously usually keep a standing stock and top it up, rather than ordering per joiner.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a new employee welcome kit include?",
        answer:
          "At minimum a notebook or diary and a pen, because those get used from day one regardless of role. Fuller kits add a keychain or card holder and a printed welcome card, presented in a gift box. What matters more than the piece count is that it is genuinely useful rather than decorative.",
      },
      {
        question: "Should welcome kits carry the employee's name or just our logo?",
        answer:
          "Both if you can, but if you have to choose, the name does more. Logo-only kits read as standard issue; a named kit reads as a welcome prepared for that person.",
      },
      {
        question: "How far in advance should onboarding kits be ordered?",
        answer:
          "Allow time for a personalization proof before production begins. Most teams that hire continuously hold a standing stock and re-order to top it up rather than ordering for each joiner individually.",
      },
      {
        question: "Can the same kit be sent to remote employees?",
        answer:
          "Yes, and compact kits are chosen partly for that reason - they pack flat and ship affordably to individual addresses. Multi-location dispatch for distributed teams is supported; share your address list with your enquiry.",
      },
    ],
    recommendedProductSlugs: [
      "executive-onboarding-essentials-set",
      "compact-corporate-welcome-kit",
      "blue-notebook-welcome-set",
      "minimal-notebook-pen-set",
    ],
    relatedLinks: [
      { label: "employee welcome kits collection", href: "/categories/joining-gifts" },
      { label: "gifting for IT and SaaS teams", href: "/industries/it-software-saas" },
      { label: "3 to 6 piece welcome kits", href: "/gift-sets" },
    ],
  },
  {
    slug: "employee-appreciation",
    primaryKeyword: "employee appreciation gifts",
    secondaryKeywords: [
      "employee recognition gifts",
      "employee appreciation box",
      "employee milestone gifts",
      "long service employee gifts",
      "employee engagement gifts",
      "spot award gift ideas",
      "employee reward gift box for corporates",
    ],
    seoTitle: "Employee Appreciation Gifts - Recognition & Milestone Sets",
    metaDescription:
      "Employee appreciation and recognition gifts with logo branding or individual names. Sets for milestones, work anniversaries and appreciation weeks.",
    h1: "Employee Appreciation & Recognition Gifts",
    intro: [
      "Recognition gifting fails in a predictable way: the gift arrives, it is obviously the same thing everyone got, and it quietly communicates the opposite of what was intended. What separates appreciation from distribution is usually personalization and timing rather than budget.",
      "These sets are chosen because they get used. A journal or planner sits on a desk for months, which keeps the recognition present far longer than something decorative.",
    ],
    sections: [
      {
        heading: "Appreciation weeks and company-wide recognition",
        body: [
          "When recognition reaches everyone at once, the risk is that it reads as an entitlement rather than a thank-you. Adding individual names to the cover is the single most effective correction, and it costs less than upgrading the gift.",
          "The journal and pen set and the grey planner set are the two most used here - both practical, both personalisable, both priced to reach a full team.",
        ],
      },
      {
        heading: "Work anniversaries and long service",
        body: [
          "Tenure recognition should visibly differ from what a first-year employee receives, or it undercuts the milestone. This is where stepping up to the leather-look journal set or an executive set makes sense: classic materials, debossed initials, and something that stays on a desk for years.",
        ],
      },
      {
        heading: "Spot awards and recurring programmes",
        body: [
          "Monthly award programmes need a gift that looks good every single time without straining a standing budget. The minimal notebook and pen set is the usual answer, because the design holds up at a price that can be repeated twelve times a year.",
        ],
      },
      {
        heading: "Quarter kickoffs and performance cycles",
        body: [
          "Planners are unusually well timed to performance moments - a quarter kickoff or an annual reset is exactly when someone is willing to start using one. Gifting a planner mid-cycle rarely lands the same way.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do we stop appreciation gifts feeling generic?",
        answer:
          "Personalise with the recipient's name and differentiate by milestone. A named gift reads as a thank-you; an identical unnamed one across the whole company reads as standard issue. Making a ten-year gift visibly different from a first-year gift matters for the same reason.",
      },
      {
        question: "What is a good work anniversary gift?",
        answer:
          "Something built to last and personalised discreetly - a leather-look journal set with debossed initials is a common choice for longer tenures, because it stays useful on a desk rather than being replaced.",
      },
      {
        question: "When is the best time to gift planners?",
        answer:
          "Ahead of the period the planner covers. January and quarter kickoffs are the two natural moments; a planner gifted mid-quarter tends to go unused.",
      },
    ],
    recommendedProductSlugs: [
      "journal-matching-pen-set",
      "grey-planner-corporate-set",
      "brown-luxury-stationery-set",
      "minimal-notebook-pen-set",
    ],
    relatedLinks: [
      { label: "work anniversary and milestone gifting", href: "/occasions/work-anniversary-milestones" },
      { label: "premium corporate gift sets", href: "/categories/premium-gifts" },
      { label: "employee onboarding gifts", href: "/gifting/employee-onboarding" },
    ],
  },
  {
    slug: "client-appreciation",
    primaryKeyword: "corporate gifts for clients",
    secondaryKeywords: [
      "customer appreciation gift sets",
      "business appreciation gifts",
      "personalized client gifts",
      "premium client gifts",
      "client gifting for new year",
      "deal closure gift ideas",
      "high end client relationship gift box",
    ],
    seoTitle: "Corporate Gifts for Clients - Appreciation & Relationship Sets",
    metaDescription:
      "Corporate gifts for clients with logo branding or recipient-name engraving. Sets for deal closures, renewals, festive campaigns and key accounts.",
    h1: "Corporate Gifts for Clients",
    intro: [
      "Client gifting works when the timing is specific. A gift attached to a moment - a contract signed, a project delivered, an account anniversary - is remembered; the same gift sent to a list in December competes with everyone else who had the same idea.",
      "The second thing that separates good client gifting is restraint. Senior recipients receive a lot of branded merchandise, and the gifts that survive on their desks tend to be the ones that carry your mark quietly.",
    ],
    sections: [
      {
        heading: "Gifting at relationship milestones",
        body: [
          "Deal closures, renewals, go-lives and account anniversaries are the moments worth marking, and they arrive unpredictably. Teams that gift well at these moments usually hold a standing stock rather than ordering reactively, because a gift that arrives three weeks after the milestone has lost most of its effect.",
        ],
      },
      {
        heading: "Choosing by recipient seniority",
        body: [
          "Match the set to who actually receives it. A working client team is well served by a desk set or notebook set they will use; an executive sponsor or managing partner sits in luxury territory, where materials and understated personalization do the work.",
          "Where a whole account team is being thanked, one good set across everyone tends to land better than a single expensive gift to the most senior name.",
        ],
      },
      {
        heading: "Logo or the client's name",
        body: [
          "This is the choice that most changes how a client gift reads. Your logo makes it a company gesture; their name makes it a personal one. A common compromise is your logo on the presentation box and their name on the item itself.",
        ],
      },
      {
        heading: "Festive client campaigns",
        body: [
          "Festive gifting is the most crowded moment of the year, which is exactly why distinctiveness matters more than spend. A white or burgundy set stands out in a season dominated by black-and-gold boxes, and arriving before the rush beats arriving with it.",
        ],
      },
    ],
    faqs: [
      {
        question: "When is the best time to send client gifts?",
        answer:
          "At a specific relationship moment rather than on a calendar date - a contract signed, a project delivered, an account anniversary. Those land far better than a festive-season gift competing with every other supplier's.",
      },
      {
        question: "Should a client gift carry our logo or the client's name?",
        answer:
          "Your logo makes it a company gesture, the client's name makes it personal. Many teams do both: the logo on the presentation box and the recipient's name engraved or foiled on the item.",
      },
      {
        question: "How do we stand out during festive client gifting?",
        answer:
          "Distinctiveness and timing beat spend. A white or burgundy set stands out against a season of black-and-gold boxes, and arriving ahead of the rush gets noticed on its own.",
      },
    ],
    recommendedProductSlugs: [
      "client-appreciation-desk-set",
      "corporate-gift-set-with-notebook",
      "white-premium-corporate-gift-set",
      "black-gold-premium-notebook-set",
    ],
    relatedLinks: [
      { label: "festive and seasonal gift sets", href: "/occasions/festive-corporate-gifting" },
      { label: "gifting to CXOs and partners", href: "/gifting/executive-leadership" },
      { label: "premium corporate gift sets", href: "/categories/premium-gifts" },
    ],
  },
  {
    slug: "events-conferences",
    primaryKeyword: "corporate gifts for conferences",
    secondaryKeywords: [
      "conference delegate gift set",
      "event attendee gift kits",
      "corporate event merchandise",
      "seminar gift kits",
      "conference welcome kits",
      "exhibition giveaway gifts",
      "speaker gift set",
    ],
    seoTitle: "Corporate Gifts for Conferences - Delegate & Event Kits",
    metaDescription:
      "Conference and event gifting: branded delegate kits, speaker gifts and exhibition giveaways. Built for volume with consistent logo branding.",
    h1: "Conference, Event & Delegate Gifting",
    intro: [
      "Event gifting is a logistics exercise as much as a gifting one. The kit has to be produced in quantity, arrive before the event rather than during it, pack down for a registration desk, and survive being carried around a venue all day.",
      "It also has to be useful during the event itself. A delegate who can take notes in your notebook, using your pen, is looking at your brand for the whole session - which is more than most conference merchandise achieves.",
    ],
    sections: [
      {
        heading: "Delegate kits at volume",
        body: [
          "For large delegate counts, per-head cost drives the decision. The minimal notebook and pen set is the one built for this: one-colour logo printing keeps customization affordable into the hundreds and thousands, and the design holds up rather than reading as disposable.",
          "Where the audience is smaller or more senior, the complete stationery set or a folio set makes the kit feel like part of the event rather than an afterthought.",
        ],
      },
      {
        heading: "Tiering speakers, sponsors and delegates",
        body: [
          "Most events need at least two tiers. A standard delegate kit covers the room; a visibly better set goes to speakers, panellists and sponsors. Tiering is worth doing explicitly - a speaker receiving the same bag as every attendee is a small but real misstep.",
        ],
        bullets: [
          "Delegates: high-volume notebook and pen sets",
          "Speakers and panellists: folio or complete stationery sets",
          "Sponsors and VIP guests: executive or luxury sets",
        ],
      },
      {
        heading: "Exhibitions and trade-show counters",
        body: [
          "Exhibition giveaways get handed to hundreds of passers-by, so the winning quality is portability. The pen and keychain set is the recurring choice - it costs little per unit, weighs nothing in a tote bag, and both items keep being used long after the show.",
        ],
      },
      {
        heading: "Lead times and on-site logistics",
        body: [
          "Event gifting has a hard deadline, which makes it the least forgiving category to leave late. Build in time for artwork approval and a personalization proof before production, and confirm the delivery address for the venue rather than the office if kits are shipping directly.",
        ],
      },
      {
        heading: "Sustainable event merchandise",
        body: [
          "Conference giveaways have a reputation for waste, and sustainability-led events increasingly need an answer for it. The recycled-cover notebook set is the practical option: it holds a credible materials story at a price that still works across a full delegate list.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should go in a conference delegate kit?",
        answer:
          "Something the delegate uses during the session - a notebook and pen is the reliable core, because it puts your brand in front of them for the whole event rather than going straight into a bag.",
      },
      {
        question: "Should speakers get a different gift from delegates?",
        answer:
          "Yes. Most events run at least two tiers, with a visibly better set for speakers, panellists and sponsors. Handing a speaker the same bag as every attendee is a small but noticeable misstep.",
      },
      {
        question: "How far ahead should event gifts be ordered?",
        answer:
          "Earlier than most other gifting, because the deadline cannot move. Allow time for artwork approval and a personalization proof before production, and confirm whether kits ship to your office or the venue.",
      },
      {
        question: "Is there a sustainable option for large delegate counts?",
        answer:
          "The recycled-cover notebook set is designed for exactly that - a credible materials story at a price that still scales across a full delegate list.",
      },
    ],
    recommendedProductSlugs: [
      "minimal-notebook-pen-set",
      "classic-pen-keychain-welcome-set",
      "complete-stationery-gift-set",
      "green-eco-notebook-gift-set",
    ],
    relatedLinks: [
      { label: "planning a large gifting order", href: "/gifting/bulk-corporate-gifting" },
      { label: "eco friendly corporate gifts", href: "/categories/eco-gifts" },
      { label: "gifting for healthcare and pharma events", href: "/industries/healthcare-pharma" },
    ],
  },
  {
    slug: "executive-leadership",
    primaryKeyword: "corporate gifts for executives",
    secondaryKeywords: [
      "corporate gifts for leadership",
      "leadership offsite gifts",
      "executive luxury gift set",
      "premium gifts for leadership",
      "board meeting gift ideas",
      "investor meeting gifts",
      "executive recognition gift box",
    ],
    seoTitle: "Corporate Gifts for Executives - Leadership & Board Gifting",
    metaDescription:
      "Executive and leadership corporate gifts with embossed initials or discreet branding. Sets for board moments, investor meetings and CXO recognition.",
    h1: "Executive & Leadership Gifting",
    intro: [
      "Executive gifting is the one category where quantity works against you. The list is short, every name on it is deliberate, and the recipient almost certainly owns better versions of most branded merchandise already.",
      "What earns a place on a senior desk is material quality and restraint. Understated personalization - a debossed initial, a blind-embossed logo, tone-on-tone foil - reads as more considered than a large printed mark, which is the opposite of how volume gifting works.",
    ],
    sections: [
      {
        heading: "Board, investor and governance moments",
        body: [
          "Board meetings, investor updates and governance milestones call for something that looks appropriate on a boardroom table. The all-black executive set and the refined folio set are the two that suit this best - functional, disciplined, and branded quietly enough not to look like marketing collateral.",
        ],
      },
      {
        heading: "Promotions, appointments and long tenure",
        body: [
          "Internal executive moments - a partner promotion, a CXO appointment, a decade of service - are worth marking with something personal rather than corporate. Embossed initials work better here than a company logo, because the gift is about the individual.",
        ],
      },
      {
        heading: "Leadership offsites and summits",
        body: [
          "A leadership summit is the one executive occasion with real volume, since the whole leadership tier receives the same thing. The black executive set handles that: low enough minimums for a small team, with options for conference-scale quantities when the tier is large.",
        ],
      },
      {
        heading: "Getting the personalization right",
        bullets: [
          "Debossed or embossed initials for individual recipients",
          "Blind-embossed or tone-on-tone logos for company programmes",
          "A printed message card rather than printing on the item itself",
          "Avoid large, high-contrast logos - they undercut a premium set",
        ],
      },
    ],
    faqs: [
      {
        question: "What makes a good gift for a senior executive?",
        answer:
          "Material quality and restraint. Senior recipients already own plenty of branded merchandise, so what earns desk space is something well made and personalised discreetly - a debossed initial rather than a large printed logo.",
      },
      {
        question: "Is there a minimum for executive gifting?",
        answer:
          "The luxury sets carry our lowest minimums precisely because they are meant for short, curated lists. Share your recipient count and we will quote against it rather than pushing you to a volume you do not need.",
      },
      {
        question: "Logo or initials for a leadership gift?",
        answer:
          "Initials for an individual milestone like a promotion or long service; a discreet logo for a company-wide leadership programme where consistency across the tier matters.",
      },
    ],
    recommendedProductSlugs: [
      "black-executive-corporate-set",
      "refined-folio-pen-gift-set",
      "luxury-planner-gift-box",
      "luxury-clutch-executive-set",
    ],
    relatedLinks: [
      { label: "high-end gifting for short lists", href: "/categories/luxury-gifts" },
      { label: "new year executive gifting", href: "/occasions/new-year-corporate-gifts" },
      { label: "gifting for consulting firms", href: "/industries/consulting" },
    ],
  },
  {
    slug: "dealer-channel-partner",
    primaryKeyword: "channel partner corporate gifts",
    secondaryKeywords: [
      "dealer and distributor gifts",
      "dealer meet gift ideas",
      "dealer gifting ideas",
      "channel partner gifts bulk",
      "sales incentive gift sets",
      "partner appreciation gift set",
    ],
    seoTitle: "Channel Partner & Dealer Gifts - Distributor Gifting Sets",
    metaDescription:
      "Corporate gifts for dealers, distributors and channel partners. Tiered gifting for dealer meets, partner conventions and performance recognition.",
    h1: "Dealer & Channel Partner Gifting",
    intro: [
      "Channel gifting has a feature no internal programme does: your recipients are being gifted by your competitors too, often in the same week. A dealer who receives four gifts from four manufacturers will compare all four, so this is the one category where the gift is directly benchmarked.",
      "It is also the category where tiering matters most. Partners know roughly where they rank, and a gifting programme that treats a top-performing distributor identically to a marginal one wastes the recognition on both.",
    ],
    sections: [
      {
        heading: "Dealer meets and partner conventions",
        body: [
          "The annual meet is usually the largest single gifting event on a manufacturer's calendar, and gifts are frequently opened in the same room. Visible substance matters here in a way it does not elsewhere - a multi-piece set in a structured box reads as more considered than a single item, whatever the two actually cost.",
        ],
      },
      {
        heading: "Tiering by performance",
        body: [
          "A tiered programme lets you recognise everyone without spending the same on everyone. The usual structure is a solid premium set across the whole network, with a distinctly better set for partners who genuinely delivered.",
          "The difference has to be visible to work. If the tiers are hard to tell apart, the recognition disappears and the extra spend achieves nothing.",
        ],
        bullets: [
          "Whole network: black-and-gold notebook set or the all-purpose corporate set",
          "Strong performers: complete stationery set with full-set branding",
          "Top tier: luxury planner box or executive set",
        ],
      },
      {
        heading: "Sales incentives and channel campaigns",
        body: [
          "Incentive gifts sit alongside a target, so predictability matters: the gift has to look the same for everyone who hits the number, whether that is five partners or fifty. Sets that hold finish consistency across a large run are what make that workable.",
        ],
      },
      {
        heading: "Branding across a partner network",
        body: [
          "Channel gifts carry your brand into businesses you do not control, which is an argument for branding the whole set rather than one piece. Full-set branding keeps your mark present across everything the partner takes home from the event.",
        ],
      },
    ],
    faqs: [
      {
        question: "What makes a good dealer meet gift?",
        answer:
          "Visible substance, because dealers open and compare gifts from several manufacturers at the same event. A multi-piece set in a structured box reads as more considered than a single item, and full-set branding keeps your mark on everything they take home.",
      },
      {
        question: "Should all channel partners receive the same gift?",
        answer:
          "Usually not. Tiering recognises performance without spending the same on everyone - but the tiers have to be visibly different, or the recognition is lost and the extra budget is wasted.",
      },
      {
        question: "Can gifts be produced consistently across a large partner network?",
        answer:
          "Yes - finish and branding consistency across a large run is exactly what these sets are chosen for, so partners recognised at the same tier receive genuinely identical gifts.",
      },
    ],
    recommendedProductSlugs: [
      "complete-stationery-gift-set",
      "black-gold-premium-notebook-set",
      "corporate-gift-set-with-notebook",
      "luxury-planner-gift-box",
    ],
    relatedLinks: [
      { label: "gifting for manufacturing companies", href: "/industries/manufacturing" },
      { label: "gifting for real estate channel partners", href: "/industries/real-estate" },
      { label: "gifting at scale", href: "/gifting/bulk-corporate-gifting" },
    ],
  },
  {
    slug: "bulk-corporate-gifting",
    primaryKeyword: "bulk corporate gifts",
    secondaryKeywords: [
      "bulk corporate gifting",
      "corporate gifts wholesale",
      "bulk gifts with company logo",
      "mass gifting for employees",
      "scalable corporate gifting",
      "corporate gifting for 500 employees",
      "large quantity promotional gifts",
    ],
    seoTitle: "Bulk Corporate Gifts - Large Volume Branded Gifting",
    metaDescription:
      "Bulk corporate gifts with company logo branding at volume. Consistent finish across large runs, tiered pricing and identical re-orders.",
    h1: "Bulk Corporate Gifting",
    intro: [
      "Buying gifts in volume changes which problems matter. Per-unit price is the obvious one, but the ones that actually cause trouble are consistency across the run, artwork approval before production starts, and whether the same gift can be re-ordered months later without visibly changing.",
      "This page covers how to plan a large gifting order and which sets hold up at volume - whether that is a hundred employees, a conference floor, or a full distributor network.",
    ],
    sections: [
      {
        heading: "Choosing a set that scales",
        body: [
          "Not every gift behaves well in quantity. Sets with a single-colour print and a simple construction hold their finish across thousands of units; sets with foil detailing, multiple materials or delicate packaging are better suited to shorter runs where each one can be checked.",
          "For the largest quantities, the minimal notebook and pen set is the one designed for the job. The mid-range notebook and corporate sets cover the common hundred-to-several-hundred band.",
        ],
      },
      {
        heading: "Volume pricing",
        body: [
          "Products with volume pricing show their quantity bands on the product page itself, so you can see where the per-unit cost steps down before enquiring. For quantities beyond the published bands, or for a mixed order across several sets, request a quote and we will price against the actual requirement.",
        ],
      },
      {
        heading: "Branding and approval at volume",
        body: [
          "A large order is the wrong place to discover an artwork problem. Logo proofs are shared before production for exactly that reason - once a run of a thousand has been printed, the mistake is a thousand units deep.",
          "Where the same gift will be re-ordered through the year, keeping one approved artwork on file is what makes later batches match the first.",
        ],
      },
      {
        heading: "Planning quantities and timelines",
        bullets: [
          "Confirm headcount including likely joiners before finalising quantity",
          "Order a margin above the exact count for damage and late additions",
          "Allow time for artwork approval and a personalization proof",
          "Confirm whether delivery is to one address or several",
          "For recurring programmes, plan re-order points rather than reordering reactively",
        ],
      },
      {
        heading: "Multi-location dispatch",
        body: [
          "Distributed teams and multi-city events do not need a single delivery address. Multi-location dispatch is supported - share the address list with your enquiry so it can be quoted properly rather than treated as one bulk shipment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you offer volume pricing on bulk corporate gifts?",
        answer:
          "Yes. Products with tiered pricing display their quantity bands on the product page, so you can see where per-unit cost steps down. For larger quantities or mixed orders across several sets, request a quote and we will price the actual requirement.",
      },
      {
        question: "Will a large order look consistent throughout?",
        answer:
          "That is a genuine consideration when choosing. Simpler constructions with single-colour printing hold their finish best across very large runs, which is why they are recommended for the highest quantities; foil and multi-material sets suit shorter runs.",
      },
      {
        question: "Can you deliver to multiple locations?",
        answer:
          "Yes, multi-location dispatch is supported for distributed teams and multi-city events. Share your address list with the enquiry so it can be quoted accurately.",
      },
      {
        question: "How much lead time does a bulk order need?",
        answer:
          "Enough for artwork approval and a personalization proof before production begins. Rush timelines can be discussed, but proofing is the step worth protecting - an error found after a large run has printed is expensive.",
      },
    ],
    recommendedProductSlugs: [
      "minimal-notebook-pen-set",
      "compact-corporate-welcome-kit",
      "classic-pen-keychain-welcome-set",
      "corporate-gift-set-with-notebook",
    ],
    relatedLinks: [
      { label: "request a bulk quote", href: "/bulk-enquiry" },
      { label: "conference and event gifting", href: "/gifting/events-conferences" },
      { label: "custom logo branding options", href: "/custom-gifts" },
    ],
  },
];
