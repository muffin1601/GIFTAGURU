import ActionForm, { AdminSelect, AdminTextarea } from "@/components/admin/ActionForm";
import { updateCustomizationAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

const statuses = ["pending", "in_review", "approved", "rejected", "completed"];

export default async function AdminCustomizationsPage() {
  const requests = await prisma.customizationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } }, user: { select: { fullName: true, phone: true } }, orderItem: { include: { order: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Corporate</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Customization requests</h1>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {requests.map((request) => (
          <section key={request.id} className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-xl text-navy-950">{request.product?.name ?? request.orderItem?.productName ?? "Custom request"}</h2>
            <p className="mt-1 text-sm text-ink-600">{request.companyName ?? request.user?.fullName ?? "Customer"} · Qty {request.quantity} · {request.status}</p>
            {request.logoUrl ? <a href={request.logoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-gold-700">View logo asset</a> : null}
            {request.instructions ? <p className="mt-2 text-sm text-ink-700">{request.instructions}</p> : null}
            <p className="mt-2 text-sm text-ink-500">Order: {request.orderItem?.order.orderNumber ?? "N/A"}</p>
            <ActionForm action={updateCustomizationAction} submitLabel="Update request" className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={request.id} />
              <AdminSelect name="status" defaultValue={request.status} options={statuses} />
              <AdminTextarea name="adminNotes" defaultValue={request.adminNotes ?? ""} rows={3} placeholder="Internal notes" />
            </ActionForm>
          </section>
        ))}
        {requests.length === 0 ? <p className="text-sm text-ink-600">No customization requests yet.</p> : null}
      </div>
    </div>
  );
}
