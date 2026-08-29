import type { NavLink } from "@/types";

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Categories", href: "/categories" },
  { label: "Custom Gifts", href: "/custom-gifts" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerCategoryLinks: NavLink[] = [
  { label: "Eco Gifts", href: "/categories/eco-gifts" },
  { label: "Joining Gifts", href: "/categories/joining-gifts" },
  { label: "Luxury Gifts", href: "/categories/luxury-gifts" },
  { label: "Premium Gifts", href: "/categories/premium-gifts" },
];

export const footerSolutionLinks: NavLink[] = [
  { label: "Employee Onboarding", href: "/corporate-gifting#onboarding" },
  { label: "Employee Appreciation", href: "/corporate-gifting#appreciation" },
  { label: "Client Gifts", href: "/corporate-gifting#client-gifts" },
  { label: "Event Gifting", href: "/corporate-gifting#event-gifting" },
];

/**
 * Footer columns. Every entry points at a route that exists -- no placeholder
 * links. Add Shipping / Returns / Our Story here once those pages are built.
 */
export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Gifts", href: "/shop" },
      { label: "Collections", href: "/categories" },
      { label: "Joining Gifts", href: "/categories/joining-gifts" },
      { label: "Premium Gifts", href: "/categories/premium-gifts" },
      { label: "Luxury Gifts", href: "/categories/luxury-gifts" },
      { label: "Eco-Friendly Gifts", href: "/categories/eco-gifts" },
    ],
  },
  {
    heading: "Business",
    links: [
      { label: "Corporate Gifting", href: "/corporate-gifting" },
      { label: "Custom Branding", href: "/custom-gifts" },
      { label: "Bulk Orders", href: "/bulk-orders" },
      { label: "Request a Quote", href: "/bulk-enquiry" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Track Order", href: "/track-order" },
      { label: "Your Account", href: "/account" },
      { label: "Your Cart", href: "/cart" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
    ],
  },
];

export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
];
