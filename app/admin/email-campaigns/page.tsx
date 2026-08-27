import { prisma } from "@/lib/prisma";

export default async function AdminEmailCampaignsPage() {
  const events = await prisma.emailEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Marketing</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Email events</h1>
      </div>
      <div className="overflow-hidden rounded-lg bg-white ring-1 ring-navy-950/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
            <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-navy-950/10">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3">{event.type}</td>
                <td className="px-4 py-3">{event.recipient}</td>
                <td className="px-4 py-3">{event.subject}</td>
                <td className="px-4 py-3">{event.status}</td>
                <td className="px-4 py-3">{event.createdAt.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
