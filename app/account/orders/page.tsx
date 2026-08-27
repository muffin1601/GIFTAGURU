import Link from "next/link";
import Container from "@/components/ui/Container";
import { isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Container className="py-16">
        <h1 className="font-display text-4xl text-navy-950">Orders</h1>
        <p className="mt-3 text-ink-700">Add Supabase credentials to enable authenticated order history.</p>
      </Container>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orders = user
    ? await prisma.order.findMany({ where: { OR: [{ userId: user.id }, { email: user.email ?? "" }] }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl text-navy-950">Orders</h1>
      <div className="mt-8 divide-y divide-navy-950/10 rounded-lg bg-white ring-1 ring-navy-950/5">
        {orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.orderNumber}`} className="grid gap-2 p-5 text-sm md:grid-cols-[140px_1fr_120px_120px]">
            <span className="font-semibold text-navy-950">{order.orderNumber}</span>
            <span>{order.status} · {order.deliveryStatus}</span>
            <span>{order.paymentStatus}</span>
            <span>{formatPrice(Number(order.total))}</span>
          </Link>
        ))}
        {orders.length === 0 ? <p className="p-6 text-sm text-ink-600">No orders yet.</p> : null}
      </div>
    </Container>
  );
}
