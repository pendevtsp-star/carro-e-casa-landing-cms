import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";

type ReviewSetting = {
  isEnabled: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  ratingAverage: number;
  reviewCount: number;
  googleProfileUrl: string;
  reviewButtonLabel: string;
};

type Review = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  reviewUrl: string | null;
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brand" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className="size-4"
          aria-hidden
          fill={index < rating ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function GoogleReviewsSection({
  setting,
  reviews,
}: {
  setting: ReviewSetting;
  reviews: Review[];
}) {
  if (!setting.isEnabled) return null;

  const visibleReviews = reviews.slice(0, 3);

  return (
    <section id="avaliacoes" className="bg-background py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <SectionTitle
              eyebrow="Google"
              title={setting.sectionTitle}
              text={setting.sectionSubtitle}
            />
            <Card className="mt-6 p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#4285f4] shadow-inner">
                  G
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold text-brand-dark">
                      {setting.ratingAverage.toFixed(1)}
                    </span>
                    <RatingStars rating={Math.round(setting.ratingAverage)} />
                  </div>
                  <p className="mt-1 text-sm text-brand-dark/58">
                    {setting.reviewCount > 0
                      ? `${setting.reviewCount} avaliações no Google`
                      : "Perfil oficial no Google"}
                  </p>
                </div>
              </div>
              <Button href={setting.googleProfileUrl} target="_blank" className="mt-5 w-full">
                {setting.reviewButtonLabel}
              </Button>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {visibleReviews.length > 0 ? (
              visibleReviews.map((review) => (
                <Card key={review.id} className="flex min-h-64 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-brand-dark">
                        {review.authorPhotoUrl ? (
                          <Image
                            src={review.authorPhotoUrl}
                            alt={`Foto de ${review.authorName}`}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          initials(review.authorName)
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-brand-dark">
                        {review.authorName}
                      </p>
                    </div>
                    {review.reviewUrl ? (
                      <a
                        href={review.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir avaliação de ${review.authorName}`}
                        className="text-brand-dark/45 transition hover:text-brand-dark"
                      >
                        <ExternalLink className="size-4" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-4 line-clamp-6 text-sm leading-6 text-brand-dark/65">
                    {review.text}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="p-6 md:col-span-3">
                <p className="text-base font-semibold text-brand-dark">
                  Reputação verificada no Google
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-dark/62">
                  Acesse o perfil oficial para conferir avaliações recentes e compartilhar sua
                  experiência com a Carro & Casa.
                </p>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
