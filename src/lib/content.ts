import { cache } from "react";

import {
  defaultBrands,
  defaultCarouselSlides,
  defaultCategories,
  defaultFaqItems,
  defaultGoogleReviewSetting,
  defaultGoogleReviews,
  defaultHero,
  defaultLegalPages,
  defaultSeoSettings,
  defaultSiteSetting,
} from "@/lib/defaults";
import { prisma } from "@/lib/prisma";

async function dbOrFallback<T>(query: () => Promise<T>, fallback: T) {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

const fallbackDate = new Date(0);

function withFallbackMeta<T extends { order?: number; name?: string; title?: string; question?: string }>(
  items: T[],
) {
  return items.map((item, index) => ({
    id: `fallback-${item.name || item.title || item.question || index}`,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
    ...item,
  }));
}

export const getSiteSetting = cache(async () => {
  return dbOrFallback(
    async () => (await prisma.siteSetting.findUnique({ where: { id: "main" } })) ?? defaultSiteSetting,
    defaultSiteSetting,
  );
});

export const getHero = cache(async () => {
  return dbOrFallback(
    async () => (await prisma.heroSection.findUnique({ where: { id: "main" } })) ?? defaultHero,
    defaultHero,
  );
});

export const getCarouselSlides = cache(async (activeOnly = true) => {
  return dbOrFallback(
    async () =>
      prisma.carouselSlide.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    withFallbackMeta(defaultCarouselSlides),
  );
});

export const getBrands = cache(async (featuredOnly = true) => {
  return dbOrFallback(
    async () =>
      prisma.brand.findMany({
        where: featuredOnly ? { isFeatured: true } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    withFallbackMeta(defaultBrands),
  );
});

export const getGoogleReviewSetting = cache(async () => {
  return dbOrFallback(
    async () =>
      (await prisma.googleReviewSetting.findUnique({ where: { id: "main" } })) ??
      defaultGoogleReviewSetting,
    defaultGoogleReviewSetting,
  );
});

export const getGoogleReviews = cache(async (activeOnly = true) => {
  return dbOrFallback(
    async () =>
      prisma.googleReview.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    withFallbackMeta(defaultGoogleReviews),
  );
});

export const getGoogleIntegration = cache(async () => {
  return dbOrFallback(
    async () =>
      prisma.googleIntegration.findUnique({
        where: { id: "main" },
        select: {
          googleAccountEmail: true,
          accountDisplayName: true,
          locationTitle: true,
          lastSyncedAt: true,
          createdAt: true,
        },
      }),
    null,
  );
});

export const getCategories = cache(async (activeOnly = true) => {
  return dbOrFallback(
    async () =>
      prisma.category.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    withFallbackMeta(defaultCategories.map((item) => ({ imageUrl: null, ...item }))),
  );
});

export const getFaqItems = cache(async (activeOnly = true) => {
  return dbOrFallback(
    async () =>
      prisma.fAQItem.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    withFallbackMeta(defaultFaqItems),
  );
});

export const getLegalPage = cache(async (slug: string) => {
  const fallback = defaultLegalPages.find((page) => page.slug === slug) ?? defaultLegalPages[0];
  return dbOrFallback(
    async () => (await prisma.legalPage.findUnique({ where: { slug } })) ?? fallback,
    fallback,
  );
});

export const getSeoSetting = cache(async (page: string) => {
  const fallback = defaultSeoSettings.find((item) => item.page === page) ?? defaultSeoSettings[0];
  return dbOrFallback(
    async () => (await prisma.seoSetting.findUnique({ where: { page } })) ?? fallback,
    fallback,
  );
});

export const getMediaAssets = cache(async () => {
  return dbOrFallback(
    async () =>
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
    [],
  );
});
