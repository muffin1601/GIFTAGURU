import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const order = await prisma.order.findFirst({
    where: { orderNumber: id, OR: [{ userId: user.id }, { email: user.email ?? "" }] },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  return (
    <Container className="py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-6 ring-1 ring-navy-950/5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Order tracking</p>
          <h1 className="mt-2 font-display text-4xl text-navy-950">{order.orderNumber}</h1>
          <div className="mt-6 space-y-3">
            <Timeline title="Order placed" detail={order.createdAt.toLocaleString("en-IN")} />
            {order.statusHistory.map((entry) => (
              <Timeline key={entry.id} title={entry.toStatus.replaceAll("_", " ")} detail={entry.createdAt.toLocaleString("en-IN")} />
            ))}
          </div>
        </section>
        <aside className="rounded-lg bg-white p-6 ring-1 ring-navy-950/5">
          <h2 className="font-display text-2xl text-navy-950">Delivery</h2>
          <p className="mt-4 text-sm">Order status: {order.status}</p>
          <p className="text-sm">Delivery: {order.deliveryStatus}</p>
          <p className="text-sm">Courier: {order.courierName ?? "Pending"}</p>
          <p className="text-sm">Tracking: {order.trackingNumber ?? "Pending"}</p>
          {order.trackingUrl ? <Link href={order.trackingUrl} target="_blank" className="mt-4 inline-flex rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-cream-100">Track shipment</Link> : null}
          <h3 className="mt-6 font-semibold text-navy-950">Items</h3>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span>{item.productName} x {item.quantity}</span>
                <span>{formatPrice(Number(item.lineTotal))}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-navy-950/10 pt-4 font-semibold text-navy-950">
            Total {formatPrice(Number(order.total))}
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Timeline({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-navy-950/10 p-4 text-sm">
      <p className="font-semibold capitalize text-navy-950">{title}</p>
      <p className="mt-1 text-ink-600">{detail}</p>
    </div>
  );
}
