"use server";

import { mkdir, writeFile } from "node:fs/promises";

import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getUploadRoot } from "@/lib/uploads";
import { emptyToNull, formBool, formString, parseOrder } from "@/lib/utils";

type ActionState = {
  ok: boolean;
  message: string;
};

const urlField = z.string().trim().optional();
const shortText = z.string().trim().min(1, "Campo obrigatório.");
const longText = z.string().trim().min(1, "Campo obrigatório.");

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/termos-de-uso");
  revalidatePath("/privacidade");
}

function redirectSaved(pathname: string) {
  redirect(`${pathname}?saved=1`);
}

export async function loginAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      email: z.string().email("Informe um e-mail válido.").trim(),
      password: z.string().min(1, "Informe a senha."),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { ok: false, message: "Revise e-mail e senha." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { ok: false, message: "E-mail ou senha inválidos." };
  }

  return { ok: true, message: "" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const parsed = z
    .object({
      businessName: shortText,
      slogan: shortText,
      institutionalText: longText,
      whatsappNumber: shortText,
      whatsappMessage: shortText,
      instagramUrl: z.string().url("Informe uma URL válida."),
      address: urlField,
      openingHours: urlField,
      email: z.string().trim().optional(),
      googleMapsUrl: urlField,
      googleMapsEmbed: z.string().trim().optional(),
      logoUrl: shortText,
      alternateLogoUrl: urlField,
      faviconUrl: urlField,
      primaryColor: shortText,
      secondaryColor: shortText,
      backgroundColor: shortText,
      appAccessUrl: z.string().url("Informe uma URL válida."),
      appAccessLabel: shortText,
    })
    .parse({
      businessName: formData.get("businessName"),
      slogan: formData.get("slogan"),
      institutionalText: formData.get("institutionalText"),
      whatsappNumber: formData.get("whatsappNumber"),
      whatsappMessage: formData.get("whatsappMessage"),
      instagramUrl: formData.get("instagramUrl"),
      address: formData.get("address"),
      openingHours: formData.get("openingHours"),
      email: formData.get("email"),
      googleMapsUrl: formData.get("googleMapsUrl"),
      googleMapsEmbed: formData.get("googleMapsEmbed"),
      logoUrl: formData.get("logoUrl"),
      alternateLogoUrl: formData.get("alternateLogoUrl"),
      faviconUrl: formData.get("faviconUrl"),
      primaryColor: formData.get("primaryColor"),
      secondaryColor: formData.get("secondaryColor"),
      backgroundColor: formData.get("backgroundColor"),
      appAccessUrl: formData.get("appAccessUrl"),
      appAccessLabel: formData.get("appAccessLabel"),
    });

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {
      ...parsed,
      address: parsed.address || null,
      openingHours: parsed.openingHours || null,
      email: parsed.email || null,
      googleMapsUrl: parsed.googleMapsUrl || null,
      googleMapsEmbed: parsed.googleMapsEmbed || null,
      alternateLogoUrl: parsed.alternateLogoUrl || null,
      faviconUrl: parsed.faviconUrl || null,
      appAccessEnabled: formBool(formData, "appAccessEnabled"),
    },
    create: {
      id: "main",
      ...parsed,
      appAccessEnabled: formBool(formData, "appAccessEnabled"),
    },
  });

  revalidatePublic();
  redirectSaved("/admin/configuracoes");
}

export async function updateHero(formData: FormData) {
  await requireAdmin();

  const parsed = z
    .object({
      title: shortText,
      subtitle: longText,
      primaryButtonLabel: shortText,
      primaryButtonUrl: urlField,
      secondaryButtonLabel: shortText,
      secondaryButtonUrl: urlField,
      badgeText: shortText,
      highlightText: shortText,
      imageUrl: shortText,
      imageAlt: shortText,
    })
    .parse({
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      primaryButtonLabel: formData.get("primaryButtonLabel"),
      primaryButtonUrl: formData.get("primaryButtonUrl"),
      secondaryButtonLabel: formData.get("secondaryButtonLabel"),
      secondaryButtonUrl: formData.get("secondaryButtonUrl"),
      badgeText: formData.get("badgeText"),
      highlightText: formData.get("highlightText"),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
    });

  await prisma.heroSection.upsert({
    where: { id: "main" },
    update: parsed,
    create: { id: "main", ...parsed },
  });

  revalidatePublic();
  redirectSaved("/admin/home");
}

export async function saveCarouselSlide(formData: FormData) {
  await requireAdmin();

  const data = {
    title: formString(formData, "title"),
    subtitle: formString(formData, "subtitle"),
    imageUrl: formString(formData, "imageUrl"),
    imageAlt: formString(formData, "imageAlt"),
    buttonLabel: emptyToNull(formData.get("buttonLabel")),
    buttonUrl: emptyToNull(formData.get("buttonUrl")),
    isActive: formBool(formData, "isActive"),
    order: parseOrder(formData),
  };

  z.object({
    title: shortText,
    subtitle: longText,
    imageUrl: shortText,
    imageAlt: shortText,
  }).parse(data);

  const id = formString(formData, "id");
  if (id) {
    await prisma.carouselSlide.update({ where: { id }, data });
  } else {
    await prisma.carouselSlide.create({ data });
  }

  revalidatePublic();
  redirectSaved("/admin/carrossel");
}

