import Image from "next/image";
import { Box, FileText, ListChecks, MessageSquareText, Stamp } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

const features = [
  { label: "Add your company branding", Icon: Stamp },
  { label: "Customize gift boxes and packaging", Icon: Box },
  { label: "Add personalized messages", Icon: MessageSquareText },
  { label: "Select products for your gift set", Icon: ListChecks },
  { label: "Request a bulk quote in minutes", Icon: FileText },
];

/**
 * Rendered on both the homepage and /custom-gifts. The CTA must therefore be
 * configurable: with a hardcoded /custom-gifts href it linked to the page the
 * visitor was already on, so the button did nothing on /custom-gifts.
 */
export default function CustomGifting({
  ctaHref = "/custom-gifts",
  ctaLabel = "Explore Custom Branding",
}: {
  ctaHref?: string;
  ctaLabel?: string;
} = {}) {
  return (
    <section className="section">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-last aspect-[4/3] overflow-hidden border border-line bg-sunken lg:order-first">
          <Image
            src="/SBanners/SBanners/LUXURY.png"
            alt="Custom branded corporate gift boxes"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Custom Corporate Gifting"
            title="Make every gift unmistakably yours"
            description="Design a gifting experience around your brand, your message and your budget."
          />
          <ul className="flex flex-col">
            {features.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3.5 border-b border-line py-3.5 text-sm text-navy-950 first:border-t"
              >
                <Icon
                  className="h-[1.15rem] w-[1.15rem] shrink-0 text-gold-600"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
          <div>
            <Button href={ctaHref} variant="primary">
              {ctaLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
