CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "businessName" TEXT NOT NULL DEFAULT 'Carro & Casa',
  "slogan" TEXT NOT NULL DEFAULT 'Produtos premium para carro e casa',
  "institutionalText" TEXT NOT NULL,
  "whatsappNumber" TEXT NOT NULL DEFAULT '558230287161',
  "whatsappMessage" TEXT NOT NULL DEFAULT 'Ola, vim pelo site da Carro & Casa e gostaria de atendimento.',
  "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/lojacarroecasa/',
  "address" TEXT,
  "openingHours" TEXT,
  "email" TEXT,
  "googleMapsUrl" TEXT,
  "googleMapsEmbed" TEXT,
  "logoUrl" TEXT NOT NULL DEFAULT '/brand/logo-carro-casa.jpg',
  "alternateLogoUrl" TEXT,
  "faviconUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#f6c400',
  "secondaryColor" TEXT NOT NULL DEFAULT '#05080a',
  "backgroundColor" TEXT NOT NULL DEFAULT '#fffdf4',
  "appAccessUrl" TEXT NOT NULL DEFAULT 'https://app.lojacarroecasa.com.br',
  "appAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
  "appAccessLabel" TEXT NOT NULL DEFAULT 'Acessar sistema',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeroSection" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "primaryButtonLabel" TEXT NOT NULL DEFAULT 'Falar no WhatsApp',
  "primaryButtonUrl" TEXT,
  "secondaryButtonLabel" TEXT NOT NULL DEFAULT 'Ver Instagram',
  "secondaryButtonUrl" TEXT,
  "badgeText" TEXT NOT NULL DEFAULT '+50 marcas premium',
  "highlightText" TEXT NOT NULL DEFAULT 'Atendimento especializado',
  "imageUrl" TEXT NOT NULL DEFAULT '/generated/hero-care-studio.png',
  "imageAlt" TEXT NOT NULL DEFAULT 'Produtos premium de cuidado automotivo e limpeza organizados em estúdio',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CarouselSlide" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "imageAlt" TEXT NOT NULL,
  "buttonLabel" TEXT,
  "buttonUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Brand" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "description" TEXT,
  "officialUrl" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "iconName" TEXT NOT NULL DEFAULT 'Sparkles',
  "imageUrl" TEXT,
  "whatsappMessage" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FAQItem" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalPage" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "altText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoSetting" (
  "id" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "keywords" TEXT,
  "ogImageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
CREATE UNIQUE INDEX "MediaAsset_url_key" ON "MediaAsset"("url");
CREATE UNIQUE INDEX "SeoSetting_page_key" ON "SeoSetting"("page");
