/** Service-area pages target commercial delivery intent. They do not claim a
 * local office: the verified office remains New Delhi, while pan-India and
 * multi-location delivery are established storefront claims. */
export const ncrServiceAreas = [
  { slug: "delhi", name: "Delhi" },
  { slug: "delhi-ncr", name: "Delhi NCR" },
  { slug: "gurgaon", name: "Gurgaon" },
  { slug: "noida", name: "Noida" },
  { slug: "ghaziabad", name: "Ghaziabad" },
  { slug: "faridabad", name: "Faridabad" },
  { slug: "greater-noida", name: "Greater Noida" },
] as const;

export function serviceAreaBySlug(slug: string) {
  return ncrServiceAreas.find((area) => area.slug === slug);
}
