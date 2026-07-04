import Image from "next/image";

import { Card } from "@/components/ui/card";

type Brand = {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
};

export function BrandCard({ brand }: { brand: Brand }) {
  const needsDarkLogoSurface = brand.name.toLowerCase() === "vonixx";

  return (
    <Card className="group flex min-h-40 flex-col items-center justify-center p-6 text-center transition hover:-translate-y-1 hover:border-brand/60 hover:shadow-[0_24px_70px_rgba(5,8,10,0.1)]">
      {brand.logoUrl ? (
        <div
          className={[
            "relative h-16 w-full rounded-md",
            needsDarkLogoSurface ? "bg-brand-dark px-5 py-4" : "",
          ].join(" ")}
        >
          <Image
            src={brand.logoUrl}
            alt={`Logo ${brand.name}`}
            fill
            sizes="180px"
            className={["object-contain", needsDarkLogoSurface ? "p-3" : ""].join(" ")}
          />
        </div>
      ) : (
        <div className="flex size-16 items-center justify-center rounded-full border border-brand-dark/10 bg-brand/18 text-lg font-bold text-brand-dark">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-brand-dark">{brand.name}</h3>
      {brand.description ? (
        <p className="mt-2 text-sm leading-6 text-brand-dark/58">
          {brand.description}
        </p>
      ) : null}
    </Card>
  );
}
