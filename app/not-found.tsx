import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="max-w-lg py-24 sm:py-32">
      <span className="type-eyebrow">404</span>
      <h1 className="type-h1 mt-4">We couldn&apos;t find that page</h1>
      <p className="type-lead mt-5">
        The page you&apos;re looking for may have moved or no longer exists. Try browsing our gift
        collections instead.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/shop" variant="secondary">Browse gifts</Button>
      </div>
    </Container>
  );
}
