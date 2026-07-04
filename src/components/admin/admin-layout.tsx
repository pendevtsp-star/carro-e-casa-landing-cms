import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f4e8] text-brand-dark lg:grid lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
