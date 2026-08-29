import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Tell us what you need",
    description: "Share the occasion, quantity and budget. We shortlist what fits.",
  },
  {
    title: "Choose your gifts",
    description: "Browse eco, joining, premium and luxury collections.",
  },
  {
    title: "Customize",
    description: "Add branding, packaging and personalized messages.",
  },
  {
    title: "We deliver",
    description: "We pack, dispatch and deliver pan-India, on time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section">
      <Container className="flex flex-col gap-14 sm:gap-20">
        <SectionHeading eyebrow="How It Works" title="From selection to delivery, in four steps" />
        {/* The numeral is the graphic. No icons, no circles, no boxes. */}
        <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-line pt-6">
              <span className="font-display text-3xl text-gold-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg text-navy-950">{step.title}</h3>
              <p className="type-body mt-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
