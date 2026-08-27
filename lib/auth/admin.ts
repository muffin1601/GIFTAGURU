import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
