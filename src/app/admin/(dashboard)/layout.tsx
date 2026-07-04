import { requireAdmin } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return <AdminLayout role={session.user?.role ?? "admin"}>{children}</AdminLayout>;
}
