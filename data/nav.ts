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

export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
];