export async function deleteCarouselSlide(formData: FormData) {
  await requireAdmin();
  await prisma.carouselSlide.delete({ where: { id: formString(formData, "id") } });
  revalidatePublic();
  redirectSaved("/admin/carrossel");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();

  const data = {
    name: formString(formData, "name"),
    logoUrl: emptyToNull(formData.get("logoUrl")),
    description: emptyToNull(formData.get("description")),
    officialUrl: emptyToNull(formData.get("officialUrl")),
    isFeatured: formBool(formData, "isFeatured"),
    order: parseOrder(formData),
  };

  z.object({ name: shortText }).parse(data);

  const id = formString(formData, "id");
  if (id) {
    await prisma.brand.update({ where: { id }, data });
  } else {
    await prisma.brand.create({ data });
  }

  revalidatePublic();
  redirectSaved("/admin/marcas");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  await prisma.brand.delete({ where: { id: formString(formData, "id") } });
  revalidatePublic();
  redirectSaved("/admin/marcas");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();

  const data = {
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    iconName: formString(formData, "iconName") || "Sparkles",
    imageUrl: emptyToNull(formData.get("imageUrl")),
    whatsappMessage: emptyToNull(formData.get("whatsappMessage")),
    isActive: formBool(formData, "isActive"),
    order: parseOrder(formData),
  };

  z.object({ name: shortText, description: longText }).parse(data);

  const id = formString(formData, "id");
  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidatePublic();
  redirectSaved("/admin/categorias");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: formString(formData, "id") } });
  revalidatePublic();
  redirectSaved("/admin/categorias");
}

export async function saveFaqItem(formData: FormData) {
  await requireAdmin();

  const data = {
    question: formString(formData, "question"),
    answer: formString(formData, "answer"),
    isActive: formBool(formData, "isActive"),
    order: parseOrder(formData),
  };

  z.object({ question: shortText, answer: longText }).parse(data);

  const id = formString(formData, "id");
  if (id) {
    await prisma.fAQItem.update({ where: { id }, data });
  } else {
    await prisma.fAQItem.create({ data });
  }

  revalidatePublic();
  redirectSaved("/admin/faq");
}

export async function deleteFaqItem(formData: FormData) {
  await requireAdmin();
  await prisma.fAQItem.delete({ where: { id: formString(formData, "id") } });
  revalidatePublic();
  redirectSaved("/admin/faq");
}

export async function updateLegalPage(formData: FormData) {
  await requireAdmin();

  const slug = formString(formData, "slug");
  const data = {
    title: formString(formData, "title"),
    content: formString(formData, "content"),
    seoTitle: emptyToNull(formData.get("seoTitle")),
    seoDescription: emptyToNull(formData.get("seoDescription")),
  };

  z.object({ title: shortText, content: longText }).parse(data);

  await prisma.legalPage.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });

  revalidatePublic();
  redirectSaved("/admin/paginas-legais");
}

export async function updateSeoSetting(formData: FormData) {
  await requireAdmin();

  const page = formString(formData, "page");
  const data = {
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    keywords: emptyToNull(formData.get("keywords")),
    ogImageUrl: emptyToNull(formData.get("ogImageUrl")),
  };

  z.object({ title: shortText, description: longText }).parse(data);

  await prisma.seoSetting.upsert({
    where: { page },
    update: data,
    create: { page, ...data },
  });

  revalidatePublic();
  redirectSaved("/admin/seo");
}

export async function uploadMedia(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Envie uma imagem válida.");
  }

  const maxMb = Number(process.env.MAX_UPLOAD_MB || 5);
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`A imagem deve ter até ${maxMb} MB.`);
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!allowedTypes.has(file.type)) {
    throw new Error("Use JPG, PNG, WebP ou AVIF.");
  }

  const uploadRoot = getUploadRoot();
  await mkdir(uploadRoot, { recursive: true });

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/avif"
          ? "avif"
          : "jpg";
  const fileName = `${Date.now()}-${nanoid(10)}.${extension}`;
  const absolutePath = `${uploadRoot}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  let metadata: { width?: number; height?: number } = {};
  try {
    const sharp = (await import("sharp")).default;
    metadata = await sharp(buffer).metadata();
  } catch {
    metadata = {};
  }

  await writeFile(absolutePath, buffer);

  await prisma.mediaAsset.create({
    data: {
      originalName: file.name,
      fileName,
      url: `/media/${fileName}`,
      mimeType: file.type,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
      altText: emptyToNull(formData.get("altText")),
    },
  });

  revalidatePublic();
  redirectSaved("/admin/midia");
}

export async function saveAdminUser(formData: FormData) {
  await requireAdmin();

  const id = formString(formData, "id");
  const password = formString(formData, "password");
  const data = {
    name: formString(formData, "name"),
    email: formString(formData, "email").toLowerCase(),
    role: formString(formData, "role") || "admin",
    isActive: formBool(formData, "isActive"),
  };

  z.object({
    name: shortText,
    email: z.string().email(),
    role: shortText,
  }).parse(data);

  if (id) {
    await prisma.adminUser.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await hash(password, 12) } : {}),
      },
    });
  } else {
    if (!password) {
      throw new Error("Informe uma senha para novo usuário.");
    }
    await prisma.adminUser.create({
      data: {
        ...data,
        passwordHash: await hash(password, 12),
      },
    });
  }

  redirectSaved("/admin/usuarios");
}

export async function deleteAdminUser(formData: FormData) {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (user?.email === session.user?.email) {
    throw new Error("Você não pode excluir o próprio usuário.");
  }
  await prisma.adminUser.delete({ where: { id } });
  redirectSaved("/admin/usuarios");
}
