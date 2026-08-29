import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">404</p>
      <h1 className="mt-3 font-display text-4xl text-navy-950 sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-700">
        The page you&apos;re looking for may have moved or no longer exists. Try browsing our gift collections instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href="/">Back to home</Button>
        <Button href="/shop" variant="secondary">Browse gifts</Button>
      </div>
    </Container>
  );
}
