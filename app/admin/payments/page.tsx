import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { orderNumber: true, email: true, paymentStatus: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Sales</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Payments</h1>
      </div>
      <div className="panel overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Razorpay order</th><th className="px-4 py-3">Payment ID</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-navy-950/10">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-3"><Link href={`/admin/orders/${payment.order.orderNumber}`} className="font-semibold text-navy-950">{payment.order.orderNumber}</Link><p className="text-ink-500">{payment.order.email}</p></td>
                <td className="px-4 py-3">{payment.razorpayOrderId}</td>
                <td className="px-4 py-3">{payment.razorpayPaymentId ?? "Pending"}</td>
                <td className="px-4 py-3">{formatPrice(Number(payment.amount))}</td>
                <td className="px-4 py-3">{payment.status}</td>
                <td className="px-4 py-3">{payment.createdAt.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 ? <p className="p-6 text-sm text-ink-600">No payments recorded yet.</p> : null}
      </div>
    </div>
  );
}
