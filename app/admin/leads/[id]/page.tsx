import { notFound } from "next/navigation";
import ActionForm, { AdminSelect, AdminTextarea } from "@/components/admin/ActionForm";
import { updateLeadAction } from "@/lib/actions/admin";
import { buildWhatsAppUrl } from "@/lib/config/store";
import { prisma } from "@/lib/prisma";

const statuses = ["new", "contacted", "qualified", "quoted", "negotiating", "converted", "closed"];

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="panel p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">{lead.type.replaceAll("_", " ")}</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{lead.name}</h1>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <Info label="Company" value={lead.company ?? "N/A"} />
          <Info label="Email" value={lead.email} />
          <Info label="Phone" value={lead.phone} />
          <Info label="Source" value={lead.source} />
          <Info label="Quantity" value={lead.quantity ?? "N/A"} />
          <Info label="Budget" value={lead.budget ?? "N/A"} />
          <Info label="Product" value={lead.productName ?? "N/A"} />
          <Info label="Collection" value={lead.collectionName ?? "N/A"} />
        </dl>
        <div className="mt-6 rounded-lg bg-cream-100 p-4 text-sm text-ink-800">{lead.message}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={buildWhatsAppUrl(`Hi ${lead.name}, following up on your Gifta Guru enquiry.`)} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white">WhatsApp</a>
          <a href={`mailto:${lead.email}`} className="btn btn-secondary">Email</a>
        </div>
      </section>
      <aside className="panel p-6">
        <h2 className="font-display text-2xl text-navy-950">Manage lead</h2>
        <ActionForm action={updateLeadAction} submitLabel="Update lead" className="mt-4 grid gap-3">
          <input type="hidden" name="id" value={lead.id} />
          <AdminSelect name="status" defaultValue={lead.status} options={statuses} />
          <AdminTextarea name="adminNotes" rows={6} defaultValue={lead.adminNotes ?? ""} placeholder="Internal notes" />
        </ActionForm>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-ink-500">{label}</dt><dd className="mt-1 font-semibold text-navy-950">{value}</dd></div>;
}
