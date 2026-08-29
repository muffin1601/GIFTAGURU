import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  // No invented social proof: render nothing until real quotes are added.
  if (testimonials.length === 0) return null;

  return (
    <section className="section border-t border-line">
      <Container className="flex flex-col gap-14 sm:gap-20">
        <SectionHeading
          eyebrow="Trusted by Businesses"
          title="What corporate teams say about Gifta Guru"
        />
        <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="border-t border-line pt-7">
              <blockquote className="font-display text-xl leading-relaxed text-navy-950">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6">
                <span className="block text-sm font-semibold text-navy-950">
                  {testimonial.name}
                </span>
                <span className="type-meta mt-0.5 block">
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
