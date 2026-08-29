import { Building2, Gem, LifeBuoy, Package, Palette, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  {
    Icon: Gem,
    title: "Curated Quality",
    description: "Every gift is sourced and finished to a standard businesses can put their name on.",
  },
  {
    Icon: Palette,
    title: "Custom Branding",
    description: "Logo embossing, branded packaging and personalized inserts across collections.",
  },
  {
    Icon: Package,
    title: "Bulk Fulfilment",
    description: "Reliable handling of corporate volumes without compromising on care.",
  },
  {
    Icon: Truck,
    title: "Pan-India Delivery",
    description: "Coordinated delivery to single offices or teams distributed across the country.",
  },
  {
    Icon: Building2,
    title: "Corporate Expertise",
    description: "Experience gifting for HR teams, founders and enterprise clients.",
  },
  {
    Icon: LifeBuoy,
    title: "Dedicated Support",
    description: "One team with you from selection through to delivery.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section bg-navy-950 text-cream-100">
      <Container className="flex flex-col gap-14 sm:gap-20">
        <SectionHeading
          eyebrow="Why Gifta Guru"
          title="Built for businesses that care about the details"
          tone="dark"
        />
        {/* Hairlines and whitespace carry the structure -- the icon is a quiet
            marker above each entry, not a badge in a box. */}
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ Icon, title, description }) => (
            <div key={title} className="border-t border-cream-100/15 pt-6">
              <Icon className="h-5 w-5 text-gold-400" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg text-cream-100">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-cream-100/65">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
