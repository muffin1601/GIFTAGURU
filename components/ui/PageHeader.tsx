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
    <section className="border-b border-line">
      <Container className="flex max-w-3xl flex-col gap-4 py-14 sm:py-20">
        {eyebrow && <span className="type-eyebrow">{eyebrow}</span>}
        <h1 className="type-h1">{title}</h1>
        {description && <p className="type-lead">{description}</p>}
      </Container>
    </section>
  );
}
