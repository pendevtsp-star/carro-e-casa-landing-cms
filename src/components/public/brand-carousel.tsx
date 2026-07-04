import Image from "next/image";

type Brand = {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
};

function BrandLogo({ brand }: { brand: Brand }) {
  const needsDarkLogoSurface = brand.name.toLowerCase() === "vonixx";

  if (!brand.logoUrl) {
    return (
      <div className="flex size-14 items-center justify-center rounded-full border border-brand-dark/10 bg-brand text-base font-bold text-brand-dark">
        {brand.name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={[
        "relative h-14 w-full max-w-40 rounded-md",
        needsDarkLogoSurface ? "bg-brand-dark" : "",
      ].join(" ")}
    >
      <Image
        src={brand.logoUrl}
        alt={`Logo ${brand.name}`}
        fill
        sizes="160px"
        className={["object-contain", needsDarkLogoSurface ? "p-3" : ""].join(" ")}
      />
    </div>
  );
}

function BrandMarqueeSet({
  brands,
  hidden = false,
}: {
  brands: Brand[];
  hidden?: boolean;
}) {
  return (
    <div className="flex min-w-max gap-3 pr-3" aria-hidden={hidden}>
      {brands.map((brand) => (
        <article
          key={`${hidden ? "copy" : "brand"}-${brand.name}`}
          className="group grid min-h-32 w-64 shrink-0 grid-cols-[5.75rem_1fr] items-center gap-3 rounded-lg border border-brand-dark/8 bg-[#f7f7f4] px-3.5 py-3 transition hover:border-brand/70 hover:bg-white hover:shadow-[0_18px_55px_rgba(5,8,10,0.08)] sm:w-72"
        >
          <div className="flex h-full items-center justify-center rounded-md bg-white/70 px-3">
            <BrandLogo brand={brand} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-brand-dark">{brand.name}</h3>
            {brand.description ? (
              <p className="mt-1 text-xs leading-5 text-brand-dark/58">
                {brand.description}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function BrandCarousel({ brands }: { brands: Brand[] }) {
  return (
    <div className="brand-marquee relative mt-10 overflow-hidden">
      <style>
        {`
          .brand-marquee-track {
            animation: brand-marquee 34s linear infinite;
          }

          .brand-marquee:hover .brand-marquee-track {
            animation-play-state: paused;
          }

          @keyframes brand-marquee {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white to-transparent" />

      <div className="brand-marquee-track flex w-max">
        <BrandMarqueeSet brands={brands} />
        <BrandMarqueeSet brands={brands} hidden />
      </div>
    </div>
  );
}
