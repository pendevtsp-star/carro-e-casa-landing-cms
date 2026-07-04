import {
  deleteGoogleReview,
  saveGoogleReview,
  updateGoogleReviewSetting,
} from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "@/components/admin/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getGoogleReviewSetting, getGoogleReviews } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

const ratingOptions = [5, 4, 3, 2, 1].map((value) => ({
  label: `${value} estrela${value > 1 ? "s" : ""}`,
  value: String(value),
}));

type Review = Awaited<ReturnType<typeof getGoogleReviews>>[number];

function ReviewForm({ review }: { review?: Review }) {
  return (
    <form action={saveGoogleReview} className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5">
      {review ? <input type="hidden" name="id" value={review.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Nome do cliente" name="authorName" defaultValue={review?.authorName} required />
        <FormInput label="Ordem" name="order" type="number" defaultValue={review?.order ?? 0} required />
        <FormSelect label="Nota" name="rating" defaultValue={review?.rating ?? 5} options={ratingOptions} />
        <FormInput
          label="Foto do cliente"
          name="authorPhotoUrl"
          defaultValue={review?.authorPhotoUrl}
          help="Opcional. Use uma URL autorizada ou deixe em branco para iniciais."
        />
        <FormInput
          className="md:col-span-2"
          label="Link da avaliação"
          name="reviewUrl"
          defaultValue={review?.reviewUrl}
          help="Opcional. Use o link público da avaliação no Google, quando disponível."
        />
        <FormTextarea
          className="md:col-span-2"
          label="Texto da avaliação"
          name="text"
          defaultValue={review?.text}
          rows={4}
          required
        />
      </div>
      <FormCheckbox label="Mostrar na landing" name="isActive" defaultChecked={review?.isActive ?? true} />
      <Button type="submit" className="w-fit">{review ? "Salvar avaliação" : "Criar avaliação"}</Button>
    </form>
  );
}

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
        <h2 className="mb-4 text-lg font-semibold text-brand-dark">Nova avaliação</h2>
        <ReviewForm />
      </Card>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="grid gap-4 p-5">
            <ReviewForm review={review} />
            <form action={deleteGoogleReview}>
              <input type="hidden" name="id" value={review.id} />
              <button type="submit" className="text-sm font-semibold text-red-700">
                Excluir avaliação
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
