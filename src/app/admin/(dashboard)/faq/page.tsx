import { deleteFaqItem, saveFaqItem } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getFaqItems } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

function FaqForm({ item }: { item?: Awaited<ReturnType<typeof getFaqItems>>[number] }) {
  return (
    <form action={saveFaqItem} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-4 md:grid-cols-[1fr_160px]">
        <FormInput label="Pergunta" name="question" defaultValue={item?.question} required />
        <FormInput label="Ordem" name="order" type="number" defaultValue={item?.order ?? 0} required />
      </div>
      <FormTextarea label="Resposta" name="answer" defaultValue={item?.answer} rows={4} required />
      <FormCheckbox label="Ativa" name="isActive" defaultChecked={item?.isActive ?? true} />
      <Button type="submit" className="w-fit">{item ? "Salvar pergunta" : "Criar pergunta"}</Button>
    </form>
  );
}

export default async function FaqAdminPage({ searchParams }: PageProps) {
  await requireCapability("manageContent");
  const [params, items] = await Promise.all([searchParams, getFaqItems(false)]);

  return (
    <AdminPage
      title="FAQ"
      description="Gerencie as perguntas frequentes da home e da página completa."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Nova pergunta</h2>
        <FaqForm />
      </Card>
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="grid gap-4 p-5">
            <FaqForm item={item} />
            <form action={deleteFaqItem}>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir pergunta
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
