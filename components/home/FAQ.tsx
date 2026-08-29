import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { faqs } from "@/data/faqs";

export default function FAQ() {
  return (
    <section className="section bg-sunken">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading eyebrow="FAQ" title="Corporate gifting, answered" />
        <Accordion items={faqs} />
      </Container>
    </section>
  );
}
