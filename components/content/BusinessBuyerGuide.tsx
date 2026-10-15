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
    <section className="buyer-guide section border-t border-line bg-sunken">
      <Container>
        <div className="grid gap-10 rounded-[30px] bg-surface p-7 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.1)] sm:p-10 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="type-eyebrow">Buyer guide</p>
            <h2 className="type-h2 mt-3">{title}</h2>
            {paragraphs.map((paragraph) => <p key={paragraph} className="type-body mt-4">{paragraph}</p>)}
          </div>
          <ul className="flex flex-col gap-3">
            {links.map((link) => <li key={link.href}><Link href={link.href} className="flex items-center justify-between rounded-[30px] border border-line px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:border-navy-950 hover:bg-navy-950 hover:text-white"><span>{link.label}</span><span aria-hidden="true">→</span></Link></li>)}
          </ul>
        </div>
      </Container>
    </section>
  );
}
