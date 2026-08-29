import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { AdminSelect } from "@/components/admin/ActionForm";
import { updateCustomerRoleAction } from "@/lib/actions/admin";
import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, viewer] = await Promise.all([
    prisma.profile.findUnique({
      where: { id },
      include: { addresses: true, orders: { orderBy: { createdAt: "desc" } } },
    }),
    getAdminSession(),
  ]);
  if (!customer) notFound();
  const spent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
  // Only a super admin can grant admin access, and never to their own account
  // here -- that avoids a super admin locking themselves out by mistake.
  const canManageRole = viewer?.role === "super_admin" && viewer.id !== customer.id;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Customer profile</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{customer.fullName ?? customer.companyName ?? "Customer"}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-5">
          <h2 className="font-display text-xl text-navy-950">Profile</h2>
          <p className="mt-3 text-sm">Phone: {customer.phone ?? "N/A"}</p>
          <p className="text-sm">Company: {customer.companyName ?? "N/A"}</p>
          <p className="text-sm">Role: {customer.role}</p>
        </section>
        {canManageRole ? (
          <section className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">Admin access</h2>
            <p className="mt-3 text-sm text-ink-600">
              Grant or revoke access to /admin. Only super admins can change this.
            </p>
            <ActionForm
              action={updateCustomerRoleAction}
              submitLabel="Update role"
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="profileId" value={customer.id} />
              <AdminSelect
                name="role"
                defaultValue={customer.role}
                options={["customer", "admin", "super_admin"]}
              />
            </ActionForm>
          </section>
        ) : null}
        <section className="panel p-5">
          <h2 className="font-display text-xl text-navy-950">Totals</h2>
          <p className="mt-3 text-sm">Orders: {customer.orders.length}</p>
          <p className="text-sm">Total spent: {formatPrice(spent)}</p>
        </section>
        <section className="panel p-5">
          <h2 className="font-display text-xl text-navy-950">Addresses</h2>
          <p className="mt-3 text-sm">{customer.addresses.length} saved address(es)</p>
        </section>
      </div>
      <section className="panel p-5">
        <h2 className="font-display text-2xl text-navy-950">Order history</h2>
        <div className="mt-4 divide-y divide-navy-950/10">
          {customer.orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.orderNumber}`} className="grid gap-2 py-3 text-sm md:grid-cols-[140px_1fr_120px_120px]">
              <span className="font-semibold text-navy-950">{order.orderNumber}</span>
              <span>{order.status}</span>
              <span>{order.paymentStatus}</span>
              <span>{formatPrice(Number(order.total))}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
