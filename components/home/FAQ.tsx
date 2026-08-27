import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { faqs } from "@/data/faqs";

export default function FAQ() {
  return (
    <section className="bg-cream-200 py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="FAQ"
          title="Corporate gifting, answered"
          align="center"
        />
        <div className="mx-auto w-full max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </Container>
    </section>
  );
}
