import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { getFeaturedProducts } from "@/lib/data/products";

export default async function FeaturedProducts() {
  const featured = await getFeaturedProducts();

  return (
    <section className="section border-t border-line">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Featured Products"
            title="A glimpse of what we curate"
            description="A sample of gifting products across our collections. Full catalogues are shared with quotes."
          />
          <Button href="/shop" variant="secondary" className="shrink-0">
            View All Gifts
          </Button>
        </div>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
