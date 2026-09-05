import Link from "next/link";
import Container from "@/components/ui/Container";

/**
 * The homepage's indexable introduction.
 *
 * The homepage previously carried almost no crawlable prose -- the hero, the
 * category tiles and the product grid are largely images and short labels, so
 * there was very little for a search engine to read on the most important page
 * on the site.
 *
 * This section fixes that WITHOUT turning the homepage into a keyword dump. It
 * owns the broad, brand-level commercial terms (corporate gifts, corporate
 * gifting company, personalized corporate gifts, custom gift sets with logo,
 * bulk corporate gifts) that deliberately belong to no category or product
 * page, and it links down into the tiers that own everything more specific.
 *
 * It sits below the featured products rather than above them so the page stays
 * conversion-first for visitors, while remaining fully crawlable.
 */
export default function SeoIntro() {
  return (
    <section className="section border-t border-line">
      <Container>
        <div className="max-w-3xl">
          <h2 className="type-h2">Corporate gifting, built around your brand</h2>
          <p className="type-body mt-5">
            Gifta Guru is a corporate gifting company supplying personalized corporate gifts and
            custom gift sets with logo branding to businesses across India. Everything in the
            catalog is made to be branded: logo printing, foil stamping, laser engraving and
            debossing, with individual recipient names where a gift should feel addressed rather
            than distributed.
          </p>
          <p className="type-body mt-4">
            The range covers the full corporate gifting calendar - employee welcome kits for
            onboarding, appreciation and milestone gifts for existing teams, client and partner
            gifting through the year, delegate kits for conferences, and premium festive sets for
            Diwali and the new year. Bulk corporate gifts are supported throughout, with volume
            pricing shown on the product pages and quotes available for larger or mixed orders.
          </p>
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-lg text-navy-950">Shop by collection</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/categories/joining-gifts" className="link-underline type-body">
                  Employee welcome kits
                </Link>
              </li>
              <li>
                <Link href="/categories/premium-gifts" className="link-underline type-body">
                  Premium corporate gift sets
                </Link>
              </li>
              <li>
                <Link href="/categories/luxury-gifts" className="link-underline type-body">
                  Luxury corporate gifts
                </Link>
              </li>
              <li>
                <Link href="/categories/eco-gifts" className="link-underline type-body">
                  Eco friendly corporate gifts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-navy-950">Shop by occasion</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/gifting/employee-onboarding" className="link-underline type-body">
                  Employee onboarding gifts
                </Link>
              </li>
              <li>
                <Link href="/gifting/client-appreciation" className="link-underline type-body">
                  Corporate gifts for clients
                </Link>
              </li>
              <li>
                <Link href="/gifting/events-conferences" className="link-underline type-body">
                  Conference and event gifting
                </Link>
              </li>
              <li>
                <Link href="/occasions/diwali-corporate-gifts" className="link-underline type-body">
                  Diwali corporate gifts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-navy-950">Gifting by industry</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/industries/it-software-saas" className="link-underline type-body">
                  IT, software and SaaS
                </Link>
              </li>
              <li>
                <Link href="/industries/bfsi-banking-insurance" className="link-underline type-body">
                  Banking and insurance
                </Link>
              </li>
              <li>
                <Link href="/industries/manufacturing" className="link-underline type-body">
                  Manufacturing and dealer networks
                </Link>
              </li>
              <li>
                <Link href="/industries" className="link-underline type-body">
                  All industries served
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-navy-950">Plan your gifting</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/guides/corporate-gifting-guide" className="link-underline type-body">
                  The corporate gifting guide
                </Link>
              </li>
              <li>
                <Link href="/guides/corporate-gifting-budget-guide" className="link-underline type-body">
                  Budgeting gifts at scale
                </Link>
              </li>
              <li>
                <Link href="/gift-sets" className="link-underline type-body">
                  3 to 6 piece gift sets
                </Link>
              </li>
              <li>
                <Link href="/bulk-enquiry" className="link-underline type-body">
                  Request a bulk quote
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
