import "server-only";

import { prisma } from "@/lib/prisma";
import type { AdminSession } from "@/lib/auth/admin";

/**
 * Records who changed what. Called from every admin mutation that touches
 * catalog, pricing, inventory, order/lead status, content, or roles.
 *
 * Logging failures never block the mutation they're describing -- losing an
 * audit entry is bad, but rolling back a successful save because the log
 * write failed would be worse.
 */
export async function logAdminAction(
  admin: AdminSession,
  input: {
    action: string;
    entityType: string;
    entityId?: string | null;
    before?: unknown;
    after?: unknown;
  },
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        before: toJson(input.before),
        after: toJson(input.after),
      },
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

function toJson(value: unknown) {
  if (value === undefined) return undefined;
  // Decimal/Date instances don't serialize the way JSON columns expect;
  // round-tripping through JSON.stringify normalizes them the same way the
  // rest of the app already does when sending Prisma rows to the client.
  return JSON.parse(JSON.stringify(value));
}
