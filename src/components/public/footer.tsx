import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildWhatsappUrl } from "@/lib/utils";

type FooterProps = {
  logoUrl: string;
  businessName: string;
  description: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  appAccessEnabled: boolean;
  appAccessUrl: string;
  appAccessLabel: string;
};

export function Footer({
  logoUrl,
  businessName,
  description,
  whatsappNumber,
  whatsappMessage,
  instagramUrl,
  appAccessEnabled,
  appAccessUrl,
  appAccessLabel,
}: FooterProps) {
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappMessage);

  return (
    <footer className="border-t border-white/10 bg-brand-dark text-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative size-12 overflow-hidden rounded-full bg-brand">
              <Image src={logoUrl} alt={`Logo ${businessName}`} fill sizes="48px" className="object-cover" />
            </span>
            <span className="text-lg font-semibold">{businessName}</span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/68">
            {description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            Links
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-white/72">
            <Link href="/#marcas" className="hover:text-white">Marcas</Link>
            <Link href="/#produtos" className="hover:text-white">Produtos</Link>
            <Link href="/empresas" className="hover:text-white">Empresas</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            Atendimento
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            <Button href={whatsappUrl} target="_blank">
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </Button>
            <Button href={instagramUrl} variant="secondary" target="_blank">
              <Camera className="size-4" aria-hidden />
              Instagram
            </Button>
            {appAccessEnabled ? (
              <Button href={appAccessUrl} variant="secondary">
                {appAccessLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10 py-5">
        <Container className="text-xs text-white/45">
          <p>© {year} {businessName}. Todos os direitos reservados.</p>
        </Container>
      </div>
    </footer>
  );
}
