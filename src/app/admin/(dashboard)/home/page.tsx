import { updateHero } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getHero } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminHomePage({ searchParams }: PageProps) {
  await requireCapability("manageContent");
  const [params, hero] = await Promise.all([searchParams, getHero()]);

  return (
    <AdminPage
      title="Home"
      description="Edite a primeira dobra da landing: título, botões, selo e imagem principal."
      saved={params.saved === "1"}
    >
      <form action={updateHero} className="grid gap-6">
        <Card className="grid gap-4 p-5">
          <FormInput label="Título" name="title" defaultValue={hero.title} required />
          <FormTextarea label="Subtítulo" name="subtitle" defaultValue={hero.subtitle} rows={4} required />
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormInput label="Texto do botão principal" name="primaryButtonLabel" defaultValue={hero.primaryButtonLabel} required />
          <FormInput label="Link do botão principal" name="primaryButtonUrl" defaultValue={hero.primaryButtonUrl} help="Em branco usa o WhatsApp configurado." />
          <FormInput label="Texto do botão secundário" name="secondaryButtonLabel" defaultValue={hero.secondaryButtonLabel} required />
          <FormInput label="Link do botão secundário" name="secondaryButtonUrl" defaultValue={hero.secondaryButtonUrl} help="Em branco usa o Instagram configurado." />
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormInput label="Selo de destaque" name="badgeText" defaultValue={hero.badgeText} required />
          <FormInput label="Destaque de atendimento" name="highlightText" defaultValue={hero.highlightText} required />
          <FormInput className="md:col-span-2" label="Imagem do hero" name="imageUrl" defaultValue={hero.imageUrl} required />
          <FormInput className="md:col-span-2" label="Texto alternativo da imagem" name="imageAlt" defaultValue={hero.imageAlt} required />
        </Card>

        <Button type="submit" className="w-fit">Salvar home</Button>
      </form>
    </AdminPage>
  );
}
