import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { getFaqs } from "@/lib/data/content";

export default async function FAQ() {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <section className="section bg-sunken">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading eyebrow="FAQ" title="Corporate gifting, answered" />
        <Accordion items={faqs} />
      </Container>
    </section>
  );
}
