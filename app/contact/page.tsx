import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import LeadForm from "@/components/forms/LeadForm";
import { buildWhatsAppUrl, STORE_CONTACT } from "@/lib/config/store";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

export const metadata: Metadata = pageMetadata({
  title: "Contact | Gifta Guru",
  description: "Get in touch with the Gifta Guru team for corporate gifting inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's create something thoughtful."
        description="Tell us what you are looking for and our team will help you find the right corporate gifting solution."
      />
      <section className="site-section bg-canvas py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-[30px] bg-navy-950 p-8 text-cream-100 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.18)] sm:p-10">
            <p className="type-eyebrow !text-gold-300">Talk to our team</p>
            <h2 className="font-display text-3xl font-bold text-cream-100">Contact details</h2>
            <ul className="flex flex-col gap-4 text-sm text-cream-100/75">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
                <a href={`tel:${STORE_CONTACT.phoneHref}`} className="hover:text-gold-300">+91 {STORE_CONTACT.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
                <a href={`mailto:${STORE_CONTACT.email}`} className="hover:text-gold-300">{STORE_CONTACT.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
                <span>{STORE_CONTACT.address}</span>
              </li>
            </ul>
            <Button href="/bulk-enquiry" variant="primary" className="w-fit !border-gold-400 !bg-gold-400 !text-navy-950">
              Request a Quote
            </Button>
            <a href={buildWhatsAppUrl("Hi Gifta Guru, I would like to know more about your corporate gifting solutions.")} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-[30px] border border-cream-100/25 px-5 py-2.5 text-sm font-semibold text-cream-100 hover:border-cream-100">
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              WhatsApp quick action
            </a>
          </div>

          <LeadForm type="contact" source="Contact page" />
        </Container>
      </section>
      <BusinessBuyerGuide
        title="What to include in a corporate gifting enquiry"
        paragraphs={[
          "The most useful starting point is the business occasion, recipient count and the type of relationship the gift should support. A joining kit, employee recognition gift and senior-client gift are usually selected differently even when they share a similar budget.",
          "If branding or multi-location delivery matters, include that in your enquiry. The team can then recommend relevant current products rather than sending a generic catalogue.",
        ]}
        links={[{ label: "Employee onboarding gifts", href: "/gifting/employee-onboarding" }, { label: "Corporate gifts for clients", href: "/gifting/client-appreciation" }, { label: "Bulk corporate gifting", href: "/gifting/bulk-corporate-gifting" }]}
      />
    </>
  );
}
