import Container from "@/components/ui/Container";

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-navy-950/10 bg-cream-200 py-14 sm:py-16">
      <Container className="flex flex-col gap-3">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-3xl text-navy-950 sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-base text-ink-700">{description}</p>}
      </Container>
    </section>
  );
}
