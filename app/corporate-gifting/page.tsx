import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import CorporateSolutions from "@/components/home/CorporateSolutions";
import HowItWorks from "@/components/home/HowItWorks";
import BulkOrderCTA from "@/components/home/BulkOrderCTA";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Solutions in India | Gifta Guru",
  description: "Corporate gifting solutions for Indian businesses: branded gifts, employee and client gifting, welcome kits, events and bulk orders.",
  path: "/corporate-gifting",
});

export default function CorporateGiftingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Corporate Gifting"
        title="Corporate gifting solutions for teams, clients and business events"
        description="Gifta Guru helps HR, procurement, admin and marketing teams plan branded corporate gifts, employee welcome kits and bulk gifting programmes across India."
      />
      <CorporateSolutions />
      <section className="section border-t border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="type-h2">Corporate gifting kits for every business moment</h2>
          <p className="type-body mt-4">
            A useful corporate gift does more than carry a logo. It should suit the reason it is being sent, the person receiving it and the way the order needs to be delivered. A compact corporate gift kit can make a new employee feel expected on their first day; a premium corporate gift set can recognise a long-standing client without feeling promotional; and a practical branded set can help a large event or employee campaign feel consistent across every recipient.
          </p>
          <p className="type-body mt-4">
            Start by separating the audience into real recipient groups. Employees, clients, channel partners and senior leadership do not need the same level of presentation or personalisation. Most successful programmes use one dependable tier for the broad list and reserve a more refined, premium or luxury corporate gift kit for a shorter relationship-led list. This creates a clear rationale for the spend while keeping the whole campaign coherent.
          </p>

          <h2 className="type-h2 mt-10">Employee, client and corporate joining kits</h2>
          <p className="type-body mt-4">
            Employee corporate gift kits work best when the contents are useful from day one. A notebook, pen, planner, card holder or desk accessory earns its place because it can stay in use at work or at home. For new employee gifting and employee welcome kits, add a welcome card and choose a format that can be re-ordered consistently as the team grows. Recipient-name personalisation makes a joining kit feel prepared for an individual, while logo branding keeps the experience connected to the company.
          </p>
          <p className="type-body mt-4">
            Client corporate gift kits need a different balance. A thoughtful desk set, folio or premium gift box is often stronger than a large item covered in branding. For clients, a restrained logo on the packaging and a name or initials on the gift can make the gesture feel personal while still representing the business relationship. The same principle applies to dealer, distributor and partner programmes: use a scalable branded tier for the wider network, then create a premium tier for the relationships that need extra attention.
          </p>

          <h2 className="type-h2 mt-10">Planning Diwali corporate gifting and bulk orders</h2>
          <p className="type-body mt-4">
            Diwali corporate gifting is usually the largest annual programme, so it benefits from planning before the product shortlist. Confirm who is receiving a gift, whether employees and clients need separate tiers, which items need logo branding or recipient names, and whether delivery goes to one office or several addresses. These details turn a generic request for corporate Diwali gifts into a practical brief for a bulk order.
          </p>
          <p className="type-body mt-4">
            Diwali gift kits for employees should be consistent enough that the entire team feels included. Diwali gifts for clients can be more selective, with premium corporate gift kits or luxury corporate gift sets for senior contacts and key accounts. Sustainable corporate gift kits are a suitable option where material choices and packaging are important to the programme. Whatever the tier, approve artwork and personalisation details early so there is time to review the selected product details and available customisation.
          </p>

          <h2 className="type-h2 mt-10">How to brief a corporate gift supplier</h2>
          <p className="type-body mt-4">
            A clear enquiry helps a corporate gift supplier recommend the right options quickly. Include the number of recipients, the purpose of the campaign, your approximate recipient tiers, logo files or branding requirements, and the delivery split. If you need a two, three or four item corporate gift set, say whether the priority is everyday utility, a fuller presentation, or a premium impression. The team can then match the brief to live catalogue products rather than promising a generic configuration.
          </p>
          <p className="type-body mt-4">
            Gifta Guru supports branded corporate gifts, customised corporate gift kits and multi-location delivery planning across India. Browse by occasion or recipient group, review the exact product details, then request a quote for bulk, personalised or split-delivery requirements.
          </p>
        </div>
      </section>
      <section className="section border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="type-h2">Explore corporate gifting by requirement</h2>
          <p className="type-body mt-4 max-w-3xl">
            Start with the business moment you are planning, then shortlist gift sets and request a quote with your quantity, branding and delivery requirements.
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Employee onboarding and welcome kits", "/gifting/employee-onboarding"],
              ["Employee appreciation and recognition gifts", "/gifting/employee-appreciation"],
              ["Corporate gifts for clients", "/gifting/client-appreciation"],
              ["Bulk corporate gifting", "/gifting/bulk-corporate-gifting"],
              ["Custom branded corporate gifts", "/custom-gifts"],
              ["Conference and event gifting", "/gifting/events-conferences"],
              ["Corporate Diwali gifts", "/occasions/diwali-corporate-gifts"],
              ["Corporate tech gifts and gadgets", "/gifting/tech-corporate-gifts"],
              ["Corporate gifting guide", "/blog/corporate-gifting-guide"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="link-underline type-body text-navy-950">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <HowItWorks />
      <BulkOrderCTA />
    </>
  );
}
