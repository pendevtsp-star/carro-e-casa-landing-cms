import { hash } from "bcryptjs";

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
} from "../src/lib/defaults";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: defaultSiteSetting,
  });

  await prisma.heroSection.upsert({
    where: { id: "main" },
    update: {},
    create: defaultHero,
  });

  for (const slide of defaultCarouselSlides) {
    const existing = await prisma.carouselSlide.findFirst({
      where: { title: slide.title },
    });
    if (!existing) {
      await prisma.carouselSlide.create({ data: slide });
    }
  }

  for (const brand of defaultBrands) {
    const existing = await prisma.brand.findFirst({
      where: { name: brand.name },
    });
    if (!existing) {
      await prisma.brand.create({ data: brand });
    }
  }

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });
    if (!existing) {
      await prisma.category.create({ data: category });
    }
  }

  for (const faq of defaultFaqItems) {
    const existing = await prisma.fAQItem.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.fAQItem.create({ data: faq });
    }
  }

  await prisma.googleReviewSetting.upsert({
    where: { id: "main" },
    update: {},
    create: defaultGoogleReviewSetting,
  });

  for (const review of defaultGoogleReviews) {
    const existing = await prisma.googleReview.findFirst({
      where: { authorName: review.authorName, text: review.text },
    });
    if (!existing) {
      await prisma.googleReview.create({ data: review });
    }
  }

  for (const legalPage of defaultLegalPages) {
    await prisma.legalPage.upsert({
      where: { slug: legalPage.slug },
      update: {},
      create: legalPage,
    });
  }

  for (const seoSetting of defaultSeoSettings) {
    await prisma.seoSetting.upsert({
      where: { page: seoSetting.page },
      update: {},
      create: seoSetting,
    });
  }

  const email = process.env.ADMIN_SEED_EMAIL || "admin@lojacarroecasa.com.br";
  const password = process.env.ADMIN_SEED_PASSWORD || "troque-esta-senha";
  const name = process.env.ADMIN_SEED_NAME || "Administrador";
  const passwordHash = await hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, isActive: true, role: "owner" },
    create: {
      name,
      email,
      passwordHash,
      role: "owner",
      isActive: true,
    },
  });

  console.log(`Seed concluído. Admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
