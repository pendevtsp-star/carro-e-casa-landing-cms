import { deleteAdminUser, saveAdminUser } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

async function getUsers() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
  });
}

type User = Awaited<ReturnType<typeof getUsers>>[number];

function UserForm({ user }: { user?: User }) {
  return (
    <form action={saveAdminUser} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Nome" name="name" defaultValue={user?.name} required />
        <FormInput label="E-mail" name="email" type="email" defaultValue={user?.email} required />
        <FormInput label="Papel" name="role" defaultValue={user?.role ?? "admin"} required />
        <FormInput label={user ? "Nova senha" : "Senha"} name="password" type="password" help={user ? "Preencha apenas para trocar." : "Obrigatória para novo usuário."} />
      </div>
      <FormCheckbox label="Usuário ativo" name="isActive" defaultChecked={user?.isActive ?? true} />
      <Button type="submit" className="w-fit">{user ? "Salvar usuário" : "Criar usuário"}</Button>
    </form>
  );
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const [params, users] = await Promise.all([searchParams, getUsers()]);

  return (
    <AdminPage
      title="Usuários"
      description="Gerencie acessos administrativos simples do painel."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Novo usuário</h2>
        <UserForm />
      </Card>
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="grid gap-4 p-5">
            <UserForm user={user} />
            <form action={deleteAdminUser}>
              <input type="hidden" name="id" value={user.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir usuário
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
