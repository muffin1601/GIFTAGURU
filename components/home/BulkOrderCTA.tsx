import { Headset, MapPinned, ReceiptIndianRupee, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const benefits = [
  { label: "Dedicated account support for large orders", Icon: Headset },
  { label: "Volume-based pricing and flexible invoicing", Icon: ReceiptIndianRupee },
  { label: "Consistent quality across every unit", Icon: ShieldCheck },
  { label: "Pan-India logistics, including multi-city dispatch", Icon: MapPinned },
];

export default function BulkOrderCTA() {
  return (
    <section className="section bg-navy-950 text-cream-100">
      <Container className="grid gap-12 lg:grid-cols-[1.5fr_auto] lg:items-center lg:gap-20">
        <div>
          <h2 className="type-h2 text-cream-100">Planning gifts for your team or clients?</h2>
          <p className="mt-5 max-w-lg text-cream-100/70">
            Whether it&apos;s 20 gifts or 2,000, our bulk gifting program is built to make ordering
            simple, consistent and on time.
          </p>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {benefits.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 border-t border-cream-100/15 py-3.5 text-sm text-cream-100/80"
              >
                <Icon
                  className="h-[1.15rem] w-[1.15rem] shrink-0 text-gold-400"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            href="/bulk-enquiry"
            variant="primary"
            className="!border-gold-500 !bg-gold-500 !text-navy-950 hover:!border-gold-400 hover:!bg-gold-400"
          >
            Request a Quote
          </Button>
          <Button
            href="/contact"
            variant="secondary"
            className="!border-cream-100/40 !text-cream-100 hover:!border-cream-100"
          >
            Contact Sales
          </Button>
        </div>
      </Container>
    </section>
  );
}
