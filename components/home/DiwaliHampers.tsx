import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { getProductsBySlugs } from "@/lib/data/products";
import { expandProductSlugs } from "@/lib/seo/content/products";

const DIWALI_HAMPER_SLUGS = [
  "diwali-signature-hamper",
  "diwali-celebration-hamper",
  "diwali-grand-hamper",
];

/** A short, seasonal home-page spotlight for the three Diwali hampers. */
export default async function DiwaliHampers() {
  const hampers = await getProductsBySlugs(expandProductSlugs(DIWALI_HAMPER_SLUGS));

  if (hampers.length === 0) return null;

  return (
    <section className="section border-t border-line bg-cream-100">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Diwali 2026"
            title="Highlighted Diwali Hampers"
            description="Three curated festive hampers for employee, client and leadership gifting."
          />
          <Button href="/diwali-2026" variant="primary" className="shrink-0">
            Explore Diwali Gifts
          </Button>
        </div>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {hampers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
