import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { roleCan, type Permission } from "@/lib/auth/permissions";

export type AdminSession = {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  fullName?: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, fullName: true },
  });

  if (profile?.role !== "admin" && profile?.role !== "super_admin") return null;

  return {
    id: profile.id,
    email: user.email,
    role: profile.role,
    fullName: profile.fullName,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin");
  return admin;
}

export class PermissionError extends Error {
  constructor(public permission: Permission) {
    super("You do not have permission to perform this action.");
    this.name = "PermissionError";
  }
}

/**
 * Server-side authorization gate. Throws (rather than redirecting) when a
 * signed-in admin lacks the capability, so callers can turn it into a
 * user-facing error instead of a silent bounce to the login page.
 */
export async function requirePermission(permission: Permission): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (!roleCan(admin.role, permission)) throw new PermissionError(permission);
  return admin;
}
