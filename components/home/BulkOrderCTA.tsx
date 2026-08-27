import { CheckCircle2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const benefits = [
  "Dedicated account support for large orders",
  "Volume-based pricing and flexible invoicing",
  "Consistent quality across every unit",
  "Pan-India logistics, including multi-city dispatch",
];

export default function BulkOrderCTA() {
  return (
    <section className="bg-navy-950 py-16 text-cream-100 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Planning gifts for your team or clients?
          </h2>
          <p className="max-w-lg text-cream-100/75">
            Whether it&apos;s 20 gifts or 2,000, our bulk gifting program is built to make ordering
            simple, consistent, and on time.
          </p>
          <ul className="flex flex-col gap-2.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-cream-100/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-white/5 p-8 sm:flex-row sm:items-center sm:justify-center lg:flex-col lg:items-stretch">
          <Button href="/bulk-enquiry" variant="primary" className="bg-gold-500 text-navy-950 hover:bg-gold-400">
            Request a Quote
          </Button>
          <Button href="/contact" variant="secondary" className="border-cream-100 text-cream-100 hover:bg-cream-100 hover:text-navy-950">
            Contact Sales
          </Button>
        </div>
      </Container>
    </section>
  );
}
