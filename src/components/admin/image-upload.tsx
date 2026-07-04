import { Upload } from "lucide-react";

import { uploadMedia } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function ImageUpload() {
  return (
    <form action={uploadMedia} className="rounded-lg border border-dashed border-brand-dark/20 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-md bg-brand text-brand-dark">
          <Upload className="size-5" aria-hidden />
        </div>
        <div className="grid flex-1 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-brand-dark">Enviar imagem</h2>
            <p className="mt-1 text-sm leading-6 text-brand-dark/60">
              JPG, PNG, WebP ou AVIF. Depois de enviar, use a URL gerada nos campos de imagem.
            </p>
          </div>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="rounded-md border border-brand-dark/12 bg-white px-3 py-2 text-sm"
          />
          <input
            name="altText"
            placeholder="Texto alternativo da imagem"
            className="h-11 rounded-md border border-brand-dark/12 px-3 text-sm"
          />
          <Button type="submit" className="w-fit">Enviar imagem</Button>
        </div>
      </div>
    </form>
  );
}
