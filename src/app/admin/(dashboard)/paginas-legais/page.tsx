import { updateLegalPage } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLegalPage } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

function LegalForm({
  page,
}: {
  page: Awaited<ReturnType<typeof getLegalPage>>;
}) {
  return (
    <form action={updateLegalPage} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      <input type="hidden" name="slug" value={page.slug} />
      <FormInput label="Título" name="title" defaultValue={page.title} required />
      <FormTextarea label="Conteúdo" name="content" defaultValue={page.content} rows={9} required />
      <FormInput label="Título SEO" name="seoTitle" defaultValue={page.seoTitle} />
      <FormTextarea label="Descrição SEO" name="seoDescription" defaultValue={page.seoDescription} rows={3} />
      <Button type="submit" className="w-fit">Salvar {page.title}</Button>
    </form>
  );
}

export default async function PaginasLegaisPage({ searchParams }: PageProps) {
  const [params, termos, privacidade] = await Promise.all([
    searchParams,
    getLegalPage("termos-de-uso"),
    getLegalPage("privacidade"),
  ]);

  return (
    <AdminPage
      title="Páginas legais"
      description="Edite os textos de Termos de Uso e Política de Privacidade."
      saved={params.saved === "1"}
    >
      <div className="grid gap-6">
        <Card className="p-5">
          <LegalForm page={termos} />
        </Card>
        <Card className="p-5">
          <LegalForm page={privacidade} />
        </Card>
      </div>
    </AdminPage>
  );
}
