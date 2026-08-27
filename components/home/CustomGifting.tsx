import Image from "next/image";
import { Stamp, Box, MessageSquareText, ListChecks, FileText } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

const features = [
  { icon: Stamp, label: "Add your company branding" },
  { icon: Box, label: "Customize gift boxes and packaging" },
  { icon: MessageSquareText, label: "Add personalized messages" },
  { icon: ListChecks, label: "Select products for your gift set" },
  { icon: FileText, label: "Request a bulk quote in minutes" },
];

export default function CustomGifting() {
  return (
    <section className="bg-cream-200 py-16 sm:py-20">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative order-last overflow-hidden rounded-3xl shadow-xl ring-1 ring-navy-950/10 lg:order-first">
          <Image
            src="/SBanners/SBanners/LUXURY.png"
            alt="Custom branded corporate gift boxes"
            width={1774}
            height={890}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Custom Corporate Gifting"
            title="Make every gift unmistakably yours"
            description="Design a gifting experience around your brand, your message, and your budget."
          />
          <ul className="flex flex-col gap-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900/5 text-navy-900">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-navy-950">{label}</span>
              </li>
            ))}
          </ul>
          <div>
            <Button href="/custom-gifts" variant="primary">
              Start a Corporate Inquiry
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
