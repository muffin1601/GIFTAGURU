import { Boxes, Paintbrush, Truck } from "lucide-react";
import Container from "@/components/ui/Container";

const benefits = [
  {
    title: "Pan-India Delivery",
    description: "Delivering thoughtful corporate gifts safely across India.",
    Icon: Truck,
  },
  {
    title: "Custom Branding",
    description: "Personalize gifts with your company logo and branding.",
    Icon: Paintbrush,
  },
  {
    title: "Bulk Order Ready",
    description: "Efficient solutions for corporate and large quantity gifting.",
    Icon: Boxes,
  },
];

export default function HeroBenefits() {
  return (
    <section className="border-b border-navy-950/10 bg-cream-100">
      <Container className="py-8 sm:py-10">
        <div className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">Why Gifta Guru</p>
          <h2 className="mt-2 font-display text-2xl text-navy-950 sm:text-3xl">Corporate gifting made simple.</h2>
        </div>
        <div className="grid overflow-hidden rounded-lg border border-navy-950/10 bg-white/72 md:grid-cols-3">
          {benefits.map(({ title, description, Icon }) => (
            <div key={title} className="group flex gap-4 p-6 transition-colors hover:bg-cream-200/45 md:border-r md:border-navy-950/10 md:last:border-r-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/14 text-gold-700 ring-1 ring-gold-500/20 transition-colors group-hover:bg-gold-500 group-hover:text-navy-950">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-xl text-navy-950">{title}</span>
                <span className="mt-2 block text-sm leading-6 text-ink-700">{description}</span>
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
