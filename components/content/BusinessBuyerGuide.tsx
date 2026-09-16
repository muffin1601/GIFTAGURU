import Link from "next/link";
import Container from "@/components/ui/Container";

export default function BusinessBuyerGuide({
  title,
  paragraphs,
  links,
}: {
  title: string;
  paragraphs: string[];
  links: { label: string; href: string }[];
}) {
  return (
    <section className="section border-t border-line bg-sunken">
      <Container>
        <div className="max-w-3xl">
          <h2 className="type-h2">{title}</h2>
          {paragraphs.map((paragraph) => <p key={paragraph} className="type-body mt-4">{paragraph}</p>)}
        </div>
        <ul className="mt-8 flex max-w-4xl flex-wrap gap-x-8 gap-y-3">
          {links.map((link) => <li key={link.href}><Link href={link.href} className="link-underline type-body text-navy-950">{link.label}</Link></li>)}
        </ul>
      </Container>
    </section>
  );
}
