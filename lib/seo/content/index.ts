import type { LandingFamily, LandingPageContent } from "./types";
import { landingFamilies } from "./types";
import { industryPages } from "./industries";
import { useCasePages } from "./use-cases";
import { occasionPages } from "./occasions";
import { giftSetPages } from "./gift-sets";
import { guidePages } from "./guides";

/**
 * Single registry of every editorial SEO landing page.
 *
 * The sitemap, the footer, and the SEO validation script all read from here,
 * which is what guarantees a new page cannot be published and then orphaned:
 * adding it to one of the family arrays automatically puts it in the sitemap,
 * in the footer navigation, and under validation.
 */
export const landingPagesByFamily: Record<LandingFamily, LandingPageContent[]> = {
  industries: industryPages,
  gifting: useCasePages,
  occasions: occasionPages,
  "gift-sets": giftSetPages,
  guides: guidePages,
};

export interface RegisteredLandingPage {
  family: LandingFamily;
  path: string;
  content: LandingPageContent;
}

/** Every landing page, flattened, with its resolved URL path. */
export function allLandingPages(): RegisteredLandingPage[] {
  return (Object.keys(landingPagesByFamily) as LandingFamily[]).flatMap((family) =>
    landingPagesByFamily[family].map((content) => ({
      family,
      path: `${landingFamilies[family].basePath}/${content.slug}`,
      content,
    })),
  );
}

/** The five hub URLs. Listed in the sitemap and linked from the footer. */
export function allLandingHubPaths(): string[] {
  return (Object.keys(landingFamilies) as LandingFamily[]).map(
    (family) => landingFamilies[family].basePath,
  );
}

export { industryPages, useCasePages, occasionPages, giftSetPages, guidePages };
