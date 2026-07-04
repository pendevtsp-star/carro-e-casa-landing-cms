import { deleteCarouselSlide, saveCarouselSlide } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormFile, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getCarouselSlides } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

function SlideForm({ slide }: { slide?: Awaited<ReturnType<typeof getCarouselSlides>>[number] }) {
  return (
    <form action={saveCarouselSlide} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Título" name="title" defaultValue={slide?.title} required />
        <FormInput label="Ordem" name="order" type="number" defaultValue={slide?.order ?? 0} required />
        <FormTextarea className="md:col-span-2" label="Subtítulo" name="subtitle" defaultValue={slide?.subtitle} rows={3} required />
        <FormFile
          label="Upload da imagem"
          name="imageFile"
          help="Opcional. Se enviar um arquivo, ele substitui o link abaixo automaticamente."
        />
        <FormInput
          label="Link da imagem"
          name="imageUrl"
          defaultValue={slide?.imageUrl}
          help="Você ainda pode colar uma URL já enviada na biblioteca de mídia."
        />
        <FormInput label="Texto alternativo" name="imageAlt" defaultValue={slide?.imageAlt} required />
        <FormInput label="Texto do botão" name="buttonLabel" defaultValue={slide?.buttonLabel} />
        <FormInput label="Link do botão" name="buttonUrl" defaultValue={slide?.buttonUrl} />
      </div>
      <FormCheckbox label="Ativo" name="isActive" defaultChecked={slide?.isActive ?? true} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{slide ? "Salvar slide" : "Criar slide"}</Button>
      </div>
    </form>
  );
}

export default async function CarrosselPage({ searchParams }: PageProps) {
  await requireCapability("manageMedia");
  const [params, slides] = await Promise.all([searchParams, getCarouselSlides(false)]);

  return (
    <AdminPage
      title="Carrossel"
      description="Gerencie banners, campanhas e destaques institucionais."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Novo slide</h2>
        <SlideForm />
      </Card>
      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="grid gap-4 p-5">
            <SlideForm slide={slide} />
            <form action={deleteCarouselSlide}>
              <input type="hidden" name="id" value={slide.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir slide
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
