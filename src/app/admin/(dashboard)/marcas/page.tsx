import { deleteBrand, saveBrand } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getBrands } from "@/lib/content";
import Image from "next/image";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

function BrandForm({ brand }: { brand?: Awaited<ReturnType<typeof getBrands>>[number] }) {
  const needsDarkLogoSurface = brand?.name.toLowerCase() === "vonixx";

  return (
    <form action={saveBrand} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {brand?.logoUrl ? (
        <div
          className={[
            "relative h-16 w-48 rounded-md border border-brand-dark/10",
            needsDarkLogoSurface ? "bg-brand-dark" : "bg-white",
          ].join(" ")}
        >
          <Image
            src={brand.logoUrl}
            alt={`Logo ${brand.name}`}
            fill
            sizes="192px"
            className={["object-contain", needsDarkLogoSurface ? "p-3" : "p-2"].join(" ")}
          />
        </div>
      ) : null}
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Nome" name="name" defaultValue={brand?.name} required />
        <FormInput label="Ordem" name="order" type="number" defaultValue={brand?.order ?? 0} required />
        <FormInput label="Logo" name="logoUrl" defaultValue={brand?.logoUrl} help="Use URL de mídia enviada. Deixe em branco para placeholder elegante." />
        <FormInput label="Link oficial" name="officialUrl" defaultValue={brand?.officialUrl} />
        <FormTextarea className="md:col-span-2" label="Descrição curta" name="description" defaultValue={brand?.description} rows={3} />
      </div>
      <FormCheckbox label="Mostrar como destaque" name="isFeatured" defaultChecked={brand?.isFeatured ?? true} />
      <Button type="submit" className="w-fit">{brand ? "Salvar marca" : "Criar marca"}</Button>
    </form>
  );
}

export default async function MarcasPage({ searchParams }: PageProps) {
  await requireCapability("manageContent");
  const [params, brands] = await Promise.all([searchParams, getBrands(false)]);

  return (
    <AdminPage
      title="Marcas"
      description="Cadastre marcas em destaque. Use placeholders quando a logo oficial ainda não tiver sido autorizada."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Nova marca</h2>
        <BrandForm />
      </Card>
      <div className="grid gap-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="grid gap-4 p-5">
            <BrandForm brand={brand} />
            <form action={deleteBrand}>
              <input type="hidden" name="id" value={brand.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir marca
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
