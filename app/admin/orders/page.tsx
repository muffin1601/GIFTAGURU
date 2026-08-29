import Link from "next/link";
import { OrderStatus, PaymentStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const orderStatuses: OrderStatus[] = ["pending", "confirmed", "processing", "ready_to_ship", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; payment?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params?.page ?? 1), 1);
  const pageSize = 20;
  const q = params?.q?.trim();
  const status = orderStatuses.includes(params?.status as OrderStatus) ? params?.status as OrderStatus : undefined;
  const payment = paymentStatuses.includes(params?.payment as PaymentStatus) ? params?.payment as PaymentStatus : undefined;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentStatus: payment } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: params?.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { fullName: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Sales</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Orders</h1>
      </div>

      <form className="panel grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_140px]">
        <input name="q" defaultValue={q} placeholder="Search order, email, phone" className="field-input text-sm" />
        <select name="status" defaultValue={status ?? ""} className="field-input text-sm">
          <option value="">All statuses</option>
          {orderStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
        </select>
        <select name="payment" defaultValue={payment ?? ""} className="field-input text-sm">
          <option value="">All payments</option>
          {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="btn btn-primary">Filter</button>
      </form>

      <div className="panel overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {orders.map((order) => {
                const address = order.shippingAddress as { name?: string } | null;
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-semibold text-navy-950"><Link href={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-950">{address?.name ?? order.user?.fullName ?? "Guest"}</p>
                      <p className="text-ink-600">{order.email}</p>
                      <p className="text-ink-500">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3">{formatPrice(Number(order.total))}</td>
                    <td className="px-4 py-3">{order.paymentStatus}</td>
                    <td className="px-4 py-3">{order.status}</td>
                    <td className="px-4 py-3">{order.deliveryStatus}</td>
                    <td className="px-4 py-3">{order.createdAt.toLocaleDateString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? <p className="p-6 text-sm text-ink-600">No orders match the current filters.</p> : null}
      </div>

      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>Showing {orders.length} of {total}</span>
        <div className="flex gap-2">
          {page > 1 ? <Link href={`/admin/orders?page=${page - 1}`} className="btn btn-secondary">Previous</Link> : null}
          {page * pageSize < total ? <Link href={`/admin/orders?page=${page + 1}`} className="btn btn-secondary">Next</Link> : null}
        </div>
      </div>
    </div>
  );
}
