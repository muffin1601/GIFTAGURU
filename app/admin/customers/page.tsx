import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { total: true, createdAt: true } }, addresses: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Customers</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Customers</h1>
      </div>
      <div className="panel overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spent</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {customers.map((customer) => {
                const spent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
                return (
                  <tr key={customer.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-navy-950">{customer.fullName ?? customer.companyName ?? customer.id}</Link>
                      <p className="text-ink-500">{customer.companyName}</p>
                    </td>
                    <td className="px-4 py-3">
                      {customer.role === "customer" ? (
                        <span className="type-meta">Customer</span>
                      ) : (
                        <span className="badge badge-positive">{customer.role.replaceAll("_", " ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{customer.phone ?? "N/A"}</td>
                    <td className="px-4 py-3">{customer.orders.length}</td>
                    <td className="px-4 py-3">{formatPrice(spent)}</td>
                    <td className="px-4 py-3">{customer.createdAt.toLocaleDateString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {customers.length === 0 ? <p className="p-6 text-sm text-ink-600">No customers yet.</p> : null}
      </div>
    </div>
  );
}
