import type { Metadata } from "next";

import { FAQAccordion } from "@/components/public/faq-accordion";
import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { getFaqItems, getSeoSetting } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getSeoSetting("faq"));
}

export default async function FAQPage() {
  const items = await getFaqItems(true);

  return (
    <PublicShell>
      <main className="bg-background py-20">
        <Container>
          <SectionTitle
            eyebrow="FAQ"
            title="Perguntas frequentes"
            text="Dúvidas comuns sobre atendimento, marcas, produtos e canais oficiais da Carro & Casa."
            align="center"
          />
          <div className="mx-auto mt-10 max-w-4xl">
            <FAQAccordion items={items} />
          </div>
        </Container>
      </main>
    </PublicShell>
  );
}
