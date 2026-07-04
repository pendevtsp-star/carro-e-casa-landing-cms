CREATE TABLE "GoogleReviewSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sectionTitle" TEXT NOT NULL DEFAULT 'Avaliações Google',
    "sectionSubtitle" TEXT NOT NULL DEFAULT 'A experiência de quem já conhece a Carro & Casa ajuda novos clientes a escolherem com confiança.',
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "googleProfileUrl" TEXT NOT NULL DEFAULT 'https://share.google/2NRGZNwWO9DOtiIIt',
    "reviewButtonLabel" TEXT NOT NULL DEFAULT 'Avaliar no Google',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleReviewSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoogleReview" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorPhotoUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "reviewUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleReview_pkey" PRIMARY KEY ("id")
);
