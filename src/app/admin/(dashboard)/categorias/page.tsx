import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getCategories } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

const iconOptions = ["Car", "Sparkles", "Home", "MessagesSquare", "BadgeCheck", "ShieldCheck"];

function CategoryForm({ category }: { category?: Awaited<ReturnType<typeof getCategories>>[number] }) {
  return (
    <form action={saveCategory} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Nome" name="name" defaultValue={category?.name} required />
        <FormInput label="Ordem" name="order" type="number" defaultValue={category?.order ?? 0} required />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-brand-dark">Ícone</span>
          <select
            name="iconName"
            defaultValue={category?.iconName ?? "Sparkles"}
            className="h-11 rounded-md border border-brand-dark/12 bg-white px-3 text-sm"
          >
            {iconOptions.map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </label>
        <FormInput label="Imagem opcional" name="imageUrl" defaultValue={category?.imageUrl} />
        <FormTextarea className="md:col-span-2" label="Descrição" name="description" defaultValue={category?.description} rows={3} required />
        <FormTextarea className="md:col-span-2" label="Mensagem do WhatsApp" name="whatsappMessage" defaultValue={category?.whatsappMessage} rows={3} />
      </div>
      <FormCheckbox label="Ativa" name="isActive" defaultChecked={category?.isActive ?? true} />
      <Button type="submit" className="w-fit">{category ? "Salvar categoria" : "Criar categoria"}</Button>
    </form>
  );
}

export default async function CategoriasPage({ searchParams }: PageProps) {
  await requireCapability("manageContent");
  const [params, categories] = await Promise.all([searchParams, getCategories(false)]);

  return (
    <AdminPage
      title="Categorias"
      description="Organize as soluções que aparecem na landing e suas mensagens de WhatsApp."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Nova categoria</h2>
        <CategoryForm />
      </Card>
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="grid gap-4 p-5">
            <CategoryForm category={category} />
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir categoria
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
