import { updateSiteSettings } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getSiteSetting } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function ConfiguracoesPage({ searchParams }: PageProps) {
  await requireCapability("manageSite");
  const [params, settings] = await Promise.all([searchParams, getSiteSetting()]);

  return (
    <AdminPage
      title="Configurações"
      description="Dados da loja, identidade visual, contato e botão opcional para o futuro sistema."
      saved={params.saved === "1"}
    >
      <form action={updateSiteSettings} className="grid gap-6">
        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormInput label="Nome comercial" name="businessName" defaultValue={settings.businessName} required />
          <FormInput label="Slogan" name="slogan" defaultValue={settings.slogan} required />
          <FormTextarea className="md:col-span-2" label="Texto institucional" name="institutionalText" defaultValue={settings.institutionalText} rows={5} required />
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormInput label="WhatsApp" name="whatsappNumber" defaultValue={settings.whatsappNumber} required help="Use apenas números com DDI e DDD. Ex.: 558230287161" />
          <FormInput label="Instagram" name="instagramUrl" defaultValue={settings.instagramUrl} required />
          <FormTextarea className="md:col-span-2" label="Mensagem padrão do WhatsApp" name="whatsappMessage" defaultValue={settings.whatsappMessage} rows={3} required />
          <FormTextarea className="md:col-span-2" label="Endereço" name="address" defaultValue={settings.address} rows={3} />
          <FormInput label="Horário de funcionamento" name="openingHours" defaultValue={settings.openingHours} />
          <FormInput label="E-mail" name="email" defaultValue={settings.email} type="email" />
          <FormInput className="md:col-span-2" label="Google Maps link" name="googleMapsUrl" defaultValue={settings.googleMapsUrl} />
          <FormTextarea className="md:col-span-2" label="Google Maps embed" name="googleMapsEmbed" defaultValue={settings.googleMapsEmbed} rows={3} />
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-3">
          <FormInput label="Logo principal" name="logoUrl" defaultValue={settings.logoUrl} required />
          <FormInput label="Logo alternativa" name="alternateLogoUrl" defaultValue={settings.alternateLogoUrl} />
          <FormInput label="Favicon" name="faviconUrl" defaultValue={settings.faviconUrl} />
          <FormInput label="Cor principal" name="primaryColor" defaultValue={settings.primaryColor} type="color" required />
          <FormInput label="Cor secundária" name="secondaryColor" defaultValue={settings.secondaryColor} type="color" required />
          <FormInput label="Cor de fundo" name="backgroundColor" defaultValue={settings.backgroundColor} type="color" required />
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormCheckbox
            label="Mostrar botão Acessar sistema"
            name="appAccessEnabled"
            defaultChecked={settings.appAccessEnabled}
            help="Deixe desativado enquanto o SaaS não estiver pronto."
          />
          <FormInput label="Texto do botão" name="appAccessLabel" defaultValue={settings.appAccessLabel} required />
          <FormInput className="md:col-span-2" label="Link de acesso ao sistema" name="appAccessUrl" defaultValue={settings.appAccessUrl} required />
        </Card>

        <Button type="submit" className="w-fit">Salvar configurações</Button>
      </form>
    </AdminPage>
  );
}
