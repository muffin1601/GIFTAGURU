import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell user={{ name: admin.fullName || admin.email.split("@")[0], email: admin.email, role: admin.role }}>
      {children}
    </AdminShell>
  );
}
