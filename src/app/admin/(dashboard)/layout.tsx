import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return <AdminLayout role={session.user?.role ?? "admin"}>{children}</AdminLayout>;
}
