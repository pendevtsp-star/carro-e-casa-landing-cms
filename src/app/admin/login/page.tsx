import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4e8] px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-brand-dark/10 bg-white p-6 shadow-[0_24px_80px_rgba(5,8,10,0.12)]">
        <div className="mb-8 flex items-center gap-3">
          <span className="relative size-14 overflow-hidden rounded-full bg-brand">
            <Image
              src="/brand/logo-carro-casa.jpg"
              alt="Logo Carro & Casa"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-brand-dark">Painel Carro & Casa</h1>
            <p className="text-sm text-brand-dark/58">Acesso administrativo</p>
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
