import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { getCategoryBanner, type BannerCategory } from "@/lib/data/category-banner";

export default async function CategoryBanner({ category }: { category?: BannerCategory }) {
  const banner = await getCategoryBanner(category).catch(() => null);
  if (!banner?.isPublished) return null;
  return (
    <Container className="py-4 sm:py-6">
      <Link href={banner.linkUrl} className="relative block aspect-[8/3] overflow-hidden rounded-xl bg-sunken">
        <Image src={banner.imageUrl} alt={banner.label} fill preload sizes="(min-width: 84rem) 78rem, 100vw" className="object-contain" />
      </Link>
    </Container>
  );
}
