import { PackageSearch, Sparkles, FileSignature, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  { icon: PackageSearch, title: "Choose your gifting category", description: "Browse eco, joining, premium, or luxury collections." },
  { icon: Sparkles, title: "Customize your gifts", description: "Add branding, packaging, and personalized messages." },
  { icon: FileSignature, title: "Request a quote or order", description: "Get pricing for your quantity and confirm your order." },
  { icon: Truck, title: "Gifta Guru handles delivery", description: "We pack, dispatch, and deliver pan-India, on time." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="How It Works"
          title="From selection to delivery, in four simple steps"
          align="center"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-3 rounded-2xl bg-white p-6 text-center ring-1 ring-navy-950/5">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-950 text-sm font-semibold text-cream-100">
                {index + 1}
              </span>
              <step.icon className="mx-auto h-6 w-6 text-gold-600" aria-hidden="true" />
              <h3 className="font-display text-base text-navy-950">{step.title}</h3>
              <p className="text-sm text-ink-700">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
