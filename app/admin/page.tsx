import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

  const [
    totalOrders,
    ordersToday,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    revenue,
    revenueToday,
    revenueMonth,
    totalCustomers,
    newCustomers,
    lowStock,
    recentOrders,
    recentBulk,
    recentCustomizations,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "processing" } }),
    prisma.order.count({ where: { deliveryStatus: { in: ["shipped", "out_for_delivery"] } } }),
    prisma.order.count({ where: { deliveryStatus: "delivered" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid", createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid", createdAt: { gte: startOfMonth } } }),
    prisma.profile.count(),
    prisma.profile.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.inventory.count({ where: { quantityAvailable: { lte: prisma.inventory.fields.lowStockThreshold } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { orderNumber: true, email: true, total: true, status: true, paymentStatus: true } }),
    prisma.bulkQuoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.customizationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { product: { select: { name: true } } } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Admin</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Operations dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={totalOrders} tone="dark" />
        <StatCard label="Orders today" value={ordersToday} />
        <StatCard label="Pending orders" value={pendingOrders} />
        <StatCard label="Processing orders" value={processingOrders} />
        <StatCard label="Shipped / in transit" value={shippedOrders} />
        <StatCard label="Delivered orders" value={deliveredOrders} />
        <StatCard label="Cancelled orders" value={cancelledOrders} />
        <StatCard label="Low stock products" value={lowStock} />
        <StatCard label="Revenue" value={formatPrice(Number(revenue._sum.total ?? 0))} />
        <StatCard label="Revenue today" value={formatPrice(Number(revenueToday._sum.total ?? 0))} />
        <StatCard label="Revenue this month" value={formatPrice(Number(revenueMonth._sum.total ?? 0))} />
        <StatCard label="Customers / new today" value={`${totalCustomers} / ${newCustomers}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="panel p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-navy-950">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-gold-700 hover:text-navy-950">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {recentOrders.map((order) => (
              <Link key={order.orderNumber} href={`/admin/orders/${order.orderNumber}`} className="grid gap-2 py-3 text-sm sm:grid-cols-[120px_1fr_120px_120px]">
                <span className="font-semibold text-navy-950">{order.orderNumber}</span>
                <span className="text-ink-700">{order.email}</span>
                <span>{formatPrice(Number(order.total))}</span>
                <span>{order.status}</span>
              </Link>
            ))}
            {recentOrders.length === 0 ? <p className="py-4 text-sm text-ink-600">No orders yet.</p> : null}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-2xl text-navy-950">Recent bulk enquiries</h2>
          <div className="mt-4 space-y-3">
            {recentBulk.map((quote) => (
              <div key={quote.id} className="text-sm">
                <p className="font-semibold text-navy-950">{quote.fullName}</p>
                <p className="text-ink-600">{quote.companyName ?? quote.productInterest ?? "Bulk enquiry"} · {quote.status}</p>
              </div>
            ))}
            {recentBulk.length === 0 ? <p className="text-sm text-ink-600">No bulk enquiries yet.</p> : null}
          </div>
        </section>

        <section className="panel p-5 xl:col-span-3">
          <h2 className="font-display text-2xl text-navy-950">Recent customization requests</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recentCustomizations.map((request) => (
              <div key={request.id} className="border border-line p-4 text-sm">
                <p className="font-semibold text-navy-950">{request.product?.name ?? "Custom product"}</p>
                <p className="mt-1 text-ink-600">{request.companyName ?? "No company"} · {request.status}</p>
              </div>
            ))}
            {recentCustomizations.length === 0 ? <p className="text-sm text-ink-600">No customization requests yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
