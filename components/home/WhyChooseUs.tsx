import { Gem, Palette, Package, Truck, Building2, Heart } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  { icon: Gem, title: "Premium Quality", description: "Every gift is sourced and finished to a standard businesses can put their name on." },
  { icon: Palette, title: "Custom Branding", description: "Logo embossing, branded packaging, and personalized inserts across collections." },
  { icon: Package, title: "Bulk Ordering", description: "Streamlined process for ordering hundreds of gifts without compromising on care." },
  { icon: Truck, title: "Pan-India Delivery", description: "Reliable delivery to single offices or distributed teams across the country." },
  { icon: Building2, title: "Corporate Expertise", description: "Years of experience gifting for HR teams, founders, and enterprise clients." },
  { icon: Heart, title: "Personalized Gifting", description: "Thoughtful curation for every occasion, team, and relationship you value." },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-navy-950 py-16 text-cream-100 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Why Gifta Guru"
          title="Built for businesses that care about the details"
          align="center"
          tone="dark"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-white/10 p-6">
              <Icon className="h-8 w-8 text-gold-400" aria-hidden="true" />
              <h3 className="font-display text-lg text-cream-100">{title}</h3>
              <p className="text-sm text-cream-100/70">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
