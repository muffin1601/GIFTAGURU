import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">System</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Audit log</h1>
        <p className="mt-2 text-sm text-ink-600">
          Every admin mutation -- catalog, pricing, inventory, orders, leads, content and roles --
          is recorded here with who made the change and when.
        </p>
      </div>

      <div className="panel overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sunken text-xs uppercase tracking-wide text-ink-600">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                  {log.createdAt.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">{log.actorEmail}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 text-ink-600">
                  {log.entityType}
                  {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? <p className="p-6 text-sm text-ink-600">No admin activity recorded yet.</p> : null}
      </div>

      {total > PAGE_SIZE ? (
        <p className="text-sm text-ink-600">
          Showing {logs.length} of {total} entries.
        </p>
      ) : null}
    </div>
  );
}
