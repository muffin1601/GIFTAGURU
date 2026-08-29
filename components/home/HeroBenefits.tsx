import { BadgeCheck, Boxes, Layers, LifeBuoy, Truck } from "lucide-react";
import Container from "@/components/ui/Container";

/**
 * Trust strip. Icons are drawn at strokeWidth 1.25 and sized to the cap height
 * of the label -- at default weight they read as chunky UI chrome rather than
 * an editorial mark.
 */
const capabilities = [
  { label: "Custom Branding", Icon: BadgeCheck },
  { label: "Bulk Orders", Icon: Boxes },
  { label: "Pan-India Delivery", Icon: Truck },
  { label: "Curated Collections", Icon: Layers },
  { label: "Dedicated Support", Icon: LifeBuoy },
];

export default function HeroBenefits() {
  return (
    <section className="border-b border-line bg-sunken">
      <Container>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 py-7 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between">
          {capabilities.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon
                className="h-[1.15rem] w-[1.15rem] shrink-0 text-gold-600"
                strokeWidth={1.25}
                aria-hidden="true"
              />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-700">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
