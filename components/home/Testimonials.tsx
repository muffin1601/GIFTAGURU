import { Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Trusted by Businesses"
          title="What corporate teams say about Gifta Guru"
          align="center"
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="flex flex-col gap-4 rounded-2xl bg-white p-7 ring-1 ring-navy-950/5">
              <Quote className="h-6 w-6 text-gold-500" aria-hidden="true" />
              <blockquote className="text-base text-ink-700">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-auto">
                <span className="block text-sm font-semibold text-navy-950">{testimonial.name}</span>
                <span className="block text-sm text-ink-500">
                  {testimonial.role}, {testimonial.company}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
