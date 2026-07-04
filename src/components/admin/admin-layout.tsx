import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
  role: string;
};

export function AdminLayout({ children, role }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f4e8] text-brand-dark lg:grid lg:grid-cols-[280px_1fr]">
      <AdminSidebar role={role} />
      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
