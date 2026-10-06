import ActionForm, { AdminInput, AdminSelect } from "@/components/admin/ActionForm";
import { createCouponAction, deleteCouponAction, updateCouponAction } from "@/lib/actions/admin";
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
        <h2 className="font-display text-2xl text-navy-950">Create coupon</h2>
        <ActionForm action={createCouponAction} submitLabel="Save coupon" className="mt-4 grid gap-3 md:grid-cols-3">
          <AdminInput name="code" placeholder="Code" required />
          <AdminSelect name="type" defaultValue="percentage" options={["percentage", "fixed"]} />
          <AdminInput name="value" type="number" min={0.01} step="0.01" placeholder="Value" required />
          <AdminInput name="minOrderValue" type="number" min={0} defaultValue={0} placeholder="Minimum order value" />
          <AdminInput name="maxUses" type="number" min={1} placeholder="Usage limit (optional)" />
          <AdminInput name="perUserLimit" type="number" min={1} placeholder="Per-user limit (optional)" />
          <AdminInput name="startsAt" type="date" aria-label="Start date" />
          <AdminInput name="expiresAt" type="date" aria-label="Expiry date" />
          <AdminInput name="description" placeholder="Description" />
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isActive" value="true" defaultChecked className="h-4 w-4 accent-navy-950" />
            Active
          </label>
        </ActionForm>
      </section>

      {coupons.length === 0 ? (
        <section className="panel p-8 text-center text-sm text-ink-600">No coupons yet.</section>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <section key={coupon.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl text-navy-950">{coupon.code}</h2>
                  <p className="mt-1 text-sm text-ink-600">Used {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</p>
                </div>
                <span className={`badge ${coupon.isActive ? "badge-positive" : "badge-attention"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <ActionForm action={updateCouponAction} submitLabel="Save changes" className="mt-4 grid gap-3 md:grid-cols-3">
                <input type="hidden" name="id" value={coupon.id} />
                <AdminInput name="code" required defaultValue={coupon.code} aria-label="Code" />
                <AdminSelect name="type" defaultValue={coupon.type} options={["percentage", "fixed"]} />
                <AdminInput name="value" type="number" min={0.01} step="0.01" required defaultValue={Number(coupon.value)} aria-label="Value" />
                <AdminInput name="minOrderValue" type="number" min={0} defaultValue={Number(coupon.minOrderValue)} aria-label="Minimum order value" />
                <AdminInput name="maxUses" type="number" min={1} defaultValue={coupon.maxUses ?? ""} placeholder="No overall limit" aria-label="Usage limit" />
                <AdminInput name="perUserLimit" type="number" min={1} defaultValue={coupon.perUserLimit ?? ""} placeholder="No per-user limit" aria-label="Per-user limit" />
                <AdminInput name="startsAt" type="date" defaultValue={coupon.startsAt?.toISOString().slice(0, 10) ?? ""} aria-label="Start date" />
                <AdminInput name="expiresAt" type="date" defaultValue={coupon.expiresAt?.toISOString().slice(0, 10) ?? ""} aria-label="Expiry date" />
                <AdminInput name="description" defaultValue={coupon.description ?? ""} placeholder="Description" aria-label="Description" />
                <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                  <input type="checkbox" name="isActive" value="true" defaultChecked={coupon.isActive} className="h-4 w-4 accent-navy-950" />
                  Active
                </label>
              </ActionForm>

              <ActionForm
                action={deleteCouponAction}
                submitLabel="Delete coupon"
                confirmMessage={`Delete coupon "${coupon.code}"? This cannot be undone.`}
                className="mt-4 border-t border-line pt-4"
              >
                <input type="hidden" name="id" value={coupon.id} />
              </ActionForm>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
