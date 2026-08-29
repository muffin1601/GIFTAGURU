import { prisma } from "@/lib/prisma";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Marketing</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Subscribers</h1>
      </div>
      <div className="panel p-5">
        <div className="divide-y divide-navy-950/10">
          {subscribers.map((subscriber) => (
            <div key={subscriber.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium text-navy-950">{subscriber.email}</span>
              <span>{subscriber.isActive ? "active" : "inactive"} · {subscriber.subscribedAt.toLocaleDateString("en-IN")}</span>
            </div>
          ))}
          {subscribers.length === 0 ? <p className="text-sm text-ink-600">No subscribers yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
