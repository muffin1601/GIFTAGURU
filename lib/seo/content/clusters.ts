import type { ProductCluster } from "./products";
import type { LandingLink } from "./types";

/**
 * Where each product cluster links UP to.
 *
 * This is the mechanism that keeps the keyword hierarchy intact. Product pages
 * own long-tail terms and must not compete for cluster head terms like
 * "luxury corporate gifts" -- instead they link to the category and use-case
 * pages that do own those terms, passing relevance upward rather than
 * duplicating it.
 *
 * Anchors are varied per cluster on purpose. Repeating one exact anchor
 * ("corporate gifts") from all 24 product pages would be an obvious
 * over-optimisation pattern; these read as the natural next step for someone
 * looking at that particular set.
 */
export const productClusterLinks: Record<ProductCluster, LandingLink[]> = {
  "onboarding-welcome-kits": [
    { label: "Browse all employee welcome kits", href: "/categories/joining-gifts" },
    { label: "How to build an onboarding gifting programme", href: "/gifting/employee-onboarding" },
    { label: "What belongs in a welcome kit", href: "/guides/employee-welcome-kit-guide" },
  ],
  "pens-desk-accessories": [
    { label: "Corporate gift sets for teams and events", href: "/categories/premium-gifts" },
    { label: "Conference and delegate gifting", href: "/gifting/events-conferences" },
    { label: "Comparing logo branding methods", href: "/guides/logo-branding-on-corporate-gifts" },
  ],
  "client-relationship-gifting": [
    { label: "Corporate gifts for clients", href: "/gifting/client-appreciation" },
    { label: "Premium corporate gift sets", href: "/categories/premium-gifts" },
    { label: "Client gifting timing and etiquette", href: "/guides/client-gifting-guide" },
  ],
  "luxury-executive": [
    { label: "Explore luxury corporate gifts", href: "/categories/luxury-gifts" },
    { label: "Executive and leadership gifting", href: "/gifting/executive-leadership" },
    { label: "New Year executive gifting", href: "/occasions/new-year-corporate-gifts" },
  ],
  "stationery-journals": [
    { label: "Premium corporate gift sets", href: "/categories/premium-gifts" },
    { label: "Employee appreciation gifting", href: "/gifting/employee-appreciation" },
    { label: "Multi-piece gift sets from 3 to 6 pieces", href: "/gift-sets" },
  ],
  "eco-sustainable": [
    { label: "Browse eco friendly corporate gifts", href: "/categories/eco-gifts" },
    { label: "Making corporate gifting genuinely sustainable", href: "/guides/eco-friendly-corporate-gifting" },
    { label: "Sustainable event merchandise", href: "/gifting/events-conferences" },
  ],
  "planners-folios": [
    { label: "Employee appreciation gifting", href: "/gifting/employee-appreciation" },
    { label: "New Year and planner gifting", href: "/occasions/new-year-corporate-gifts" },
    { label: "Gifting for consulting and professional services", href: "/industries/consulting" },
  ],
};
