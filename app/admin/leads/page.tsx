import Link from "next/link";
import { LeadStatus, LeadType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl } from "@/lib/config/store";

const types: LeadType[] = ["general", "contact", "bulk_order", "product", "collection", "customization", "chatbot", "consultation"];
const statuses: LeadStatus[] = ["new", "contacted", "qualified", "quoted", "negotiating", "converted", "closed"];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; type?: string; status?: string; source?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q?.trim();
  const type = types.includes(params?.type as LeadType) ? (params?.type as LeadType) : undefined;
  const status = statuses.includes(params?.status as LeadStatus) ? (params?.status as LeadStatus) : undefined;
  const where: Prisma.LeadWhereInput = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(params?.source ? { source: { contains: params.source, mode: "insensitive" } } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Corporate</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Leads</h1>
      </div>
      <form className="panel grid gap-3 p-4 md:grid-cols-[1fr_170px_170px_140px]">
        <input name="q" defaultValue={q} placeholder="Search name, company, email, phone" className="field-input text-sm" />
        <select name="type" defaultValue={params?.type ?? ""} className="field-input text-sm"><option value="">All types</option>{types.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
        <select name="status" defaultValue={params?.status ?? ""} className="field-input text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <button className="btn btn-primary">Filter</button>
      </form>
      <div className="panel overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-navy-950">{lead.name}</Link></td>
                  <td className="px-4 py-3">{lead.company ?? "N/A"}</td>
                  <td className="px-4 py-3"><p>{lead.email}</p><a href={buildWhatsAppUrl(`Hi ${lead.name}, following up on your Gifta Guru enquiry.`)} target="_blank" rel="noreferrer" className="text-gold-700">{lead.phone}</a></td>
                  <td className="px-4 py-3">{lead.type}</td>
                  <td className="px-4 py-3">{lead.source}</td>
                  <td className="px-4 py-3">{lead.quantity ?? "N/A"}</td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3">{lead.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leads.length === 0 ? <p className="p-6 text-sm text-ink-600">No leads found.</p> : null}
      </div>
    </div>
  );
}
