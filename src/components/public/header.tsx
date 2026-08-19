"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildWhatsappUrl, cn } from "@/lib/utils";

type HeaderProps = {
  logoUrl: string;
  businessName: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  appAccessEnabled: boolean;
  appAccessUrl: string;
  appAccessLabel: string;
};

const navItems = [
  ["Início", "/#inicio"],
  ["Marcas", "/#marcas"],
  ["Produtos", "/#produtos"],
  ["Empresas", "/empresas"],
  ["Avaliações", "/#avaliacoes"],
  ["Sobre", "/#sobre"],
  ["FAQ", "/#faq"],
  ["Contato", "/#contato"],
];

export function Header({
  logoUrl,
  businessName,
  whatsappNumber,
  whatsappMessage,
  instagramUrl,
  appAccessEnabled,
  appAccessUrl,
  appAccessLabel,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappMessage);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY + 10 && currentScrollY > 100) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
        setHidden(false);
      }
      
      setScrolled(currentScrollY > 20);
      lastScrollY = currentScrollY;
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-xl",
        scrolled
          ? "border-brand-dark/15 bg-background/95 shadow-md shadow-brand-dark/5 py-1"
          : "border-brand-dark/10 bg-background/85 py-0",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link
          href="/#inicio"
          className="group flex min-w-0 flex-1 items-center gap-3 lg:flex-none"
        >
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-brand shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image
              src={logoUrl}
              alt={`Logo ${businessName}`}
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </span>
          <span
            className="flex min-w-0 shrink whitespace-nowrap text-[clamp(1rem,3.8vw,1.5rem)] font-black uppercase leading-none tracking-[-0.045em] text-brand-dark"
            aria-label={businessName}
          >
            <span>Carro</span>
            <span className="text-brand transition-transform duration-300 group-hover:scale-125 inline-block mx-0.5">&amp;</span>
            <span>Casa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Menu principal">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="group relative text-sm font-medium text-brand-dark/75 transition-colors hover:text-brand-dark"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {appAccessEnabled ? (
            <Button href={appAccessUrl} variant="secondary" className="h-10 px-4">
              {appAccessLabel}
            </Button>
          ) : null}
          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Instagram"
            className="inline-flex h-10 min-w-12 items-center justify-center gap-1 rounded-md border border-brand-dark/15 bg-white px-3 text-brand-dark transition duration-200 hover:border-brand-dark/35 hover:bg-brand/10 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Camera aria-hidden className="size-4" />
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
          <Button href={whatsappUrl} className="h-10 px-4" target="_blank">
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </Button>
        </div>

        <button
          className="inline-flex size-11 items-center justify-center rounded-md border border-brand-dark/10 bg-white lg:hidden transition active:scale-95"
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5 text-brand-dark" /> : <Menu className="size-5 text-brand-dark" />}
        </button>
      </Container>

      <div
        className={cn(
          "grid border-t border-brand-dark/10 bg-background/98 backdrop-blur-xl transition-[grid-template-rows] duration-300 lg:hidden shadow-lg",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2.5 text-base font-medium text-brand-dark hover:bg-brand/10 transition"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {appAccessEnabled ? (
              <Button href={appAccessUrl} variant="secondary" className="mt-2">
                {appAccessLabel}
              </Button>
            ) : null}
            <Button href={whatsappUrl} className="mt-2" target="_blank">
              <MessageCircle aria-hidden className="size-4" />
              Falar no WhatsApp
            </Button>
            <Button href={instagramUrl} variant="dark" target="_blank">
              <Camera aria-hidden className="size-4" />
              Ver Instagram
            </Button>
          </Container>
        </div>
      </div>
    </header>
  );
}
