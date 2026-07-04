import Image from "next/image";

import { AdminPage } from "@/components/admin/admin-page";
import { ImageUpload } from "@/components/admin/image-upload";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getMediaAssets } from "@/lib/content";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function MidiaPage({ searchParams }: PageProps) {
  await requireCapability("manageMedia");
  const [params, assets] = await Promise.all([searchParams, getMediaAssets()]);

  return (
    <AdminPage
      title="Mídia"
      description="Envie imagens e copie a URL para usar na home, carrossel, marcas e categorias."
      saved={params.saved === "1"}
    >
      <ImageUpload />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <div className="relative aspect-[16/10] bg-brand-dark/5">
              <Image
                src={asset.url}
                alt={asset.altText || asset.originalName}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
            <div className="grid gap-2 p-4">
              <p className="truncate text-sm font-semibold text-brand-dark">{asset.originalName}</p>
              <code className="rounded bg-brand-dark/5 px-2 py-1 text-xs text-brand-dark/70">
                {asset.url}
              </code>
              <p className="text-xs text-brand-dark/50">
                {asset.width || "?"}x{asset.height || "?"} · {Math.round(asset.size / 1024)} KB
              </p>
            </div>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
