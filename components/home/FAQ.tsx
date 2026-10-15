import Link from "next/link";
import Container from "@/components/ui/Container";
import Accordion from "@/components/ui/Accordion";
import { getFaqs } from "@/lib/data/content";
import type { Faq as FaqItem } from "@/types";

const faqLinks = [
  { label: "Explore corporate gifts", href: "/corporate-gifting" },
  { label: "View employee welcome kits", href: "/gifting/employee-onboarding" },
  { label: "Plan a bulk order", href: "/bulk-enquiry" },
];

export default async function FAQ({ items }: { items?: FaqItem[] }) {
  const faqs = items ?? await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <section className="section border-t border-line bg-sunken" aria-labelledby="home-faq-heading">
      <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <p className="type-eyebrow">Corporate gifting FAQs</p>
          <h2 id="home-faq-heading" className="mt-3 max-w-lg font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-navy-950">
            Practical answers for confident gifting decisions.
          </h2>
          <p className="type-body mt-5 max-w-md">
            From custom branding and minimum quantities to nationwide delivery, here is what business buyers usually need to know before placing an order.
          </p>
          <nav className="mt-8 border-t border-line pt-5" aria-label="Helpful corporate gifting links">
            <ul className="space-y-3">
              {faqLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm font-semibold text-navy-950">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="hanna-card border border-line bg-surface px-5 sm:px-8">
          <Accordion items={faqs} />
        </div>
      </Container>
    </section>
  );
}
