import {
  syncGoogleReviews,
  updateGoogleReviewSetting,
} from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getGoogleReviewSetting, getGoogleReviews } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

type Review = Awaited<ReturnType<typeof getGoogleReviews>>[number];

export default async function AvaliacoesPage({ searchParams }: PageProps) {
  await requireCapability("manageContent");
  const [params, setting, reviews] = await Promise.all([
    searchParams,
    getGoogleReviewSetting(),
    getGoogleReviews(false),
  ]);

  return (
    <AdminPage
      title="Avaliações Google"
      description="Gerencie a seção pública de avaliações. Por enquanto, o cadastro é manual e preparado para uma integração oficial futura."
      saved={params.saved === "1"}
    >
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Configuração da seção</h2>
        <form action={updateGoogleReviewSetting} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Título" name="sectionTitle" defaultValue={setting.sectionTitle} required />
            <FormInput label="Texto do botão" name="reviewButtonLabel" defaultValue={setting.reviewButtonLabel} required />
            <FormInput
              label="Nota média"
              name="ratingAverage"
              type="number"
              defaultValue={setting.ratingAverage}
              required
            />
            <FormInput
              label="Quantidade de avaliações"
              name="reviewCount"
              type="number"
              defaultValue={setting.reviewCount}
              required
            />
            <FormInput
              className="md:col-span-2"
              label="Link do perfil Google"
              name="googleProfileUrl"
              defaultValue={setting.googleProfileUrl}
              required
            />
            <FormTextarea
              className="md:col-span-2"
              label="Subtítulo"
              name="sectionSubtitle"
              defaultValue={setting.sectionSubtitle}
              rows={3}
              required
            />
          </div>
          <FormCheckbox label="Exibir seção na landing" name="isEnabled" defaultChecked={setting.isEnabled} />
          <Button type="submit" className="w-fit">Salvar configuração</Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-lg font-semibold text-brand-dark">Sincronização com Google</h2>
            <p className="mt-2 text-sm leading-6 text-brand-dark/62">
              As avaliações exibidas na landing devem vir do perfil real da empresa no Google.
              A sincronização usa a API oficial do Google Places e substitui a lista local pelos
              comentários retornados pelo perfil.
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-dark/52">
              Requer `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` configurados no ambiente da VPS.
            </p>
          </div>
          <form action={syncGoogleReviews}>
            <Button type="submit">Sincronizar avaliações reais</Button>
          </form>
        </div>
      </Card>

      <div className="grid gap-4">
        {reviews.length > 0 ? (
          reviews.map((review: Review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-brand-dark">{review.authorName}</h3>
                  <p className="mt-1 text-sm text-brand-dark/55">
                    {review.rating} de 5 estrelas
                  </p>
                </div>
                <span className="rounded-full bg-brand/18 px-3 py-1 text-xs font-semibold text-brand-dark">
                  Google
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-dark/66">{review.text}</p>
            </Card>
          ))
        ) : (
          <Card className="p-5">
            <p className="text-sm leading-6 text-brand-dark/62">
              Nenhuma avaliação sincronizada ainda. Configure as credenciais do Google e use o
              botão de sincronização.
            </p>
          </Card>
        )}
      </div>
    </AdminPage>
  );
}
