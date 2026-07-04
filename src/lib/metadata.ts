import type { Metadata } from "next";

type SeoLike = {
  title: string;
  description: string;
  keywords?: string | null;
  ogImageUrl?: string | null;
};

export function pageMetadata(seo: SeoLike): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const image = seo.ogImageUrl || "/generated/hero-care-studio.png";

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: siteUrl,
      images: [
        {
          url: image,
          width: 1920,
          height: 1024,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}
