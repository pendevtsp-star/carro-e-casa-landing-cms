import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Mail,
  MessageCircle,
  Route,
  Store,
  Target,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { getSiteSetting } from "@/lib/content";
import { buildWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Soluções para Empresas | Carro & Casa",
  description:
    "Consultoria, treinamentos e suporte técnico para empresas, profissionais e operações de cuidado automotivo e limpeza.",
};

const services: Array<[string, string, LucideIcon]> = [
  [
    "Treinamentos personalizados",
    "Capacitação alinhada à rotina da equipe, aos produtos utilizados e ao padrão de entrega desejado.",
    GraduationCap,
  ],
  [
    "Tira-dúvidas técnico",
    "Apoio sobre produtos, protocolos, rendimento, aplicação e escolhas mais seguras para cada operação.",
    MessageCircle,
  ],
  [
    "Cardápio de serviços",
    "Estruturação de pacotes, etapas e ofertas para tornar o atendimento mais claro e rentável.",
    ClipboardList,
  ],
  [
    "Acompanhamento contínuo",
    "Suporte técnico recorrente para ajustar processos, reduzir falhas e elevar a qualidade percebida.",
    Route,
  ],
  [
    "Estratégia operacional",
    "Orientação para otimizar atendimentos, melhorar produtividade e apoiar o crescimento profissional.",
    Target,
  ],
  [
    "Fornecimento orientado",
    "Curadoria de produtos e marcas para compras mais eficientes, com suporte comercial especializado.",
    BadgeCheck,
  ],
];

const audiences = [
  "Empresas com frota própria",
  "Lava-jatos e estúdios de estética",
  "Detalhadores profissionais",
  "Oficinas e centros automotivos",
  "Condomínios e facilities",
  "Equipes que precisam padronizar limpeza e cuidado",
];

const process = [
  "Entendimento da operação e objetivos",
  "Diagnóstico dos produtos, rotinas e oportunidades",
  "Plano de treinamento, protocolos e compras",
  "Acompanhamento técnico para evolução contínua",
];

export default async function EmpresasPage() {
  const settings = await getSiteSetting();
  const commercialEmail = "comercial@lojacarroecasa.com.br";
  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    "Olá, gostaria de falar com o comercial da Carro & Casa sobre consultoria, treinamentos ou soluções para empresas.",
  );

  return (
    <PublicShell>
      <main>
        <section className="relative overflow-hidden bg-brand-dark text-white">
          <div className="absolute inset-0">
            <Image
              src="/generated/carousel-auto-care.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-64"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/82 to-brand-dark/40" />
          </div>
          <Container className="relative grid min-h-[calc(100svh-80px)] items-center py-16 lg:grid-cols-[1fr_0.78fr]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-brand/30 bg-brand/15 px-4 py-2 text-sm font-semibold text-brand">
                Pessoa Jurídica
              </span>
              <h1 className="mt-7 text-balance text-5xl font-semibold tracking-normal sm:text-6xl">
                Consultoria especializada para empresas e profissionais.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
                Suporte técnico, treinamentos e orientação estratégica para quem deseja aprimorar resultados, atuar com mais segurança e elevar o padrão dos atendimentos.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappUrl} target="_blank">
                  <MessageCircle className="size-4" aria-hidden />
                  Falar com o comercial
                </Button>
                <Button href={`mailto:${commercialEmail}`} variant="secondary">
                  <Mail className="size-4" aria-hidden />
                  Enviar e-mail
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-background py-16">
          <Container>
            <SectionTitle
              eyebrow="Consultoria"
              title="Suporte completo para operar melhor"
              text="A Carro & Casa apoia profissionais e empresas na escolha de produtos, criação de protocolos, treinamento de equipes e melhoria contínua da operação."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map(([title, text, Icon]) => (
                <Card key={title} className="p-5 transition hover:-translate-y-1 hover:border-brand/60">
                  <div className="flex size-10 items-center justify-center rounded-md bg-brand text-brand-dark">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-brand-dark">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-dark/62">{text}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white py-16">
          <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionTitle
                eyebrow="Para quem"
                title="Soluções para operações que precisam de padrão"
                text="Atendemos negócios que dependem de cuidado, limpeza, proteção e acabamento com consistência."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-brand-dark/8 bg-background/70 p-4">
                  <CheckCircle2 className="size-5 shrink-0 text-brand-dark" aria-hidden />
                  <span className="text-sm font-semibold text-brand-dark">{item}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative overflow-hidden bg-brand-dark py-16 text-white">
          <div className="absolute inset-0">
            <Image
              src="/generated/carousel-home-care.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-44"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/94 via-brand-dark/82 to-brand-dark/66" />
          </div>
          <Container className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <SectionTitle
              eyebrow="Método"
              title="Da escolha do produto ao atendimento final"
              text="A consultoria organiza decisões técnicas e comerciais para que a equipe trabalhe com mais clareza, segurança e previsibilidade."
              tone="inverse"
            />
            <div className="grid gap-3">
              {process.map((step, index) => (
                <div key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-lg border border-white/12 bg-white/[0.08] p-4 backdrop-blur-sm">
                  <span className="flex size-10 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-dark">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-semibold text-white">{step}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/62">
                      Etapa conduzida com foco em rotina real, viabilidade e melhoria percebida pelo cliente.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-brand py-12 text-brand-dark">
          <Container className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="size-6" aria-hidden />
                <h2 className="text-balance text-3xl font-semibold">
                  Vamos desenhar a solução ideal para sua operação?
                </h2>
              </div>
              <p className="mt-3 max-w-3xl text-base leading-7 text-brand-dark/72">
                Fale com o comercial para explicar sua necessidade, receber orientação inicial e combinar o melhor formato de atendimento.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button href={whatsappUrl} variant="dark" target="_blank">
                <UsersRound className="size-4" aria-hidden />
                Falar com o comercial
              </Button>
              <Button href={`mailto:${commercialEmail}`} variant="secondary">
                <Store className="size-4" aria-hidden />
                {commercialEmail}
              </Button>
            </div>
          </Container>
        </section>
      </main>
    </PublicShell>
  );
}
