import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center ring-1 ring-navy-950/5">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Order Received</p>
        <h1 className="mt-3 font-display text-4xl text-navy-950">We have your gifting request</h1>
        <p className="mt-4 text-ink-700">Reference: {id}. Payment verification and fulfillment status are handled server-side when Razorpay credentials are connected.</p>
        <Button href="/shop" className="mt-8">Continue Shopping</Button>
      </div>
    </Container>
  );
}
