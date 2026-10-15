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
    <section className="page-hero border-b border-line bg-sunken">
      <Container className="grid min-h-[27rem] gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,1.12fr)] lg:items-center lg:gap-16 lg:py-16">
        <div className="relative z-10 flex max-w-3xl flex-col gap-4">
          {eyebrow && <span className="type-eyebrow">{eyebrow}</span>}
          <h1 className="type-h1 max-w-[12ch]">{title}</h1>
          {description && <p className="type-lead">{description}</p>}
        </div>
        <div className="relative order-first mx-auto w-full max-w-[36rem] lg:order-none">
          <div className="hanna-arch-frame relative aspect-[4/3] bg-surface">
            <Image src={image} alt="GiftaGuru corporate gifting collection" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[68%_center]" />
          </div>
          <div className="absolute -bottom-5 -left-3 flex h-24 w-24 items-center justify-center rounded-full border border-gold-400 bg-navy-950 px-3 text-center font-script text-base leading-tight text-cream-100 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.25)] sm:h-28 sm:w-28">
            Curated for business
          </div>
        </div>
      </Container>
    </section>
  );
}
