import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { getCategoryBanner } from "@/lib/data/category-banner";

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const banner = await getCategoryBanner().catch(() => null);
  return (
    <>
      {banner?.isPublished && (
        <Container className="py-4 sm:py-6">
          <Link href={banner.linkUrl} className="relative block aspect-[8/3] overflow-hidden rounded-xl bg-sunken">
            <Image src={banner.imageUrl} alt={banner.label} fill preload sizes="(min-width: 84rem) 78rem, 100vw" className="object-contain" />
          </Link>
        </Container>
      )}
      {children}
    </>
  );
}
