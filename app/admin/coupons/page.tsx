import ActionForm, { AdminInput, AdminSelect } from "@/components/admin/ActionForm";
import { createCouponAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminCouponsPage() {
  const coupons = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Sales</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Coupons</h1>
      </div>
      <section className="panel p-5">
        <h2 className="font-display text-2xl text-navy-950">Create or update coupon</h2>
        <ActionForm action={createCouponAction} submitLabel="Save coupon" className="mt-4 grid gap-3 md:grid-cols-3">
          <AdminInput name="code" placeholder="Code" required />
          <AdminSelect name="type" defaultValue="percentage" options={["percentage", "fixed"]} />
          <AdminInput name="value" type="number" min={1} step="0.01" placeholder="Value" required />
          <AdminInput name="minOrderValue" type="number" min={0} placeholder="Minimum order value" />
          <AdminInput name="maxUses" type="number" min={1} placeholder="Usage limit" />
          <AdminInput name="perUserLimit" type="number" min={1} placeholder="Per-user limit" />
          <AdminInput name="expiresAt" type="date" />
          <AdminInput name="description" placeholder="Description" className="md:col-span-2" />
        </ActionForm>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coupons.map((coupon) => (
          <section key={coupon.id} className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">{coupon.code}</h2>
            <p className="mt-1 text-sm text-ink-600">{coupon.type} · {Number(coupon.value)} · {coupon.isActive ? "active" : "inactive"}</p>
            <p className="mt-2 text-sm">Used {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</p>
            <p className="text-sm">Min order: {Number(coupon.minOrderValue)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
