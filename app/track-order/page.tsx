import Container from "@/components/ui/Container";

export default function TrackOrderPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 ring-1 ring-navy-950/5">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Track order</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Find your order</h1>
        <form action="/api/track-order" method="get" className="mt-6 grid gap-4">
          <input name="orderNumber" required placeholder="Order number" className="rounded-lg border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <input name="email" required type="email" placeholder="Email used at checkout" className="rounded-lg border border-navy-950/10 px-4 py-3 outline-none focus:border-navy-900" />
          <button className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100">Track Order</button>
        </form>
      </div>
    </Container>
  );
}
