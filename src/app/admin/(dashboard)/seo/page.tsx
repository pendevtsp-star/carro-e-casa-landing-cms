import { updateSeoSetting } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getSeoSetting } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

const pages = [
  ["home", "Home"],
  ["faq", "FAQ"],
  ["termos-de-uso", "Termos de Uso"],
  ["privacidade", "Privacidade"],
];

function SeoForm({
  setting,
  label,
}: {
  setting: Awaited<ReturnType<typeof getSeoSetting>>;
  label: string;
}) {
  return (
    <form action={updateSeoSetting} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      <input type="hidden" name="page" value={setting.page} />
      <h2 className="text-lg font-semibold text-brand-dark">{label}</h2>
      <FormInput label="Título SEO" name="title" defaultValue={setting.title} required />
      <FormTextarea label="Descrição SEO" name="description" defaultValue={setting.description} rows={3} required />
      <FormInput label="Palavras-chave" name="keywords" defaultValue={setting.keywords} />
      <FormInput label="Imagem Open Graph" name="ogImageUrl" defaultValue={setting.ogImageUrl} />
      <Button type="submit" className="w-fit">Salvar SEO</Button>
    </form>
  );
}

export default async function SeoPage({ searchParams }: PageProps) {
  await requireCapability("manageSite");
  const params = await searchParams;
  const settings = await Promise.all(pages.map(([page]) => getSeoSetting(page)));

  return (
    <AdminPage
      title="SEO"
      description="Configure títulos, descrições, palavras-chave e imagem social das páginas."
      saved={params.saved === "1"}
    >
      <div className="grid gap-6">
        {settings.map((setting, index) => (
          <Card key={setting.page} className="p-5">
            <SeoForm setting={setting} label={pages[index][1]} />
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
