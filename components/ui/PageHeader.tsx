import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
  breadcrumbs,
  actions,
  image: imageOverride,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  image?: string;
}) {
  const image = imageOverride ?? headerImage(eyebrow, title);

  return (
    <section className="page-hero border-b border-line bg-sunken">
      {breadcrumbs?.length ? (
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="contents">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.href ? <Link href={item.href} className="hover:text-navy-950">{item.label}</Link> : <span className="text-navy-950">{item.label}</span>}
              </span>
            ))}
          </nav>
        </Container>
      ) : null}
      <Container className={`grid min-h-[27rem] gap-10 pb-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,1.12fr)] lg:items-center lg:gap-16 lg:pb-16 ${breadcrumbs?.length ? "pt-8" : "pt-12 sm:pt-14 lg:pt-16"}`}>
        <div className="relative z-10 flex max-w-3xl flex-col gap-4">
          {eyebrow && <span className="type-eyebrow">{eyebrow}</span>}
          <h1 className="type-h1 max-w-[12ch]">{title}</h1>
          {description && <p className="type-lead">{description}</p>}
          {actions ? <div className="mt-3 flex flex-wrap gap-3">{actions}</div> : null}
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
