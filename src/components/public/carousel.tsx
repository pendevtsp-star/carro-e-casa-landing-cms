"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
};

export function Carousel({ slides }: { slides: Slide[] }) {
  const safeSlides = useMemo(() => slides.filter((slide) => slide.imageUrl), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (paused || safeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % safeSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, safeSlides.length]);

  if (!safeSlides.length) return null;

  const active = safeSlides[index];
  const previous = () => setIndex((value) => (value - 1 + safeSlides.length) % safeSlides.length);
  const next = () => setIndex((value) => (value + 1) % safeSlides.length);

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-brand-dark/10 bg-brand-dark text-white shadow-[0_24px_90px_rgba(5,8,10,0.14)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 48) {
          if (delta > 0) {
            previous();
          } else {
            next();
          }
        }
        touchStart.current = null;
      }}
      aria-roledescription="carrossel"
    >
      <div className="relative min-h-[360px]">
        {safeSlides.map((slide, slideIndex) => (
          <div
            key={slide.id ?? slide.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/48 to-black/10" />
          </div>
        ))}
        <div className="relative z-10 flex min-h-[360px] max-w-2xl flex-col justify-end p-5 sm:p-8 lg:p-10">
          <p className="mb-3 w-fit rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Destaque
          </p>
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
            {active.title}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/72">
            {active.subtitle}
          </p>
          {active.buttonLabel && active.buttonUrl ? (
            <Button href={active.buttonUrl} className="mt-5 w-fit">
              {active.buttonLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {safeSlides.length > 1 ? (
        <>
          <div className="absolute bottom-5 right-5 z-20 flex gap-2">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              onClick={previous}
              aria-label="Slide anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              onClick={next}
              aria-label="Próximo slide"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="absolute bottom-6 left-5 z-20 flex gap-2 sm:left-8 lg:left-10">
            {safeSlides.map((slide, slideIndex) => (
              <button
                key={slide.id ?? slide.title}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  slideIndex === index ? "w-9 bg-brand" : "w-4 bg-white/35",
                )}
                onClick={() => setIndex(slideIndex)}
                aria-label={`Ir para slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
