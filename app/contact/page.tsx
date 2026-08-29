import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import LeadForm from "@/components/forms/LeadForm";
import { buildWhatsAppUrl, STORE_CONTACT } from "@/lib/config/store";

export const metadata: Metadata = {
  title: "Contact | Gifta Guru",
  description: "Get in touch with the Gifta Guru team for corporate gifting inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's create something thoughtful."
        description="Tell us what you are looking for and our team will help you find the right corporate gifting solution."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-lg bg-white p-8 ring-1 ring-navy-950/5">
            <h2 className="font-display text-xl text-navy-950">Contact details</h2>
            <ul className="flex flex-col gap-4 text-sm text-ink-700">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
                <a href={`tel:${STORE_CONTACT.phoneHref}`} className="hover:text-gold-600">+91 {STORE_CONTACT.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
                <a href={`mailto:${STORE_CONTACT.email}`} className="hover:text-gold-600">{STORE_CONTACT.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
                <span>{STORE_CONTACT.address}</span>
              </li>
            </ul>
            <Button href="/bulk-enquiry" variant="primary" className="w-fit">
              Request a Quote
            </Button>
            <a href={buildWhatsAppUrl("Hi Gifta Guru, I would like to know more about your corporate gifting solutions.")} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-cream-200">
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              WhatsApp quick action
            </a>
          </div>

          <LeadForm type="contact" source="Contact page" />
        </Container>
      </section>
    </>
  );
}
