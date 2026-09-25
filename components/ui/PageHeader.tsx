import Image from "next/image";
import Container from "@/components/ui/Container";

function headerImage(eyebrow: string | undefined, title: string) {
  const context = `${eyebrow ?? ""} ${title}`.toLowerCase();
  if (context.includes("eco") || context.includes("sustainable")) return "/BANNERS/ECO.png";
  if (context.includes("joining") || context.includes("welcome") || context.includes("onboarding")) return "/BANNERS/JOINING.png";
  if (context.includes("luxury") || context.includes("leadership") || context.includes("client")) return "/BANNERS/LUXURY.png";
  return "/BANNERS/PREMIUM.png";
}

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  const image = headerImage(eyebrow, title);

  return (
    <section className="border-b border-line bg-sunken">
      <Container className="grid min-h-[19rem] gap-8 py-8 sm:min-h-[22rem] sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-center lg:gap-12 lg:py-0">
        <div className="relative z-10 flex max-w-3xl flex-col gap-4 lg:py-12">
          {eyebrow && <span className="type-eyebrow">{eyebrow}</span>}
          <h1 className="type-h1">{title}</h1>
          {description && <p className="type-lead">{description}</p>}
        </div>
        <div className="relative order-first aspect-[16/9] overflow-hidden rounded-[3px] border border-line bg-surface lg:order-none lg:aspect-auto lg:self-stretch">
          <Image src={image} alt="GiftaGuru corporate gifting collection" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain px-4 sm:px-8" />
        </div>
      </Container>
    </section>
  );
}
