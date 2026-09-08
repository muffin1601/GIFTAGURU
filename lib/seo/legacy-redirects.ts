/**
 * Permanent redirects for URLs published by the former storefront.
 *
 * These URLs have external discovery history in Search Console, but the
 * current information architecture serves the same intent at the destination
 * below. Keeping this list in one place lets next.config.ts send a 308 before
 * a dynamic route renders, while the SEO validator protects it from regressions.
 */
export const legacySeoRedirects = [
  { source: "/categories/client-gifts", destination: "/gifting/client-appreciation" },
  { source: "/categories/corporate-gifts", destination: "/corporate-gifting" },
  { source: "/categories/employee-appreciation-gifts", destination: "/gifting/employee-appreciation" },
  { source: "/categories/employee-welcome-kits", destination: "/categories/joining-gifts" },
  { source: "/categories/festive-corporate-gifts", destination: "/occasions/festive-corporate-gifting" },
  { source: "/categories/gift-sets-hampers", destination: "/gift-sets" },
  { source: "/products/journal-and-matching-pen-set", destination: "/products/journal-matching-pen-set" },
  { source: "/products/minimal-notebook-and-pen-set", destination: "/products/minimal-notebook-pen-set" },
] as const;
