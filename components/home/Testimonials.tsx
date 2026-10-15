import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { getTestimonials } from "@/lib/data/content";

export default async function Testimonials() {
  const testimonials = await getTestimonials();
  // No invented social proof: render nothing until a real quote is added
  // from /admin/testimonials.
  if (testimonials.length === 0) return null;

  return (
    <section className="site-section section border-t border-line bg-surface">
      <Container className="flex flex-col gap-14 sm:gap-20">
        <SectionHeading
          eyebrow="Trusted by Businesses"
          title="What corporate teams say about Gifta Guru"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="rounded-[30px] border border-line bg-canvas p-8 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.08)]">
              <blockquote className="font-display text-xl font-medium leading-relaxed text-navy-950">
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
