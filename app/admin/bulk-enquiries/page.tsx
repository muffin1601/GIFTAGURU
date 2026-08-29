import ActionForm, { AdminSelect, AdminTextarea } from "@/components/admin/ActionForm";
import { updateBulkQuoteAction } from "@/lib/actions/admin";
import { buildWhatsAppUrl } from "@/lib/config/store";
import { prisma } from "@/lib/prisma";

const statuses = ["new", "contacted", "quoted", "negotiating", "converted", "closed", "won", "lost"];

export default async function AdminBulkEnquiriesPage() {
  const enquiries = await prisma.bulkQuoteRequest.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Corporate</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Bulk enquiries</h1>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {enquiries.map((enquiry) => (
          <section key={enquiry.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-navy-950">{enquiry.fullName}</h2>
                <p className="text-sm text-ink-600">{enquiry.companyName ?? "No company"} · {enquiry.quantity ?? "N/A"} units · {enquiry.status}</p>
                <p className="mt-2 text-sm">{enquiry.email} · {enquiry.phone}</p>
                <p className="mt-2 text-sm text-ink-700">{enquiry.productInterest ?? "No product selected"} · {enquiry.budgetRange ?? "No budget"}</p>
                {enquiry.message ? <p className="mt-2 text-sm text-ink-700">{enquiry.message}</p> : null}
              </div>
              <div className="flex gap-2">
                <a href={buildWhatsAppUrl(`Hi ${enquiry.fullName}, following up on your Gifta Guru bulk enquiry.`)} target="_blank" rel="noreferrer" className="btn btn-secondary">WhatsApp</a>
                <a href={`mailto:${enquiry.email}`} className="btn btn-secondary">Email</a>
              </div>
            </div>
            <ActionForm action={updateBulkQuoteAction} submitLabel="Update enquiry" className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={enquiry.id} />
              <AdminSelect name="status" defaultValue={enquiry.status} options={statuses} />
              <AdminTextarea name="adminNotes" defaultValue={enquiry.adminNotes ?? ""} rows={3} placeholder="Internal notes" />
            </ActionForm>
          </section>
        ))}
        {enquiries.length === 0 ? <p className="text-sm text-ink-600">No bulk enquiries yet.</p> : null}
      </div>
    </div>
  );
}
