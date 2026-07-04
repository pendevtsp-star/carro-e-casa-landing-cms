import { requireAdmin } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
